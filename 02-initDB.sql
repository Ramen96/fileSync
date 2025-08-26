-- run this script after you have set up the database schema.
BEGIN;
-- Insert into metadata and save the generated UUID
WITH new_entry AS (
    INSERT INTO metadata (name, file_type, is_folder, created_at)
    VALUES ('root', 'true', TRUE, CURRENT_TIMESTAMP)
    RETURNING id
)
-- Use the UUID from metadata to insert into hierarchy
INSERT INTO hierarchy (id, parent_id)
SELECT id, NULL FROM new_entry;

COMMIT;