-- Add RLS policies for the cont table
-- Assuming this is public content that authenticated users can read and create

CREATE POLICY "Authenticated users can view content" 
ON public.cont 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert content" 
ON public.cont 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update content" 
ON public.cont 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete content" 
ON public.cont 
FOR DELETE 
TO authenticated 
USING (true);