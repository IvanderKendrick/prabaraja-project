import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CoaSelect } from "@/components/CoaSelect";

export interface SalesItem {
  item_name: string;
  sku?: string;
  memo?: string;
  qty: number;
  unit: string;
  return_qty?: number;
  price: number;
  disc_item: number;
  disc_item_type: "percentage" | "rupiah";
  item_coa_id?: string | null;
  item_coa_label?: string | null;
}

interface Props {
  items: SalesItem[];
  setItems: (items: SalesItem[]) => void;
  showSku?: boolean;
  returnFieldName?: string; // name for return quantity field when needed
  showReturn?: boolean;
  showItemCoa?: boolean;
}

export default function SalesItemsForm({ items, setItems, showSku = false, returnFieldName = "return_qty", showReturn = true, showItemCoa = false }: Props) {
  const addItem = () => {
    setItems([...items, { item_name: "", sku: "", memo: "", qty: 1, unit: "pcs", return_qty: 0, price: 0, disc_item: 0, disc_item_type: "percentage" }]);
  };

  const updateItem = (idx: number, key: keyof SalesItem, value: any) => {
    const next = items.map((it, i) => (i === idx ? { ...it, [key]: value } : it));
    setItems(next);
  };

  const removeItem = (idx: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-white p-2 rounded">
      <div className="flex justify-end items-center mb-4">
        <Button type="button" variant="outline" onClick={addItem}>
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="border p-3 rounded">
            <div className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-4">
                <Label>Item Name</Label>
                <Input value={item.item_name} onChange={(e) => updateItem(idx, "item_name", e.target.value)} />
              </div>

              {showSku && (
                <div className="col-span-2">
                  <Label>SKU</Label>
                  <Input value={item.sku} onChange={(e) => updateItem(idx, "sku", e.target.value)} />
                </div>
              )}

              {showItemCoa && (
                <div className="col-span-6">
                  <Label>Item COA</Label>
                  <CoaSelect
                    valueId={item.item_coa_id}
                    valueLabel={item.item_coa_label}
                    onSelect={(id, label) => {
                      updateItem(idx, "item_coa_id", id);
                      updateItem(idx, "item_coa_label", label);
                    }}
                    placeholder="Select account"
                    className="w-full"
                  />
                </div>
              )}

              {/* Leave space if needed; Memo/Qty moved to next row */}
            </div>

            <div className="grid grid-cols-12 gap-3 mt-3 items-end">
              <div className="col-span-6">
                <Label>Memo</Label>
                <Input placeholder="Notes" value={item.memo} onChange={(e) => updateItem(idx, "memo", e.target.value)} />
              </div>

              <div className="col-span-2">
                <Label>Qty</Label>
                <Input type="number" min={1} value={item.qty} onChange={(e) => updateItem(idx, "qty", Number(e.target.value) || 0)} />
              </div>

              <div className="col-span-2">
                <Label>Unit</Label>
                <Select value={item.unit} onValueChange={(v) => updateItem(idx, "unit", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ms">ms</SelectItem>
                    <SelectItem value="pcs">pcs</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="pax">pax</SelectItem>
                    <SelectItem value="custom">custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showReturn && (
                <div className="col-span-2">
                  <Label>Return</Label>
                  <Input type="number" min={0} value={item.return_qty} onChange={(e) => updateItem(idx, "return_qty", Number(e.target.value) || 0)} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-12 gap-3 mt-3 items-center">
              <div className="col-span-6">
                <div className="mb-3">
                  <Label>Price</Label>
                  <Input type="number" min={0} value={item.price} onChange={(e) => updateItem(idx, "price", Number(e.target.value) || 0)} />
                </div>

                <div className="flex items-center gap-3">
                  <Switch checked={item.disc_item_type === "percentage"} onCheckedChange={(checked) => updateItem(idx, "disc_item_type", checked ? "percentage" : "rupiah")} />
                  <Label>{item.disc_item_type === "percentage" ? "Discount (%)" : "Discount (Rp)"}</Label>
                  <Input type="number" min={0} value={item.disc_item} onChange={(e) => updateItem(idx, "disc_item", Number(e.target.value) || 0)} />
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-500">Line Subtotal</div>
                  <div className="font-semibold">
                    Rp{" "}
                    {(() => {
                      const price = Number(item.price || 0) * Number(item.qty || 1);
                      const disc = item.disc_item_type === "percentage" ? (price * Number(item.disc_item || 0)) / 100 : Number(item.disc_item || 0);
                      const ret = Number(item.return_qty || 0) * Number(item.price || 0);
                      return (price - disc - ret).toLocaleString();
                    })()}
                  </div>
                </div>
              </div>

              <div className="col-span-6 flex justify-end">
                <Button type="button" variant="destructive" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
