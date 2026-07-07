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

When using the compose file from `../crm-backend`, frontend is available at:

```bash
cd ../crm-backend
cp .env.example .env
docker compose --env-file .env -f docker-compose.yml -f docker-compose.dev.yml up --build
```

```text
http://localhost:5173
```

## Docker dev mode

For realtime frontend debugging with Vite HMR inside Docker:

```bash
cd ../crm-backend
docker compose --env-file .env -f docker-compose.yml -f docker-compose.dev.yml up --build frontend
```

Open:

```text
http://localhost:5173
```

The dev container mounts `../crm-frontend` into `/app`, keeps `node_modules` in a Docker volume, and proxies `/api` to the backend container.

## Auth refresh

Next.js is not required for this flow. The important part is the client auth layer:

- tokens are restored from local storage on page reload;
- the app silently calls `/auth/refresh` on startup when a refresh token exists;
- API requests retry once after `401` by refreshing the token pair;
- concurrent `401` requests share one refresh call, so rotated refresh tokens do not race;
- UI state such as filters, drafts, theme, and search is persisted separately from auth.

For production, consider moving refresh tokens to secure HTTP-only cookies.
