CREATE TABLE public.payment_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payment settings are viewable by everyone"
ON public.payment_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert payment settings"
ON public.payment_settings
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update payment settings"
ON public.payment_settings
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete payment settings"
ON public.payment_settings
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_payment_settings_updated_at ON public.payment_settings;
CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.payment_settings (id, bank_name, account_number, account_name)
VALUES ('primary', 'Zenith Bank', '1234567890', 'Egypt Plugs Ltd')
ON CONFLICT (id) DO NOTHING;
