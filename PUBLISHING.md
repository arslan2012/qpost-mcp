# Publishing

Both registries are live at **0.2.0** as of 2026-08-03:

- npm: https://www.npmjs.com/package/qpost-mcp
- MCP registry: `io.github.arslan2012/qpost-mcp` (marked `isLatest`)

Smithery, Glama, PulseMCP, and mcp.so all ingest from the official MCP
registry, so publishing there is what propagates to the directories — they
no longer take direct submissions.

## Cutting a release

Preferred, once the trusted publisher is linked (see below) — CI publishes
via OIDC with no token anywhere, and npm attaches a provenance attestation:

```bash
npm version patch -m "v%s"     # keep server.json's two version fields in sync
git push --follow-tags
```

The workflow refuses to publish if the tag doesn't match `package.json`.

Publishing from a laptop also works, using the granular token in `~/.npmrc`:

```bash
npm run build && npm publish --access public
```

Then sync the MCP registry (update `version` in **both** places in
`server.json` first):

```bash
mcp-publisher publish
```

`mcp-publisher`'s GitHub login is time-limited and expires; when it does,
`publish` fails with `Invalid or expired Registry JWT token`. Re-auth with
`mcp-publisher login github` and complete the device-code prompt in a browser.

## Outstanding

Link the trusted publisher at
https://www.npmjs.com/package/qpost-mcp/access → Trusted Publisher:

| Field | Value |
| --- | --- |
| Organization or user | `arslan2012` |
| Repository | `qpost-mcp` |
| Workflow filename | `publish.yml` |
| Environment | *(blank)* |

Until that's linked, `.github/workflows/publish.yml` falls back to token auth
and releases get no provenance badge. Keep the granular npm token regardless —
trusted publishing only covers CI, not local publishes.
