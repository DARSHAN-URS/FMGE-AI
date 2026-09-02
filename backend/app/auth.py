import os
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
import jwt
from jwt import PyJWKClient
from .config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)

# Global JWK client cached to avoid multiple network calls
jwk_client = None

def get_jwk_client() -> PyJWKClient:
    global jwk_client
    if jwk_client is not None:
        return jwk_client
        
    supabase_url = settings.supabase_url or os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    if not supabase_url or "your-supabase-project" in supabase_url or "placeholder" in supabase_url:
        return None
        
    # Strip any trailing slash
    supabase_url = supabase_url.rstrip("/")
    jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
    
    try:
        # Initialize PyJWKClient with caching options
        jwk_client = PyJWKClient(jwks_url, cache_jwk_set=True, lifespan=3600)
        return jwk_client
    except Exception as err:
        logger.warning(f"Could not initialize PyJWKClient: {err}")
        return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Decodes and verifies the Supabase JWT token from the Authorization header.
    Supports symmetric (HS256 via SUPABASE_JWT_SECRET) and asymmetric (ES256/RS256 via JWKS),
    as well as development mock auth tokens.
    """
    app_env = os.getenv("APP_ENV", "development").lower()
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET") or os.getenv("JWT_SECRET")

    # 1. Enforce token presence
    if not credentials:
        if app_env == "development":
            return {"sub": "demo_user", "email": "student@auraroutes.com", "role": "authenticated"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials are required to access this resource."
        )

    token = credentials.credentials
    if not token or token == "mock-dev-token" or token.startswith("mock-"):
        return {"sub": "demo_user", "email": "student@auraroutes.com", "role": "authenticated"}

    # 2. Try symmetric secret (HS256) if SUPABASE_JWT_SECRET is configured
    if jwt_secret:
        try:
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User session token has expired. Please sign in again."
            )
        except Exception:
            # Fall through to JWKS attempt
            pass

    # 3. Try JWKS asymmetric verification if Supabase URL is available
    client = get_jwk_client()
    if client:
        try:
            signing_key = client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "RS256"],
                options={"verify_aud": False}
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User session token has expired. Please sign in again."
            )
        except Exception as e:
            if app_env == "development":
                logger.warning(f"JWKS verification fallback in dev mode: {e}")
            else:
                logger.error(f"JWT Verification Error: {e}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Cryptographic authentication verification failed: {str(e)}"
                )

    # 4. In development mode, allow unverified decoding of valid JWT structures or fallback
    if app_env == "development":
        try:
            return jwt.decode(token, options={"verify_signature": False})
        except Exception:
            return {"sub": "demo_user", "email": "student@auraroutes.com", "role": "authenticated"}

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token or authentication server not configured."
    )

