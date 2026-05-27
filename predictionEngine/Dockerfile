FROM python:3.12-slim-bookworm AS builder
RUN pip install uv --quiet
WORKDIR /predictionEngine
COPY pyproject.toml .
RUN uv sync --no-dev

FROM python:3.12-slim-bookworm
RUN pip install uv --quiet
WORKDIR /predictionEngine
COPY --from=builder /predictionEngine/.venv .venv
COPY app/ app/
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
