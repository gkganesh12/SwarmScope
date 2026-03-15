"""
BYO API middleware
Extracts user-provided API keys from request headers, falling back to server config.
"""

from flask import request, g

from .config import Config


def extract_api_keys():
    """
    Before-request hook: pull BYO keys from headers, fall back to server config.

    Supported headers:
        X-LLM-API-Key: OpenAI-compatible LLM API key
        X-LLM-Base-URL: LLM API base URL
        X-LLM-Model-Name: LLM model name
        X-Zep-API-Key: Zep Cloud API key
    """
    g.llm_api_key = request.headers.get('X-LLM-API-Key') or Config.LLM_API_KEY
    g.llm_base_url = request.headers.get('X-LLM-Base-URL') or Config.LLM_BASE_URL
    g.llm_model_name = request.headers.get('X-LLM-Model-Name') or Config.LLM_MODEL_NAME
    g.zep_api_key = request.headers.get('X-Zep-API-Key') or Config.ZEP_API_KEY

    # Track whether keys came from user (for validation endpoint)
    g.using_byo_llm = bool(request.headers.get('X-LLM-API-Key'))
    g.using_byo_zep = bool(request.headers.get('X-Zep-API-Key'))
