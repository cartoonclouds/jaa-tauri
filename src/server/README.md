# server

Server-only code for Nuxt server runtime.

Updated: 2026-05-23.

## System Architecture Reference

See the [system architecture diagram](../../README.md#system-architecture-overview) for how server-only code fits into the overall app.

Place API handlers and server utilities here.
Do not import client-only dependencies in this folder.
Prefer delegating business rules to shared services and infrastructure adapters.
