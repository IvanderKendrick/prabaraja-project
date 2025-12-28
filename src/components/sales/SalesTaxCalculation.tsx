import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

interface SalesTaxCalculationProps {
  subtotal: number;
  onTaxChange?: (taxData: { dpp: number; ppn: number; pph: number; grandTotal: number; ppn_percentage?: number | string; pph_type?: string; pph_percentage?: number | string }) => void;
  onTaxMethodChange?: (method: string) => void;
}

export function SalesTaxCalculation({ subtotal, onTaxChange, onTaxMethodChange }: SalesTaxCalculationProps) {
  const [isTaxAfter, setIsTaxAfter] = useState(false);
  const [selectedPph, setSelectedPph] = useState<"pph22" | "pph23" | "custom">("pph23");
  const [customTaxRate, setCustomTaxRate] = useState<string>("0");
  const [ppnRate, setPpnRate] = useState<"11" | "12">("11");

  const calculateDpp = () => {
    const rate = ppnRate === "11" ? 0.11 : 0.12;
    // Mirror purchases logic: when Before Tax and rate 12%, DPP = 11/12 * subtotal
    if (!isTaxAfter) {
      if (rate === 0.11) {
        return subtotal;
      } else {
        return (11 / 12) * subtotal;
      }
    } else {
      if (rate === 0.11) {
        return subtotal / 1.11;
      } else {
        return subtotal / 1.12;
      }
    }
  };

  const calculatePpn = () => {
    const rate = ppnRate === "11" ? 0.11 : 0.12;
    if (!isTaxAfter) {
      return calculateDpp() * rate;
    } else {
      if (rate === 0.11) {
        return (calculateDpp() * 11) / 100;
      } else {
        return (calculateDpp() * 12) / 100;
      }
    }
  };

  const calculatePph = () => {
    const dpp = calculateDpp();
    const subtotalWithCosts = subtotal; // sales uses subtotal as base (no extra costs in this component)
    if (selectedPph === "pph23") {
      if (!isTaxAfter) {
        return Math.round(((subtotalWithCosts + calculatePpn()) / 1.11) * 0.0265);
      } else {
        return Math.round(((subtotalWithCosts + calculatePpn()) / 1.011) * 0.0265);
      }
    } else if (selectedPph === "pph22") {
      if (dpp <= 500000000) return dpp * 0.01;
      if (dpp <= 10000000000) return dpp * 0.015;
      return dpp * 0.025;
    }
    const rate = parseFloat(customTaxRate.replace(",", ".")) / 100;
    return dpp * rate;
  };

  const calculateGrandTotal = () => {
    const ppn = calculatePpn();
    const pph = calculatePph();
    if (isTaxAfter) {
      return calculateDpp() + ppn - pph;
    }
    return subtotal + ppn - pph;
  };

  const handleCustomTaxChange = (value: string) => {
    if (/^[0-9,.]*$/.test(value)) {
      setCustomTaxRate(value);
    }
  };

  // Call onTaxChange whenever calculations change — emit rounded values
  React.useEffect(() => {
    const dppRaw = calculateDpp();
    const ppnRaw = calculatePpn();
    const pphRaw = calculatePph();

    const dppRounded = Math.round(dppRaw);
    const ppnRounded = Math.round(ppnRaw);
    const pphRounded = Math.round(pphRaw);

    const grandTotalRounded = isTaxAfter ? dppRounded + ppnRounded - pphRounded : subtotal + ppnRounded - pphRounded;

    // Determine percentages/types to emit
    const ppnPercentage = ppnRate === "11" ? 11 : 12;

    let pphPercentage: number | string = 0;
    if (selectedPph === "pph23") {
      // use 2% for PPh23 per requirement
      pphPercentage = 2;
    } else if (selectedPph === "pph22") {
      // determine percentage based on DPP tiers used in calculatePph
      if (dppRaw <= 500000000) pphPercentage = 1;
      else if (dppRaw <= 10000000000) pphPercentage = 1.5;
      else pphPercentage = 2.5;
    } else {
      // custom
      const parsed = parseFloat(customTaxRate.replace(",", "."));
      pphPercentage = isNaN(parsed) ? 0 : parsed;
    }

    if (onTaxChange) {
      onTaxChange({
        dpp: dppRounded,
        ppn: ppnRounded,
        pph: pphRounded,
        grandTotal: grandTotalRounded,
        ppn_percentage: ppnPercentage,
        pph_type: selectedPph,
        pph_percentage: pphPercentage,
      });
    }
    if (typeof onTaxMethodChange === "function") {
      onTaxMethodChange(isTaxAfter ? "After Calculate" : "Before Calculate");
    }
  }, [subtotal, isTaxAfter, selectedPph, customTaxRate, ppnRate, onTaxChange, onTaxMethodChange]);

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
        <div className="text-right">{formatCurrency(Math.round(calculateDpp()))}</div>
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
          <div className="flex-1 text-right">{formatCurrency(Math.round(calculatePpn()))}</div>
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
          <div className="text-right">{formatCurrency(Math.round(calculatePph()))}</div>
        </div>
      </div>

      {/* Grand Total rendering moved to parent form to avoid duplication */}
    </div>
  );
}
