# 🖨️ PrintLab 3D Manager

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Gestionale completo per laboratori di stampa 3D - Self-hosted, Open Source, Gratuito**

Gestisci il tuo laboratorio di stampa 3D in modo professionale: inventario filamenti, preventivi, job di stampa, costi e report finanziari.  
**Tutto in una sola applicazione web**, facile da installare con Docker.

---

## 🎯 A Cosa Serve

PrintLab 3D Manager è il tuo **assistente digitale** per la gestione quotidiana del laboratorio:

- 📦 **Tieni traccia dei filamenti**: Quanto ne hai? Dove sono? Quando riordinare?
- 💰 **Crea preventivi professionali**: Calcolo automatico dei costi, generazione PDF, versionamento
- 🖨️ **Gestisci i lavori di stampa**: Dalla pianificazione al completamento, con consuntivi reali
- 📊 **Analizza i costi**: Scopri quanto guadagni davvero su ogni lavoro
- 👥 **Gestione multi-utente**: 4 ruoli (Admin, Operatore, Commerciale, Viewer)

**Ideale per**: Piccoli laboratori, Maker, Produttori artigianali, Fab Lab

---

## 🚀 Installazione Rapida (3 minuti)

### Opzione 1: Docker su PC/Mac/Linux

**Prerequisiti**: Docker installato ([Scarica qui](https://www.docker.com/get-started))

```bash
# 1. Scarica il progetto
git clone https://github.com/tuousername/printlab3d_manager.git
cd printlab3d_manager

# 2. Avvia tutto
docker compose up -d

# 3. Aspetta 2-3 minuti, poi apri il browser
```

**Apri**: http://localhost:8080  
**Credenziali**: `admin@printlab.local` / `admin123`

✅ **Fatto!** Il sistema è pronto con dati di esempio.

---

### Opzione 2: TrueNAS Scale (Con Interfaccia Grafica)

Se hai un server TrueNAS Scale, puoi installare PrintLab 3D Manager usando l'interfaccia grafica:

#### Passo 1: Prepara i File

1. Scarica questo repository sul tuo PC
2. Copia la cartella `printlab3d_manager` sul tuo NAS via SMB/NFS  
   (Es: `/mnt/tank/apps/printlab3d_manager`)

#### Passo 2: Crea le Applicazioni Custom

**A. Database PostgreSQL**

1. Vai in **Apps** → **Discover Apps** → **Custom App**
2. Compila i campi:

   **Nome applicazione**: `printlab-db`
   
   **Image repository**: `postgres`  
   **Image tag**: `16`
   
   **Container environment variables**:
   ```
   POSTGRES_DB=printlab
   POSTGRES_USER=printlab
   POSTGRES_PASSWORD=printlab
   ```
   
   **Storage** → **Add** (Volume host path):
   - **Host Path**: `/mnt/tank/apps/printlab3d_manager/postgres_data`
   - **Mount Path**: `/var/lib/postgresql/data`
   
   **Network** → **Add** (crea network `printlab`):
   - Seleziona "Use different network" → Crea `printlab`
   
   Clicca **Save**

**B. Backend API**

1. **Apps** → **Custom App**
2. Compila:

   **Nome applicazione**: `printlab-backend`
   
   **Image repository**: Devi buildare l'immagine prima (vedi sotto*)
   **Image tag**: `latest`
   
   **Container environment variables**:
   ```
   POSTGRES_HOST=printlab-db
   POSTGRES_PORT=5432
   POSTGRES_DB=printlab
   POSTGRES_USER=printlab
   POSTGRES_PASSWORD=printlab
   SECRET_KEY=CHANGE_ME_IN_PROD
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   LOG_LEVEL=INFO
   ADMIN_EMAIL=admin@printlab.local
   ADMIN_PASSWORD=admin123
   CORS_ORIGINS=http://YOUR_TRUENAS_IP:8080
   ```
   
   **Port Forwarding**:
   - Container Port: `8000` → Node Port: `9000`
   
   **Network**: Seleziona network `printlab`
   
   **Depends On**: `printlab-db` (opzionale ma consigliato)

**C. Frontend Web**

1. **Apps** → **Custom App**
2. Compila:

   **Nome applicazione**: `printlab-web`
   
   **Image repository**: (buildare prima*)
   **Image tag**: `latest`
   
   **Port Forwarding**:
   - Container Port: `80` → Node Port: `8080`
   
   **Network**: Seleziona network `printlab`

#### Passo 3: Accedi

Apri il browser: `http://TUO_IP_TRUENAS:8080`

**Credenziali**: `admin@printlab.local` / `admin123`

---

**\*Nota Build Immagini per TrueNAS**:

TrueNAS Scale non builda automaticamente i Dockerfile. Hai 2 opzioni:

**Opzione A - Build su PC e Push su Docker Hub**:
```bash
# Sul tuo PC con Docker
cd printlab3d_manager/backend
docker build -t tuousername/printlab-backend:latest .
docker push tuousername/printlab-backend:latest

cd ../frontend
docker build -t tuousername/printlab-web:latest .
docker push tuousername/printlab-web:latest
```

Poi usa `tuousername/printlab-backend:latest` e `tuousername/printlab-web:latest` nei campi Image repository.

**Opzione B - Usa Docker Compose nel Shell di TrueNAS**:
```bash
# SSH nel TrueNAS
ssh admin@truenas-ip

# Vai nella cartella
cd /mnt/tank/apps/printlab3d_manager

# Builda e avvia con compose
docker compose up -d --build
```

Questa opzione crea i container classici (non app TrueNAS gestite dall'UI).

---

## 📖 Come Funziona

### 1. **Dashboard - Il Tuo Pannello di Controllo**

Appena fai login, vedi subito:
- 📊 Quanti preventivi hai (bozze, inviati, accettati)
- 🖨️ Job di stampa attivi
- 🧵 Filamenti in stock basso (alert automatici!)
- 💰 Ricavi, costi e margini del mese

### 2. **Inventory Filamenti**

### 2. **Inventory Filamenti**

Registra tutti i tuoi filamenti:
- Materiale (PLA, ABS, PETG, TPU, etc.)
- Tipo (Basic, Plus, Matter, etc.)
- Marca, colore, diametro
- Prezzo acquisto
- Peso residuo (aggiornato automaticamente quando usi i filamenti in un job)
- Dove si trova (sistema di ubicazioni a 4 livelli: Magazzino → Scaffale → Ripiano → Slot)

**Alert automatici** quando il peso scende sotto la soglia minima!

### 3. **Preventivi Professionali**

1. Seleziona cliente
2. Aggiungi righe al preventivo (ogni riga = 1 pezzo/modello):
   - Nome pezzo
   - Stampante da usare
   - Filamento
   - Peso materiale (g)
   - Tempo di stampa (ore:minuti)
   - Quantità
3. Il sistema calcola **automaticamente**:
   - Costo materiale
   - Costo energia elettrica (basato su consumo stampante)
   - Costo manodopera
   - Overhead e margine
   - Prezzo finale

**Genera PDF** e invialo al cliente con un click!

### 4. **Job di Stampa**

Quando il cliente accetta un preventivo:
1. Crea un Job automaticamente dal preventivo
2. Segna lo stato: Pianificato → In Corso → Completato
3. Registra consumi effettivi di filamento
4. Vedi in tempo reale il margine effettivo (confronto preventivo vs consuntivo)

### 5. **Gestione Costi**

Registra tutte le spese del laboratorio:
- Affitto locale
- Elettricità
- Manutenzione stampanti
- Materiali consumabili
- Costi associati a job specifici

Vedi report mensili dei costi per categoria.

---

## 👥 Utenti e Permessi

### 4 Ruoli Disponibili

| Ruolo | Cosa può fare |
|-------|---------------|
| **👑 Admin** | Tutto: gestione utenti, impostazioni, accesso completo |
| **🔧 Operatore** | Gestisce job di stampa, filamenti, ubicazioni (non vede preventivi/clienti) |
| **💼 Commerciale** | Crea preventivi, gestisce clienti (non tocca job/filamenti) |
| **👁️ Viewer** | Solo lettura su tutto (per controllori, contabili, etc.) |

**Come creare nuovi utenti**: Solo gli Admin possono farlo dal menu "Utenti".

---

## ⚙️ Configurazione Avanzata

### Cambia Porte

Se le porte 8080 o 9000 sono già usate sul tuo sistema, modifica `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "9999:8000"  # Usa 9999 invece di 9000
  web:
    ports:
      - "3000:80"   # Usa 3000 invece di 8080
```

Poi riavvia: `docker compose down && docker compose up -d`

### Cambia Password Admin Predefinita

**IMPORTANTE PER PRODUZIONE!**

Crea un file `.env` nella root con:
```bash
ADMIN_PASSWORD=TuaPasswordSicura123!
SECRET_KEY=UnaSuperChiaveSegretaLunga-MinимumCaratteri32
```

### Backup del Database

```bash
# Esporta tutti i dati
docker exec printlab3d_manager-db-1 pg_dump -U printlab printlab > backup_$(date +%Y%m%d).sql

# Ripristina da backup
docker exec -i printlab3d_manager-db-1 psql -U printlab printlab < backup_20260216.sql
```

---

## 🐛 Problemi Comuni

### "Non riesco ad accedere a localhost:8080"

1. Controlla che i container siano running:
   ```bash
   docker compose ps
   ```
   Devono essere tutti `Up (healthy)`

2. Aspetta 2-3 minuti dopo `docker compose up` (le migrazioni DB richiedono tempo)

3. Controlla i log:
   ```bash
   docker compose logs -f backend
   ```

### "CORS error" nel browser

Hai cambiato porta? Devi aggiornare `CORS_ORIGINS` in `backend/app/core/config.py`:
```python
CORS_ORIGINS = ["http://localhost:TUAPORTA"]
```

Poi rebuilda: `docker compose up -d --build backend`

### "Database connection refused"

Il database non è pronto. Aspetta qualche secondo e ricontrolla:
```bash
docker compose restart backend
```

### Reset Completo (Cancella TUTTI i Dati)

```bash
docker compose down -v  # -v cancella anche i volumi del database
docker compose up -d --build
```

⚠️ **ATTENZIONE**: Perderai tutti i dati! Fai backup prima.

---

## 🛠️ Per Sviluppatori

### Stack Tecnologico

**Backend**:
- FastAPI (Python 3.12)
- SQLAlchemy 2.0 + Alembic
- PostgreSQL 16
- JWT Authentication
- Pydantic v2

**Frontend**:
- React 18 + TypeScript
- Vite (build tool)
- Material-UI v5
- Axios + React Router

### Avvia in Modalità Sviluppo

```bash
# Backend (con hot-reload)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (con hot-reload)
cd frontend
npm install
npm run dev  # Sarà su porta 5173
```

### Test

```bash
# Backend tests
docker compose exec backend pytest --cov=app

# Frontend lint
docker compose exec web npm run lint
```

### Migrazioni Database

```bash
# Crea nuova migrazione
docker exec printlab3d_manager-backend-1 alembic revision -m "descrizione"

# Applica migrazioni
docker exec printlab3d_manager-backend-1 alembic upgrade head

# Rollback
docker exec printlab3d_manager-backend-1 alembic downgrade -1
```

---

## 📝 API Documentation

Documentazione interattiva disponibile su:
- **Swagger UI**: http://localhost:9000/docs
- **ReDoc**: http://localhost:9000/redoc
- **OpenAPI JSON**: http://localhost:9000/openapi.json

Esempi di chiamate API:

```bash
# Login
curl -X POST http://localhost:9000/api/v1/auth/login \
  -d "username=admin@printlab.local&password=admin123"

# Lista filamenti (con token)
curl http://localhost:9000/api/v1/filaments \
  -H "Authorization: Bearer TUO_TOKEN"
```

---

## 🤝 Contribuire

Vuoi migliorare PrintLab 3D Manager? I contributi sono benvenuti!

1. Fai un **Fork** del repository
2. Crea un branch per la tua feature: `git checkout -b feature/MiaFeature`
3. Fai commit: `git commit -m 'Aggiungo MiaFeature'`
4. Push: `git push origin feature/MiaFeature`
5. Apri una **Pull Request**

### Roadmap Future (v2.0)

Funzionalità pianificate:
- [ ] Dashboard con grafici storici (Recharts)
- [ ] Report PDF mensili automatici
- [ ] Integrazione con OctoPrint/Klipper
- [ ] API pubbliche per integrazioni esterne
- [ ] Multi-azienda (gestione più laboratori)
- [ ] App mobile (React Native)

---

## 📄 Licenza

Questo progetto è rilasciato sotto **licenza MIT**. Puoi usarlo liberamente, modificarlo e distribuirlo.  
Vedi il file [LICENSE](LICENSE) per i dettagli completi.

---

## ❤️ Supporta il Progetto

Se PrintLab 3D Manager ti è utile:
- ⭐ **Lascia una stella** su GitHub
- 🐛 **Segnala bug** o suggerisci miglioramenti nelle [Issues](https://github.com/tuousername/printlab3d_manager/issues)
- 📢 **Condividi** con altri maker e laboratori
- ☕ **Offrimi un caffè** (link PayPal/Ko-fi se vuoi)

---

## 🙋 FAQ

**Q: È gratis?**  
A: Sì, completamente open source e gratuito.

**Q: Devo per forza usare Docker?**  
A: È il modo più semplice. Puoi anche installare manualmente backend e frontend, ma richiede più configurazione.

**Q: Posso usarlo per più laboratori contemporaneamente?**  
A: Al momento no (single-tenant). La versione multi-tenant è prevista per v2.0.

**Q: È sicuro per uso in produzione?**  
A: Sì, ma **cambia le password di default** e `SECRET_KEY` nel file `.env`!

**Q: Supporta altre lingue oltre l'italiano?**  
A: Attualmente solo italiano. L'internazionalizzazione è in roadmap.

**Q: Posso personalizzare i calcoli dei preventivi?**  
A: Sì! Vai in Impostazioni (da Admin) e modifica i parametri di calcolo.

---

**Fatto con ❤️ per la community Maker**

**⭐ Se ti piace, lascia una stella su GitHub!**
