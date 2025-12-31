-- Fix: Allow deleting users by cascading the deletion to their timesheets
-- Currently, you cannot delete a user if they have time logs because of the Foreign Key constraint.
-- This script changes the constraint to "ON DELETE CASCADE", meaning if you delete the user, their logs are also deleted.

ALTER TABLE public.timesheets
DROP CONSTRAINT timesheets_user_id_fkey,
ADD CONSTRAINT timesheets_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;
