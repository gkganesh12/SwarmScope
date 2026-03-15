"""
Configuration API routes
BYO API key validation and status endpoints
"""

import traceback
from flask import g, jsonify

from . import config_bp
from ..utils.logger import get_logger

logger = get_logger('swarmscope.api.config')


@config_bp.route('/validate-keys', methods=['POST'])
def validate_keys():
    """
    Validate API keys (either BYO or server-configured).

    Tests that the currently active keys (from headers or server config) work.

    Returns:
        {
            "success": true,
            "data": {
                "llm": {"valid": true, "source": "byo|server", "model": "gpt-4o-mini"},
                "zep": {"valid": true, "source": "byo|server"},
                "all_valid": true
            }
        }
    """
    results = {
        "llm": {"valid": False, "source": "byo" if g.using_byo_llm else "server", "error": None},
        "zep": {"valid": False, "source": "byo" if g.using_byo_zep else "server", "error": None},
    }

    # Test LLM key
    if g.llm_api_key:
        try:
            from ..utils.llm_client import LLMClient
            client = LLMClient(
                api_key=g.llm_api_key,
                base_url=g.llm_base_url,
                model=g.llm_model_name
            )
            client.chat(
                [{"role": "user", "content": "Say OK"}],
                max_tokens=5,
                temperature=0
            )
            results["llm"]["valid"] = True
            results["llm"]["model"] = g.llm_model_name
            results["llm"]["base_url"] = g.llm_base_url
        except Exception as e:
            results["llm"]["error"] = str(e)
    else:
        results["llm"]["error"] = "No LLM API key configured"

    # Test Zep key
    if g.zep_api_key:
        try:
            from zep_cloud.client import Zep
            zep = Zep(api_key=g.zep_api_key)
            # List graphs as a quick connectivity test
            zep.graph.list_graphs()
            results["zep"]["valid"] = True
        except Exception as e:
            results["zep"]["error"] = str(e)
    else:
        results["zep"]["error"] = "No Zep API key configured"

    all_valid = results["llm"]["valid"] and results["zep"]["valid"]

    return jsonify({
        "success": True,
        "data": {
            **results,
            "all_valid": all_valid
        }
    })


@config_bp.route('/status', methods=['GET'])
def config_status():
    """
    Check which API keys are configured (without exposing the actual keys).

    Returns:
        {
            "success": true,
            "data": {
                "llm_configured": true,
                "llm_source": "byo|server",
                "llm_model": "gpt-4o-mini",
                "llm_base_url": "https://api.openai.com/v1",
                "zep_configured": true,
                "zep_source": "byo|server"
            }
        }
    """
    return jsonify({
        "success": True,
        "data": {
            "llm_configured": bool(g.llm_api_key),
            "llm_source": "byo" if g.using_byo_llm else "server",
            "llm_model": g.llm_model_name,
            "llm_base_url": g.llm_base_url,
            "zep_configured": bool(g.zep_api_key),
            "zep_source": "byo" if g.using_byo_zep else "server",
        }
    })
