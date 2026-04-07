
-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', false);

-- RLS: Users can upload their own receipts
CREATE POLICY "Users can upload receipts" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can view their own receipts
CREATE POLICY "Users can view own receipts" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'payment-receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Admins can view all receipts
CREATE POLICY "Admins can view all receipts" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'payment-receipts' AND public.has_role(auth.uid(), 'admin'));
