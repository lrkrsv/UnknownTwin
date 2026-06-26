-- Add conversation_id to escalations for mentor context and message threading

ALTER TABLE escalations ADD COLUMN conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_escalations_conversation_id ON escalations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_escalations_message_id ON escalations(message_id);
