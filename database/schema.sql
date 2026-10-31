
-- CampusFix Database Updates

-- 1. Add department relationship to issues
ALTER TABLE public.issues
ADD COLUMN IF NOT EXISTS department_id BIGINT;

ALTER TABLE public.issues
ADD CONSTRAINT issues_department_id_fkey
FOREIGN KEY (department_id)
REFERENCES public.departments(id)
ON DELETE SET NULL;

-- 2. Create issue history table
CREATE TABLE IF NOT EXISTS public.issue_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    issue_id BIGINT NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    issue_id BIGINT REFERENCES public.issues(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON public.issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_reported_by ON public.issues(reported_by);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON public.issues(assigned_to);
CREATE INDEX IF NOT EXISTS idx_issues_department ON public.issues(department_id);
CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON public.comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- 5. Create complaint statistics view
CREATE OR REPLACE VIEW public.complaint_statistics AS
SELECT status, COUNT(*) AS total_complaints
FROM public.issues
GROUP BY status;
