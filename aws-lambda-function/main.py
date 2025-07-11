from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from mangum import Mangum
from uuid import uuid4
import boto3
import os

from app.ec2_launcher import launch_lab_instance

app = FastAPI()
handler = Mangum(app)

# DynamoDB table
ddb = boto3.resource("dynamodb", region_name=os.environ.get("AWS_REGION","ap-south-1"))
table = ddb.Table(os.environ.get("DDB_TABLE","LabStackLabs"))

class LabRequest(BaseModel):
    lab_type: str
    ttl: int = 30

@app.post("/labs")
def create_lab(req: LabRequest):
    lab_id = str(uuid4())

    # launch EC2
    try:
        instance_id, port = launch_lab_instance(req.lab_type, req.ttl)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Launch failed: "+str(e))

    # persist in DynamoDB
    table.put_item(Item={
        "lab_id":       lab_id,
        "instance_id":  instance_id,
        "port":         port,
        "status":       "pending",
        "access_url":   None
    })

    return {"lab_id": lab_id}


@app.get("/labs/{lab_id}/status")
def get_lab_status(lab_id: str):
    # fetch record
    resp = table.get_item(Key={"lab_id": lab_id})
    item = resp.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Not found")

    # check EC2 state
    ec2 = boto3.client("ec2", region_name=os.environ.get("AWS_REGION","ap-south-1"))
    sts = ec2.describe_instances(InstanceIds=[item["instance_id"]])
    state = sts["Reservations"][0]["Instances"][0]["State"]["Name"]

    if state == "running":
        # compute access_url
        pu = sts["Reservations"][0]["Instances"][0]["PublicIpAddress"]
        url = f"http://{pu}:{item['port']}"

        # update DynamoDB once
        if item["status"] != "ready":
            table.update_item(
                Key={"lab_id": lab_id},
                UpdateExpression="SET #s=:s, access_url=:u",
                ExpressionAttributeNames={"#s":"status"},
                ExpressionAttributeValues={":s":"ready",":u":url}
            )
        return {"status":"ready", "access_url":url}

    # still launching
    return {"status":"pending", "access_url":None}

@app.post("/labs/{lab_id}/terminate")
def terminate_lab(lab_id: str):
    # Fetch the lab record from DynamoDB
    resp = table.get_item(Key={"lab_id": lab_id})
    item = resp.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Lab not found")

    instance_id = item.get("instance_id")
    if not instance_id:
        raise HTTPException(status_code=400, detail="Missing instance_id")

    # Terminate the EC2 instance
    ec2 = boto3.client("ec2", region_name=os.environ.get("AWS_REGION", "ap-south-1"))
    try:
        ec2.terminate_instances(InstanceIds=[instance_id])
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to terminate instance: " + str(e))

    # Update the lab status in DynamoDB
    table.update_item(
        Key={"lab_id": lab_id},
        UpdateExpression="SET #s = :s",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":s": "terminated"}
    )

    return {"message": "Lab terminated"}