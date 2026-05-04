# Deploy e messa in produzione

## 1. Variabili d'ambiente

```bash
cp .env.example .env
# modifica .env con i tuoi valori
```

## 2. Backup automatico del DB

```bash
chmod +x scripts/backup.sh

# Test manuale
./scripts/backup.sh

# Aggiungi al cron (backup ogni giorno alle 03:00)
crontab -e
# Aggiungi la riga:
# 0 3 * * * /home/fra/Desktop/bar-gestionale/scripts/backup.sh >> /var/log/bar-backup.log 2>&1
```

I backup vengono salvati in `db/backups/` e quelli più vecchi di 30 giorni vengono eliminati automaticamente.

## 3. Avvio automatico con systemd

```bash
# Copia il file service (modifica User e WorkingDirectory se necessario)
sudo cp deploy/bar-gestionale.service /etc/systemd/system/

# Ricarica systemd e abilita il servizio
sudo systemctl daemon-reload
sudo systemctl enable bar-gestionale
sudo systemctl start bar-gestionale

# Controlla lo stato
sudo systemctl status bar-gestionale

# Leggi i log
journalctl -u bar-gestionale -f
```

## 4. HTTPS con nginx (opzionale, rete locale)

Installa nginx:
```bash
sudo dnf install nginx   # Fedora
```

Crea `/etc/nginx/conf.d/bar-gestionale.conf`:
```nginx
server {
    listen 80;
    server_name bar.local;  # oppure l'IP della macchina

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo systemctl enable --now nginx
```

Per HTTPS su rete locale usa [mkcert](https://github.com/FiloSottile/mkcert):
```bash
mkcert -install
mkcert bar.local
# poi aggiorna nginx con ssl_certificate e ssl_certificate_key
```

## 5. PWA — installa su tablet/telefono

Apri l'app nel browser del tablet, poi:
- **Android Chrome**: menu ⋮ → "Aggiungi a schermata Home"
- **iOS Safari**: condividi → "Aggiungi a schermata Home"

L'app si aprirà in modalità schermo intero senza barra del browser.
