#!/bin/sh
set -eu

./node_modules/.bin/prisma migrate deploy
node dist-seed/prisma/seed/seed.js
exec node dist/main.js
