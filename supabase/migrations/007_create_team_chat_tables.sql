-- ============================================================
-- TriosFlow Team Chat & Mentions (Unified conversations system)
-- ============================================================

-- ------------------------------
-- Helper: user role checks
-- ------------------------------
-- Assumptions:
-- - Admin/member roles live in `profiles.role`
-- - Client role lives in `client_users.role` and `client_users.id = auth.uid()`
-- - RLS uses auth.uid()

-- ------------------------------
-- conversations
-- ------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  conversation_type text NOT NULL CHECK (conversation_type IN ('team','client')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversations_project_id_idx ON conversations(project_id);
CREATE INDEX IF NOT EXISTS conversations_type_idx ON conversations(conversation_type);

-- ------------------------------
-- messages
-- ------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id),
  sender_role text NOT NULL CHECK (sender_role IN ('admin','member','client')),
  message text NOT NULL,
  edited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);

-- ------------------------------
-- message_mentions
-- ------------------------------
CREATE TABLE IF NOT EXISTS message_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  mentioned_user_id uuid NOT NULL REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS message_mentions_message_id_idx ON message_mentions(message_id);
CREATE INDEX IF NOT EXISTS message_mentions_mentioned_user_id_idx ON message_mentions(mentioned_user_id);

-- ------------------------------
-- message_reactions
-- ------------------------------
CREATE TABLE IF NOT EXISTS message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  reaction text NOT NULL CHECK (reaction IN ('👍','❤️','🚀','👀')),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS message_reactions_message_id_idx ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS message_reactions_user_id_idx ON message_reactions(user_id);

-- ------------------------------
-- message_files
-- ------------------------------
CREATE TABLE IF NOT EXISTS message_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS message_files_message_id_idx ON message_files(message_id);
CREATE INDEX IF NOT EXISTS message_files_file_id_idx ON message_files(file_id);

-- ------------------------------
-- Enable RLS
-- ------------------------------
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_files ENABLE ROW LEVEL SECURITY;

-- ------------------------------
-- RLS: conversations
-- ------------------------------

-- Admin: full access
CREATE POLICY "admin_conversations_all"
  ON conversations
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Members: only team conversations
CREATE POLICY "member_conversations_select_team"
  ON conversations
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND conversation_type = 'team'
  );

CREATE POLICY "member_conversations_insert_team"
  ON conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND conversation_type = 'team'
  );

CREATE POLICY "member_conversations_update_team"
  ON conversations
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND conversation_type = 'team'
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND conversation_type = 'team'
  );

-- Clients: only client conversations
CREATE POLICY "client_conversations_select_client"
  ON conversations
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND conversation_type = 'client'
  );

CREATE POLICY "client_conversations_insert_client"
  ON conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND conversation_type = 'client'
  );

CREATE POLICY "client_conversations_update_client"
  ON conversations
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND conversation_type = 'client'
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND conversation_type = 'client'
  );

-- ------------------------------
-- RLS: messages
-- ------------------------------

-- Admin: full access
CREATE POLICY "admin_messages_all"
  ON messages
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Member: read team messages only
CREATE POLICY "member_messages_select_team"
  ON messages
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'team'
    )
    AND messages.deleted_at IS NULL
  );

-- Client: read client messages only
CREATE POLICY "client_messages_select_client"
  ON messages
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'client'
    )
    AND messages.deleted_at IS NULL
  );

-- Member: insert messages only into team conversations
CREATE POLICY "member_messages_insert_team"
  ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'team'
    )
  );

-- Client: insert messages only into client conversations
CREATE POLICY "client_messages_insert_client"
  ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'client'
    )
  );

-- Member: edit own messages in team conversations
CREATE POLICY "member_messages_update_own"
  ON messages
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'team'
    )
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'team'
    )
  );

-- Client: edit own messages in client conversations
CREATE POLICY "client_messages_update_own"
  ON messages
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'client'
    )
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'client'
    )
  );

-- Member: delete own messages (soft delete via deleted_at)
CREATE POLICY "member_messages_soft_delete_own"
  ON messages
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'team'
    )
  );

-- Client: delete own messages (soft delete via deleted_at)
CREATE POLICY "client_messages_soft_delete_own"
  ON messages
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'client'
    )
  );

-- ------------------------------
-- RLS: message_mentions
-- ------------------------------

-- Admin: full access
CREATE POLICY "admin_message_mentions_all"
  ON message_mentions
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Member: can read mentions for messages they can read
CREATE POLICY "member_message_mentions_select"
  ON message_mentions
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_mentions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'team'
    )
  );

-- Client: can read mentions for messages they can read (client conversations only)
CREATE POLICY "client_message_mentions_select"
  ON message_mentions
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_mentions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'client'
    )
  );

-- Insert mentions allowed for users who can insert messages into the related conversation
CREATE POLICY "member_message_mentions_insert"
  ON message_mentions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_mentions.message_id
        AND c.conversation_type = 'team'
    )
  );

CREATE POLICY "client_message_mentions_insert"
  ON message_mentions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_mentions.message_id
        AND c.conversation_type = 'client'
    )
  );

-- ------------------------------
-- RLS: message_reactions
-- ------------------------------

-- Admin: full access (moderate reactions)
CREATE POLICY "admin_message_reactions_all"
  ON message_reactions
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Everyone with access to the message can select reactions
CREATE POLICY "member_message_reactions_select"
  ON message_reactions
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'team'
    )
    AND message_reactions.deleted_at IS NULL
  );

CREATE POLICY "client_message_reactions_select"
  ON message_reactions
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'client'
    )
    AND message_reactions.deleted_at IS NULL
  );

-- Member: create own reaction on team message
CREATE POLICY "member_message_reactions_insert_own"
  ON message_reactions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'team'
    )
  );

-- Client: create own reaction on client message
CREATE POLICY "client_message_reactions_insert_own"
  ON message_reactions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'client'
    )
  );

-- Member: delete own reaction
CREATE POLICY "member_message_reactions_delete_own"
  ON message_reactions
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'team'
    )
  );

-- Client: delete own reaction
CREATE POLICY "client_message_reactions_delete_own"
  ON message_reactions
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'client'
    )
  );

-- ------------------------------
-- RLS: message_files
-- ------------------------------

-- Admin: full access
CREATE POLICY "admin_message_files_all"
  ON message_files
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Members: can attach/read files only in team message contexts and only to files they can access
CREATE POLICY "member_message_files_select"
  ON message_files
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_files.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'team'
    )
    AND EXISTS (
      SELECT 1 FROM files f WHERE f.id = message_files.file_id
    )
  );

CREATE POLICY "member_message_files_insert"
  ON message_files
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_files.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'team'
    )
    AND EXISTS (
      SELECT 1 FROM files f WHERE f.id = message_files.file_id
    )
  );

-- Clients: can only attach/read file links for client conversations.
-- Additionally, file access is already enforced by `files` RLS + policies.
CREATE POLICY "client_message_files_select"
  ON message_files
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_files.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'client'
    )
    AND EXISTS (
      SELECT 1 FROM files f WHERE f.id = message_files.file_id
    )
  );

CREATE POLICY "client_message_files_insert"
  ON message_files
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_files.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'client'
    )
    AND EXISTS (
      SELECT 1 FROM files f WHERE f.id = message_files.file_id
    )
  );

