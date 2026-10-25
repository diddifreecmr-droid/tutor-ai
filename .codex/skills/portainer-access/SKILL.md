---
name: portainer-access
description: Connect to and manage a Portainer instance for this project using its API, Docker endpoint, and stack operations. Use when deploying, inspecting, or troubleshooting the tutor-ai Docker environment through Portainer.
---

# Portainer Access

Use this skill only for the `tutor-ai` deployment workflow.

## Credentials and safety

- Read the base URL from `PORTAINER_URL` and the API token from `PORTAINER_API_TOKEN`.
- Never place tokens in source files, shell history, logs, commits, or chat messages.
- Prefer an API token with the minimum Portainer permissions needed for the requested operation.
- Treat stack deployment, restart, environment changes, and image updates as external mutations. Confirm the exact target stack and endpoint before mutating it.
- Use HTTPS. If the instance uses a self-signed certificate, report the certificate problem and ask before bypassing verification; do not silently disable TLS verification.

## Connection workflow

1. Confirm `PORTAINER_URL` is present and normalize it without exposing the token.
2. Call Portainer's API with `X-API-Key: $PORTAINER_API_TOKEN`.
3. Verify access with a read-only request such as `/api/status`.
4. List endpoints with `/api/endpoints` and identify the intended Docker endpoint by name or ID.
5. Inspect existing stacks before changing anything.
6. For deployment, validate the Compose file locally, identify the exact stack name, and show the planned mutation before applying it.
7. After a mutation, inspect stack status, container health, and recent logs.

## Useful API operations

- Health: `GET /api/status`
- Endpoints: `GET /api/endpoints`
- Stacks: `GET /api/stacks`
- Stack details: `GET /api/stacks/{id}`
- Stack deployment/update: use the Portainer API for the selected stack only after target confirmation.

## Project deployment invariants

- Preserve named volumes for PostgreSQL/pgvector and uploaded documents.
- Do not delete or recreate persistent volumes during routine deployment.
- Keep OpenRouter and OCR credentials as Portainer-managed environment variables or secrets.
- Do not expose PostgreSQL or internal services publicly unless explicitly requested.
- Verify the PWA and API health endpoints after deployment.
