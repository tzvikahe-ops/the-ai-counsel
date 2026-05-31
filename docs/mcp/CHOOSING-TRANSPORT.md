# Choosing a Transport: stdio vs SSE

The MCP server supports two transport modes. Picking the right one depends on where your The AI Counsel backend is running and whether you want to install anything locally.

---

## What is stdio transport?

In stdio mode, your AI tool (Claude Code, Gemini CLI) launches the MCP server as a child process and communicates with it over standard input/output. The MCP server process lives on your local machine and makes outbound HTTP requests to reach the Council backend.

- The backend can be local (`localhost:8001`) or remote (`https://yourserver.com:8001`) — you control this with `--base-url`.
- No extra port needs to be open for the MCP layer itself; only the backend API port (8001) must be reachable.
- Requires Python to be installed locally.

## What is SSE transport?

In SSE (Server-Sent Events) mode, the MCP server is mounted directly inside the main Council backend application on port `8001` at `/mcp`. Your AI tool connects to it over HTTP/HTTPS, with no local process involved.

- Zero local installation: no Python, no pip, just a URL.
- Requires only the main backend port (`8001`) to be reachable (firewall, reverse proxy, or VPN).
- The MCP server and Council backend run as a single process in the container.

---

## Side-by-side comparison

| Feature | stdio (local) | stdio (remote backend) | SSE (remote) |
|---|---|---|---|
| Local Python needed | Yes | Yes | No |
| Backend location | localhost:8001 | Remote server | Remote server |
| MCP server location | Your machine | Your machine | Remote server (built-in) |
| Ports to open | None | Backend 8001 | Backend 8001 only |
| Security | Process isolation | Outbound HTTPS only | Needs firewall/VPN/Auth for 8001 |
| Best for | Local development | Remote server, laptop client | Shared team server, zero install |

---

## Decision guide

**If you are running Council on your laptop:**
Use stdio with a local backend. Nothing is exposed to the network.
```
Claude Code --stdio--> MCP server --HTTP--> localhost:8001
```

**If Council runs on a remote server but you have Python locally:**
Use stdio with `--base-url`. The MCP server runs on your machine and makes outbound HTTPS calls to the server.
```
Claude Code --stdio--> MCP server --HTTPS--> yourserver.com:8001
```

**If Council runs on a remote server and you do not want to install anything locally:**
Use SSE. Mount the MCP server directly inside the backend app, exposing it on port 8001 under the `/mcp/sse` path.
```
Claude Code --HTTPS--> Remote Server (8001/mcp/sse) --internal--> FastAPI / FastMCP
```

---

## Architecture diagrams

```
stdio local:               stdio remote:                 SSE remote:

Claude Code                Claude Code                   Claude Code
    |                          |                              |
    | stdin/stdout             | stdin/stdout                 | HTTPS :8001/mcp/sse
    v                          v                              v
MCP server (local)         MCP server (local)         Remote FastAPI App
    |                          |                       - /mcp routes
    | HTTP                     | HTTPS                 - REST / UI routes
    v                          v                              
localhost:8001            yourserver.com:8001           
```

---

## Frequently asked questions

**Can I use SSE locally?**
Yes. Since SSE is built into the backend, any time you run `uv run python -m backend.main`, the SSE endpoint is live at `http://localhost:8001/mcp/sse`. You can register this URL in Claude Code. It works perfectly, though stdio is the default local setup.

**Does SSE have built-in authentication?**
No. The MCP server does not implement token-based auth on the `/mcp` endpoints. If port `8001` is exposed to the internet, protect the entire app with a firewall rule, a VPN, or a reverse proxy that enforces auth (nginx with `auth_basic`, Caddy with `basicauth`, Cloudflare Access, etc.).

**Which transport has better performance?**
For individual users the difference is imperceptible — both add only a few milliseconds of overhead on top of LLM inference time. stdio avoids one network hop for local setups. SSE saves you from maintaining a local Python environment.

**Do both transports support streaming responses?**
Yes. Both transports stream deliberation output back to the AI tool as it arrives from the backend.
