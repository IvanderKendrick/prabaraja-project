import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PurchaseItem, PurchaseType } from "@/types/purchase";
import {
  formatInputCurrency,
  parseInputCurrency,
  formatCurrency,
} from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface PurchaseItemsFormProps {
  items: PurchaseItem[];
  setItems: (items: PurchaseItem[]) => void;
  onTotalChange?: (total: number) => void;
  onNetTotalChange?: (total: number) => void;
  purchaseType: PurchaseType; // Add purchaseType prop
  title?: string;
  // showCosts?: boolean;
  showTax?: boolean; // override; if undefined, follows invoice logic
  showGrandTotal?: boolean;
}

export function PurchaseItemsForm({
  items,
  setItems,
  onTotalChange,
  onNetTotalChange,
  purchaseType, // Receive purchaseType prop
  title = "Items",
  // showCosts = true,
  showTax,
  showGrandTotal = true,
}: PurchaseItemsFormProps) {
  const [isTaxAfter, setIsTaxAfter] = useState(false);
  const [selectedPph, setSelectedPph] = useState<"pph22" | "pph23" | "custom">(
    "custom"
  );
  const [customTaxRate, setCustomTaxRate] = useState<string>("0");
  const [ppnRate, setPpnRate] = useState<"11" | "12">("11");
  const [discountModeByItem, setDiscountModeByItem] = useState<
    Record<string, "percent" | "nominal">
  >({});

  // ✅ Sinkronisasi mode diskon awal berdasarkan props.items
  useEffect(() => {
    const newModes: Record<string, "percent" | "nominal"> = {};
    items.forEach((item) => {
      if (item.discountType === "rupiah") {
        newModes[item.id] = "nominal";
      } else {
        newModes[item.id] = "percent";
      }
    });
    setDiscountModeByItem(newModes);
  }, [items]);

  const [freightIn, setFreightIn] = useState<number>(0);
  const [insuranceCost, setInsuranceCost] = useState<number>(0);
  const [paymentDiscount, setPaymentDiscount] = useState<string>(""); // display only

  const [openCoaForItemId, setOpenCoaForItemId] = useState<string | null>(null);
  const [coaSearch, setCoaSearch] = useState<string>("");
  const [coaOptions, setCoaOptions] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [isLoadingCoa, setIsLoadingCoa] = useState<boolean>(false);

  const isInvoice = purchaseType === "invoice"; // Helper variable
  const shouldShowTax = showTax === undefined ? isInvoice : showTax;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: "",
        quantity: 1,
        unit: "pcs",
        price: 0,
        discountPercent: 0,
        discountPrice: 0,
        stock: false,
        return: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleItemChange = (
    id: string,
    field: keyof PurchaseItem,
    value: any
  ) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handlePriceChange = (id: string, value: string) => {
    const formattedValue = formatInputCurrency(value);
    const numericValue = parseInputCurrency(value);
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, price: numericValue } : item
      )
    );
  };

  const calculateTotal = () => {
    return items.reduce(
      (total, item) =>
        total + item.quantity * item.price - item.return * item.price,
      0
    );
  };

  const calculateItemDiscount = (item: PurchaseItem) => {
    const lineTotal = item.quantity * item.price;
    const mode = discountModeByItem[item.id] ?? "percent";
    if (mode === "percent") {
      const percent = (item.discountPercent ?? 0) / 100;
      const percentDiscount = lineTotal * percent;
      return Math.min(percentDiscount, lineTotal);
    }
    const priceDiscount = item.discountPrice ?? 0;
    return Math.min(priceDiscount, lineTotal);
  };

  const calculateTotalDiscount = () => {
    return items.reduce((sum, item) => sum + calculateItemDiscount(item), 0);
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
    const totalDiscount = calculateTotalDiscount();
    const discountedTotal = Math.max(total - totalDiscount, 0);
    return (11 / 12) * discountedTotal;
  };

  const calculatePpn = () => {
    const rate = ppnRate === "11" ? 0.11 : 0.12;
    if (!isTaxAfter) {
      return calculateDpp() * rate;
    } else {
      return calculateDpp() * rate * 0.1;
    }
  };

  const calculatePph = (totalBeforeTax) => {
    const dpp = calculateDpp();
    if (selectedPph === "pph23") {
      if (!isTaxAfter) {
        return Math.round(((totalBeforeTax + calculatePpn()) / 1.11) * 0.0265);
      } else {
        return Math.round(((totalBeforeTax + calculatePpn()) / 1.011) * 0.0265);
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
    const totalBeforeTax = calculateTotal();
    const totalDiscount = calculateTotalDiscount();
    // const discountedTotal = Math.max(totalBeforeTax - totalDiscount, 0);
    const discountedTotal =
      Math.max(totalBeforeTax - totalDiscount, 0) + freightIn + insuranceCost;
    if (shouldShowTax) {
      // return (
      //   discountedTotal +
      //   calculatePpn() -
      //   calculatePph(discountedTotal) +
      //   freightIn +
      //   insuranceCost
      // );
      return discountedTotal + calculatePpn() - calculatePph(discountedTotal);
    }
    return discountedTotal + freightIn + insuranceCost;
  };

  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(calculateTotal());
    }
    if (onNetTotalChange) {
      onNetTotalChange(calculateGrandTotal());
    }
  }, [
    items,
    freightIn,
    insuranceCost,
    isTaxAfter,
    selectedPph,
    customTaxRate,
    ppnRate,
    onTotalChange,
    onNetTotalChange,
  ]);

  const handleCustomTaxChange = (value: string) => {
    if (/^[0-9,.]*$/.test(value)) {
      setCustomTaxRate(value);
    }
  };

  // Helper function to get auth token
  const getAuthToken = () => {
    const authDataRaw = localStorage.getItem(
      "sb-xwfkrjtqcqmmpclioakd-auth-token"
    );
    if (!authDataRaw) {
      throw new Error("No access token found in localStorage");
    }
    const authData = JSON.parse(authDataRaw);
    const token = authData.access_token;
    if (!token) {
      throw new Error("Access token missing in parsed auth data");
    }
    return token;
  };

  // Fetch COA options when searching and popover is open
  useEffect(() => {
    let abort = false;
    const doFetch = async () => {
      if (!openCoaForItemId) return;
      setIsLoadingCoa(true);
      try {
        const token = getAuthToken();
        const q = encodeURIComponent(coaSearch || "");
        const resp = await fetch(
          `https://pbw-backend-api.vercel.app/api/dashboard?action=getAccountCOA&search=${q}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (abort) return;
        const json = await resp.json();
        const list = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];
        const mapped = list.map((x: any, idx: number) => {
          const id = String(x.id || x.code || x.account_code || idx);
          const name =
            x.name || x.account_name || x.label || x.title || "Account";
          const code = x.code || x.account_code || "";
          const label = code ? `${code} - ${name}` : name;
          return { id, label };
        });
        setCoaOptions(mapped);
      } catch (e) {
        if (!abort) setCoaOptions([]);
      } finally {
        if (!abort) setIsLoadingCoa(false);
      }
    };
    doFetch();
    return () => {
      abort = true;
    };
  }, [coaSearch, openCoaForItemId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{title}</h2>
        <Button type="button" variant="outline" onClick={handleAddItem}>
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border-b pb-4">
            {/* Baris 1: Item Name dan COA */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6">
                <Label htmlFor={`item-name-${item.id}`}>Item Name</Label>
                <Input
                  id={`item-name-${item.id}`}
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(item.id, "name", e.target.value)
                  }
                />
              </div>

              {purchaseType === "invoice" && (
                <div className="col-span-6">
                  <Label>Item COA</Label>
                  <Popover
                    open={openCoaForItemId === item.id}
                    onOpenChange={(o) =>
                      setOpenCoaForItemId(o ? item.id : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                      >
                        {item.coaLabel || item.coa || "Select account"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[320px]">
                      <Command>
                        <CommandInput
                          placeholder="Search account..."
                          value={coaSearch}
                          onValueChange={(v) => setCoaSearch(v)}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {isLoadingCoa ? "Loading..." : "No results found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {coaOptions.map((opt) => (
                              <CommandItem
                                key={opt.id}
                                value={opt.label}
                                onSelect={() => {
                                  handleItemChange(item.id, "coa", opt.id);
                                  handleItemChange(
                                    item.id,
                                    "coaLabel",
                                    opt.label
                                  );
                                  setOpenCoaForItemId(null);
                                  setCoaSearch("");
                                }}
                              >
                                {opt.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            {/* Baris 2: SKU, Memo, Qty, Unit, Price */}
            <div className="grid grid-cols-12 gap-4 mt-3">
              {(purchaseType === "invoice" ||
                purchaseType === "shipment" ||
                purchaseType === "request") && (
                <div
                  className={
                    purchaseType === "invoice" || purchaseType === "shipment"
                      ? "col-span-2"
                      : "col-span-3"
                  }
                >
                  <Label htmlFor={`item-sku-${item.id}`}>SKU</Label>
                  <Input
                    id={`item-sku-${item.id}`}
                    value={item.sku || ""}
                    onChange={(e) =>
                      handleItemChange(item.id, "sku", e.target.value)
                    }
                    placeholder="SKU"
                  />
                </div>
              )}

              <div className="col-span-3">
                <Label htmlFor={`item-memo-${item.id}`}>Memo</Label>
                <Input
                  id={`item-memo-${item.id}`}
                  value={item.memo || ""}
                  onChange={(e) =>
                    handleItemChange(item.id, "memo", e.target.value)
                  }
                  placeholder="Notes"
                />
              </div>

              <div className="col-span-1">
                <Label htmlFor={`item-quantity-${item.id}`}>Qty</Label>
                <Input
                  id={`item-quantity-${item.id}`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(
                      item.id,
                      "quantity",
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor={`item-unit-${item.id}`}>Unit</Label>
                <Select
                  value={item.unit}
                  onValueChange={(value: string) =>
                    handleItemChange(item.id, "unit", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ms">ms</SelectItem>
                    <SelectItem value="pcs">pcs</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="pax">pax</SelectItem>
                    <SelectItem value="__custom__">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(purchaseType === "invoice" || purchaseType === "shipment") && (
                <div className="col-span-1">
                  <Label htmlFor={`item-return-${item.id}`}>Return</Label>
                  <Input
                    id={`item-return-${item.id}`}
                    type="number"
                    min="0"
                    value={item.return}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "return",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
              )}

              <div className="col-span-3">
                <Label htmlFor={`item-price-${item.id}`}>Price</Label>
                <Input
                  id={`item-price-${item.id}`}
                  type="text"
                  inputMode="numeric"
                  value={formatPriceDisplay(item.price)}
                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Baris 4: Discount tetap sama */}
            <div className="grid grid-cols-12 gap-4 mt-3">
              <div className="col-span-6">
                <div className="flex items-center gap-2 mb-2">
                  <Switch
                    id={`discount-mode-${item.id}`}
                    checked={
                      (discountModeByItem[item.id] ?? "percent") === "percent"
                    }
                    onCheckedChange={(checked) =>
                      setDiscountModeByItem((prev) => ({
                        ...prev,
                        [item.id]: checked ? "percent" : "nominal",
                      }))
                    }
                  />
                  <Label htmlFor={`discount-mode-${item.id}`}>
                    {(discountModeByItem[item.id] ?? "percent") === "percent"
                      ? "Discount (%)"
                      : "Discount (Rp)"}
                  </Label>
                </div>
                {(discountModeByItem[item.id] ?? "percent") === "percent" ? (
                  <Input
                    id={`item-discount-percent-${item.id}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.discountPercent ?? 0}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "discountPercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                  />
                ) : (
                  <Input
                    id={`item-discount-price-${item.id}`}
                    type="text"
                    inputMode="numeric"
                    value={formatPriceDisplay(item.discountPrice ?? 0)}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "discountPrice",
                        parseInputCurrency(e.target.value)
                      )
                    }
                    placeholder="0"
                  />
                )}
              </div>

              <div className="col-span-6 flex items-end justify-end text-sm text-muted-foreground">
                <span>
                  Line discount: {formatCurrency(calculateItemDiscount(item))}
                </span>
              </div>

              {/* Baris Stock + Remove */}
              <div className="flex items-center justify-between mt-3 gap-3">
                {purchaseType === "invoice" && (
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      id={`stock-${item.id}`}
                      checked={item.stock || false}
                      onChange={(e) =>
                        handleItemChange(item.id, "stock", e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`stock-${item.id}`} className="text-sm">
                      Add to Stock
                    </Label>
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-500 h-8"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={items.length === 1}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional costs before tax calculation (do not affect tax base) */}
      {/* {purchaseType === "invoice" && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-medium">Additional Costs</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="freight-in">Freight In (Shipping)</Label>
              <Input
                id="freight-in"
                type="text"
                inputMode="numeric"
                value={formatPriceDisplay(freightIn)}
                onChange={(e) => setFreightIn(parseInputCurrency(e.target.value))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="insurance">Insurance</Label>
              <Input
                id="insurance"
                type="text"
                inputMode="numeric"
                value={formatPriceDisplay(insuranceCost)}
                onChange={(e) =>
                  setInsuranceCost(parseInputCurrency(e.target.value))
                }
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="text-right text-sm text-muted-foreground">
              <span>Total Additional Cost: </span>
              <span className="font-medium">
                {formatCurrency(freightIn + insuranceCost)}
              </span>
            </div>
          </div>
        </div>
      )} */}

      {/* Conditionally render tax section only for invoices */}
      {shouldShowTax && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-medium">Tax Calculation</h2>

          <div className="grid grid-cols-2 gap-4 items-center">
            <Label>Tax Calculation Method</Label>
            <div className="flex items-center gap-2">
              <Switch
                id="tax-method"
                checked={isTaxAfter}
                onCheckedChange={setIsTaxAfter}
              />
              <Label htmlFor="tax-method">
                {isTaxAfter ? "After Tax" : "Before Tax"}
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Label>DPP/VOT</Label>
            <div className="text-right">{formatCurrency(calculateDpp())}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Label>PPN (VAT)</Label>
            <div className="flex gap-2">
              <Select
                value={ppnRate}
                onValueChange={(value: "11" | "12") => setPpnRate(value)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11">11%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 text-right">
                {formatCurrency(calculatePpn())}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Label>PPh</Label>
            <div className="space-y-2">
              <Select
                value={selectedPph}
                onValueChange={(value: "pph22" | "pph23" | "custom") =>
                  setSelectedPph(value)
                }
              >
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
                  <Input
                    type="text"
                    value={customTaxRate}
                    onChange={(e) => handleCustomTaxChange(e.target.value)}
                    placeholder="0,00%"
                    className="flex-1"
                  />
                </div>
              )}
              <div className="text-right">
                {(() => {
                  const total = calculateTotal();
                  const totalDiscount = calculateTotalDiscount();
                  const discountedTotal = Math.max(total - totalDiscount, 0);
                  return formatCurrency(calculatePph(discountedTotal));
                })()}
              </div>
            </div>
          </div>

          {/* Purchase Payment Discount - does not affect calculations */}
          <div className="grid grid-cols-2 gap-4">
            <Label>Purchase Payment Discount</Label>
            <div>
              <Input
                type="text"
                value={paymentDiscount}
                onChange={(e) => setPaymentDiscount(e.target.value)}
                placeholder="Optional notes or value"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Label>Total Discount</Label>
            <div className="text-right">
              {formatCurrency(calculateTotalDiscount())}
            </div>
          </div>
        </div>
      )}

      {showGrandTotal && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-semibold">Grand Total</Label>
            <div className="text-xl font-bold">
              {formatCurrency(calculateGrandTotal())}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
