import io
import logging
import pickle

from minio import Minio

from app.config import (
    MINIO_ACCESS_KEY,
    MINIO_BUCKET,
    MINIO_ENDPOINT,
    MINIO_SECRET_KEY,
    MINIO_SECURE,
)

logger = logging.getLogger(__name__)

_client: Minio | None = None


def _get_client() -> Minio:
    global _client
    if _client is None:
        _client = Minio(
            MINIO_ENDPOINT,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=MINIO_SECURE,
            region="us-east-1",
        )
    return _client


def init_minio():
    client = _get_client()
    if not client.bucket_exists(MINIO_BUCKET):
        client.make_bucket(MINIO_BUCKET)
        logger.info("Created MinIO bucket: %s", MINIO_BUCKET)
    else:
        logger.info("MinIO bucket already exists: %s", MINIO_BUCKET)


def upload_model(model_key: str, model_obj, version: str):
    client = _get_client()
    data = pickle.dumps(model_obj)
    metadata = {"version": version}
    client.put_object(
        MINIO_BUCKET,
        f"models/{model_key}.pkl",
        io.BytesIO(data),
        len(data),
        content_type="application/octet-stream",
        metadata=metadata,
    )
    logger.info("Uploaded model: %s (v%s)", model_key, version)


def download_model(model_key: str):
    client = _get_client()
    try:
        response = client.get_object(MINIO_BUCKET, f"models/{model_key}.pkl")
        data = response.read()
        response.close()
        response.release_conn()
        return pickle.loads(data)
    except Exception as exc:
        logger.warning("Model not found in MinIO: %s — %s", model_key, exc)
        return None


def list_models(prefix: str = "models/"):
    client = _get_client()
    try:
        objects = client.list_objects(MINIO_BUCKET, prefix=prefix, recursive=True)
        return [
            {
                "name": obj.object_name.removeprefix(prefix).removesuffix(".pkl"),
                "size": obj.size,
                "last_modified": obj.last_modified.isoformat(),
            }
            for obj in objects
        ]
    except Exception as exc:
        logger.warning("Failed to list models: %s", exc)
        return []
