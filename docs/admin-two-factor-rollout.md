# Admin Two-Factor Rollout

Two-factor authentication applies only to operations staff using the admin portal. Founder and investor logins are unchanged.

## First deployment

1. Set `ADMIN_TWO_FACTOR_ENABLED=false` in the production `.env` file.
2. Deploy the application with `bash deploy.sh`. This installs Fortify, runs the database migration, and rebuilds Laravel's caches.
3. Ask each operations team member to sign in and open `/admin/two-factor/setup`.
4. Each person scans the QR code, confirms a six-digit code, and saves their recovery codes.
5. A superadmin checks each member's Team edit page and confirms the status shows **Enabled**.
6. Change `ADMIN_TWO_FACTOR_ENABLED=true` in the production `.env` file.
7. Run `php artisan config:clear` followed by `php artisan config:cache`.
8. Sign out and verify one complete password plus authenticator login.

## Live checks

- An enrolled staff member is challenged after entering their password.
- An incorrect authenticator code is rejected.
- A recovery code works once and cannot be reused.
- An unconfigured staff member is sent to setup before entering an admin desk.
- A superadmin can reset another staff member's 2FA from Team.
- A reset staff member is sent through setup on their next admin request.
- Founder and investor logins continue to work without this challenge.

## Emergency rollback

Set `ADMIN_TWO_FACTOR_ENABLED=false`, then run:

```bash
php artisan config:clear
php artisan config:cache
```

This pauses enforcement without deleting anyone's authenticator setup. Set the value back to `true` and rebuild the config cache to resume enforcement.
