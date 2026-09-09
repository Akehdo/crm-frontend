#!/bin/sh
set -eu
: "${CRM_DOMAIN:=oyu-cargo-crm.me}"
export CRM_DOMAIN
case "$CRM_DOMAIN" in
  ''|*[!a-zA-Z0-9.-]*|.*|-*) echo 'Invalid CRM_DOMAIN' >&2; exit 1 ;;
esac
template=/etc/nginx/crm/http.conf.template
case "${CRM_HTTPS_MODE:-off}" in
  off) template=/etc/nginx/crm/local.conf.template ;;
  auto)
    if [ -f "/etc/letsencrypt/live/$CRM_DOMAIN/fullchain.pem" ] &&
       [ -f "/etc/letsencrypt/live/$CRM_DOMAIN/privkey.pem" ]; then
      template=/etc/nginx/crm/https.conf.template
    fi
    ;;
  *) echo 'CRM_HTTPS_MODE must be off or auto' >&2; exit 1 ;;
esac
# Keep nginx variables such as $uri intact.
envsubst '${CRM_DOMAIN}' < "$template" > /etc/nginx/conf.d/default.conf
nginx -t
