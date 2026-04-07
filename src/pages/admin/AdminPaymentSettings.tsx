import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DEFAULT_FORM = {
  bank_name: "",
  account_number: "",
  account_name: "",
};

export default function AdminPaymentSettings() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payment_settings")
      .select("bank_name, account_number, account_name")
      .eq("id", "primary")
      .maybeSingle();

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data) {
      setForm({
        bank_name: data.bank_name,
        account_number: data.account_number,
        account_name: data.account_name,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!form.bank_name || !form.account_number || !form.account_name) {
      toast.error("All fields are required");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("payment_settings").upsert({
      id: "primary",
      bank_name: form.bank_name.trim(),
      account_number: form.account_number.trim(),
      account_name: form.account_name.trim(),
    });

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Payment account details updated");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Payment Settings</h1>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="pt-6 space-y-4 max-w-xl">
            <div>
              <Label>Bank Name *</Label>
              <Input
                value={form.bank_name}
                onChange={(e) => setForm((prev) => ({ ...prev, bank_name: e.target.value }))}
                placeholder="Zenith Bank"
              />
            </div>
            <div>
              <Label>Account Number *</Label>
              <Input
                value={form.account_number}
                onChange={(e) => setForm((prev) => ({ ...prev, account_number: e.target.value }))}
                placeholder="1234567890"
              />
            </div>
            <div>
              <Label>Account Name *</Label>
              <Input
                value={form.account_name}
                onChange={(e) => setForm((prev) => ({ ...prev, account_name: e.target.value }))}
                placeholder="Egypt Plugs Ltd"
              />
            </div>
            <Button onClick={handleSave} disabled={loading || saving}>
              {loading ? "Loading..." : saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
