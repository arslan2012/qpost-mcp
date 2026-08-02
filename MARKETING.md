# Distribution copy — ready to post

Context for whoever posts these: qpost is a self-hosted-friendly, API-first
social scheduler (YouTube/TikTok/Instagram) that now ships an MCP server, so
any AI agent can publish on your behalf. Positioning against Blotato
(hosted MCP social poster, $29/mo flat): qpost is open, API-key based, and
usage isn't locked behind a subscription tier.

---

## Show HN (post yourself — no API, and HN rewards founder authenticity)

**Title:**
Show HN: QPost – give your AI agent an MCP tool to post to YouTube/TikTok/IG

**Body:**
I built QPost originally as a simple multi-platform scheduler (n8n + REST
API). Usage stalled, and around the same time I kept running into agents
that could *generate* video/image content but had no clean way to actually
*publish* it anywhere.

So I added an MCP server (`qpost-mcp`) on top of the existing API: any
MCP-compatible agent — Claude, Cursor, a LangChain/AutoGPT pipeline, your
own — gets tools to list connected accounts, create/schedule/retry posts,
and check status, all scoped to an API key.

Stack: Astro + Express + Prisma/Postgres + better-auth, self-hosted on a
$6/mo droplet. Not trying to compete with the big schedulers on features —
just trying to be the thing an agent can call without a human clicking
through a dashboard.

Repo: https://github.com/arslan2012/qpost-mcp
App: https://qpost.dev
Docs: https://qpost.dev/docs

Feedback very welcome, especially on the tool schemas — first time
designing an API primarily for agent consumption rather than humans.

---

## Product Hunt (post yourself — PH rewards founder engagement in comments)

**Tagline:** The publishing API AI agents use to post video content

**Description:**
QPost schedules and publishes video/image posts to YouTube, TikTok, and
Instagram — built API-first from day one, and now with a native MCP server
so agents (Claude, Cursor, your own pipeline) can publish autonomously.
Connect your accounts once, hand your agent an API key, and it can create,
schedule, retry, and manage posts without a human in the loop. Also plugs
into n8n for no-code automation. Self-hostable, open API.

**First comment (post immediately after launch):**
Hey — maker here. QPost started as "just" a scheduler; the thing that made
it interesting was realizing the API surface I'd already built for n8n
users was 90% of what an AI agent needs too. Wrapped it in MCP, wrote it
up at qpost.dev/docs. Happy to answer anything about the agent-facing
design decisions (auth model, media upload via MCP, scoped API keys) or
the more boring scheduler stuff.

---

## Reddit

### r/AI_Agents
**Title:** Built an MCP server so agents can actually publish to
YouTube/TikTok/Instagram (not just draft)
**Body:**
Most "AI + social media" tools I found generate content but stop at the
draft stage — you still have to paste it into the platform yourself. QPost
is the opposite bet: a small API-first scheduler with an MCP server on
top, so the agent's last step is an actual publish, not a copy-paste.
Tools: list_connected_accounts, create_post, list_posts, get_post,
update_post, delete_post, retry_post. Repo + docs in comments. Would love
feedback from anyone who's building agents that need to take real-world
publishing actions, not just generate content.

### r/mcp (if it exists on your Reddit) / r/modelcontextprotocol
**Title:** qpost-mcp — MCP server for scheduling/publishing to
YouTube/TikTok/Instagram
**Body:** (technical, shorter) Wrapped an existing REST API (Astro +
better-auth API keys, scoped read/write/delete permissions) in an MCP
server. Tools mirror the REST surface 1:1. Media handling: since there's
no pre-signed upload flow, the MCP server accepts either a URL (fetches
server-side) or a local path and forwards as multipart in the same
request as the post metadata. Open to feedback on that design — curious
how others are handling binary uploads through MCP tool calls.

### r/SideProject
**Title:** Pivoted my stalled side project (social scheduler, 18 users in
a year) into "publishing infra for AI agents" — here's the MCP server
**Body:** (more narrative/vulnerable tone, standard r/SideProject register)
Built QPost as a scheduler, got to 18 users, then flatlined for 3 months.
Realized the "Code & API" pitch I'd buried under the human-facing UI was
actually the interesting part — agents need a way to *publish*, not just
generate. Spent this week building an MCP server on top of the existing
API instead of more UI polish. Curious if anyone else has had a stalled
project where the "boring" API layer turned out to be the actual product.

### r/SaaS
**Title:** How I'm repositioning a stalled scheduler SaaS around AI agents
instead of building more UI
**Body:** (business/strategy register) 18 users, 3 months no growth,
zero billing. Rather than chase more scheduler features, I shipped an MCP
server so AI agents can be the *customer* directly — no human dashboard
required. Distribution plan is entirely MCP directory listings
(Smithery/Glama/PulseMCP/mcp.so) instead of paid acquisition. Will report
back on whether "agent as user" is a real wedge or just a narrower niche.

---

## X/Twitter thread (short form)

1/ Shipped an MCP server for QPost — now any AI agent (Claude, Cursor,
your own) can publish to YouTube/TikTok/Instagram directly. No dashboard,
no copy-paste. `npx qpost-mcp` 🧵

2/ The API already existed for n8n users. Turns out "API a no-code tool
can call" and "API an agent can call" are basically the same shape — MCP
was mostly documentation + packaging, not new backend work.

3/ Tools: list_connected_accounts, create_post (video or images, from a
URL or local path), list_posts, get_post, update_post, delete_post,
retry_post.

4/ Repo: github.com/arslan2012/qpost-mcp
Docs: qpost.dev/docs
Open to feedback, especially from anyone else building agents that need
to take real publishing actions, not just draft content.
