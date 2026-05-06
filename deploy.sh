#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Pinpoint Launchpad — cPanel Post-Upload Deployment Script
# Run once from the app root after uploading files to the server:
#   bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "==> [1/7] Setting storage & bootstrap permissions..."
chmod -R 775 storage bootstrap/cache
chown -R "$(whoami)" storage bootstrap/cache

echo "==> [2/7] Clearing old caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
php artisan event:clear

echo "==> [3/7] Running database migrations..."
php artisan migrate --force

echo "==> [4/7] Seeding required data (safe — skips existing records)..."
php artisan db:seed --class=AdminSeeder --force 2>/dev/null || echo "    AdminSeeder skipped (ADMIN_PASSWORD not set or already seeded)"
php artisan db:seed --class=DiagnosticQuestionSeeder --force 2>/dev/null || echo "    DiagnosticQuestionSeeder skipped"

echo "==> [5/7] Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || echo "    Storage link already exists"

echo "==> [6/7] Caching config, routes, views for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "==> [7/7] Optimising autoloader..."
php artisan optimize

echo ""
echo "✓ Deployment complete."
echo ""
echo "IMPORTANT — cPanel Cron Job (add via cPanel > Cron Jobs):"
echo "  * * * * * php $(pwd)/artisan schedule:run >> /dev/null 2>&1"
echo ""
echo "IMPORTANT — Queue Worker (add via cPanel > Terminal or Supervisor):"
echo "  php $(pwd)/artisan queue:work --sleep=3 --tries=3 --max-time=3600"
