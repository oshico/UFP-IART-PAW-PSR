FROM astral/uv:alpine-dhi AS builder
USER 0
RUN mkdir -p /predictionEngine && chown 1000:1000 /predictionEngine
USER 1000
WORKDIR /predictionEngine
COPY pyproject.toml .
RUN uv sync --no-dev

FROM astral/uv:alpine-dhi
WORKDIR /predictionEngine
COPY --from=builder /predictionEngine/.venv .venv
COPY app/ app/
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
