# CRM Frontend

React frontend for the parcel CRM.

## Run

```bash
npm install
npm run dev
```

The app starts at:

```text
http://127.0.0.1:5173
```

Backend API defaults to:

```text
/api
```

To override it, create `.env`:

```env
VITE_API_URL=/api
```

For local Vite development without nginx proxy, use:

```env
VITE_API_URL=http://localhost:8080
```

## Docker

The production image builds static assets and serves them with nginx:

```bash
docker build -t crm-frontend .
docker run --rm -p 3000:80 crm-frontend
```

The production Compose stack is managed from `../crm-backend`:

```bash
cd ../crm-backend
cp .env.production.example .env
# Fill all empty values in .env first.
docker compose config --quiet
docker compose up -d --build --remove-orphans
```

```text
http://SERVER_IP
```

nginx serves the built static assets on port 80 and proxies `/api` to the backend container.
Postgres, Redis, and the backend do not publish host ports in the production stack.

## Auth refresh

Next.js is not required for this flow. The important part is the client auth layer:

- tokens are restored from local storage on page reload;
- the app silently calls `/auth/refresh` on startup when a refresh token exists;
- API requests retry once after `401` by refreshing the token pair;
- concurrent `401` requests share one refresh call, so rotated refresh tokens do not race;
- UI state such as filters, drafts, theme, and search is persisted separately from auth.

For production, consider moving refresh tokens to secure HTTP-only cookies.
