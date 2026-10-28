#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";

const BASE_URL = (process.env.QPOST_BASE_URL ?? "https://qpost.dev").replace(
  /\/$/,
  "",
);
const API_KEY = process.env.QPOST_API_KEY;

if (!API_KEY) {
  console.error(
    "[qpost-mcp] Missing QPOST_API_KEY environment variable. " +
      "Generate one from your QPost dashboard (Settings > API Keys) and set it before starting this server.",
  );
  process.exit(1);
}

const VIDEO_MIME_BY_EXT: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".mkv": "video/x-matroska",
};

const IMAGE_MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

function guessMime(name: string, kind: "video" | "image"): string {
  const ext = extname(name).toLowerCase();
  const table = kind === "video" ? VIDEO_MIME_BY_EXT : IMAGE_MIME_BY_EXT;
  return table[ext] ?? (kind === "video" ? "video/mp4" : "image/jpeg");
}

async function loadMediaFile(
  kind: "video" | "image",
  source: { url?: string; path?: string },
): Promise<File> {
  if (source.url) {
    const res = await fetch(source.url);
    if (!res.ok) {
      throw new Error(
        `Failed to download ${kind} from ${source.url}: ${res.status} ${res.statusText}`,
      );
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const name = source.url.split("/").pop()?.split("?")[0] || `${kind}${kind === "video" ? ".mp4" : ".jpg"}`;
    return new File([buf], name, { type: guessMime(name, kind) });
  }
  if (source.path) {
    const buf = await readFile(source.path);
    const name = source.path.split("/").pop() || `${kind}${kind === "video" ? ".mp4" : ".jpg"}`;
    return new File([buf], name, { type: guessMime(name, kind) });
  }
  throw new Error(`No url or path provided for ${kind}`);
}

async function qpostFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("x-api-key", API_KEY as string);
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(
      `QPost API error ${res.status} ${res.statusText}: ${JSON.stringify(body)}`,
    );
  }
  return body;
}

const { version } = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string };

const platformSchema = z.object({
  platform: z.enum(["YOUTUBE", "TIKTOK", "INSTAGRAM"]),
  metadata: z
    .record(z.string(), z.any())
    .optional()
    .describe(
      "Platform-specific options (privacy, tags, category, etc). See the platform metadata tables at https://qpost.dev/docs",
    ),
});

// serveStdio asks for a fresh server per connection, and serves 2026-07-28
// clients (server/discover) and 2025-era clients (initialize) from it alike.
function buildServer() {
  const server = new McpServer({ name: "qpost-mcp", version });

  server.registerTool(
    "list_connected_accounts",
    {
      description:
        "List the social media accounts (YouTube, TikTok, Instagram) currently connected to this QPost account, including connection status. Call this before creating a post to know which platforms are actually available.",
      annotations: { readOnlyHint: true },
      inputSchema: z.object({}),
    },
    async () => {
      const result = await qpostFetch("/api/accounts");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.registerTool(
    "create_post",
    {
      description:
        "Create and publish (or schedule) a post to one or more connected social platforms (YouTube, TikTok, Instagram). Provide media as either a remote URL (mediaUrl fetched by the server) or a local file path (mediaPath read from disk) — exactly one media source per call. Omit scheduledFor to publish immediately.",
      annotations: { destructiveHint: false, openWorldHint: true },
      inputSchema: z.object({
      caption: z.string().min(1).describe("Main text/caption content of the post"),
      platforms: z
        .array(platformSchema)
        .min(1)
        .describe("Target platforms and their per-platform metadata"),
      title: z.string().optional().describe("Optional title (used by YouTube)"),
      scheduledFor: z
        .string()
        .datetime()
        .optional()
        .describe("ISO datetime; if omitted the post publishes immediately"),
      timezone: z.string().optional().describe('IANA timezone, default "UTC"'),
      mediaKind: z
        .enum(["video", "image"])
        .describe("Whether the attached media is a single video or one or more images"),
      mediaUrl: z
        .string()
        .url()
        .optional()
        .describe("Publicly fetchable URL of the video, or of a single image"),
      mediaPath: z
        .string()
        .optional()
        .describe("Local filesystem path to the video, or to a single image"),
      imageUrls: z
        .array(z.string().url())
        .optional()
        .describe("Multiple image URLs (mediaKind=image, carousel posts)"),
      imagePaths: z
        .array(z.string())
        .optional()
        .describe("Multiple local image file paths (mediaKind=image, carousel posts)"),
      }),
    },
    async (args) => {
      const form = new FormData();
      form.append("caption", args.caption);
      form.append("platforms", JSON.stringify(args.platforms));
      if (args.title) form.append("title", args.title);
      if (args.scheduledFor) form.append("scheduledFor", args.scheduledFor);
      if (args.timezone) form.append("timezone", args.timezone);

      if (args.mediaKind === "video") {
        const file = await loadMediaFile("video", {
          url: args.mediaUrl,
          path: args.mediaPath,
        });
        form.append("video", file);
      } else {
        const urls = args.imageUrls ?? (args.mediaUrl ? [args.mediaUrl] : []);
        const paths = args.imagePaths ?? (args.mediaPath ? [args.mediaPath] : []);
        if (urls.length === 0 && paths.length === 0) {
          throw new Error(
            "mediaKind is 'image' but no mediaUrl/mediaPath/imageUrls/imagePaths were provided",
          );
        }
        for (const url of urls) {
          form.append("images", await loadMediaFile("image", { url }));
        }
        for (const path of paths) {
          form.append("images", await loadMediaFile("image", { path }));
        }
      }

      const headers = new Headers();
      headers.set("x-api-key", API_KEY as string);
      const res = await fetch(`${BASE_URL}/api/post`, {
        method: "POST",
        headers,
        body: form,
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(`QPost API error ${res.status}: ${JSON.stringify(body)}`);
      }
      return { content: [{ type: "text", text: JSON.stringify(body, null, 2) }] };
    },
  );

  server.registerTool(
    "list_posts",
    {
      description:
        "List posts on this QPost account, optionally filtered by status or platform.",
      annotations: { readOnlyHint: true },
      inputSchema: z.object({
        status: z.enum(["DRAFT", "SCHEDULED", "POSTED", "FAILED"]).optional(),
        platform: z.enum(["YOUTUBE", "TIKTOK", "INSTAGRAM"]).optional(),
      }),
    },
    async ({ status, platform }) => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (platform) params.set("platform", platform);
      const qs = params.toString();
      const result = await qpostFetch(`/api/post${qs ? `?${qs}` : ""}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.registerTool(
    "get_post",
    {
      description:
        "Get a single post by ID, including its per-platform publish status.",
      annotations: { readOnlyHint: true },
      inputSchema: z.object({ id: z.string() }),
    },
    async ({ id }) => {
      const result = await qpostFetch(`/api/post/${encodeURIComponent(id)}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.registerTool(
    "get_post_stats",
    {
      description:
        "How a published post is doing: views, likes, comments and shares per platform, read live from the platform (TikTok so far), plus each platform's public URL.",
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: z.object({ id: z.string() }),
    },
    async ({ id }) => {
      const result = await qpostFetch(`/api/post/${encodeURIComponent(id)}/stats`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.registerTool(
    "update_post",
    {
      description:
        "Update a post's caption, schedule, timezone, or status. Only works on posts you own.",
      annotations: { destructiveHint: false, idempotentHint: true },
      inputSchema: z.object({
        id: z.string(),
        caption: z.string().optional(),
        scheduledFor: z.string().datetime().nullable().optional(),
        timezone: z.string().optional(),
        status: z.enum(["DRAFT", "SCHEDULED", "POSTED", "FAILED"]).optional(),
      }),
    },
    async ({ id, ...body }) => {
      const result = await qpostFetch(`/api/post/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.registerTool(
    "delete_post",
    {
      description:
        "Permanently delete a post you own.",
      annotations: { destructiveHint: true },
      inputSchema: z.object({ id: z.string() }),
    },
    async ({ id }) => {
      const result = await qpostFetch(`/api/post/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.registerTool(
    "retry_post",
    {
      description:
        "Retry publishing a post that previously failed.",
      annotations: { destructiveHint: false, openWorldHint: true },
      inputSchema: z.object({ id: z.string() }),
    },
    async ({ id }) => {
      const result = await qpostFetch(`/api/post/${encodeURIComponent(id)}/retry`, {
        method: "POST",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  return server;
}

serveStdio(buildServer, {
  onerror: (err) => console.error("[qpost-mcp] error", err),
});
console.error(`[qpost-mcp] running (target: ${BASE_URL})`);
