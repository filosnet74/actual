# Actual Budget sul NAS (Docker)

Questa cartella contiene tutto il necessario per far girare la tua versione
personalizzata di Actual Budget (web app + server di sincronizzazione) in un
container Docker sul NAS.

## 1. Costruire l'immagine (sul Mac)

Dalla cartella del progetto:

```bash
cd ~/Documents/actual
deploy/nas/build-image.sh
```

Lo script costruisce l'immagine per processori Intel/AMD (`linux/amd64`, il
caso della maggior parte dei NAS UGREEN) e crea in `deploy/nas/dist/`:

- `actual-custom-<versione>-amd64.tar.gz`: l'immagine Docker
- `docker-compose.yml`: la configurazione del container

Se il NAS ha un processore ARM: `deploy/nas/build-image.sh linux/arm64`.

## 2. Installare sul NAS

1. Copia la cartella `deploy/nas/dist` sul NAS, per esempio in
   `/volume1/docker/actual` (da Finder, condivisione SMB).
2. Importa l'immagine:
   - **App Docker di UGREEN**: *Immagini → Aggiungi → Importa da locale* e
     scegli il file `.tar.gz`.
   - **Oppure via SSH**: `docker load -i actual-custom-<versione>-amd64.tar.gz`
3. Crea il container:
   - **App Docker di UGREEN**: *Progetti → Crea*, scegli la cartella
     `/volume1/docker/actual` e usa il `docker-compose.yml` incluso.
   - **Oppure via SSH**: `cd /volume1/docker/actual && docker compose up -d`
4. Apri `http://<IP-del-NAS>:5006` e imposta la password del server al
   primo accesso.

I dati (budget, impostazioni, utenti) finiscono in `actual-data/` accanto al
`docker-compose.yml`: includi quella cartella nei backup del NAS.

## 3. HTTPS (consigliato)

I browser abilitano alcune funzioni che Actual usa (SharedArrayBuffer) solo su
connessioni sicure, cioè `https://` oppure `localhost`. Aprendo
`http://<IP-del-NAS>:5006` Actual può mostrare un avviso. Soluzioni, dalla più
semplice:

- **Tailscale** (già installato sul Mac): installa Tailscale anche sul NAS ed
  esponi la porta con `tailscale serve --bg 5006`. Otterrai un indirizzo
  `https://<nome-nas>.<tailnet>.ts.net` valido su tutti i tuoi dispositivi.
- **Reverse proxy del NAS**: nel pannello del NAS crea un reverse proxy HTTPS
  verso `http://localhost:5006`.
- **HTTPS nel container**: metti `key.pem` e `cert.pem` in `actual-data/` e
  togli il commento alle righe `ACTUAL_HTTPS_KEY`/`ACTUAL_HTTPS_CERT` nel
  `docker-compose.yml`.

## 4. Aggiornare

Dopo nuove modifiche al codice:

1. Sul Mac rilancia `deploy/nas/build-image.sh`.
2. Sul NAS importa il nuovo `.tar.gz` (stesso tag `actual-custom:latest`).
3. Ricrea il container: `docker compose up -d` (o *Riavvia/Ricrea* dal
   progetto nell'app Docker). I dati in `actual-data/` restano intatti.
