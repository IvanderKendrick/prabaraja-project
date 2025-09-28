import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PurchaseItem, PurchaseType } from "@/types/purchase";
import { formatInputCurrency, parseInputCurrency, formatCurrency } from "@/lib/utils";

interface PurchaseItemsFormProps {
  items: PurchaseItem[];
  setItems: (items: PurchaseItem[]) => void;
  onTotalChange?: (total: number) => void;
  purchaseType: PurchaseType; // Add purchaseType prop
}

export function PurchaseItemsForm({
  items,
  setItems,
  onTotalChange,
  purchaseType, // Receive purchaseType prop
}: PurchaseItemsFormProps) {
  const [isTaxAfter, setIsTaxAfter] = useState(false);
  const [selectedPph, setSelectedPph] = useState<"pph22" | "pph23" | "custom">("pph23");
  const [customTaxRate, setCustomTaxRate] = useState<string>("0");
  const [ppnRate, setPpnRate] = useState<"11" | "12">("11");

  const isInvoice = purchaseType === "invoice"; // Helper variable

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: "",
        quantity: 1,
          unit: "kg",
        price: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof PurchaseItem, value: any) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handlePriceChange = (id: string, value: string) => {
    const formattedValue = formatInputCurrency(value);
    const numericValue = parseInputCurrency(value);
    setItems(items.map((item) => (item.id === id ? { ...item, price: numericValue } : item)));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const formatPriceDisplay = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateDpp = () => {
    const total = calculateTotal();
    return isTaxAfter ? total / 1.11 : (11 / 12) * total;
  };

  const calculatePpn = () => {
    const rate = ppnRate === "11" ? 0.11 : 0.12;
    return calculateDpp() * rate;
  };

  const calculatePph = () => {
    const dpp = calculateDpp();
    if (selectedPph === "pph23") {
      return dpp * 0.02;
    } else if (selectedPph === "pph22") {
      if (dpp <= 500000000) return dpp * 0.01;
      if (dpp <= 10000000000) return dpp * 0.015;
      return dpp * 0.025;
    }
    const rate = parseFloat(customTaxRate.replace(",", ".")) / 100;
    return dpp * rate;
  };

  const calculateGrandTotal = () => {
    return isInvoice ? calculateTotal() + calculatePpn() - calculatePph() : calculateTotal();
  };

  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(calculateTotal());
    }
  }, [items, onTotalChange]);

  const handleCustomTaxChange = (value: string) => {
    if (/^[0-9,.]*$/.test(value)) {
      setCustomTaxRate(value);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Items</h2>
        <Button type="button" variant="outline" onClick={handleAddItem}>
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-4 items-center border-b pb-4">
            <div className="col-span-4">
              <Label htmlFor={`item-name-${item.id}`}>Item Name</Label>
              <Input id={`item-name-${item.id}`} value={item.name} onChange={(e) => handleItemChange(item.id, "name", e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label htmlFor={`item-quantity-${item.id}`}>Qty</Label>
              <Input id={`item-quantity-${item.id}`} type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, "quantity", parseInt(e.target.value))} />
            </div>
            <div className="col-span-2">
              <Label htmlFor={`item-unit-${item.id}`}>Unit</Label>
              <Select value={item.unit} onValueChange={(value: "kg" | "buah") => handleItemChange(item.id, "unit", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="buah">buah</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor={`item-price-${item.id}`}>Price</Label>
              <Input id={`item-price-${item.id}`} type="text" inputMode="numeric" value={formatPriceDisplay(item.price)} onChange={(e) => handlePriceChange(item.id, e.target.value)} placeholder="0" />
            </div>
            <div className="col-span-2 flex justify-end items-end h-full">
              <Button type="button" variant="ghost" className="text-red-500 h-8" onClick={() => handleRemoveItem(item.id)} disabled={items.length === 1}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Conditionally render tax section only for invoices */}
      {isInvoice && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-medium">Tax Calculation</h2>

          <div className="grid grid-cols-2 gap-4 items-center">
            <Label>Tax Calculation Method</Label>
            <div className="flex items-center gap-2">
              <Switch id="tax-method" checked={isTaxAfter} onCheckedChange={setIsTaxAfter} />
              <Label htmlFor="tax-method">{isTaxAfter ? "After Tax" : "Before Tax"}</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Label>DPP/VOT</Label>
            <div className="text-right">{formatCurrency(calculateDpp())}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Label>PPN (VAT)</Label>
            <div className="flex gap-2">
              <Select value={ppnRate} onValueChange={(value: "11" | "12") => setPpnRate(value)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11">11%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 text-right">{formatCurrency(calculatePpn())}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Label>PPh</Label>
            <div className="space-y-2">
              <Select value={selectedPph} onValueChange={(value: "pph22" | "pph23" | "custom") => setSelectedPph(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pph22">PPh 22 (1-2.5%)</SelectItem>
                  <SelectItem value="pph23">PPh 23 (2%)</SelectItem>
                  <SelectItem value="custom">Custom Tax</SelectItem>
                </SelectContent>
              </Select>
              {selectedPph === "custom" && (
                <div className="flex gap-2">
                  <Input type="text" value={customTaxRate} onChange={(e) => handleCustomTaxChange(e.target.value)} placeholder="0,00%" className="flex-1" />
                </div>
              )}
              <div className="text-right">{formatCurrency(calculatePph())}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="text-lg font-semibold">Grand Total</Label>
          <div className="text-xl font-bold">{formatCurrency(calculateGrandTotal())}</div>
        </div>
      </div>
    </div>
  );
}
