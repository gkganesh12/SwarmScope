"""
BYO API key resolution utilities.
Reads keys from Flask g context (set by middleware), falls back to Config.
"""

from ..config import Config


def get_zep_api_key(explicit_key=None):
    """Get Zep API key: explicit > Flask g > Config"""
    if explicit_key:
        return explicit_key
    try:
        from flask import g
        key = getattr(g, 'zep_api_key', None)
        if key:
            return key
    except RuntimeError:
        pass
    return Config.ZEP_API_KEY


def get_llm_api_key(explicit_key=None):
    """Get LLM API key: explicit > Flask g > Config"""
    if explicit_key:
        return explicit_key
    try:
        from flask import g
        key = getattr(g, 'llm_api_key', None)
        if key:
            return key
    except RuntimeError:
        pass
    return Config.LLM_API_KEY


def get_llm_base_url(explicit_url=None):
    """Get LLM base URL: explicit > Flask g > Config"""
    if explicit_url:
        return explicit_url
    try:
        from flask import g
        url = getattr(g, 'llm_base_url', None)
        if url:
            return url
    except RuntimeError:
        pass
    return Config.LLM_BASE_URL


def get_llm_model_name(explicit_model=None):
    """Get LLM model name: explicit > Flask g > Config"""
    if explicit_model:
        return explicit_model
    try:
        from flask import g
        model = getattr(g, 'llm_model_name', None)
        if model:
            return model
    except RuntimeError:
        pass
    return Config.LLM_MODEL_NAME
