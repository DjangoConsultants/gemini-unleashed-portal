-- Enable RLS on processing_logs table
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view processing logs
-- Note: You may want to restrict this further based on your business logic
-- For now, allowing all authenticated users to view all logs
CREATE POLICY "Authenticated users can view processing logs" 
ON public.processing_logs 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- If you want to restrict by user/organization, you would need additional columns
-- For example, if you had a user_id column:
-- CREATE POLICY "Users can view their own processing logs" 
-- ON public.processing_logs 
-- FOR SELECT 
-- USING (auth.uid() = user_id);