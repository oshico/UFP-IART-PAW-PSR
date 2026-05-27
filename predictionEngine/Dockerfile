FROM astral/uv:alpine-dhi AS builder
USER root
RUN mkdir -p /predictionEngine && chown uv:uv /predictionEngine
USER uv
WORKDIR /predictionEngine
COPY pyproject.toml .
RUN uv sync --no-dev

FROM astral/uv:alpine-dhi
WORKDIR /predictionEngine
COPY --from=builder /predictionEngine/.venv .venv
COPY app/ app/
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
