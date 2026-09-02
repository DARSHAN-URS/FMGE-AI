"""
NursePass API Package
=====================
Combined router aggregating all NursePass endpoint modules.
Mounted under prefix /api/nursepass by the main application.

NOTE: Sub-modules are imported using their full module path to avoid
circular import with the 'nursepass' package name itself.
"""
from fastapi import APIRouter
import importlib

def _import_router(module_path: str, attr: str = "router"):
    """Import a router from a module path, handling missing modules gracefully."""
    try:
        mod = importlib.import_module(module_path)
        return getattr(mod, attr)
    except (ImportError, AttributeError) as e:
        import logging
        logging.getLogger(__name__).warning(f"Could not import {module_path}: {e}")
        return None

# Aggregated NursePass router
nursepass_router = APIRouter(tags=["NursePass"])

# Import each NursePass sub-router by full module path (avoids circular import)
_sub_modules = [
    "app.api.nursepass_core",       # core (renamed to avoid collision)
    "app.api.nursepass_auth",
    "app.api.nursepass_dashboard",
    "app.api.nursepass_mock_engine",
    "app.api.nursepass_planner",
    "app.api.nursepass_writing",
    "app.api.nursepass_tutor",
    "app.api.nursepass_speaking",
    "app.api.nursepass_analytics",
    "app.api.nursepass_certificates",
    "app.api.nursepass_payments",
    "app.api.nursepass_notifications",
    "app.api.nursepass_institution",
    "app.api.nursepass_admin",
]

# Direct imports (these use relative paths from api/ parent package)
from ..nursepass_auth import router as _auth_router
from ..nursepass_dashboard import router as _dashboard_router
from ..nursepass_mock_engine import router as _mock_router
from ..nursepass_planner import router as _planner_router
from ..nursepass_writing import router as _writing_router
from ..nursepass_tutor import router as _tutor_router
from ..nursepass_speaking import router as _speaking_router
from ..nursepass_analytics import router as _analytics_router
from ..nursepass_certificates import router as _certificates_router
from ..nursepass_payments import router as _payments_router
from ..nursepass_notifications import router as _notifications_router
from ..nursepass_institution import router as _institution_router
from ..nursepass_admin import router as _admin_router


nursepass_router.include_router(_auth_router)
nursepass_router.include_router(_dashboard_router)
nursepass_router.include_router(_mock_router)
nursepass_router.include_router(_planner_router)
nursepass_router.include_router(_writing_router)
nursepass_router.include_router(_tutor_router)
nursepass_router.include_router(_speaking_router)
nursepass_router.include_router(_analytics_router)
nursepass_router.include_router(_certificates_router)
nursepass_router.include_router(_payments_router)
nursepass_router.include_router(_notifications_router)
nursepass_router.include_router(_institution_router)
nursepass_router.include_router(_admin_router)
