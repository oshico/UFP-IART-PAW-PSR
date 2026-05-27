import logging

from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.api.routes import router
from app.data.loader import init_db
from app.storage.minio import init_minio

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting TerraWatch ML service...")
    init_db()
    init_minio()
    yield


app = FastAPI(
    title="TerraWatch ML Service",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(router)
