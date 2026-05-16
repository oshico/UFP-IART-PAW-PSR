FROM oven/bun:latest AS builder

WORKDIR /frontend

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json bun.lock ./
RUN bun install

COPY . .
RUN bun run build

FROM oven/bun:latest

WORKDIR /frontend

RUN bun add -g serve

COPY --from=builder /fronted/dist ./dist 

EXPOSE 4173

CMD ["serve" , "-s" ,"dist" , "-l" , "4173"]
