#!/bin/sh
set -e

mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/storage/app/private \
         /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

echo "[Backend] Waiting for MySQL TCP connection and running migrations..."
ATTEMPTS=0
until php artisan migrate --force; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ "$ATTEMPTS" -ge 30 ]; then
        echo "[Backend] Warning: Database migrations failed after 30 attempts."
        break
    fi
    echo "[Backend] Database not ready yet (attempt $ATTEMPTS/30), retrying in 2s..."
    sleep 2
done

USER_COUNT=$(php artisan tinker --execute="echo \App\Models\User::count();" 2>/dev/null | tr -d '[:space:]' || echo "0")
if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "[Backend] Seeding initial enterprise database..."
    php artisan db:seed --force || true
fi

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

exec "$@"
