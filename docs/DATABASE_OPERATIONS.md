# Database migration and recovery guide

## Migration policy

- Flyway is the only schema migration mechanism. Hibernate runs with `ddl-auto=validate`.
- Never edit an applied migration. Add a new, monotonically numbered migration.
- Phase 5 adds `V13__create_production_admin_module.sql` for analytics events, broadcast history, admin audit events, production indexes, and inventory adjustment history.
- Apply migrations to an isolated staging database first and run `mvn clean verify` before production deployment.
- Do not use `flyway repair` against production unless an operator has confirmed the exact checksum discrepancy and preserved a backup.

## Pre-deploy validation

```sql
select installed_rank, version, description, success
from flyway_schema_history
order by installed_rank;

select version()
```

Confirm that all existing rows have `success = true`, the PostgreSQL version is supported by the Supabase project, and the application role can create/alter schema objects during deployment. After deployment, the newest successful migration must be V13.

## Backup strategy

- Production should use a paid Supabase plan with daily backups. Enable Point-in-Time Recovery when the business recovery point objective is shorter than one day.
- Free projects require scheduled off-site logical exports using `supabase db dump` or `pg_dump`.
- Database backups contain Storage metadata, not deleted Storage objects. Back up image/object buckets separately if Supabase Storage is adopted.
- Keep at least one encrypted off-site copy and test restoring it quarterly into a separate project.
- Document recovery targets: recommended initial RPO 24 hours with daily backups (or minutes with PITR) and RTO 4 hours after a rehearsed restore.

## Restore drill

1. Announce a maintenance window and stop writes.
2. Select a backup immediately before the failure, or the required PITR timestamp.
3. Restore/clone into a new Supabase project; do not overwrite the only recoverable production copy during a drill.
4. Set the staging API's database variables to the restored project.
5. Start the API and confirm Flyway validation, health, row counts, recent orders, payments, reward balances, and admin reports.
6. Rotate database credentials used during the drill.
7. Record actual RPO/RTO and any missing operational steps.

Supabase restores can make the project unavailable, and custom database-role passwords might need to be reset after restoration. Plan and communicate downtime.
