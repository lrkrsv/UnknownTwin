-- Add needs_human flag to messages for mentor escalation UI

ALTER TABLE messages ADD COLUMN needs_human INTEGER DEFAULT 0;
