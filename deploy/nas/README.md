# Actual Budget sul NAS (Docker)

Questa cartella contiene tutto il necessario per far girare la tua versione
personalizzata di Actual Budget (web app + server di sincronizzazione) in un
container Docker sul NAS.

## 1. Pubblicare l'immagine (sul Mac)

L'immagine viene pubblicata su GitHub Container Registry come
`ghcr.io/filosnet74/actual` (pubblica, quindi il NAS la scarica senza login):

```bash
cd ~/Documents/actual
deploy/nas/publish-image.sh
```

La prima volta serve `gh auth refresh -h github.com -s write:packages`.

In alternativa `deploy/nas/build-image.sh` crea un file `.tar` da importare a
mano (`docker load -i <file>.tar`), utile senza connessione a GitHub.

## 2. Installare sul NAS

1. Copia `docker-compose.yml` sul NAS, per esempio in
   `/volume1/docker/actual`.
2. **App Docker di UGREEN**: _Progetti → Crea_, scegli quella cartella e usa il
   `docker-compose.yml`: l'immagine viene scaricata da ghcr.io.
   **Oppure via SSH**: `cd /volume1/docker/actual && docker compose up -d`
3. Apri `http://<IP-del-NAS>:5006` e imposta la password del server al primo
   accesso (oppure accedi con quella esistente, se riusi dati di un Actual
   precedente).

I dati (budget, impostazioni, utenti) finiscono in `actual-data/` accanto al
`docker-compose.yml`: includi quella cartella nei backup del NAS. Per riusare i
dati di un Actual già installato, punta il volume alla sua cartella dati
(ferma prima il vecchio container e fanne una copia).

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

1. Sul Mac rilancia `deploy/nas/publish-image.sh`.
2. Sul NAS, nel progetto dell'app Docker, scegli _Aggiorna/Ricrea_ (oppure via
   SSH `docker compose pull && docker compose up -d`). I dati restano intatti.
