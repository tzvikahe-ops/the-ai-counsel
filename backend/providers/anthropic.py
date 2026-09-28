"""Anthropic provider implementation."""

import httpx

from .errors import describe_exception
from typing import List, Dict, Any
from .base import LLMProvider
from .max_tokens import anthropic_max_tokens
from .temperature import add_temperature_if_supported
from ..settings import get_settings

class AnthropicProvider(LLMProvider):
    """Anthropic API provider."""
    
    BASE_URL = "https://api.anthropic.com/v1"
    
    def _get_api_key(self) -> str:
        from ..credentials import get_api_key
        return get_api_key("anthropic")


    async def query(self, model_id: str, messages: List[Dict[str, str]], timeout: float = 120.0, temperature: float = 0.7) -> Dict[str, Any]:
        api_key = self._get_api_key()
        if not api_key:
            return {"error": True, "error_message": "Anthropic API key not configured"}
            
        model = model_id.removeprefix("anthropic:")
        
        # Convert messages to Anthropic format (system message is separate)
        system_message = ""
        filtered_messages = []
        for msg in messages:
            if msg["role"] == "system":
                system_message = msg["content"]
            else:
                filtered_messages.append(msg)
        
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                payload = {
                    "model": model,
                    "messages": filtered_messages,
                    # Reasoning models spend this budget on thinking before any
                    # visible text, so 4096 could be exhausted mid-thought.
                    "max_tokens": anthropic_max_tokens(),
                }
                add_temperature_if_supported(payload, model, "anthropic", temperature)
                if system_message:
                    payload["system"] = system_message
                    
                response = await client.post(
                    f"{self.BASE_URL}/messages",
                    headers={
                        "x-api-key": api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json"
                    },
                    json=payload
                )
                
                if response.status_code != 200:
                    return {
                        "error": True, 
                        "error_message": f"Anthropic API error: {response.status_code} - {response.text}"
                    }
                    
                data = response.json()

                # Anthropic returns a list of content blocks, and only some carry
                # text. Reasoning-capable models emit "thinking" blocks first, so
                # indexing [0]["text"] raises KeyError('text') on an otherwise
                # successful response. Concatenate every text block instead.
                blocks = data.get("content") or []
                if not isinstance(blocks, list):
                    return {
                        "error": True,
                        "error_message": "Unexpected response format from Anthropic API",
                    }
                text_parts = [
                    block.get("text", "")
                    for block in blocks
                    if isinstance(block, dict) and block.get("type") == "text"
                ]
                content = "".join(text_parts)

                # Key on the *absence of a text block*, not on falsy content: a
                # model may legitimately return a text block containing "", and
                # the previous implementation surfaced that as a successful empty
                # response. Only a response carrying no text block at all is an
                # error.
                if not text_parts:
                    # A response with no text block is a real condition worth
                    # naming: hitting max_tokens mid-reasoning yields thinking
                    # blocks only. Report why rather than a bare parse error.
                    stop_reason = data.get("stop_reason")
                    block_types = sorted(
                        {b.get("type") for b in blocks if isinstance(b, dict) and b.get("type")}
                    )
                    detail = f"stop_reason={stop_reason or 'unknown'}"
                    if block_types:
                        detail += f", content block types: {', '.join(block_types)}"
                    return {
                        "error": True,
                        "error_message": f"Anthropic API returned no text content ({detail})",
                    }

                return {"content": content, "usage": data.get("usage"), "error": False}

        except Exception as e:
            return {"error": True, "error_message": describe_exception(e, timeout)}

    async def get_models(self) -> List[Dict[str, Any]]:
        api_key = self._get_api_key()
        if not api_key:
            return []
            
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.BASE_URL}/models",
                    headers={
                        "x-api-key": api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json"
                    }
                )
                
                if response.status_code != 200:
                    # Fallback to hardcoded list if API fails (e.g. older keys or API not enabled)
                    return [
                        {"id": "anthropic:claude-opus-4-7", "name": "Claude Opus 4.7 [Anthropic]", "provider": "Anthropic"},
                        {"id": "anthropic:claude-opus-4-6", "name": "Claude Opus 4.6 [Anthropic]", "provider": "Anthropic"},
                        {"id": "anthropic:claude-sonnet-4-6", "name": "Claude Sonnet 4.6 [Anthropic]", "provider": "Anthropic"},
                        {"id": "anthropic:claude-haiku-4-5-20251001", "name": "Claude Haiku 4.5 [Anthropic]", "provider": "Anthropic"},
                        {"id": "anthropic:claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet [Anthropic]", "provider": "Anthropic"},
                    ]
                    
                data = response.json()
                models = []
                
                for model in data.get("data", []):
                    if model.get("type") == "model":
                        models.append({
                            "id": f"anthropic:{model['id']}",
                            "name": f"{model.get('display_name', model['id'])} [Anthropic]",
                            "provider": "Anthropic"
                        })
                
                return sorted(models, key=lambda x: x["name"])
                
        except Exception:
            return []

    async def validate_key(self, api_key: str) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.BASE_URL}/messages",
                    headers={
                        "x-api-key": api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json"
                    },
                    json={
                        "model": "claude-haiku-4-5-20251001",
                        "messages": [{"role": "user", "content": "Hi"}],
                        "max_tokens": 1
                    }
                )

                if response.status_code == 200:
                    return {"success": True, "message": "API key is valid"}

                error_body = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
                error_detail = error_body.get("error", {}).get("message", response.text)

                if response.status_code == 401:
                    return {"success": False, "message": f"Invalid API key: {error_detail}"}
                return {"success": False, "message": f"Anthropic API error ({response.status_code}): {error_detail}"}
        except Exception as e:
            return {"success": False, "message": str(e)}
