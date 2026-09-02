"""
Healthcare AI Suite — Unified FastAPI Backend
=============================================
Modular Monolith serving all products from one engine:
  - Aura Routes  (/api/aura/*)
  - NursePass    (/api/nursepass/*)
  - FMGE AI      (/api/fmge/*)
  - Common       (/api/common/*)

All existing route prefixes are preserved for backward compatibility.
"""
import logging
import os
import time
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base, SessionLocal

# ─── Product Routers (new namespaced aggregates) ───────────────────────────────
from .api.aura import aura_router
from .api.nursepass import nursepass_router
from .api.common import common_router
from .api.fmge import fmge_router

# ─── Seed Services ────────────────────────────────────────────────────────────
from .services.payment_service import (
    seed_initial_services, seed_dashboard_defaults, seed_universities,
    seed_applications, seed_scholarships, seed_whatsapp_defaults,
    seed_indian_colleges, seed_mbbs_universities
)
from .services.explorer_service import seed_explorer_data
from .services.knowledge_service import seed_knowledge_data
from .services.communication_service import seed_communication_data
from .services.nursepass_service import seed_nursepass_data

# ─── Logger ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Database Initialization ──────────────────────────────────────────────────
try:
    logger.info("Initializing database schemas...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")

    db = SessionLocal()
    try:
        seed_initial_services(db)
        seed_dashboard_defaults(db)
        seed_universities(db)
        seed_applications(db)
        seed_scholarships(db)
        seed_whatsapp_defaults(db)
        seed_explorer_data(db)
        seed_knowledge_data(db)
        seed_communication_data(db)
        seed_indian_colleges(db)
        seed_mbbs_universities(db)
        seed_nursepass_data(db)
    finally:
        db.close()
except Exception as e:
    logger.error(f"Failed to initialize database or seed data: {str(e)}")

# ─── FastAPI Application ───────────────────────────────────────────────────────
app = FastAPI(
    title="Healthcare AI Suite — Unified Backend",
    description=(
        "Production-grade FastAPI Modular Monolith powering:\n"
        "• **Aura Routes** — Study Abroad, Visa & University Portal\n"
        "• **NursePass** — AI Nursing Licensing Exam Prep (NCLEX, CBT, OET, DHA, HAAD, MOH)\n"
        "• **FMGE AI** — Medical Licensing Exam Prep (Coming Soon)\n\n"
        "All products share one backend, one database, one AI engine, one payment engine, and one auth system."
    ),
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# ─── CORS Configuration ───────────────────────────────────────────────────────
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=r"https?://.*\.?(auraroutes\.com|nursepass\.com|localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# ─── Product Source Detection Middleware ───────────────────────────────────────
@app.middleware("http")
async def detect_product_source(request: Request, call_next):
    """Automatically detect which SaaS product is calling this backend."""
    origin = request.headers.get("origin", "") or request.headers.get("referer", "")
    if "nursepass" in origin:
        request.state.product = "NURSEPASS"
    elif "fmge" in origin:
        request.state.product = "FMGE"
    else:
        request.state.product = "AURA"
    response = await call_next(request)
    response.headers["X-Product-Source"] = request.state.product
    return response

# ─── Global Exception Handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    app_env = os.getenv("APP_ENV", "production").lower()
    detail = str(exc) if app_env == "development" else "An internal server error occurred. Support has been notified."
    return JSONResponse(status_code=500, content={"detail": detail})

# ─── Register Product Routers ─────────────────────────────────────────────────
# New namespaced product routers (Healthcare AI Suite monorepo architecture)
app.include_router(aura_router)
app.include_router(nursepass_router)
app.include_router(common_router)
app.include_router(fmge_router)

# ─── Root & Suite-Level Endpoints ─────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    """Root health check — for Railway, Docker, and load balancer probes."""
    return {
        "status": "healthy",
        "service": "Healthcare AI Suite — Unified Backend",
        "version": "2.0.0",
        "products": ["aura-routes", "nursepass", "fmge-ai"],
        "timestamp": time.time()
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "name": "Healthcare AI Suite",
        "description": "Unified backend serving Aura Routes, NursePass, and FMGE AI",
        "docs": "/api/docs",
        "health": "/health",
        "products": {
            "aura_routes": {"health": "/api/aura/health", "docs": "https://auraroutes.com"},
            "nursepass": {"health": "/api/nursepass/health", "docs": "https://nursepass.com"},
            "fmge_ai": {"health": "/api/fmge/health", "status": "coming_soon"}
        }
    }
