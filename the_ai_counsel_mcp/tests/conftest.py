"""Shared test utilities for MCP tool tests."""

import json


def get_text(call_tool_result) -> str:
    """Extract plain text from call_tool's (content_blocks, raw) tuple."""
    content_blocks, _ = call_tool_result
    return content_blocks[0].text


def get_json(call_tool_result) -> dict | list:
    """Parse JSON from call_tool result."""
    return json.loads(get_text(call_tool_result))
