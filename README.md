# 🖨️ PrintLab 3D Manager

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Gestionale web self-hosted completo per la gestione di laboratori di stampa 3D**

Sistema integrato per la gestione di inventario filamenti, preventivi, job di stampa, costi operativi e analisi finanziarie. Progettato per piccoli laboratori di stampa 3D che necessitano di uno strumento professionale, open-source e facilmente personalizzabile.

---

## 📋 Indice

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🏗️ Architettura](#️-architettura)
- [🛠️ Stack Tecnologico](#️-stack-tecnologico)
- [📁 Struttura del Progetto](#-struttura-del-progetto)
- [⚙️ Configurazione](#️-configurazione)
- [👥 Gestione Utenti](#-gestione-utenti)
- [🧪 Testing](#-testing)
- [🐛 Troubleshooting](#-troubleshooting)
- [📝 API Documentation](#-api-documentation)
- [🤝 Contribuire](#-contribuire)
- [📄 Licenza](#-licenza)

---

## ✨ Features

### 📊 Dashboard Finanziaria
- **KPI in tempo reale**: Preventivi, job, stock, clienti attivi
- **Metriche finanziarie**: Ricavi, costi, utile mensile
- **Margine medio** calcolato automaticamente sui job completati

### 💼 Gestione Preventivi
- Creazione e versionamento preventivi multi-cliente
- Calcolo automatico dei costi (materiali, energia, manodopera, overhead)
- Stati preventivo: BOZZA → INVIATO → ACCETTATO/RIFIUTATO
- Generazione PDF automatica

### 🖨️ Job di Stampa
- Creazione job da preventivi accettati
- Tracciamento stato: PIANIFICATO → IN_CORSO → COMPLETATO/ANNULLATO
- Registrazione consumi filamento per job
- Calcolo costi effettivi e margini

### 🧵 Inventario Filamenti
- Gestione anagrafica filamenti (materiale, colore, diametro, fornitore)
- Sistema di ubicazioni gerarchiche (magazzino/scaffale/ripiano/slot)
- Tracking peso residuo e soglie di riordino
- Alert stock basso

### 💰 Gestione Costi
- Categorie di costo personalizzabili
- Registrazione costi mensili per periodo
- Associazione costi a job specifici
- Report costi per cliente, job, categoria

### 👥 Multi-utente con RBAC
- 4 ruoli: **Admin**, **Operator**, **Commercial**, **Viewer**
- Autenticazione JWT sicura
- Permessi granulari per endpoint

### 📈 Analytics e Report
- Report costi mensili aggregati
- Report per cliente e per job
- Analisi margini e redditività

---

## 🚀 Quick Start

### Prerequisiti

- **Docker** versione 20.10+
- **Docker Compose** v2+ (plugin `docker compose`)

### Installazione

1. **Clona il repository**
   ```bash
   git clone https://github.com/tuousername/printlab3d_manager.git
   cd printlab3d_manager
   ```

2. **Avvia i container**
   ```bash
   docker compose up -d --build
   ```

3. **Attendi il completamento** (circa 2-3 minuti)
   ```bash
   docker compose ps
   ```
   Tutti i container devono essere nello stato `Up (healthy)`

4. **Accedi all'applicazione**
   - **Frontend**: http://localhost:8080
   - **API Swagger**: http://localhost:9000/docs
   - **OpenAPI JSON**: http://localhost:9000/openapi.json

### Credenziali Demo

Il sistema viene inizializzato con utenti di test:

| Ruolo | Email | Password | Permessi |
|-------|-------|----------|----------|
| Admin | `admin@printlab.local` | `admin123` | Accesso completo |
| Operator | `operatore@printlab.local` | `operatore123` | Gestione job e inventario |
| Commercial | `commerciale@printlab.local` | `commerciale123` | Preventivi e clienti |
| Viewer | `viewer@printlab.local` | `viewer123` | Sola lettura |

### Dati Demo Inclusi

Il database viene popolato automaticamente con:
- ✅ 1 albero ubicazioni (Magazzino → Scaffale A → Ripiano 1 → Slot 1)
- ✅ 2 filamenti (PLA Bianco 1kg, PETG Nero 1kg con stock basso)
- ✅ 2 clienti (Mario Rossi, Maria Bianchi)
- ✅ 2 preventivi (PRV-0001 BOZZA, PRV-0002 ACCETTATO)
- ✅ 1 job in corso generato da PRV-0002
- ✅ Categorie costi predefinite + registrazioni demo

---

## 🏗️ Architettura

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   NGINX + SPA   │─────▶│  FastAPI Backend │─────▶│  PostgreSQL 16  │
│  (React/Vite)   │      │   (Python 3.11)  │      │                 │
│  Port 8080      │      │   Port 9000      │      │   Port 5432     │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

- **Frontend**: Single Page Application (React + TypeScript + Vite + Material-UI)
- **Backend**: REST API (FastAPI + SQLAlchemy + Alembic)
- **Database**: PostgreSQL 16 con migrazioni automatiche
- **Deployment**: Docker Compose con health checks

---

## 🛠️ Stack Tecnologico

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) 0.100+
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) 2.0
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: [Pydantic](https://pydantic.dev/) v2
- **Database**: PostgreSQL 16
- **Testing**: pytest

### Frontend
- **Framework**: [React](https://reactjs.org/) 18
- **Language**: TypeScript 5
- **Build Tool**: [Vite](https://vitejs.dev/)
- **UI Library**: [Material-UI](https://mui.com/) v5
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (per servire SPA)
- **Reverse Proxy**: Nginx (API proxy)

---

## 📁 Struttura del Progetto

```
printlab3d_manager/
├── backend/
│   ├── alembic/              # Migrazioni database
│   │   └── versions/         # File migrazioni (a0001-a0005)
│   ├── app/
│   │   ├── api_v1/           # Endpoints REST API
│   │   │   ├── endpoints/    # Routes (auth, jobs, costs, etc.)
│   │   │   ├── deps.py       # Dependencies (auth, db)
│   │   │   └── router.py     # Router principale
│   │   ├── core/             # Config, security, logging
│   │   ├── db/               # Database session, seed data
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── main.py           # FastAPI app
│   ├── Dockerfile
│   ├── requirements.txt
│   └── entrypoint.sh
├── frontend/
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # React components
│   │   ├── layouts/          # Layout components
│   │   ├── pages/            # Page components
│   │   └── theme/            # Material-UI theme
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚙️ Configurazione

### Variabili d'Ambiente

Crea un file `.env` nella root del progetto (opzionale, valori di default inclusi):

```bash
# Database
POSTGRES_DB=printlab
POSTGRES_USER=printlab
POSTGRES_PASSWORD=printlab

# Backend
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440
LOG_LEVEL=INFO

# Admin iniziale
ADMIN_EMAIL=admin@printlab.local
ADMIN_PASSWORD=admin123
```

### Personalizzazione

#### Porte
Modifica in `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "9000:8000"  # Cambia 9000 con la porta desiderata
  web:
    ports:
      - "8080:80"    # Cambia 8080 con la porta desiderata
```

#### CORS
Modifica in `backend/app/core/config.py`:
```python
CORS_ORIGINS: str | list[str] = ["http://localhost:8080", "https://tuodominio.com"]
```

---

## 👥 Gestione Utenti

### Ruoli e Permessi

| Ruolo | Preventivi | Job | Filamenti | Clienti | Costi | Utenti | Ubicazioni |
|-------|------------|-----|-----------|---------|-------|--------|------------|
| **Admin** | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W |
| **Operator** | ❌ | ✅ R/W | ✅ R/W | ❌ | ❌ | ❌ | ✅ R/W |
| **Commercial** | ✅ R/W | ❌ | 👁️ R | ✅ R/W | 👁️ R | ❌ | ❌ |
| **Viewer** | 👁️ R | 👁️ R | 👁️ R | 👁️ R | 👁️ R | ❌ | 👁️ R |

### Creazione Nuovi Utenti

1. **Via UI**: Accedi come Admin → Menu "Utenti" → "Crea Utente"
2. **Via API**: POST `/api/v1/users/` (richiede token Admin)

---

## 🧪 Testing

### Test Backend

```bash
# Esegui tutti i test
docker compose exec backend pytest

# Test con coverage
docker compose exec backend pytest --cov=app --cov-report=html

# Test specifico
docker compose exec backend pytest app/tests/test_smoke.py -v
```

### Test Manuale API

Usa Swagger UI:
```
http://localhost:9000/docs
```

Oppure cURL:
```bash
# Login
curl -X POST http://localhost:9000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@printlab.local&password=admin123"

# Dashboard KPI
curl http://localhost:9000/api/v1/dashboard/kpi \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🐛 Troubleshooting

### Container non si avvia

```bash
# Verifica log
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f web

# Verifica health status
docker compose ps

# Ricrea container
docker compose down
docker compose up -d --build
```

### Errori database

```bash
# Reset completo database (ATTENZIONE: cancella tutti i dati!)
docker compose down -v
docker compose up -d --build
```

### Errori CORS

Verifica che:
- Frontend su `http://localhost:8080`
- Backend CORS configurato per `http://localhost:8080`
- Hard refresh browser (Cmd+Shift+R o Ctrl+Shift+R)

### Cache browser

```bash
# Apri in modalità incognito
# Oppure svuota cache:
# Chrome: F12 > Network > Disable cache
# Firefox: F12 > Network > Disable cache
```

---

## 📝 API Documentation

### Endpoints Principali

- **Auth**: `/api/v1/auth/login`, `/api/v1/auth/me`
- **Dashboard**: `/api/v1/dashboard/kpi`
- **Users**: `/api/v1/users/`
- **Customers**: `/api/v1/customers/`
- **Filaments**: `/api/v1/filaments/`
- **Locations**: `/api/v1/locations/`
- **Quotes**: `/api/v1/quotes/`
- **Jobs**: `/api/v1/jobs/`
- **Costs**: `/api/v1/costs/`

### Documentazione Interattiva

- **Swagger UI**: http://localhost:9000/docs
- **ReDoc**: http://localhost:9000/redoc
- **OpenAPI JSON**: http://localhost:9000/openapi.json

---

## 🤝 Contribuire

I contributi sono benvenuti! Per contribuire:

1. **Fork** il repository
2. **Crea** un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. **Push** al branch (`git push origin feature/AmazingFeature`)
5. **Apri** una Pull Request

### Linee Guida

- Segui lo stile del codice esistente
- Aggiungi test per nuove feature
- Aggiorna la documentazione
- Scrivi commit messages chiari

---

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

---

## 👨‍💻 Autore

Sviluppato con ❤️ per la community Open Source

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) per l'eccellente framework
- [Material-UI](https://mui.com/) per i componenti UI
- [SQLAlchemy](https://www.sqlalchemy.org/) per l'ORM
- Tutti i contributor del progetto

---

**⭐ Se questo progetto ti è utile, lascia una stella su GitHub!**
