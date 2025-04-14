FROM oven/bun:1 AS builder

WORKDIR /app

COPY bun.lock package.json prisma ./ 

RUN bun install
RUN bun run generate

COPY . .
FROM oven/bun:1

WORKDIR /app
COPY --from=builder /app /app

EXPOSE 3000

CMD ["bun", "start"]