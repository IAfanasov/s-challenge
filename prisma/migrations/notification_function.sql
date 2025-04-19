CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('new_message', row_to_json(NEW)::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS message_notify_trigger ON "Message";
CREATE TRIGGER message_notify_trigger
AFTER INSERT ON "Message"
FOR EACH ROW
EXECUTE FUNCTION notify_new_message(); 