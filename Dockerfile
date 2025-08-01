FROM oven/bun:1.2.19 AS build

WORKDIR /app

# 缓存包安装
COPY src-server/package.json package.json
COPY src-server/bun.lock bun.lock
COPY src-server/tsconfig.json tsconfig.json
COPY src-server/src ./src

ENV NODE_ENV=production

RUN bun install

RUN bun build \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --target bun \
  --outfile server \
  ./src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app/video-box

COPY --from=build /app/server ./runtime/server
COPY src-server/public ./public
COPY src-server/migrations ./migrations

ENV NODE_ENV=production
ENV ADMIN_JWT_SECRET=123456
ENV ADMIN_USERNAME=admin
ENV ADMIN_PASSWORD=123456

VOLUME /app/video-box/data
VOLUME /app/video-box/files
EXPOSE 52411

CMD ["./runtime/server"]