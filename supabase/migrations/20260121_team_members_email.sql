-- Add email column to team_members for direct reply-to
-- When a salesperson sends an email, replies will go directly to their business email

ALTER TABLE team_members ADD COLUMN IF NOT EXISTS email TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN team_members.email IS 'Business email address for direct replies. If set, used as reply-to when this team member sends emails from CRM.';

-- Set default reply-to emails for team members
UPDATE team_members
SET email = 'maciej@tomekniedzwiecki.pl'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'kanczewski.maciej@gmail.com');

UPDATE team_members
SET email = 'ceo@tomekniedzwiecki.pl'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'tomek@tomekniedzwiecki.pl');
