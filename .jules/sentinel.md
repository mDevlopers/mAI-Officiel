## 2025-02-14 - Type Safety in UI Components
**Vulnerability:** Use of `any` type in UI components handling user and API data.
**Learning:** Bypassing TypeScript checks via `any` can lead to runtime errors or security bugs by masking undefined inputs or property mismatches between UI and DB/API layers.
**Prevention:** Always define explicit `interface` or `type` DTOs (Data Transfer Objects) matching the API response schemas to map props. Utilize `Partial` or `Pick` from DB schema models if strictly necessary, but avoid `any`.
## 2025-05-24 - Environment Variable Leakage in Code Interpreter Sandbox
**Vulnerability:** The code execution sandbox in `app/api/code-interpreter/route.ts` was passing the entire server environment (`...process.env`) to the spawned child processes used for evaluating untrusted user code.
**Learning:** Any code spawned via `child_process.spawn()` or `exec` implicitly inherits the full process environment unless specifically restricted. This allowed user-submitted code in the interpreter tool to read sensitive production secrets like `POSTGRES_URL` and API keys (e.g. `SERPAPI_KEY`, `DEEPGRAM_API_KEY`).
**Prevention:** Always construct an explicit, minimal `env` object when spawning child processes for untrusted code execution. Only pass necessary variables (like `PATH` or `NODE_ENV`) and explicitly exclude `...process.env`.
