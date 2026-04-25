"""
utils.py — Shared helper utilities

Small functions used by main.py and detector.py
to avoid code duplication.
"""

import os
from pathlib import Path


def ensure_dir(path: str) -> Path:
    """Create a directory if it doesn't exist and return it as a Path."""
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p


def allowed_image(content_type: str) -> bool:
    """Return True if the MIME type is an accepted image format."""
    return content_type in {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/bmp",
    }


def bytes_to_mb(num_bytes: int) -> float:
    """Convert bytes to megabytes, rounded to 2 decimal places."""
    return round(num_bytes / (1024 * 1024), 2)
