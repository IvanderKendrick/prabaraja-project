import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

interface SalesTaxCalculationProps {
  subtotal: number;
  onTaxChange?: (taxData: { dpp: number; ppn: number; pph: number; grandTotal: number }) => void;
}

export function SalesTaxCalculation({ subtotal, onTaxChange }: SalesTaxCalculationProps) {
  const [isTaxAfter, setIsTaxAfter] = useState(false);
  const [selectedPph, setSelectedPph] = useState<"pph22" | "pph23" | "custom">("pph23");
  const [customTaxRate, setCustomTaxRate] = useState<string>("0");
  const [ppnRate, setPpnRate] = useState<"11" | "12">("11");

  const calculateDpp = () => {
    return isTaxAfter ? subtotal / 1.11 : (11 / 12) * subtotal;
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
    return subtotal + calculatePpn() - calculatePph();
  };

  const handleCustomTaxChange = (value: string) => {
    if (/^[0-9,.]*$/.test(value)) {
      setCustomTaxRate(value);
    }
  };

  // Call onTaxChange whenever calculations change
  React.useEffect(() => {
    if (onTaxChange) {
      onTaxChange({
        dpp: calculateDpp(),
        ppn: calculatePpn(),
        pph: calculatePph(),
        grandTotal: calculateGrandTotal(),
      });
    }
  }, [subtotal, isTaxAfter, selectedPph, customTaxRate, ppnRate, onTaxChange]);

  return (
    <div className="mt-8 space-y-4 bg-white p-6 rounded-lg border">
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

      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="text-lg font-semibold">Grand Total</Label>
          <div className="text-xl font-bold">{formatCurrency(calculateGrandTotal())}</div>
        </div>
      </div>
    </div>
  );
}
