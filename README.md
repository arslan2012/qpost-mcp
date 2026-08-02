# qpost-mcp

MCP server for [QPost](https://qpost.dev) — lets AI agents schedule and publish video/image posts to YouTube, TikTok, and Instagram through QPost's REST API.

## Install

Generate an API key from your QPost dashboard (Settings → API Keys), then add this server to your MCP client config.

### Claude Code

```bash
claude mcp add qpost -e QPOST_API_KEY=your_key_here -- npx -y qpost-mcp
```

### Claude Desktop / other MCP clients

```json
{
  "mcpServers": {
    "qpost": {
      "command": "npx",
      "args": ["-y", "qpost-mcp"],
      "env": {
        "QPOST_API_KEY": "your_key_here"
      }
    }
  }
}
```

Set `QPOST_BASE_URL` too if you're self-hosting QPost (defaults to `https://qpost.dev`).

## Tools

| Tool | Description |
|---|---|
| `list_connected_accounts` | List connected YouTube/TikTok/Instagram accounts and their status |
| `create_post` | Create and publish (or schedule) a post, with video or image media from a URL or local path |
| `list_posts` | List posts, optionally filtered by status/platform |
| `get_post` | Get a single post by ID |
| `update_post` | Update a post's caption/schedule/timezone/status |
| `delete_post` | Delete a post |
| `retry_post` | Retry a failed post |

Full request/response shapes and per-platform metadata options (YouTube category/privacy, TikTok privacy level, Instagram media type, etc.) are documented at [qpost.dev/docs](https://qpost.dev/docs) — this server is a thin wrapper over that same REST API.

## Local development

```bash
npm install
npm run dev   # runs src/index.ts directly via tsx
npm run build # compiles to dist/
```

## License

MIT
