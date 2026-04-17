import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface VariantRow {
  id?: string;
  size: string;
  color: string;
  price_adjustment_ngn: number;
  stock_count: number;
  in_stock: boolean;
  _isNew?: boolean;
}

interface Props {
  productId: string | null; // null when creating a new product
  variants: VariantRow[];
  setVariants: (v: VariantRow[]) => void;
}

export default function ProductVariantsManager({ productId, variants, setVariants }: Props) {
  const [loading, setLoading] = useState(false);
  const [bulkSizes, setBulkSizes] = useState("");
  const [bulkColors, setBulkColors] = useState("");

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setVariants(
          (data || []).map((v) => ({
            id: v.id,
            size: v.size || "",
            color: v.color || "",
            price_adjustment_ngn: Number(v.price_adjustment_ngn) || 0,
            stock_count: v.stock_count || 0,
            in_stock: v.in_stock !== false,
          }))
        );
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const addRow = () => {
    setVariants([
      ...variants,
      { size: "", color: "", price_adjustment_ngn: 0, stock_count: 10, in_stock: true, _isNew: true },
    ]);
  };

  const updateRow = (idx: number, patch: Partial<VariantRow>) => {
    setVariants(variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };

  const removeRow = async (idx: number) => {
    const row = variants[idx];
    if (row.id) {
      const { error } = await supabase.from("product_variants").delete().eq("id", row.id);
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const generateMatrix = () => {
    const sizes = bulkSizes.split(",").map((s) => s.trim()).filter(Boolean);
    const colors = bulkColors.split(",").map((s) => s.trim()).filter(Boolean);
    if (sizes.length === 0 && colors.length === 0) {
      toast.error("Enter at least one size or color");
      return;
    }
    const sList = sizes.length ? sizes : [""];
    const cList = colors.length ? colors : [""];
    const generated: VariantRow[] = [];
    for (const s of sList) {
      for (const c of cList) {
        const exists = variants.some((v) => v.size === s && v.color === c);
        if (!exists) {
          generated.push({
            size: s,
            color: c,
            price_adjustment_ngn: 0,
            stock_count: 10,
            in_stock: true,
            _isNew: true,
          });
        }
      }
    }
    if (generated.length === 0) {
      toast.info("All combinations already exist");
      return;
    }
    setVariants([...variants, ...generated]);
    setBulkSizes("");
    setBulkColors("");
    toast.success(`Added ${generated.length} variant${generated.length > 1 ? "s" : ""}`);
  };

  return (
    <div className="space-y-3 border border-border rounded-lg p-3 bg-muted/20">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Variants (Sizes & Colors)</Label>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>

      {/* Bulk generator */}
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Sizes: S, M, L, XL"
          value={bulkSizes}
          onChange={(e) => setBulkSizes(e.target.value)}
          className="h-8 text-xs"
        />
        <Input
          placeholder="Colors: Black, Navy, Gold"
          value={bulkColors}
          onChange={(e) => setBulkColors(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={generateMatrix} className="w-full">
        Generate Combinations
      </Button>

      {loading && <p className="text-xs text-muted-foreground">Loading variants...</p>}

      {variants.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-[1fr_1fr_70px_60px_30px] gap-2 text-xs text-muted-foreground px-1">
            <span>Size</span>
            <span>Color</span>
            <span>Price +</span>
            <span>Stock</span>
            <span></span>
          </div>
          {variants.map((v, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_70px_60px_30px] gap-2 items-center">
              <Input
                value={v.size}
                onChange={(e) => updateRow(idx, { size: e.target.value })}
                placeholder="M"
                className="h-8 text-xs"
              />
              <Input
                value={v.color}
                onChange={(e) => updateRow(idx, { color: e.target.value })}
                placeholder="Black"
                className="h-8 text-xs"
              />
              <Input
                type="number"
                value={v.price_adjustment_ngn}
                onChange={(e) => updateRow(idx, { price_adjustment_ngn: Number(e.target.value) })}
                className="h-8 text-xs"
              />
              <Input
                type="number"
                value={v.stock_count}
                onChange={(e) =>
                  updateRow(idx, { stock_count: Number(e.target.value), in_stock: Number(e.target.value) > 0 })
                }
                className="h-8 text-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => removeRow(idx)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {!loading && variants.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          No variants. Add manually or use the generator above.
        </p>
      )}
    </div>
  );
}

// Helper to persist variants for a given product
export async function saveVariants(productId: string, variants: VariantRow[]) {
  const toInsert = variants
    .filter((v) => !v.id && (v.size || v.color))
    .map((v) => ({
      product_id: productId,
      size: v.size || null,
      color: v.color || null,
      price_adjustment_ngn: v.price_adjustment_ngn || 0,
      stock_count: v.stock_count || 0,
      in_stock: v.in_stock,
    }));

  const toUpdate = variants.filter((v) => v.id && (v.size || v.color));

  if (toInsert.length > 0) {
    const { error } = await supabase.from("product_variants").insert(toInsert);
    if (error) throw error;
  }

  for (const v of toUpdate) {
    const { error } = await supabase
      .from("product_variants")
      .update({
        size: v.size || null,
        color: v.color || null,
        price_adjustment_ngn: v.price_adjustment_ngn || 0,
        stock_count: v.stock_count || 0,
        in_stock: v.in_stock,
      })
      .eq("id", v.id!);
    if (error) throw error;
  }
}
