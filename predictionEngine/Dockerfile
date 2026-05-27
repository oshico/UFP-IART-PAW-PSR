FROM ghcr.io/astral-sh/uv:python3.12 AS builder

WORKDIR /predictionEngine
COPY pyproject.toml .
RUN uv sync --no-dev

FROM ghcr.io/astral-sh/uv:python3.12
WORKDIR /predictionEngine
COPY --from=builder /predictionEngine/.venv .venv
COPY app/ app/
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
