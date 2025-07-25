FROM oven/bun:1.2.8 AS build

WORKDIR /app

# 缓存包安装
COPY package.json package.json
COPY bun.lock bun.lock
COPY tsconfig.json tsconfig.json
COPY ./src ./src

ENV NODE_ENV=production

RUN bun install
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
COPY ./public ./public
COPY ./migrations ./migrations

ENV NODE_ENV=production
ENV ADMIN_JWT_SECRET=123456
ENV ADMIN_USERNAME=admin
ENV ADMIN_PASSWORD=123456

VOLUME /app/video-box/data
VOLUME /app/video-box/files
EXPOSE 52411

CMD ["./runtime/server"]