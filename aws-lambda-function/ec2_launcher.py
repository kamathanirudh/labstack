import json
import boto3
import os
from pathlib import Path

# — Load lab templates —
def load_lab_templates():
    p = Path(__file__).parent / "lab_templates.json"
    return json.loads(p.read_text())

LAB_TEMPLATES = load_lab_templates()

# — AWS setup —
EC2 = boto3.resource("ec2", region_name=os.environ.get("AWS_REGION", "ap-south-1"))
AMI_ID             = os.environ["AMI_ID"]
INSTANCE_TYPE      = "t2.micro"
KEY_NAME           = os.environ.get("KEY_NAME")        # optional ssh key
SECURITY_GROUP_IDS = [os.environ["SECURITY_GROUP_ID"]]
SUBNET_ID          = os.environ["SUBNET_ID"]           # public subnet

def build_user_data(lab_config, ttl):
    return f"""#!/bin/bash
service docker start
docker pull {lab_config['image']}
docker run -d -p {lab_config['port']}:{lab_config['container_port']} {lab_config['image']}
shutdown -h +{ttl}
"""

def launch_lab_instance(lab_type, ttl):
    """
    Launches the EC2 instance for the given lab_type and returns (instance_id, port).
    Raises ValueError if lab_type invalid.
    """
    if lab_type not in LAB_TEMPLATES:
        raise ValueError(f"Unknown lab_type '{lab_type}'")

    cfg = LAB_TEMPLATES[lab_type]
    ud = build_user_data(cfg, ttl)

    args = {
        "ImageId": AMI_ID,
        "InstanceType": INSTANCE_TYPE,
        "MinCount": 1,
        "MaxCount": 1,
        "UserData": ud,
        "NetworkInterfaces": [{
            "DeviceIndex": 0,
            "SubnetId": SUBNET_ID,
            "AssociatePublicIpAddress": True,
            "Groups": SECURITY_GROUP_IDS
        }],
        "TagSpecifications": [{
            "ResourceType": "instance",
            "Tags": [{"Key":"LabStackLab","Value":lab_type}]
        }]
    }
    if KEY_NAME:
        args["KeyName"] = KEY_NAME

    inst = EC2.create_instances(**args)[0]
    return inst.id, cfg["port"]

can i upload this as it is on github?
