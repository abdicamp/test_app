const CURSOR_API = "https://api.cursor.com/v1";

function authHeader() {
  const key = process.env.CURSOR_API_KEY;
  if (!key) {
    throw new Error("CURSOR_API_KEY is not set in environment");
  }
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

export function repoConfig() {
  return {
    url: process.env.GITHUB_REPO_URL || "https://github.com/abdicamp/test_app",
    startingRef: process.env.GITHUB_BRANCH || "main",
  };
}

export async function cursorFetch(path: string, init?: RequestInit) {
  const response = await fetch(`${CURSOR_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${text}`);
  }

  return data as Record<string, unknown>;
}

export function buildAgentPrompt(userText: string) {
  return `${userText}

Constraints for editing this website repository:
- Prefer editing src/content/site.ts for visible homepage/nav/section text.
- You may also update related UI in src/app/page.tsx or components if needed.
- Do NOT remove the chatroom, API routes under src/app/api, or break the build.
- Keep TypeScript/Next.js compiling.
- Push changes directly to branch ${process.env.GITHUB_BRANCH || "main"}.

Chat reply rules (important):
- Reply in the user's language.
- Keep the final chat message SHORT — 1 to 3 short sentences max.
- Do NOT dump current site inventory (brand/hero/about lists) unless asked.
- Do NOT include branch names, agent URLs, deploy instructions, or meta footers.
- If the user only greets or chats without an edit request, reply briefly and do not change code.
- If you edited files, say only what changed in plain language (e.g. "Menu Product sudah ditambahkan.").`;
}
