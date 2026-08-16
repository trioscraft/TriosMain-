import { supabase } from "@/lib/supabase";

export type MentionCandidate = {
  userId: string;
  name: string;
  email: string | null;
  role?: string | null;
};

/**
 * Extract @mentions from text.
 * Returns display names as they appear (case-preserved).
 * Example: "Please review @Rahul" => ["Rahul"]
 */
export function extractMentions(text: string): string[] {
  if (!text) return [];

  // Matches @Word characters (letters/numbers/_/.-). Stops at whitespace/punctuation.
  // Example: @Rahul, @Akash, @Arun
  const matches = text.match(/@([A-Za-z0-9_\-\.]+)/g);
  if (!matches) return [];

  // Strip leading @
  const raw = matches.map((m) => m.slice(1));

  // De-dupe case-insensitively, preserve first occurrence casing
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of raw) {
    const key = r.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

/**
 * Find user candidates that match a mention display name.
 * Search by:
 * - profiles.name (if exists)
 * - profiles.email (if exists)
 */
export async function getMentionedUsers(params: {
  projectId?: string;
  mentionTexts: string[];
  conversationType: "team" | "client";
}): Promise<MentionCandidate[]> {
  const { mentionTexts } = params;
  if (!mentionTexts?.length) return [];

  // We’ll search in profiles.
  // NOTE: this assumes profiles has `name` and `email` columns.
  // If your schema differs, adjust the select/filters.
  const lowerList = mentionTexts.map((t) => t.toLowerCase());

  // Supabase doesn’t support lower() in an IN list reliably without rpc; do ilike per token.
  // For performance we keep it simple for Phase 3 foundation.
  const results: MentionCandidate[] = [];
  const added = new Set<string>();

  for (const tokenLower of lowerList) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .or(`name.ilike.%${tokenLower}%,email.ilike.%${tokenLower}%`)
      .limit(5);

    if (error) continue;

    for (const row of data || []) {
      const userId = row.id as string;
      if (added.has(userId)) continue;

      results.push({
        userId,
        name: (row.name as string) || userId,
        email: (row.email as string) ?? null,
        role: (row.role as string) ?? null,
      });
      added.add(userId);
    }
  }

  return results;
}

/**
 * Create message mention rows.
 * - extractedMentionTexts: output of extractMentions
 * - It maps mention texts to profiles by best-effort (case-insensitive search).
 *
 * Returns created mention rows (best-effort).
 */
export async function createMentions(params: {
  messageId: string;
  extractedMentionTexts: string[];
  conversationType: "team" | "client";
}): Promise<void> {
  const { messageId, extractedMentionTexts } = params;
  if (!extractedMentionTexts?.length) return;

  const mentionedUsers = await getMentionedUsers({
    mentionTexts: extractedMentionTexts,
    conversationType: params.conversationType,
  });

  if (!mentionedUsers.length) return;

  // Insert mention rows.
  const payload = mentionedUsers.map((u) => ({
    message_id: messageId,
    mentioned_user_id: u.userId,
  }));

  const { error } = await supabase.from("message_mentions").insert(payload);
  if (error) {
    // RLS violations will surface here; swallow to keep message send resilient.
    console.error("createMentions failed:", error);
  }
}

