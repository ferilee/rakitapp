FROM node:22-bookworm-slim AS build

WORKDIR /app

# Native modules used by the backend need a compiler during installation.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

RUN npm install --global pnpm@10.29.1

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm prune --prod

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=2005

COPY --from=build /app/.output ./.output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

VOLUME ["/app/data"]
EXPOSE 2005

CMD ["node", ".output/server/index.mjs"]
