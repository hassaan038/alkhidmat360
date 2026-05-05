# Oracle VM HTTP Deploy

This setup puts the whole app on one Oracle Cloud VM and serves it over plain HTTP for small-scale testing.

## What this uses

- `docker-compose.oracle.yml` for the deployment stack
- `client/Dockerfile.deploy` for a production frontend build
- `client/nginx.http.conf` to serve the React app and proxy `/api` and `/uploads`
- `server/.env.oracle.example` as the server env template

## Before you start

- Oracle Cloud account
- One Ubuntu VM in Oracle Cloud Always Free
- This repository pushed somewhere you can clone from the VM

## Oracle steps

1. Sign in to Oracle Cloud and create a compartment if you want to keep this project separate.
2. Go to `Compute` -> `Instances` -> `Create instance`.
3. Pick an `Ampere A1` Always Free shape if available. Ubuntu 22.04 is a good default.
4. Keep the boot volume small enough to stay in the Always Free limits.
5. In networking, allow a public IPv4 address.
6. Download the SSH key Oracle gives you, or use your own public key.
7. After the VM is created, note the public IP address.

## Open the firewall

In Oracle Cloud:

1. Open the instance subnet security list or network security group.
2. Add an ingress rule for TCP port `80` from `0.0.0.0/0`.
3. You can also temporarily open TCP port `22` if not already open for SSH.

On the VM:

```bash
sudo apt update
sudo apt install -y ufw
sudo ufw allow 22
sudo ufw allow 80
sudo ufw --force enable
```

### Oracle iptables gotcha (important)

Oracle's Ubuntu cloud images ship with a pre-installed iptables ruleset that
DROPs all inbound traffic except port 22. UFW alone does NOT override this.
Run this once on the VM or you will get a connection timeout on port 80 even
though the security list, UFW, and the container all look correct:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo netfilter-persistent save
```

(If `netfilter-persistent` is not installed: `sudo apt install -y iptables-persistent` first.)

## Add swap (only if you are on a 1 GB Always Free shape)

VM.Standard.E2.1.Micro (AMD Always Free) has 1 GB RAM. MySQL 8 + Node +
nginx in a single host will OOM-kill MySQL during boot or under load.
Add a 2 GB swap file before installing Docker:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Skip this step on Ampere A1 (which is typically configured with 6+ GB).

## Install Docker

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin git
sudo usermod -aG docker $USER
newgrp docker
```

## Get the code onto the VM

```bash
git clone YOUR_REPO_URL
cd alkhidmat360
```

## Create the deploy env file

```bash
cp server/.env.oracle.example server/.env.oracle
```

Edit `server/.env.oracle` and set:

- `SESSION_SECRET` to a long random string
- `CORS_ORIGIN` to `http://YOUR_VM_PUBLIC_IP`
- any API keys or SMTP values you actually want to use

For this HTTP test deploy, keep:

- `DATABASE_URL="mysql://root:rootpassword@db:3306/alkhidmat360"`
- `PORT=5000`
- `NODE_ENV=development`

## Deploy

```bash
docker compose -f docker-compose.oracle.yml up -d --build
```

## Check it

```bash
docker compose -f docker-compose.oracle.yml ps
docker compose -f docker-compose.oracle.yml logs -f server
docker compose -f docker-compose.oracle.yml logs -f client
```

Open:

```text
http://YOUR_VM_PUBLIC_IP
```

## How frontend is pointed at the backend

You asked whether you need to point the frontend manually. With this deploy setup, yes, but it is already handled by the deployment files:

- the frontend is built with `VITE_API_URL=/api`
- nginx inside the frontend container proxies `/api` to the backend container
- nginx also proxies `/uploads` to the backend container

So the browser only talks to one URL:

```text
http://YOUR_VM_PUBLIC_IP
```

and the container handles routing internally.

## Useful commands

Restart after code changes:

```bash
docker compose -f docker-compose.oracle.yml up -d --build
```

Stop:

```bash
docker compose -f docker-compose.oracle.yml down
```

Stop and delete containers but keep database and uploads:

```bash
docker compose -f docker-compose.oracle.yml down
```

Stop and delete everything including database data:

```bash
docker compose -f docker-compose.oracle.yml down -v
```
