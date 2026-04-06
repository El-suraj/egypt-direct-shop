import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminVendors() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", location: "Cairo, Egypt", logo_url: "", verified: false });
  const [loading, setLoading] = useState(false);

  const fetchVendors = async () => {
    const { data } = await supabase.from("vendors").select("*").order("name");
    setVendors(data || []);
  };

  useEffect(() => { fetchVendors(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", location: "Cairo, Egypt", logo_url: "", verified: false });
    setDialogOpen(true);
  };

  const openEdit = (v: any) => {
    setEditing(v);
    setForm({ name: v.name, slug: v.slug, description: v.description || "", location: v.location || "Cairo, Egypt", logo_url: v.logo_url || "", verified: v.verified || false });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    setLoading(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload = { name: form.name, slug, description: form.description || null, location: form.location, logo_url: form.logo_url || null, verified: form.verified };

    let error;
    if (editing) {
      ({ error } = await supabase.from("vendors").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("vendors").insert(payload));
    }
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success(editing ? "Vendor updated" : "Vendor created"); setDialogOpen(false); fetchVendors(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vendor?")) return;
    const { error } = await supabase.from("vendors").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Vendor deleted"); fetchVendors(); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Vendors</h1>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Vendor</Button>
        </div>
        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Vendor</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((v) => (
                  <TableRow key={v.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {v.logo_url && <img src={v.logo_url} alt={v.name} className="h-8 w-8 rounded-full object-cover" />}
                        <span className="font-medium text-foreground">{v.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{v.location}</TableCell>
                    <TableCell>
                      {v.verified ? <CheckCircle className="h-4 w-4 text-green-500" /> : <span className="text-muted-foreground text-xs">No</span>}
                    </TableCell>
                    <TableCell>{v.total_sales || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {vendors.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No vendors found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editing ? "Edit Vendor" : "Add Vendor"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>Logo URL</Label><Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} className="h-4 w-4" />
                <Label>Verified Vendor</Label>
              </div>
              <Button onClick={handleSave} disabled={loading} className="w-full">{loading ? "Saving..." : editing ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
