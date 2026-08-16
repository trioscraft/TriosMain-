"use client";

import { useMemo, useState } from "react";

type Candidate = {
  id: string;
  name: string;
  email: string | null;
};

type Props = {
  query: string;
  onSelect: (user: Candidate) => void;
  conversationType: "team" | "client";
};

export default function MentionAutocomplete({
  query,
}: Props) {
  const [loading] = useState(false);

  const candidates = useMemo(() => [], []);

  // Placeholder UI (no dropdown rendering yet)
  // Phase 3: foundation only. Wiring comes in MessageInput.
  return (
    <div style={{ display: "none" }} aria-hidden="true">
      {loading ? "Loading" : ""}
      {query}
      {candidates.length}
    </div>
  );
}

