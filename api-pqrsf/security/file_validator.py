import mimetypes

ALLOWED_EXTENSIONS = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg'
}

MAGIC_BYTES = {
    b'%PDF-': '.pdf',
    b'\x89PNG\r\n\x1a\n': '.png',
    b'\xff\xd8\xff': '.jpg'
}

def validate_magic_bytes(header_bytes: bytes) -> str:
    """Returns the detected extension based on magic bytes, or None if unknown."""
    for magic, ext in MAGIC_BYTES.items():
        if header_bytes.startswith(magic):
            if ext == '.jpg':
                return '.jpeg' # Normalize to .jpeg
            return ext
    return None

def is_allowed_file(filename: str, content_type: str, header_bytes: bytes) -> bool:
    import os
    ext = os.path.splitext(filename)[1].lower()
    
    # Check extension
    if ext not in ALLOWED_EXTENSIONS:
        return False
        
    # Check mime type match
    if ALLOWED_EXTENSIONS[ext] != content_type:
        return False
        
    # Check magic bytes
    detected_ext = validate_magic_bytes(header_bytes)
    if not detected_ext or (detected_ext != ext and not (detected_ext == '.jpeg' and ext == '.jpg')):
        return False
        
    return True
