# modules

Feature-first modules.

Updated: 2026-05-18.

## Convention

Each feature folder should contain:

- domain: Business entities and rules.
- application: Use cases and orchestration.
- presentation: UI-facing adapters/components/composables.
- index.ts: Barrel exports.

## Current modules

- customers
- notifications
- projects
- updates

## Planned domains

As product scope expands, this folder should grow around feature domains such as:

- applications
- companies
- contacts
- events
- interviews
- documents
- communications
- offers
- analytics
- profile
- settings
