FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

FROM base AS deps

RUN npm ci

FROM deps AS dev

ENV VITE_API_URL=/api
ENV VITE_DEV_API_TARGET=http://app:8080
ENV VITE_USE_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]

FROM deps AS builder

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production

COPY nginx/ /etc/nginx/crm/
COPY nginx.conf /etc/nginx/crm/http.conf.template
COPY nginx/00-rate-limits.conf /etc/nginx/conf.d/00-rate-limits.conf
COPY nginx/19-configure-crm.sh /docker-entrypoint.d/19-configure-crm.sh
RUN chmod +x /docker-entrypoint.d/19-configure-crm.sh
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
