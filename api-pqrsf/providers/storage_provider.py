import os
import uuid
from typing import Dict, Any
from abc import ABC, abstractmethod
from fastapi import UploadFile

class StorageProvider(ABC):
    @abstractmethod
    async def upload_avatar(self, file: UploadFile) -> Dict[str, Any]:
        """
        Uploads an avatar file and returns an AvatarResult dictionary.
        AvatarResult: { "url": str, "fileName": str, "provider": str, "uploadedAt": str }
        """
        pass

class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: str = "attachments/profiles"):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    async def upload_avatar(self, file: UploadFile) -> Dict[str, Any]:
        import datetime
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'png'
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(self.base_dir, filename)
        
        # Read and save file
        content = await file.read()
        with open(filepath, "wb") as f:
            f.write(content)
            
        # In this MVP, we serve attachments locally. Assuming the backend serves the "attachments" folder at /attachments
        # In a real S3 scenario, this would be the bucket URL.
        url = f"/attachments/profiles/{filename}"
        
        return {
            "url": url,
            "fileName": filename,
            "provider": "local",
            "uploadedAt": datetime.datetime.utcnow().isoformat()
        }

def get_storage_provider() -> StorageProvider:
    return LocalStorageProvider()
