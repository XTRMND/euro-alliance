#!/bin/sh
# Run by CI over SSH (a forced command for the deploy key in root's authorized_keys): pull the
# new staging image and restart the site. Whatever command the client sends is ignored.
set -eu
cd /opt/euro-alliance-staging
docker compose pull --quiet site
docker compose up -d --no-build --remove-orphans
docker image prune -f >/dev/null
docker compose ps site
