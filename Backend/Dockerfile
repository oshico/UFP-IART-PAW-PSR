FROM golang:latest AS builder

WORKDIR /Backend


COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o server .

FROM alpine:latest

WORKDIR /Backend

COPY --from=builder /Backend/server .

EXPOSE 8080

CMD ["./server"]
