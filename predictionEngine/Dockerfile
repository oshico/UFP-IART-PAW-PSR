FROM astral/uv:alpine-dhi AS builder
USER 0
WORKDIR /predictionEngine
ENV UV_CACHE_DIR=/tmp/uv-cache
COPY pyproject.toml .
RUN uv sync --no-dev

FROM astral/uv:alpine-dhi
USER 0
WORKDIR /predictionEngine
COPY --from=builder /predictionEngine/.venv .venv
COPY app/ app/
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
