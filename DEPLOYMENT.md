# 🚀 Webora – Komplette Neuinstallation auf einem frischen Server (Ubuntu 24.04)

Repo: `https://github.com/ATkrass357/infometrica`
Domain (Beispiel): `webora.de` → überall durch deine echte Domain ersetzen.

> **Als root ausführen.** Kopiere die Blöcke **nacheinander**.

---

## 0) Voraussetzungen
- Ubuntu 24.04 LTS Server
- Domain `webora.de` mit **A-Record auf die Server-IP** (bei Cloudflare: Proxy für SSL-Ausstellung kurz auf „DNS only")
- Deine API-Keys (SMS/Anosim/Telegram) – stehen schon in den Befehlen unten

---

## 1) System + Node + Docker
```bash
apt update && apt upgrade -y
apt install -y git curl python3 python3-venv python3-dev python3-pip build-essential libffi-dev libssl-dev nginx ufw
# Firewall
ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable
# Node 20 + Yarn
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs && npm install -g yarn
# Docker
apt install -y docker.io && systemctl enable --now docker
node -v && yarn -v && docker --version
```

## 2) MongoDB 4.4 (Docker)
```bash
mkdir -p /var/lib/webora-mongo
docker run -d --name webora-mongo --restart unless-stopped \
  -p 127.0.0.1:27017:27017 -v /var/lib/webora-mongo:/data/db mongo:4.4
docker exec -it webora-mongo mongo --eval "db.runCommand({ ping: 1 })"   # → { "ok" : 1 }
```

## 3) Code klonen
```bash
git clone https://github.com/ATkrass357/infometrica /root/infometrica
cd /root/infometrica && ls
```

## 4) Backend – venv + Abhängigkeiten
```bash
cd /root/infometrica/backend
python3 -m venv venv && source venv/bin/activate
pip install --upgrade pip wheel
pip install -r requirements-prod.txt
```

## 5) Backend – `.env`
```bash
cat > /root/infometrica/backend/.env <<'EOF'
MONGO_URL="mongodb://localhost:27017"
DB_NAME="webora_production"
CORS_ORIGINS="https://webora.de,https://www.webora.de"
FRONTEND_URL=https://webora.de
SMSROUTE_API_KEY=69a9491f.maF6qlb09cozI-0QtrHOo2tS81xk_xNVsSsM6KPt95A.eyJpZCI6ImNtbTI1MXBraDA0cnY3ZGthNGNlamE3M20iLCJpc19hcGlfa2V5Ijp0cnVlfQ
SMSROUTE_SENDER_ID=Webora
ANOSIM_API_KEY=UJA6zrZbiFCNqONXUv3kd418BHCyUMDN9SlTa6wxPFFW4PvXbIbizdV692pFhCLc
TELEGRAM_BOT_TOKEN=8658978837:AAETK-b3mWxgwmlIAs2B0_hwCH3NE85AAWc
ADMIN_EMAIL='admin@webora.de'
ADMIN_PASSWORD='Kp9!xRv2Lq@Zm7Tn4&Q'
EOF
```

## 6) Backend – systemd-Dienst
```bash
tee /etc/systemd/system/webora-backend.service > /dev/null <<'EOF'
[Unit]
Description=Webora Backend (FastAPI)
After=network.target docker.service
Requires=docker.service
[Service]
User=root
WorkingDirectory=/root/infometrica/backend
EnvironmentFile=/root/infometrica/backend/.env
ExecStart=/root/infometrica/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001 --workers 2
Restart=always
RestartSec=5
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload && systemctl enable --now webora-backend
sleep 4 && curl -s http://127.0.0.1:8001/api/ && echo ""     # → {"message":"Hello World"}
```

## 7) Frontend bauen
```bash
echo 'REACT_APP_BACKEND_URL=https://webora.de' > /root/infometrica/frontend/.env
cd /root/infometrica/frontend
# yarn.lock ist im Repo -> reproduzierbare Installation.
# --network-timeout hilft bei langsamer/instabiler VPS-Verbindung.
yarn install --frozen-lockfile --network-timeout 1000000
yarn build
```
> Falls "No lockfile found" ODER "Couldn't find package ... on the npm registry" erscheint:
> ```bash
> cd /root/infometrica && git fetch origin && git reset --hard origin/main
> cd frontend && yarn cache clean
> yarn install --network-timeout 1000000
> yarn build
> ```
> Bei „killed" (zu wenig RAM): Swap anlegen und erneut `yarn build`:
> ```bash
> fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo '/swapfile none swap sw 0 0' >> /etc/fstab
> ```

## 8) Nginx
```bash
tee /etc/nginx/sites-available/webora > /dev/null <<'EOF'
server {
    listen 80;
    server_name webora.de www.webora.de;
    root /root/infometrica/frontend/build;
    index index.html;
    client_max_body_size 25M;
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
    location / { try_files $uri $uri/ /index.html; }
}
EOF
ln -sf /etc/nginx/sites-available/webora /etc/nginx/sites-enabled/webora
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
curl -s http://localhost/api/ && echo ""     # → {"message":"Hello World"}
```
> Nginx darf `/root/infometrica/frontend/build` lesen: `chmod o+x /root` (falls 403 im Browser).

## 9) HTTPS / SSL
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d webora.de -d www.webora.de
certbot renew --dry-run
```
Im Dialog: E-Mail, AGB `Y`, Redirect **Option 2**.

## 10) Telegram-Webhook
```bash
curl "https://api.telegram.org/bot8658978837:AAETK-b3mWxgwmlIAs2B0_hwCH3NE85AAWc/setWebhook?url=https://webora.de/api/chat/telegram/webhook"
```

---

## ✅ Fertig – Prüfen
- `https://webora.de` lädt (Webora, hellblau, HTTPS-Schloss)
- Admin-Login: `https://webora.de/admin/login` → `admin@webora.de` / `Kp9!xRv2Lq@Zm7Tn4&Q`

## 🔁 Künftige Updates
```bash
cd /root/infometrica && git fetch origin && git reset --hard origin/main
cd frontend && yarn build
systemctl restart webora-backend && systemctl reload nginx
```

## 🛠️ Troubleshooting
| Problem | Lösung |
|--------|--------|
| Mongo crasht (`Illegal instruction`) | Nur `mongo:4.4` (CPU ohne AVX). |
| Login-Fehler / 500 | `pip install bcrypt==4.0.1` erzwingen, Backend neu starten. |
| 502 Bad Gateway | `systemctl status webora-backend` – Backend muss auf 127.0.0.1:8001 laufen. |
| 403 im Browser | `chmod o+x /root` (Nginx muss den Pfad lesen). |
| `pip` scheitert an Version | `requirements-prod.txt` benutzen (nicht `requirements.txt`). |
| Build „killed" | Swap anlegen (Schritt 7). |
| Backend-Logs | `journalctl -u webora-backend -f` |
