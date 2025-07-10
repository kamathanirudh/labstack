"use client"
import { ScrollArea } from "@/components/ui/scroll-area"

const COMMANDS = `
# 🔧 SYSTEM
hostnamectl
uptime
top
htop
ps aux
kill -9 <PID>
df -h
du -sh *
free -m
uname -a
whoami
id
env
export VAR=value

# 📁 FILES & DIRECTORIES
ls -al
cd /path
pwd
mkdir newdir
rm -rf dir
cp file1 file2
mv old new
find . -name "*.log"
locate <file>
tree

# 📜 TEXT & EDITING
cat file
less file
head -n 20 file
tail -f file
nano file
vim file
cut -d':' -f1 /etc/passwd
sort
uniq
grep "string" file
awk '{print $1}'
sed 's/foo/bar/g'

# 🔐 USERS & PERMISSIONS
adduser john
passwd john
usermod -aG sudo john
chmod +x file
chown user:group file
ls -l

# 🌐 NETWORKING
ip a
ifconfig
ip route
traceroute 8.8.8.8
ping google.com
netstat -tuln
ss -tulnp
nslookup google.com
dig google.com
host google.com
wget http://...
curl -I https://...
scp file user@host:/path
ssh user@host
telnet host port
ftp

# 🔍 SECURITY & LOGS
ufw status
fail2ban-client status
journalctl -xe
dmesg
last
who
w
history
sudo !!

# 📦 PACKAGES
apt update && apt upgrade
apt install <pkg>
apt remove <pkg>
dpkg -i package.deb
snap install <pkg>

# 🐍 PYTHON
python3
pip install flask
python3 -m http.server 8000

# 🔁 PROCESS CONTROL
bg
fg
jobs
kill %1
nohup
tmux
screen

# 💻 MISC
alias ll="ls -alF"
which bash
date
cal
uptime
neofetch
clear
`

export default function CommandCheatsheet() {
  return (
    <div className="rounded-xl border bg-black text-white p-4 max-h-[400px]">
      <h3 className="font-semibold text-lg mb-2 text-green-400">Essential Linux & Networking Commands</h3>
      <ScrollArea className="text-sm whitespace-pre-wrap h-[350px] p-2">
        {COMMANDS}
      </ScrollArea>
    </div>
  )
} 