# Security Policy

## Versioni Supportate

| Versione | Supportata          |
| -------- | ------------------- |
| 1.0.x    | :white_check_mark: |
| < 1.0    | :x:                |

## Segnalare una Vulnerabilità

Se scopri una vulnerabilità di sicurezza in PrintLab 3D Manager, ti preghiamo di segnalarla in modo responsabile.

### Come Segnalare

**NON** aprire una issue pubblica per vulnerabilità di sicurezza.

Invece, invia una email a: **security@printlab.local** (sostituisci con la tua email)

Includi:
- Descrizione dettagliata della vulnerabilità
- Passi per riprodurla
- Potenziale impatto
- Suggerimenti per la correzione (se disponibili)

### Cosa Aspettarsi

- **Conferma ricezione** entro 48 ore
- **Valutazione iniziale** entro 7 giorni
- **Piano di risoluzione** entro 14 giorni
- **Rilascio patch** in base alla severità

### Severità

- **Critica**: Fix entro 24-48 ore
- **Alta**: Fix entro 7 giorni
- **Media**: Fix nella prossima release minore
- **Bassa**: Fix nella prossima release patch

## Best Practices per Deployment

### In Produzione

1. **Cambia le credenziali di default**
   ```env
   ADMIN_PASSWORD=usa-password-forte-qui
   SECRET_KEY=genera-chiave-segreta-casuale
   POSTGRES_PASSWORD=usa-password-db-forte
   ```

2. **Usa HTTPS**
   - Configura reverse proxy (nginx/traefik) con SSL/TLS
   - Usa certificati Let's Encrypt

3. **Limita accesso al database**
   - Non esporre la porta 5432 pubblicamente
   - Usa network privati Docker

4. **Aggiorna regolarmente**
   ```bash
   git pull origin main
   docker compose down
   docker compose up -d --build
   ```

5. **Backup regolari**
   ```bash
   docker compose exec db pg_dump -U printlab printlab > backup_$(date +%Y%m%d).sql
   ```

6. **Log monitoring**
   - Monitora `docker compose logs -f`
   - Configura log aggregation (ELK, Loki, ecc.)

7. **Rate limiting**
   - Configura rate limiting sul reverse proxy
   - Proteggi endpoint di login

### Variabili Sensibili

Non committare MAI:
- File `.env` con credenziali reali
- Chiavi segrete
- Password
- Token di accesso

Usa `.env.example` come template.

## Funzionalità di Sicurezza

### Implementate

✅ Autenticazione JWT con scadenza token  
✅ Password hashing con bcrypt  
✅ CORS configurabile  
✅ Validazione input con Pydantic  
✅ SQL injection protection (SQLAlchemy ORM)  
✅ HTTPS ready  
✅ Role-Based Access Control (RBAC)  
✅ Health checks per servizi  

### In Roadmap

🔲 Rate limiting integrato  
🔲 2FA (Two-Factor Authentication)  
🔲 Audit log completo  
🔲 Session management avanzato  
🔲 IP whitelisting  
🔲 Brute force protection  

## Auditing

Ogni azione critica viene loggata con:
- User ID
- Timestamp
- Tipo di azione (CREATE, UPDATE, DELETE)
- Entità modificata
- IP address (in roadmap)

Le tabelle `audit_log` contengono la cronologia completa.

---

**Grazie per aiutarci a mantenere PrintLab 3D Manager sicuro! 🔒**
