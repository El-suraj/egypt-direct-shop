import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import ProductVariantsManager, { VariantRow, saveVariants } from "@/components/admin/ProductVariantsManager";

interface Product {
  id: string;
  name: string;
  slug: string;
  price_ngn: number;
  price_egp: number;
  shipping_fee_ngn: number | null;
  service_fee_ngn: number | null;
  image_url: string | null;
  images: string[] | null;
  in_stock: boolean | null;
  category_id: string | null;
  vendor_id: string | null;
  description: string | null;
  badge: string | null;
}

const emptyForm = {
  name: "", slug: "", price_ngn: 0, price_egp: 0,
  shipping_fee_ngn: 5000, service_fee_ngn: 2000,
  image_url: "", images: [] as string[], description: "",
  category_id: "", vendor_id: "", badge: "", in_stock: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  const fetchProducts = async () => {
    let query = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (search) query = query.ilike("name", `%${search}%`);
    const { data } = await query.limit(100);
    setProducts((data as Product[]) || []);
  };

  useEffect(() => {
    fetchProducts();
    supabase.from("categories").select("id, name").then(({ data }) => setCategories(data || []));
    supabase.from("vendors").select("id, name").then(({ data }) => setVendors(data || []));
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, price_ngn: p.price_ngn, price_egp: p.price_egp,
      shipping_fee_ngn: p.shipping_fee_ngn || 5000, service_fee_ngn: p.service_fee_ngn || 2000,
      image_url: p.image_url || "", images: p.images || [],
      description: p.description || "", category_id: p.category_id || "",
      vendor_id: p.vendor_id || "", badge: p.badge || "", in_stock: p.in_stock !== false,
    });
    setDialogOpen(true);
  };

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (form.images.includes(url)) { toast.error("Image already added"); return; }
    setForm({ ...form, images: [...form.images, url] });
    setNewImageUrl("");
  };

  const removeImage = (idx: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const handleSave = async () => {
    if (!form.name || !form.price_ngn || !form.price_egp) {
      toast.error("Name and prices are required"); return;
    }
    setLoading(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload = {
      name: form.name, slug,
      price_ngn: form.price_ngn, price_egp: form.price_egp,
      shipping_fee_ngn: form.shipping_fee_ngn, service_fee_ngn: form.service_fee_ngn,
      image_url: form.image_url || (form.images.length > 0 ? form.images[0] : null),
      images: form.images.length > 0 ? form.images : null,
      description: form.description || null,
      category_id: form.category_id || null, vendor_id: form.vendor_id || null,
      badge: form.badge || null, in_stock: form.in_stock,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success(editing ? "Product updated" : "Product created");
      setDialogOpen(false);
      fetchProducts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Product deleted"); fetchProducts(); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Product</TableHead>
                  <TableHead>Price (NGN)</TableHead>
                  <TableHead>Price (EGP)</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.image_url && <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-md object-cover" />}
                        <span className="font-medium text-foreground">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>₦{Number(p.price_ngn).toLocaleString()}</TableCell>
                    <TableCell>E£{Number(p.price_egp).toLocaleString()}</TableCell>
                    <TableCell>{(p.images?.length || 0) + (p.image_url ? 1 : 0)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.in_stock !== false ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                      }`}>
                        {p.in_stock !== false ? "In Stock" : "Out of Stock"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No products found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if empty" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Price NGN *</Label><Input type="number" value={form.price_ngn} onChange={(e) => setForm({ ...form, price_ngn: Number(e.target.value) })} /></div>
                <div><Label>Price EGP *</Label><Input type="number" value={form.price_egp} onChange={(e) => setForm({ ...form, price_egp: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Shipping Fee (NGN)</Label><Input type="number" value={form.shipping_fee_ngn} onChange={(e) => setForm({ ...form, shipping_fee_ngn: Number(e.target.value) })} /></div>
                <div><Label>Service Fee (NGN)</Label><Input type="number" value={form.service_fee_ngn} onChange={(e) => setForm({ ...form, service_fee_ngn: Number(e.target.value) })} /></div>
              </div>

              {/* Main Image URL */}
              <div>
                <Label>Main Image URL</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Primary product image URL" />
              </div>

              {/* Additional Images */}
              <div>
                <Label>Additional Images</Label>
                <div className="flex gap-2">
                  <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="Paste image URL" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())} />
                  <Button type="button" variant="outline" onClick={addImageUrl} size="sm">Add</Button>
                </div>
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative group w-16 h-16 rounded-md overflow-hidden border border-border">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vendor</Label>
                  <Select value={form.vendor_id} onValueChange={(v) => setForm({ ...form, vendor_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                    <SelectContent>{vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Badge</Label>
                <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="e.g. Best Seller, New" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} className="h-4 w-4" />
                <Label>In Stock</Label>
              </div>
              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? "Saving..." : editing ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
