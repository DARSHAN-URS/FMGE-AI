"""
Healthcare AI Suite — Unified Settings
======================================
Single source of truth for all environment variables across
Aura Routes, NursePass, FMGE AI, and future products.
"""
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Server ───────────────────────────────────────────────────────────────
    app_env: str = "production"
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = (
        "http://localhost:3000,"
        "http://localhost:3001,"
        "http://localhost:3002,"
        "https://auraroutes.com,"
        "https://www.auraroutes.com,"
        "https://routes.auraroutes.com,"
        "https://nursepass.auraroutes.com,"
        "https://fmge.auraroutes.com,"
        "https://api.auraroutes.com,"
        "https://nursepass.com,"
        "https://www.nursepass.com"
    )


    # ── Database ─────────────────────────────────────────────────────────────
    # Shared PostgreSQL / Supabase — one database for all products.
    # application_type column on each table isolates product data.
    database_url: str = "sqlite:///./aura.db"

    # ── Redis ─────────────────────────────────────────────────────────────────
    redis_url: str = ""

    # ── Supabase Auth & Storage ───────────────────────────────────────────────
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""
    # Legacy alias kept for backward compat
    supabase_key: str = ""

    # ── AI Providers — Shared Engine ─────────────────────────────────────────
    default_ai_provider: str = "openai"    # openai | anthropic | google | replicate
    default_ai_model: str = "gpt-4o"
    openai_api_key: str = ""
    replicate_api_token: str = ""
    gemini_api_key: str = ""
    anthropic_api_key: str = ""

    # ── Payments — Shared Razorpay ────────────────────────────────────────────
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""

    # ── Notifications — Email ─────────────────────────────────────────────────
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_sender: str = "Healthcare AI Suite <noreply@healthcare-suite.com>"
    resend_api_key: str = ""

    # ── Security ──────────────────────────────────────────────────────────────
    jwt_secret: str = ""

    # ── Feature Flags ─────────────────────────────────────────────────────────
    enable_nursepass: bool = True
    enable_fmge: bool = False
    enable_redis_cache: bool = False

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Emit a startup warning if no AI key is configured
if not settings.openai_api_key and not settings.replicate_api_token:
    import logging
    logging.getLogger(__name__).warning(
        "Neither OPENAI_API_KEY nor REPLICATE_API_TOKEN is configured. AI features will run in mock/fallback mode."
    )

