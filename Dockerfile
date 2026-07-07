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

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
