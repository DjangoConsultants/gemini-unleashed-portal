-- Check if RLS is enabled on purchase_file table and create policies
-- First, let's enable RLS and create policies for purchase_file table

-- Enable RLS (if not already enabled)
ALTER TABLE public.purchase_file ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view purchase files
CREATE POLICY "Authenticated users can view purchase files" 
ON public.purchase_file 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to insert purchase files
CREATE POLICY "Authenticated users can insert purchase files" 
ON public.purchase_file 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update purchase files
CREATE POLICY "Authenticated users can update purchase files" 
ON public.purchase_file 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete purchase files
CREATE POLICY "Authenticated users can delete purchase files" 
ON public.purchase_file 
FOR DELETE 
USING (auth.role() = 'authenticated');