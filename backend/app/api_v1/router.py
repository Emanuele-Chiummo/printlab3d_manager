from fastapi import APIRouter

from app.api_v1.endpoints import auth, users, filaments, locations, customers, quotes, jobs, costs, dashboard, settings

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(filaments.router, prefix="/filaments", tags=["filaments"])
api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(quotes.router, prefix="/quotes", tags=["quotes"])
 # rimosso quote_calc_router
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(costs.router, prefix="/costs", tags=["costs"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

