## 2025-02-14 - Type Safety in UI Components
**Vulnerability:** Use of `any` type in UI components handling user and API data.
**Learning:** Bypassing TypeScript checks via `any` can lead to runtime errors or security bugs by masking undefined inputs or property mismatches between UI and DB/API layers.
**Prevention:** Always define explicit `interface` or `type` DTOs (Data Transfer Objects) matching the API response schemas to map props. Utilize `Partial` or `Pick` from DB schema models if strictly necessary, but avoid `any`.
