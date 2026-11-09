#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Pinpoint Launchpad — cPanel Post-Upload Deployment Script
# Run once from the app root after uploading files to the server:
#   bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "==> [1/8] Installing production PHP dependencies..."
if command -v composer >/dev/null 2>&1; then
    composer install --no-dev --optimize-autoloader --no-interaction
elif [ -f composer.phar ]; then
    php composer.phar install --no-dev --optimize-autoloader --no-interaction
else
    echo "Composer was not found. Install Composer or upload composer.phar to the app root."
    exit 1
fi

echo "==> [2/8] Setting storage & bootstrap permissions..."
chmod -R 775 storage bootstrap/cache
chown -R "$(whoami)" storage bootstrap/cache

echo "==> [3/8] Clearing old caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
php artisan event:clear

echo "==> [4/8] Running database migrations..."
php artisan migrate --force

echo "==> [5/8] Seeding required data (safe — skips existing records)..."
php artisan db:seed --class=AdminSeeder --force 2>/dev/null || echo "    AdminSeeder skipped (ADMIN_PASSWORD not set or already seeded)"
php artisan db:seed --class=DiagnosticQuestionSeeder --force 2>/dev/null || echo "    DiagnosticQuestionSeeder skipped"

echo "==> [6/8] Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || echo "    Storage link already exists"

echo "==> [7/8] Caching config, routes, views for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "==> [8/8] Optimising application caches..."
php artisan optimize

echo ""
echo "✓ Deployment complete."
echo ""
echo "IMPORTANT — cPanel Cron Job (add via cPanel > Cron Jobs):"
echo "  * * * * * php $(pwd)/artisan schedule:run >> /dev/null 2>&1"
echo ""
echo "IMPORTANT — Queue Worker (add via cPanel > Terminal or Supervisor):"
echo "  php $(pwd)/artisan queue:work --sleep=3 --tries=3 --max-time=3600"
