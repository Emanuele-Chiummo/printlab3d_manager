# Contributing to PrintLab 3D Manager

Prima di tutto, grazie per il tuo interesse nel contribuire a PrintLab 3D Manager! 🎉

## Come Contribuire

### Segnalare Bug

Se trovi un bug, apri una [Issue](https://github.com/tuousername/printlab3d_manager/issues) includendo:

- **Descrizione chiara** del problema
- **Passi per riprodurlo**
- **Comportamento atteso** vs **comportamento osservato**
- **Screenshot** se applicabile
- **Ambiente**: OS, browser, versione Docker

### Proporre Nuove Features

Apri una [Issue](https://github.com/tuousername/printlab3d_manager/issues) con:

- **Descrizione dettagliata** della feature
- **Caso d'uso** reale
- **Mockup/esempi** se possibile

### Pull Request

1. **Fork** il repository
2. **Crea un branch** dalla `main`:
   ```bash
   git checkout -b feature/nome-feature
   # oppure
   git checkout -b fix/nome-bug
   ```

3. **Sviluppa** la tua modifica:
   - Segui lo stile del codice esistente
   - Aggiungi test se aggiungi codice
   - Aggiorna la documentazione

4. **Testa localmente**:
   ```bash
   # Backend tests
   docker compose exec backend pytest
   
   # Frontend build
   docker compose exec web npm run build
   ```

5. **Commit** con messaggi chiari:
   ```bash
   git commit -m "feat: aggiungi ricerca filamenti per colore"
   git commit -m "fix: correggi calcolo margine preventivi"
   git commit -m "docs: aggiorna README con nuove API"
   ```

6. **Push** e apri una **Pull Request**:
   ```bash
   git push origin feature/nome-feature
   ```

## Stile del Codice

### Backend (Python)
- Segui [PEP 8](https://pep8.org/)
- Usa type hints
- Docstring per funzioni complesse
- Nomi variabili in `snake_case`

```python
def calculate_total_cost(
    material_cost: float,
    labor_hours: float,
    overhead_pct: float
) -> float:
    """Calcola il costo totale includendo overhead."""
    return (material_cost + labor_hours * HOURLY_RATE) * (1 + overhead_pct / 100)
```

### Frontend (TypeScript/React)
- Usa TypeScript strict mode
- Componenti funzionali con hooks
- Nomi componenti in `PascalCase`, funzioni in `camelCase`
- Props tipizzate con interfaces

```typescript
interface KPICardProps {
  label: string
  value: number | string
  icon: React.ReactNode
}

function KPICard({ label, value, icon }: KPICardProps) {
  return <Card>...</Card>
}
```

### Git Commit Messages

Usa [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nuova feature
- `fix:` bug fix
- `docs:` documentazione
- `style:` formattazione
- `refactor:` refactoring
- `test:` aggiunta test
- `chore:` maintenance

## Struttura Branch

- `main` - branch stabile, pronto per produzione
- `develop` - branch di sviluppo
- `feature/*` - nuove features
- `fix/*` - bug fixes
- `docs/*` - solo documentazione

## Testing

### Backend
```bash
# Tutti i test
docker compose exec backend pytest

# Con coverage
docker compose exec backend pytest --cov=app --cov-report=html

# Test specifico
docker compose exec backend pytest app/tests/test_auth.py -v
```

### Frontend
```bash
# Build check
docker compose exec web npm run build

# Lint
docker compose exec web npm run lint
```

## Domande?

Apri una [Discussion](https://github.com/tuousername/printlab3d_manager/discussions) per:
- Domande generali
- Proposte di architettura
- Richieste di chiarimenti

---

**Grazie per contribuire! 🙌**
