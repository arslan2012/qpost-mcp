# qpost-mcp

MCP server for [QPost](https://qpost.dev) — lets AI agents schedule and publish video/image posts to YouTube, TikTok, and Instagram through QPost's REST API.

## Install

Generate an API key from your QPost dashboard (Settings → API Keys), then pick one of the two options below.

### Hosted (recommended — nothing to install)

QPost runs the same server at `https://qpost.dev/mcp` over Streamable HTTP:

```bash
claude mcp add --transport http qpost https://qpost.dev/mcp \
  --header "x-api-key: YOUR_API_KEY"
```

Any MCP client that speaks Streamable HTTP can point at that URL with an
`x-api-key` (or `Authorization: Bearer`) header. The endpoint is stateless, so
there is no session to manage.

### Local (stdio) via npx

Use this if you self-host QPost or would rather run the server yourself:

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

### Media handling differs by transport

The local stdio server can read files from your machine, so `create_post`
accepts `mediaPath` as well as `mediaUrl`. The hosted endpoint obviously
cannot reach your disk — it takes `mediaUrl`/`imageUrls`, or `mediaBase64`
with an optional `mediaFilename` to set the MIME type.

Full request/response shapes and per-platform metadata options (YouTube category/privacy, TikTok privacy level, Instagram media type, etc.) are documented at [qpost.dev/docs](https://qpost.dev/docs) — this server is a thin wrapper over that same REST API.

## Local development

```bash
npm install
npm run dev   # runs src/index.ts directly via tsx
npm run build # compiles to dist/
```

## License

MIT
