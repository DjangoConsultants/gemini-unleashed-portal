-- Create storage policies for the uploads bucket to allow authenticated users to download files

-- Create policy to allow authenticated users to view/download files from uploads bucket
CREATE POLICY "Authenticated users can view files in uploads bucket" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'uploads' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to insert files to uploads bucket
CREATE POLICY "Authenticated users can upload files to uploads bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'uploads' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to update files in uploads bucket
CREATE POLICY "Authenticated users can update files in uploads bucket" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'uploads' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to delete files in uploads bucket
CREATE POLICY "Authenticated users can delete files in uploads bucket" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'uploads' 
  AND auth.role() = 'authenticated'
);