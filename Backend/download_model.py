import os
from pathlib import Path

os.environ.setdefault('HF_HUB_DISABLE_XET', '1')

from huggingface_hub import hf_hub_download

from app.config import Config


def main() -> None:
    repo_id = Config.LOCAL_MODEL_REPO
    filename = Config.LOCAL_MODEL_FILE
    target_path = Path(Config.LOCAL_MODEL_PATH)
    target_path.parent.mkdir(parents=True, exist_ok=True)

    print(f'Downloading "{repo_id}/{filename}" into "{target_path.parent}"...')
    downloaded = hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        local_dir=str(target_path.parent),
    )
    print(f'Model download complete: {downloaded}')


if __name__ == '__main__':
    main()
