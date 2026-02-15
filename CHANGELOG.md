# Changelog

Tutte le modifiche importanti a questo progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/lang/it/).

## [1.0.0] - 2026-02-15

### ✨ Added
- **Dashboard finanziaria** con 8 KPI in tempo reale
  - Preventivi mese
  - Job in corso
  - Stock basso
  - Clienti attivi
  - Ricavi mensili
  - Costi mensili
  - Utile mensile
  - Margine medio
- **Gestione preventivi** con versionamento e generazione PDF
- **Job di stampa** con tracking stato e consumi filamento
- **Inventario filamenti** con ubicazioni gerarchiche
- **Gestione costi** per categoria e periodo
- **Sistema multi-utente** con 4 ruoli (Admin, Operator, Commercial, Viewer)
- **Autenticazione JWT** sicura
- **Report costi** per cliente, job e mese
- **Alert stock basso** per filamenti sotto soglia
- **Seed data** automatico per demo

### 🔧 Technical
- Backend FastAPI con Python 3.11
- Frontend React 18 + TypeScript + Material-UI
- Database PostgreSQL 16
- ORM SQLAlchemy 2.0 con Alembic migrations
- Docker Compose per deployment
- Health checks per tutti i servizi
- API documentation con Swagger/ReDoc
- CORS configurabile

### 📝 Documentation
- README completo con quickstart
- API documentation interattiva
- Guida troubleshooting
- Contributing guidelines
- MIT License

---

## [Unreleased]

### 🚀 Planned
- Export Excel preventivi e report
- Notifiche email per stock basso
- Dashboard grafici avanzati (Chart.js)
- Gestione stampanti 3D
- Tracking tempi stampa effettivi
- Calendar view per job pianificati
- Multi-language support (EN, IT)
- Dark mode

---

## Versioning

- **MAJOR** version: breaking changes
- **MINOR** version: nuove features backward-compatible
- **PATCH** version: bug fixes

[1.0.0]: https://github.com/tuousername/printlab3d_manager/releases/tag/v1.0.0
