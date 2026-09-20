# VPS-Deployment – MORE Applications GmbH (React + FastAPI + MongoDB)

Vollständige Anleitung für ein Ubuntu 22.04 / 24.04 VPS.
Stack: **FastAPI (uvicorn)** unter `/api`, **MongoDB** lokal, **React-Build** statisch via **Nginx**, **SSL** via Let's Encrypt.

Beispiel-Domain: `deine-domain.de` – überall ersetzen.

---

## 0. Architektur-Überblick

```
Internet ──► Nginx (Port 80/443, SSL)
               ├─ /            → statischer React-Build (frontend/build)
               └─ /api/...     → Proxy auf 127.0.0.1:8001 (uvicorn/FastAPI)
                                    └─ MongoDB auf 127.0.0.1:27017
```
- Frontend und Backend laufen unter **derselben Domain** → `REACT_APP_BACKEND_URL` = `https://deine-domain.de` (kein separater Port).
- Backend lauscht nur lokal auf `127.0.0.1:8001`, nach außen nur über Nginx.

---

## 1. Voraussetzungen
- VPS mit Ubuntu 22.04/24.04, root- oder sudo-Zugang
- Eine Domain, deren A-Record (und optional `www`) auf die VPS-IP zeigt
- SSH-Zugang

```bash
ssh root@DEINE_VPS_IP
apt update && apt upgrade -y
```

Optional: eigenen Benutzer + Firewall:
```bash
adduser deploy && usermod -aG sudo deploy
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

---

## 2. Software installieren

### 2.1 Python 3.11 + Tools
```bash
apt install -y python3.11 python3.11-venv python3-pip build-essential libpq-dev git nginx
```

### 2.2 Node.js 20 + Yarn
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g yarn
```

### 2.3 MongoDB 7 (Community)
```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update && apt install -y mongodb-org
systemctl enable --now mongod
```
> Ubuntu 24.04: `jammy` ggf. durch die passende Codename-Zeile ersetzen (MongoDB-Doku).

---

## 3. Code auf den Server bringen
```bash
mkdir -p /var/www && cd /var/www
# Variante A: aus GitHub (empfohlen – nutze "Save to GitHub" in Emergent)
git clone https://github.com/DEIN_USER/DEIN_REPO.git more-app
# Variante B: per scp/rsync vom lokalen Rechner hochladen
cd /var/www/more-app
```

---

## 4. Backend einrichten

### 4.1 Virtualenv + Abhängigkeiten
```bash
cd /var/www/more-app/backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 4.2 `.env` anlegen (`/var/www/more-app/backend/.env`)
```env
MONGO_URL="mongodb://127.0.0.1:27017"
DB_NAME="more_applications"
# WICHTIG: neuen, starken Secret erzeugen (siehe unten). NICHT den Preview-Wert nehmen!
JWT_SECRET_KEY="HIER_STARKEN_ZUFALLSWERT_EINSETZEN"
ADMIN_EMAIL="admin@deine-domain.de"
ADMIN_PASSWORD="EIN_STARKES_ADMIN_PASSWORT"
CORS_ORIGINS="https://deine-domain.de"
# Optionale Integrationen – leer lassen, wenn nicht genutzt:
ANOSIM_API_KEY=""
SMSROUTE_API_KEY=""
SMSROUTE_SENDER_ID=""
```
Starken JWT-Secret erzeugen:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```
> Der Admin wird beim Backend-Start automatisch aus `ADMIN_EMAIL`/`ADMIN_PASSWORD` angelegt/aktualisiert (idempotent), Vertragsvorlagen werden geseedet.

### 4.3 Kurztest
```bash
source .venv/bin/activate
uvicorn server:app --host 127.0.0.1 --port 8001
# in anderem Terminal:  curl http://127.0.0.1:8001/api/   → sollte JSON liefern
# danach mit STRG+C beenden
```

### 4.4 systemd-Service (`/etc/systemd/system/more-backend.service`)
```ini
[Unit]
Description=MORE Applications FastAPI Backend
After=network.target mongod.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/more-app/backend
EnvironmentFile=/var/www/more-app/backend/.env
ExecStart=/var/www/more-app/backend/.venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001 --workers 2
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```
Rechte + Start:
```bash
chown -R www-data:www-data /var/www/more-app
systemctl daemon-reload
systemctl enable --now more-backend
systemctl status more-backend        # muss "active (running)" sein
```

---

## 5. Frontend bauen

### 5.1 `.env` (`/var/www/more-app/frontend/.env`)
```env
REACT_APP_BACKEND_URL=https://deine-domain.de
```
> Kein `/api` anhängen – das steckt bereits in den API-Aufrufen des Codes.

### 5.2 Build erstellen
```bash
cd /var/www/more-app/frontend
yarn install
yarn build          # erzeugt /var/www/more-app/frontend/build
```

---

## 6. Nginx konfigurieren

`/etc/nginx/sites-available/more-app`:
```nginx
server {
    listen 80;
    server_name deine-domain.de www.deine-domain.de;

    # Frontend (statischer React-Build)
    root /var/www/more-app/frontend/build;
    index index.html;

    # Uploads/Dateidownloads können groß sein
    client_max_body_size 25M;

    # API → FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # React-Router: alle übrigen Pfade auf index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
Aktivieren:
```bash
ln -s /etc/nginx/sites-available/more-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 7. SSL / HTTPS (Let's Encrypt)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d deine-domain.de -d www.deine-domain.de
# Auto-Renewal testen:
certbot renew --dry-run
```
Certbot passt den Nginx-Block automatisch auf 443/SSL an und leitet 80→443 um.

---

## 8. MongoDB absichern (empfohlen)
1. Auth aktivieren:
```bash
mongosh
```
```javascript
use admin
db.createUser({ user: "moreadmin", pwd: "STARKES_DB_PASSWORT", roles: ["root"] })
exit
```
2. In `/etc/mongod.conf`:
```yaml
security:
  authorization: enabled
net:
  bindIp: 127.0.0.1      # nur lokal erreichbar
```
3. Neustart + `MONGO_URL` anpassen:
```bash
systemctl restart mongod
```
```env
MONGO_URL="mongodb://moreadmin:STARKES_DB_PASSWORT@127.0.0.1:27017/?authSource=admin"
```
Danach `systemctl restart more-backend`.

---

## 9. Persistenz & Backups
- **Uploads** liegen in `/var/www/more-app/backend/uploads` → in Backups einschließen, bei Updates NICHT löschen.
- **MongoDB-Backup** (z. B. täglich per cron):
```bash
mongodump --uri="mongodb://moreadmin:STARKES_DB_PASSWORT@127.0.0.1:27017/?authSource=admin" --db more_applications --out /var/backups/mongo/$(date +\%F)
```
- Wiederherstellen: `mongorestore --uri="..." /var/backups/mongo/DATUM`

---

## 10. Updates / neue Version ausrollen
```bash
cd /var/www/more-app
git pull                                   # oder neuen Code hochladen
# Backend
cd backend && source .venv/bin/activate && pip install -r requirements.txt
sudo systemctl restart more-backend
# Frontend
cd ../frontend && yarn install && yarn build
sudo systemctl reload nginx
```

---

## 11. Umgebungsvariablen – Übersicht
| Variable | Wo | Zweck |
|---|---|---|
| `MONGO_URL` | backend/.env | MongoDB-Verbindung |
| `DB_NAME` | backend/.env | Datenbankname |
| `JWT_SECRET_KEY` | backend/.env | **Pflicht**, starker Zufallswert (Backend startet sonst nicht) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | backend/.env | Admin-Account (auto-seed) |
| `CORS_ORIGINS` | backend/.env | erlaubte Origin(s), z. B. `https://deine-domain.de` |
| `ANOSIM_API_KEY` | backend/.env | optional (Rufnummern) |
| `SMSROUTE_API_KEY` / `SMSROUTE_SENDER_ID` | backend/.env | optional (SMS-Versand) |
| `REACT_APP_BACKEND_URL` | frontend/.env | Basis-URL für API-Calls (Build-Zeit!) |

> `REACT_APP_BACKEND_URL` wird **beim Build** eingebacken – nach Änderung immer `yarn build` neu ausführen.

---

## 12. Go-Live-Checkliste
- [ ] DNS A-Record zeigt auf VPS-IP
- [ ] `mongod`, `more-backend`, `nginx` laufen (`systemctl status ...`)
- [ ] `curl https://deine-domain.de/api/` liefert JSON
- [ ] Startseite lädt über HTTPS, Zertifikat gültig
- [ ] Admin-Login unter `/admin/login` funktioniert
- [ ] **Neuer** `JWT_SECRET_KEY` gesetzt (nicht der Preview-Wert)
- [ ] Admin-Passwort geändert / stark
- [ ] MongoDB-Auth aktiv, nur `127.0.0.1` gebunden
- [ ] Firewall (ufw) aktiv: nur 22/80/443
- [ ] Backup-Cron eingerichtet

---

## 13. Häufige Fehler
- **502 Bad Gateway** → Backend läuft nicht: `journalctl -u more-backend -n 50`
- **Frontend lädt, API 404/CORS** → `REACT_APP_BACKEND_URL` falsch oder `/api`-Proxy in Nginx fehlt; nach Änderung neu `yarn build`
- **Backend startet nicht** → meist fehlender `JWT_SECRET_KEY` oder `MONGO_URL`
- **Uploads verschwinden nach Update** → `backend/uploads` nicht überschreiben/löschen
- **Login geht nicht** → Admin wird aus `.env` geseedet; `ADMIN_EMAIL/PASSWORD` prüfen, Backend neu starten
