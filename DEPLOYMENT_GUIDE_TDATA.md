# Tdata Testing — Deployment Guide (Ubuntu 24.04 VPS)

Complete, copy‑paste guide to publish the website (React frontend + FastAPI backend + MongoDB)
on a fresh **Ubuntu 24.04 LTS** server, reachable at your own domain over HTTPS.

**Stack**
- Frontend: React (CRA/craco) → static build served by **Nginx**
- Backend: **FastAPI** (`server:app`) on `127.0.0.1:8001`, all routes prefixed `/api`, run by **systemd**
- Database: **MongoDB** (local, bound to localhost)
- Reverse proxy + TLS: **Nginx** + **Let's Encrypt (certbot)**
- Persistent file uploads: `backend/uploads/{contracts,signatures,verifications,chat,documents}`

Throughout the guide replace:
- `tdata-testing.de` → **your domain**
- `deploy` → your Linux username
- All example secrets → **your own** freshly generated values

---

## 0. What you need before you start
1. A VPS with Ubuntu 24.04 and root (or sudo) SSH access.
2. A domain name. In your DNS provider create **A records**:
   - `tdata-testing.de` → your server's public IPv4
   - `www.tdata-testing.de` → your server's public IPv4
   (If you have IPv6, also add AAAA records.)
3. Wait for DNS to propagate (`ping tdata-testing.de` should show your server IP).

---

## 1. Initial server hardening

SSH in as root (or a sudo user):

```bash
ssh root@YOUR_SERVER_IP
```

Update the system and create a non‑root deploy user:

```bash
apt update && apt -y upgrade
adduser deploy
usermod -aG sudo deploy
# copy your SSH key to the new user (recommended)
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

Firewall (allow SSH + web only):

```bash
apt -y install ufw
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

Optional but recommended — brute‑force protection for SSH:

```bash
apt -y install fail2ban
systemctl enable --now fail2ban
```

From now on, log in as `deploy`:

```bash
ssh deploy@YOUR_SERVER_IP
```

---

## 2. Install runtimes & tools

### 2.1 Base build tools + Nginx + git
```bash
sudo apt -y install git curl build-essential nginx
```

### 2.2 Python 3 + venv (Ubuntu 24.04 ships Python 3.12)
```bash
sudo apt -y install python3 python3-venv python3-dev python3-pip
python3 --version   # should be 3.12.x (the app also runs fine on 3.11)
```

### 2.3 Node.js 20 LTS + Yarn
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs
sudo corepack enable
corepack prepare yarn@1.22.22 --activate
node -v && yarn -v
```

### 2.4 MongoDB 7.0 (official repo, supports Ubuntu 24.04 "noble")
```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt -y install mongodb-org
sudo systemctl enable --now mongod
systemctl status mongod --no-pager   # should be "active (running)"
```

MongoDB listens only on `127.0.0.1` by default — good. Do **not** open port 27017 in the firewall.

---

## 3. Get the code onto the server

**Recommended:** push the project to a GitHub repository, then clone it:

```bash
sudo mkdir -p /var/www/tdata
sudo chown -R deploy:deploy /var/www/tdata
cd /var/www/tdata
git clone https://github.com/<your-user>/<your-repo>.git .
```

You should now have `/var/www/tdata/backend` and `/var/www/tdata/frontend`.

> Alternative (no GitHub): use `scp -r ./app deploy@YOUR_SERVER_IP:/var/www/tdata` from your local machine.

---

## 4. Backend setup

### 4.1 Virtual environment + dependencies
```bash
cd /var/www/tdata/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```
(This step takes a few minutes — it compiles numpy/pandas/cryptography, etc.)

### 4.2 Generate fresh production secrets
Never reuse the development secrets. Generate new ones:

```bash
openssl rand -hex 48    # → use as JWT_SECRET_KEY
openssl rand -base64 24 # → use as your new ADMIN_PASSWORD (or pick your own strong one)
```

### 4.3 Create the production `backend/.env`
```bash
nano /var/www/tdata/backend/.env
```
Paste and **edit the values**:

```ini
MONGO_URL="mongodb://localhost:27017"
DB_NAME="tdata_prod"
CORS_ORIGINS="https://tdata-testing.de,https://www.tdata-testing.de"
FRONTEND_URL=https://tdata-testing.de
SMSROUTE_API_KEY=YOUR_SMSROUTE_KEY
SMSROUTE_SENDER_ID=TdataTest
ANOSIM_API_KEY=YOUR_ANOSIM_KEY
ADMIN_EMAIL='admin@tdata-testing.de'
ADMIN_PASSWORD='PASTE_A_STRONG_PASSWORD_HERE'
JWT_SECRET_KEY="PASTE_THE_OPENSSL_HEX_OUTPUT_HERE"
```

Notes:
- The admin account is **auto‑created on backend startup** from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- The employment‑contract templates are **auto‑seeded** on startup too.
- Keep `.env` private: `chmod 600 /var/www/tdata/backend/.env`

### 4.4 Quick smoke test (still inside the venv)
```bash
cd /var/www/tdata/backend
uvicorn server:app --host 127.0.0.1 --port 8001
# in another terminal:  curl http://127.0.0.1:8001/api/   → {"message":"Hello World"}
# then press Ctrl+C to stop
deactivate
```

### 4.5 Run the backend with systemd (auto‑start on boot)
```bash
sudo nano /etc/systemd/system/tdata-backend.service
```
```ini
[Unit]
Description=Tdata Testing FastAPI backend
After=network.target mongod.service
Requires=mongod.service

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/var/www/tdata/backend
EnvironmentFile=/var/www/tdata/backend/.env
ExecStart=/var/www/tdata/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001 --workers 2
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```
Enable and start it:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now tdata-backend
sudo systemctl status tdata-backend --no-pager
# logs:  sudo journalctl -u tdata-backend -f
```

Make sure the uploads directory is writable by the service user (it persists all
signed contracts, ID verifications, chat images and documents):
```bash
mkdir -p /var/www/tdata/backend/uploads/{contracts,signatures,verifications,chat,documents}
sudo chown -R deploy:deploy /var/www/tdata/backend/uploads
```

---

## 5. Frontend build

The frontend calls the API using `REACT_APP_BACKEND_URL` — it must be your **public HTTPS domain**.

```bash
cd /var/www/tdata/frontend
nano .env
```
```ini
REACT_APP_BACKEND_URL=https://tdata-testing.de
```
Install & build:
```bash
yarn install
yarn build
```
This produces `/var/www/tdata/frontend/build` — the static site Nginx will serve.

> If you ever change the domain, edit `frontend/.env` and re‑run `yarn build`.

---

## 6. Nginx: serve the site + proxy the API

```bash
sudo nano /etc/nginx/sites-available/tdata
```
```nginx
server {
    listen 80;
    server_name tdata-testing.de www.tdata-testing.de;

    # Allow larger uploads (ID photos, CV, chat images, signatures)
    client_max_body_size 25M;

    root /var/www/tdata/frontend/build;
    index index.html;

    # API → FastAPI backend
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # React single-page-app routing (client-side routes)
    location / {
        try_files $uri /index.html;
    }

    # Cache static assets
    location /static/ {
        expires 30d;
        access_log off;
    }
}
```
Enable it and reload:
```bash
sudo ln -s /etc/nginx/sites-available/tdata /etc/nginx/sites-enabled/tdata
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

At this point `http://tdata-testing.de` should already show the site.

---

## 7. HTTPS with Let's Encrypt

```bash
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d tdata-testing.de -d www.tdata-testing.de
```
Follow the prompts (enter email, agree, choose "redirect HTTP→HTTPS").
Certbot rewrites your Nginx config for TLS and sets up **auto‑renewal**. Verify:
```bash
sudo certbot renew --dry-run
```

Now open **https://tdata-testing.de** 🎉

---

## 8. First login & smoke test
- Public site: `https://tdata-testing.de`
- Admin panel: `https://tdata-testing.de/admin/login` → log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `backend/.env`
- Employee portal: `https://tdata-testing.de/mitarbeiter/login`
- Careers form: `https://tdata-testing.de/karriere` (submit → creates an applicant login)

Quick backend check:
```bash
curl https://tdata-testing.de/api/     # {"message":"Hello World"}
```

---

## 9. Backups

**Database** (run daily via cron):
```bash
mongodump --db tdata_prod --out /var/backups/mongo/$(date +\%F)
```
Example cron (as deploy): `crontab -e`
```
0 3 * * * mongodump --db tdata_prod --out /var/backups/mongo/$(date +\%F) >/dev/null 2>&1
```
**Uploaded files:** back up `/var/www/tdata/backend/uploads` (contracts, signatures, IDs, chat, documents).

Restore example:
```bash
mongorestore --db tdata_prod /var/backups/mongo/2026-06-01/tdata_prod
```

---

## 10. Updating / redeploying after code changes

```bash
cd /var/www/tdata
git pull

# backend deps (only if requirements changed)
source backend/venv/bin/activate
pip install -r backend/requirements.txt
deactivate
sudo systemctl restart tdata-backend

# frontend rebuild
cd frontend
yarn install
yarn build
sudo systemctl reload nginx
```

---

## 11. Security checklist (do all of these)
- [x] `JWT_SECRET_KEY` regenerated (see 4.2) — never the dev value.
- [x] `ADMIN_PASSWORD` is strong and unique; `ADMIN_EMAIL` is yours.
- [x] `CORS_ORIGINS` set to your real domain(s), not `*`.
- [x] `backend/.env` is `chmod 600` and not committed to a public repo.
- [x] UFW only allows SSH + Nginx; MongoDB stays on `127.0.0.1`.
- [x] TLS enabled + auto‑renew working.
- [x] Rotate the SMS/Anosim API keys if they were ever shared in chat/logs.
- [x] The app already ships hardened: JWT auth (fail‑closed), bcrypt passwords,
      admin brute‑force lockout, RBAC on all admin endpoints, IDOR protection,
      NoSQL‑injection‑safe login, path‑traversal‑safe file serving.
- [ ] (Optional) Enable MongoDB authentication for defence‑in‑depth (see below).

### (Optional) Enable MongoDB auth
```bash
mongosh
```
```javascript
use admin
db.createUser({ user: "tdata", pwd: "A_STRONG_DB_PASSWORD", roles:[{role:"readWrite", db:"tdata_prod"}, {role:"dbAdmin", db:"tdata_prod"}] })
exit
```
```bash
sudo nano /etc/mongod.conf      # add under 'security:'  ->  authorization: enabled
sudo systemctl restart mongod
```
Then update `backend/.env`:
```ini
MONGO_URL="mongodb://tdata:A_STRONG_DB_PASSWORD@localhost:27017/tdata_prod?authSource=admin"
```
`sudo systemctl restart tdata-backend`

---

## 12. Troubleshooting

**Site loads but API calls fail / CORS errors**
- Check `frontend/.env` → `REACT_APP_BACKEND_URL=https://tdata-testing.de` and that you re‑ran `yarn build`.
- Check `CORS_ORIGINS` in `backend/.env` includes your exact `https://` origin.

**502 Bad Gateway**
- Backend not running: `sudo systemctl status tdata-backend` and `sudo journalctl -u tdata-backend -e`.
- Confirm it listens on 8001: `curl http://127.0.0.1:8001/api/`.

**Backend won't start**
- `sudo journalctl -u tdata-backend -e` — usually a bad `.env` value or MongoDB down (`systemctl status mongod`).

**Uploads fail / 413 error**
- Increase `client_max_body_size` in Nginx (already 25M) and reload Nginx.
- Ensure `backend/uploads` is owned by `deploy` and writable.

**Client‑side routes 404 on refresh**
- Ensure the Nginx `location / { try_files $uri /index.html; }` block is present.

---

### Service quick‑reference
```bash
sudo systemctl restart tdata-backend     # restart API
sudo systemctl reload nginx              # reload web server
sudo journalctl -u tdata-backend -f      # live backend logs
sudo systemctl status mongod             # database status
```

That's it — your Tdata Testing site is live and production‑ready.
