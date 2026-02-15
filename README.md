# PrintLab 3D Manager (MVP)

Gestionale web self-hosted per inventario filamenti, preventivi, job di stampa e costi.

## Prerequisiti
- Docker + Docker Compose (plugin `docker compose`)

## Quickstart
```bash
cp .env.example .env
docker compose up -d --build
```

Apri:
- App: http://localhost:8080
- API Swagger: http://localhost:8080/api/v1/docs

## Credenziali demo
- Admin: `admin@printlab.local` / `admin123`
- Operatore: `operatore@printlab.local` / `operatore123`
- Commerciale: `commerciale@printlab.local` / `commerciale123`
- Viewer: `viewer@printlab.local` / `viewer123`

## Variabili ambiente
Vedi `.env.example`.

## Dati demo inclusi (seed)
- 1 albero ubicazioni (Magazzino > Scaffale A > Ripiano 1 > Slot 1)
- 2 filamenti (1 con stock basso)
- 2 clienti
- 2 preventivi (PRV-0001 bozza, PRV-0002 accettato)
- 1 job (in corso) generato da PRV-0002
- categorie costi + registrazioni demo

## Troubleshooting
- Se il backend non parte:
  - verifica i log: `docker compose logs -f backend`
  - verifica DB: `docker compose logs -f db`
- Se l'app non raggiunge l'API:
  - assicurati che `web` sia up e che la route `/api/` sia proxyata
  - controlla `docker compose logs -f web`

## Test rapidi (opzionale)
```bash
docker compose exec backend pytest -q
```
