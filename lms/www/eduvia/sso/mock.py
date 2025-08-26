import time
import uuid
from datetime import datetime, timedelta, timezone

import frappe

try:
    import jwt  # PyJWT
except Exception:
    jwt = None


def _now_utc():
    return datetime.now(timezone.utc)


def get_context(context):
    conf = frappe.get_conf()

    if not conf.get("eduvia_sso_mock_enabled"):
        frappe.throw("Mock désactivé. Ajoutez eduvia_sso_mock_enabled: 1 dans site_config.json")

    if jwt is None:
        frappe.throw("PyJWT manquant. Installez-le: bench pip install PyJWT")

    shared_secret = conf.get("eduvia_sso_shared_secret")
    if not shared_secret:
        frappe.throw("Ajoutez eduvia_sso_shared_secret dans site_config.json")

    algorithm = conf.get("eduvia_sso_algorithm", "HS256")
    cookie_name = conf.get("eduvia_sso_cookie_name", "eduvia_sso")
    # Optionnel: mets "lms.localhost" en dev HTTP, ou ".eduvia.app" en prod HTTPS
    cookie_domain = conf.get("eduvia_sso_cookie_domain")
    cookie_path = conf.get("eduvia_sso_cookie_path", "/")
    cookie_ttl_seconds = int(conf.get("eduvia_sso_cookie_ttl_seconds", 120))
    issuer = conf.get("eduvia_sso_issuer", "eduvia")
    audience = conf.get("eduvia_sso_audience", "lms-eduvia")

    user_email = frappe.form_dict.get("email") or "demo.user@eduvia.local"
    return_url = frappe.form_dict.get("return") or "/"

    now = _now_utc()
    expires = now + timedelta(seconds=cookie_ttl_seconds)
    claims = {
        "iss": issuer,
        "aud": audience,
        "sub": user_email,
        "email": user_email,
        "iat": int(now.timestamp()),
        "exp": int(expires.timestamp()),
        "jti": str(uuid.uuid4()),
    }

    token = jwt.encode(claims, shared_secret, algorithm=algorithm)

    is_https = getattr(getattr(frappe, "request", None), "scheme", "") == "https"
    default_secure = 1 if is_https else 0
    secure_flag = bool(int(conf.get("eduvia_sso_cookie_secure", default_secure)))

    # Set the cookie
    cookies = frappe.local.response.setdefault("cookie", {})
    cookie = {
        "value": token,
        "path": cookie_path,
        "secure": False, # change to True for production
        "httponly": True,
        "samesite": "Lax",
        "max_age": cookie_ttl_seconds,
        "expires": int(time.time()) + cookie_ttl_seconds,
    }
    if cookie_domain:
        cookie["domain"] = cookie_domain  # otherwise host-only

    cookies[cookie_name] = cookie

    # Redirect to the original page
    frappe.local.flags.redirect_location = return_url
    raise frappe.Redirect