import frappe
from urllib.parse import urlencode

def get_context(context):
    return_url = frappe.form_dict.get("return") or "/"
    email = frappe.form_dict.get("email")
    conf = frappe.get_conf()

    if conf.get("eduvia_sso_mock_enabled"):
        params = {"return": return_url}
        if email:
            params["email"] = email
        target = f"{frappe.utils.get_url('/eduvia/sso/mock')}?{urlencode(params)}"
    else:
        eduvia_start = conf.get("eduvia_sso_start_url") or "https://app.eduvia.app/sso/start"
        target = f"{eduvia_start}?{urlencode({'return': return_url})}"

    frappe.local.flags.redirect_location = target
    raise frappe.Redirect