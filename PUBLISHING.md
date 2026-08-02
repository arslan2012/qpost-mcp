# Publishing checklist (manual — needs your accounts)

Everything code-side is ready (`npm run build` passes, `server.json` and
`mcpName` are set). These last steps need your own npm and GitHub logins —
I can't create accounts or hold your credentials, so run these yourself:

## 1. Publish to npm

```bash
cd /Users/arslan/Projects/qpost-mcp
npm login          # if not already logged in
npm publish --access public
```

Verify at https://www.npmjs.com/package/qpost-mcp

## 2. Publish to the official MCP Registry

This is what makes `qpost-mcp` show up in Smithery, Glama, PulseMCP, mcp.so,
and Claude's own MCP directory — they all ingest from this registry now
instead of taking direct submissions.

```bash
# macOS
brew install mcp-publisher

mcp-publisher login github     # opens a device-code flow in your browser
mcp-publisher publish          # reads server.json in this directory
```

Verify:
```bash
curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.arslan2012/qpost-mcp"
```

## 3. (Optional, later) Open a PR to awesome-mcp-servers

Once published, a PR to https://github.com/punkpeye/awesome-mcp-servers
adding a line under an appropriate category (Social Media / Content) — I
can draft and open this PR for you once steps 1-2 are done, since at that
point it's just a public README edit with no credentials needed.

---

After step 1 and 2, tell me and I'll flip `growth-ops-state.json`'s
`npm_published` flag and update the daily growth-ops task so it starts
tracking directory listing status and stops reminding you about this.
