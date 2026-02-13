# Agent Guidelines

Welcome! This repository contains a Node.js (CommonJS) REST API built with Express, Prisma, and MySQL.

## Quick start
- Install dependencies with `npm install`.
- Duplicate `env_example` to `.env` and fill in the database URL, JWT secret, and CORS origin.
- Run database migrations and generate the Prisma client via `npx prisma migrate deploy` (or `npx prisma migrate dev` for local development) followed by `npx prisma generate`.
- Launch the API with `npm run dev` (Nodemon) or `npm start` for a plain Node process.

## Code organization
- HTTP routes live in `src/routes`. Each router delegates to controllers in `src/controllers` and services in `src/services`.
- Controllers should validate incoming payloads with the Zod schemas in `src/types` before calling the service layer.
- Database access must go through the Prisma client exported from `src/utils/prisma.js`. Avoid raw SQL unless absolutely necessary.
- Shared helpers (JWT, bcrypt, HTTP status codes, response shape helpers) sit in `src/utils`.
- Middleware handling auth, roles, logging, and errors is under `src/middleware`.

## Development conventions
- Keep the codebase on CommonJS (`require`/`module.exports`). If you introduce ESM syntax, convert the affected module tree consistently.
- Prefer async/await; bubble errors to the centralized handler by throwing or calling `next(err)`.
- Stick to existing naming patterns: `*.controller.js`, `*.service.js`, `*.router.js`.
- Follow the established response format helpers in `src/utils/response.js` when adding new endpoints.

## Testing & verification
- There is no automated test suite yet. When feasible, exercise endpoints manually (e.g., with Thunder Client/Postman) and document any manual verification in the PR description.
- If you modify the Prisma schema, regenerate the client with `npx prisma generate` and mention it in your summary/testing notes.

## Git & PR expectations
- Work on a feature branch (do **not** commit directly to `main` or `work`).
- Format commit messages in the imperative mood (e.g., `Add applicants filter by status`).
- PR summaries should list the notable changes in bullet form and include how you tested the work (even if "not run" for doc-only edits).

## Helpful references
- `prisma/schema.prisma` describes the relational model (accounts, users, applicants, vacancies, interviews, etc.).
- Authentication uses JWT stored in cookies; see `src/middleware/protectAuth.js` and `src/utils/jwt.js`.
- Role-based access control is enforced via `src/middleware/roleMiddleware.js`.

Happy hacking!
