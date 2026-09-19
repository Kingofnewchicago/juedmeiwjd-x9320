# Test Credentials

## Admin (Webora / MO Handel & Service)
- Email: admin@webora.de
- Password: Kp9!xRv2Lq@Zm7Tn4&Q
- Note: Seeded/migrated automatically on backend startup from ADMIN_EMAIL/ADMIN_PASSWORD in backend/.env (idempotent). Legacy admin emails (keyperion/prysm/precision) are auto-renamed to this email.

## Test Employee
- Email: mitarbeiter@precision-labs.de
- Password: Mitarbeiter123!
- Note: Employee login email NOT changed to avoid lockout.

## Security note (2026-08-16)
- `JWT_SECRET_KEY` is now REQUIRED in backend/.env (auth.py fails closed without it). Preview has a strong random value set.
- On the VPS, a DIFFERENT strong JWT_SECRET_KEY must be set (rotating it invalidates any stolen/forged tokens). Admin password should be rotated too after the incident.
