import { useEffect, useState } from "react";
import { PurchaseType, PurchaseItem } from "@/types/purchase";
import { PurchaseInformationForm } from "@/components/purchases/PurchaseInformationForm";
import { PurchaseItemsForm } from "@/components/purchases/PurchaseItemsForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { sub } from "date-fns";
import { after } from "node:test";

interface CreatePurchaseFormProps {
  purchaseType: PurchaseType;
  setPurchaseType: (type: PurchaseType) => void;
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
  isReadOnlyTypeAndNumber?: boolean;
  initialData?: any;
  submitLabel?: string;
}

export function CreatePurchaseForm({
  purchaseType,
  setPurchaseType,
  onSubmit,
  isLoading = false,
  isReadOnlyTypeAndNumber = false,
  initialData,
  submitLabel,
}: CreatePurchaseFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [number, setNumber] = useState(
    purchaseType === "quotation" ? `QUO-` : `INV-`
  );
  const [approver, setApprover] = useState("");
  const [status, setStatus] = useState<
    "pending" | "completed" | "cancelled" | "Half-paid"
  >("pending");
  const [tags, setTags] = useState("");
  const [discountModeByItem, setDiscountModeByItem] = useState<
    Record<string, "percent" | "nominal">
  >({});
  const [items, setItems] = useState<PurchaseItem[]>([
    {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      quantity: 1,
      unit: "pcs",
      price: 0,
      stock: false,
      return: 0,
    },
  ]);

  const [vendorCoaAccountId, setVendorCoaAccountId] = useState<string>("");
  const [vendorCoaLabel, setVendorCoaLabel] = useState<string>("");

  const [openVendorCoa, setOpenVendorCoa] = useState(false);
  const [vendorCoaOptions, setVendorCoaOptions] = useState<any[]>([]);
  const [isLoadingVendorCoa, setIsLoadingVendorCoa] = useState(false);

  const [openCoaForItemId, setOpenCoaForItemId] = useState<string | null>(null);
  const [coaSearch, setCoaSearch] = useState<string>("");
  const [coaOptions, setCoaOptions] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [isLoadingCoa, setIsLoadingCoa] = useState<boolean>(false);

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

  // Fetch COA options khusus vendor
  useEffect(() => {
    let abort = false;
    const doFetch = async () => {
      if (!openVendorCoa) return;
      setIsLoadingVendorCoa(true);
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
        setVendorCoaOptions(mapped);
      } catch (e) {
        if (!abort) setVendorCoaOptions([]);
      } finally {
        if (!abort) setIsLoadingVendorCoa(false);
      }
    };
    doFetch();
    return () => {
      abort = true;
    };
  }, [coaSearch, openVendorCoa]);

  // Retur items section
  const [returItems, setReturItems] = useState<PurchaseItem[]>([
    {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      quantity: 1,
      unit: "kg",
      price: 0,
      stock: false,
      return: 0,
    },
  ]);

  const [itemsNetTotal, setItemsNetTotal] = useState(0);
  const [returNetTotal, setReturNetTotal] = useState(0);
  const [freightIn, setFreightIn] = useState(0);
  const [insuranceCost, setInsuranceCost] = useState(0);

  // Tax calculation states
  const [isTaxAfter, setIsTaxAfter] = useState(false);
  const [selectedPph, setSelectedPph] = useState<"pph22" | "pph23" | "custom">(
    "custom"
  );
  const [customTaxRate, setCustomTaxRate] = useState<string>("0");
  const [ppnRate, setPpnRate] = useState<"11" | "12">("11");

  // Request-specific fields
  const [requestedBy, setRequestedBy] = useState("");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [urgency, setUrgency] = useState<"High" | "Medium" | "Low">("Medium");

  // // Offer-specific fields
  // const [expiryDate, setExpiryDate] = useState(
  //   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  // );
  // const [discountTerms, setDiscountTerms] = useState("");

  // // Order-specific fields
  // const [orderDate, setOrderDate] = useState(
  //   new Date().toISOString().split("T")[0]
  // );

  // Shipment-specific fields
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [shippingDate, setShippingDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Quotation-specific fields
  const [vendorName, setVendorName] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");

  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [terms, setTerms] = useState("");

  const [memo, setMemo] = useState("");

  // File upload for invoice, shipment, order, offer, request (multiple)
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

  // Calculate subtotal (Items - Retur)
  const calculateSubtotal = () => {
    return Math.max(itemsNetTotal - returNetTotal, 0);
  };

  // Calculate total additional costs
  const calculateAdditionalCosts = () => {
    const freight = Number(freightIn) || 0;
    const insurance = Number(insuranceCost) || 0;
    return freight + insurance;
  };

  // Calculate subtotal with additional costs
  const calculateSubtotalWithCosts = () => {
    return calculateSubtotal() + calculateAdditionalCosts();
  };

  // Calculate DPP (Dasar Pengenaan Pajak) - based on subtotal + additional costs
  const calculateDpp = () => {
    const subtotalWithCosts = calculateSubtotalWithCosts();
    const rate = ppnRate === "11" ? 0.11 : 0.12;

    if (!isTaxAfter) {
      if (rate == 0.11) {
        return subtotalWithCosts;
      } else {
        return (11 / 12) * subtotalWithCosts;
      }
    } else {
      if (rate == 0.11) {
        return subtotalWithCosts / 1.11;
      } else {
        return subtotalWithCosts / 1.12;
      }
    }
  };

  // Calculate PPN (VAT)
  const calculatePpn = () => {
    const rate = ppnRate === "11" ? 0.11 : 0.12;
    if (!isTaxAfter) {
      return calculateDpp() * rate;
    } else {
      if (rate == 0.11) {
        return (calculateDpp() * 11) / 100;
      } else {
        return (calculateDpp() * 12) / 100;
      }
    }
  };

  // Calculate PPh
  const calculatePph = () => {
    const subtotalWithCosts = calculateSubtotalWithCosts();
    const dpp = calculateDpp();
    if (selectedPph === "pph23") {
      if (!isTaxAfter) {
        return Math.round(
          ((subtotalWithCosts + calculatePpn()) / 1.11) * 0.0265
        );
      } else {
        return Math.round(
          ((subtotalWithCosts + calculatePpn()) / 1.011) * 0.0265
        );
      }
    } else if (selectedPph === "pph22") {
      if (dpp <= 500000000) return dpp * 0.01;
      if (dpp <= 10000000000) return dpp * 0.015;
      return dpp * 0.025;
    }
    const rate = parseFloat(customTaxRate.replace(",", ".")) / 100;
    return dpp * rate;
  };

  // Calculate final grand total
  const calculateGrandTotal = () => {
    const subtotalWithCosts = calculateSubtotalWithCosts();
    const ppn = calculatePpn();
    const pph = calculatePph();
    // console.log("Grand Total Calc:", { subtotalWithCosts, ppn, pph });

    if (isTaxAfter) {
      return calculateDpp() + ppn - pph;
    }

    return subtotalWithCosts + ppn - pph;
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // helper id unik
  const uid = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  // normalisasi array items dari backend ke shape form + id unik
  const normalizeItemsFromApi = (raw: any[] = []) => {
    return raw.map((it) => {
      const isPercent = it.disc_item_type === "percentage";
      const isRupiah = it.disc_item_type === "rupiah";

      return {
        id:
          it.id ??
          (typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2)),

        name: it.item_name ?? it.name ?? "",
        quantity: it.qty ?? it.quantity ?? 1,
        unit: it.unit ?? "pcs",
        price: it.price ?? 0,
        stock: it.stock ?? false,
        return: it.return_unit ?? it.return ?? 0,

        coa: it.coa ?? "",
        coaLabel: it.coa ?? "",

        // ✅ tambahkan ketiganya agar toggle tahu state aktif
        discountType: isRupiah ? "rupiah" : "percentage", // <---- ini kuncinya
        discountPercent: isPercent ? it.disc_item ?? 0 : 0,
        discountPrice: isRupiah ? it.disc_item ?? 0 : 0,
      };
    });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a flexible form data object that can accept any properties
    const formData: Record<string, any> = {
      type: purchaseType,
      date,
      dueDate,
      status,
      vendorCoaAccountId,
      approver,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      items,
      returItems,
      number,
      taxCalculationMethod: isTaxAfter,
      ppnPercentage: ppnRate === "11" ? 11 : 12,
      pphPercentage:
        selectedPph === "custom"
          ? parseFloat(customTaxRate.replace(",", "."))
          : selectedPph === "pph22"
          ? 1
          : 2,
      pphType: selectedPph,
      grandTotal: calculateGrandTotal(),
      subtotal: calculateSubtotal(),
      subtotalWithCosts: calculateSubtotalWithCosts(),
      additionalCosts: calculateAdditionalCosts(),
      freightIn: freightIn,
      insuranceCost: insuranceCost,
      memo,
      dpp: calculateDpp(),
      ppn: calculatePpn(),
      pph: calculatePph(),
      attachmentFiles: attachmentFiles,
    };

    // Add type-specific fields based on purchaseType
    switch (purchaseType) {
      case "request":
        formData.requestedBy = requestedBy || "";
        formData.urgency = urgency;
        formData.installmentAmount = installmentAmount;
        formData.vendorName = vendorName;
        formData.vendorAddress = vendorAddress;
        formData.vendorPhone = vendorPhone;
        break;
      // case "offer":
      //   formData.expiryDate = expiryDate;
      //   formData.discountTerms = discountTerms;
      //   break;
      // case "order":
      //   formData.orderDate = orderDate;
      //   break;
      case "shipment":
        formData.trackingNumber = trackingNumber;
        formData.carrier = carrier;
        formData.shippingDate = shippingDate;
        formData.vendorName = vendorName;
        formData.vendorAddress = vendorAddress;
        formData.vendorPhone = vendorPhone;
        break;
      case "invoice":
        formData.vendorName = vendorName;
        formData.vendorAddress = vendorAddress;
        formData.vendorPhone = vendorPhone;
        formData.terms = terms;
        formData.vendorCoaAccountId = vendorCoaAccountId;
        formData.vendorCoaLabel = vendorCoaLabel;
        break;
      case "quotation":
        formData.vendorName = vendorName;
        formData.vendorAddress = vendorAddress;
        formData.vendorPhone = vendorPhone;
        formData.startDate = startDate;
        formData.validUntil = validUntil;
        formData.terms = terms;
        formData.quotationDate = date;
        formData.grandTotal = calculateSubtotalWithCosts();
        formData.dpp = 0;
        formData.ppn = 0;
        formData.pph = 0;

        // NOTED!
        formData.ppnPercentage = 0;
        formData.pphPercentage = 0;
        console.log("Kirim ke API:", {
          ppnPercentage: formData.ppnPercentage,
          pphPercentage: formData.pphPercentage,
        });
        break;
    }

    onSubmit?.(formData);
  };

  useEffect(() => {
    if (initialData) {
      setNumber(initialData.number || "");
      setDate(initialData.quotation_date || initialData.date || "");
      setDueDate(initialData.due_date || "");
      setStatus(initialData.status || "");

      setVendorName(initialData.vendor_name || "");
      setVendorAddress(initialData.vendor_address || "");
      setVendorPhone(initialData.vendor_phone || "");

      // ⚠️ khusus REQUEST – ini yang sebelumnya tidak di-set
      setRequestedBy(initialData.requested_by || initialData.requestedBy || "");
      setUrgency(initialData.urgency || "Medium");
      setInstallmentAmount(
        (
          initialData.installment_amount ??
          initialData.installmentAmount ??
          0
        ).toString()
      );

      setTerms(initialData.terms || "");
      setMemo(initialData.memo || "");

      // ✅ Bedakan logika berdasarkan purchaseType
      if (purchaseType === "quotation") {
        // Data quotation biasanya sudah dalam format items siap render
        setItems(normalizeItemsFromApi(initialData.items || []));
      } else if (purchaseType === "request") {
        setItems(initialData.items || []);
        // Data request masih format API mentah → butuh normalize
      } else {
        // fallback aman
        setItems(initialData.items || []);
      }

      // biaya tambahan (kalau ada di response-mu)
      setFreightIn(initialData.freight_in || 0);
      setInsuranceCost(initialData.insurance_cost || 0);

      // pajak
      setIsTaxAfter(initialData.tax_method === "After Calculate");
      setPpnRate(
        String(initialData.ppn_percentage ?? 11) === "12" ? "12" : "11"
      );

      if (initialData.pph_type === "22") setSelectedPph("pph22");
      else if (initialData.pph_type === "23") setSelectedPph("pph23");
      else setSelectedPph("custom");

      setCustomTaxRate(String(initialData.pph_percentage ?? 0));

      // tags bisa array/string
      setTags(
        Array.isArray(initialData.tags)
          ? initialData.tags.join(",")
          : initialData.tags || ""
      );

      // tanggal khusus quotation (kalau ada)
      if (initialData.start_date) setStartDate(initialData.start_date);
      if (initialData.valid_until) setValidUntil(initialData.valid_until);

      // 🧭 Tambahan khusus untuk Shipment
      if (purchaseType === "shipment") {
        setTrackingNumber(
          initialData.tracking_number || initialData.trackingNumber || ""
        );
        setCarrier(initialData.carrier || initialData.carrierName || "");
        setShippingDate(
          initialData.shipping_date || initialData.shippingDate || ""
        );
      }

      if (purchaseType === "invoice") {
        setApprover(initialData.approver || "");
        setVendorCoaAccountId(
          initialData.vendor_COA || initialData.vendor_coa || ""
        );
        setVendorCoaLabel(
          initialData.vendor_COA || initialData.vendor_coa || ""
        );
        setFreightIn(initialData.freight_in || 0);
        setInsuranceCost(initialData.insurance || 0);
        setTerms(initialData.terms || "");
      }

      // file baru akan diupload manual
      setAttachmentFiles([]);
    }
  }, [initialData]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 overflow-auto h-[80vh]">
      <PurchaseInformationForm
        purchaseType={purchaseType}
        setPurchaseType={setPurchaseType}
        date={date}
        setDate={setDate}
        number={number}
        setNumber={setNumber}
        isReadOnlyTypeAndNumber={isReadOnlyTypeAndNumber}
        approver={approver}
        setApprover={setApprover}
        dueDate={dueDate}
        setDueDate={setDueDate}
        status={status}
        setStatus={setStatus}
        tags={tags}
        setTags={setTags}
      />

      {/* Quotation-specific fields */}
      {(purchaseType === "quotation" ||
        purchaseType === "request" ||
        purchaseType === "shipment" ||
        purchaseType === "invoice") && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-900">
            Vendor & Quotation Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendorName">Vendor Name</Label>
              <Input
                id="vendorName"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Enter vendor name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendorAddress">Vendor Address</Label>
              <Input
                id="vendorAddress"
                value={vendorAddress}
                onChange={(e) => setVendorAddress(e.target.value)}
                placeholder="Enter vendor address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendorPhone">Vendor Phone</Label>
              <Input
                id="vendorPhone"
                value={vendorPhone}
                onChange={(e) => setVendorPhone(e.target.value)}
                placeholder="Enter vendor phone"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Start Date & Valid Until hanya untuk quotation */}
            {purchaseType === "quotation" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* Hanya tampil untuk invoice & quotation */}
            {(purchaseType === "invoice" || purchaseType === "quotation") && (
              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Input
                  id="terms"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Enter terms and conditions"
                  required
                />
              </div>
            )}

            {purchaseType === "invoice" && (
              <div className="space-y-2">
                <Label>Vendor COA</Label>
                {/* <Popover
                  open={openCoaForItemId === "vendor"}
                  onOpenChange={(o) => setOpenCoaForItemId(o ? "vendor" : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      {vendorCoaLabel || "Select vendor account"}
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
                                setVendorCoaAccountId(opt.id);
                                setVendorCoaLabel(opt.label);
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
                </Popover> */}

                <Popover open={openVendorCoa} onOpenChange={setOpenVendorCoa}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      {vendorCoaLabel || "Select vendor account"}
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
                          {isLoadingVendorCoa
                            ? "Loading..."
                            : "No results found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {vendorCoaOptions.map((opt) => (
                            <CommandItem
                              key={opt.id}
                              value={opt.label}
                              onSelect={() => {
                                setVendorCoaAccountId(opt.id);
                                setVendorCoaLabel(opt.label);
                                setOpenVendorCoa(false);
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
        </div>
      )}

      {/* Request-specific fields */}
      {purchaseType === "request" && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-900">Request Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestedBy">Requested By</Label>
              <Input
                id="requestedBy"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                placeholder="Enter requester name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select
                value={urgency}
                onValueChange={(value: "High" | "Medium" | "Low") =>
                  setUrgency(value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="installmentAmount">Installment Amount</Label>
              <Input
                id="installmentAmount"
                type="number"
                min="0"
                value={installmentAmount}
                onChange={(e) => setInstallmentAmount(e.target.value)}
                placeholder="Enter installment amount if needed "
              />
            </div>
          </div>
        </div>
      )}

      {/* Offer-specific fields */}
      {/* {purchaseType === "offer" && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-900">Offer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountTerms">Discount Terms</Label>
              <Input
                id="discountTerms"
                value={discountTerms}
                onChange={(e) => setDiscountTerms(e.target.value)}
                placeholder="Enter discount terms"
              />
            </div>
          </div>
        </div>
      )} */}

      {/* Order-specific fields */}
      {/* {purchaseType === "order" && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-900">Order Details</h3>
          <div className="space-y-2">
            <Label htmlFor="orderDate">Order Date</Label>
            <Input
              id="orderDate"
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
            />
          </div>
        </div>
      )} */}

      {/* Shipment-specific fields */}
      {purchaseType === "shipment" && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-900">Shipment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carrier">Carrier</Label>
              <Input
                id="carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="Enter carrier name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingDate">Shipping Date</Label>
              <Input
                id="shippingDate"
                type="date"
                value={shippingDate}
                onChange={(e) => setShippingDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Items Section */}
      <PurchaseItemsForm
        items={items}
        setItems={setItems}
        purchaseType={purchaseType}
        title="Items"
        onNetTotalChange={setItemsNetTotal}
        discountModeByItem={discountModeByItem}
        setDiscountModeByItem={setDiscountModeByItem}
        // showCosts={false}
        showTax={false}
        showGrandTotal={false}
      />

      {/* Retur Section
      <PurchaseItemsForm
        items={returItems}
        setItems={setReturItems}
        purchaseType={purchaseType}
        title="Retur"
        onNetTotalChange={setReturNetTotal}
        showCosts={false}
        showTax={false}
        showGrandTotal={false}
      /> */}

      {/* Additional Costs Section */}
      {purchaseType === "invoice" && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Additional Costs</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="freight-in">Freight In (Shipping)</Label>
              <Input
                id="freight-in"
                type="text"
                inputMode="numeric"
                value={new Intl.NumberFormat("id-ID", {
                  style: "decimal",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(freightIn)}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, "");
                  setFreightIn(parseInt(value) || 0);
                }}
                placeholder="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="insurance">Insurance</Label>
              <Input
                id="insurance"
                type="text"
                inputMode="numeric"
                value={new Intl.NumberFormat("id-ID", {
                  style: "decimal",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(insuranceCost)}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, "");
                  setInsuranceCost(parseInt(value) || 0);
                }}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <div className="text-right text-sm text-muted-foreground">
              <span>Total Additional Cost: </span>
              <span className="font-medium">
                {formatCurrency(calculateAdditionalCosts())}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Subtotal with Additional Costs Display */}
      {(purchaseType === "invoice" || purchaseType === "shipment") && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            {(purchaseType === "invoice" || purchaseType === "shipment") && (
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">
                  Subtotal (Items - Retur)
                </Label>
                <div className="text-lg font-bold">
                  {formatCurrency(calculateSubtotal())}
                </div>
              </div>
            )}

            {purchaseType === "invoice" && (
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">
                  Subtotal + Additional Costs
                </Label>
                <div className="text-xl font-bold">
                  {formatCurrency(calculateSubtotalWithCosts())}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tax Calculation Section */}
      {(purchaseType === "invoice" ||
        purchaseType === "shipment" ||
        purchaseType === "request") && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Tax Calculation</h2>

          <div className="grid grid-cols-2 gap-4 items-center mb-4">
            <Label>Tax Calculation Method</Label>
            <div className="flex items-center gap-2">
              {/* <input
                type="checkbox"
                id="tax-method"
                checked={isTaxAfter}
                onChange={(e) => setIsTaxAfter(e.target.checked)}
                className="rounded border-gray-300"
              /> */}
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

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Label>DPP/VOT</Label>
            <div className="text-right">{formatCurrency(calculateDpp())}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
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

          <div className="grid grid-cols-2 gap-4 mb-4">
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
                    onChange={(e) => {
                      if (/^[0-9,.]*$/.test(e.target.value)) {
                        setCustomTaxRate(e.target.value);
                      }
                    }}
                    placeholder="0,00%"
                    className="flex-1"
                  />
                </div>
              )}
              <div className="text-right">{formatCurrency(calculatePph())}</div>
            </div>
          </div>
        </div>
      )}

      {/* File upload for invoice, shipment, order, offer, request, quotation */}
      {(purchaseType === "invoice" ||
        purchaseType === "shipment" ||
        purchaseType === "order" ||
        purchaseType === "offer" ||
        purchaseType === "request" ||
        purchaseType === "quotation") && (
        <div className="bg-white p-4 rounded-lg space-y-4">
          {/* Memo Input */}
          <div className="space-y-2">
            <Label htmlFor="memo">Memo</Label>
            <Textarea
              id="memo"
              placeholder="Enter memo here..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <h3 className="font-medium text-gray-900">Attachment</h3>
          <div className="space-y-2">
            <Label
              htmlFor="attachment"
              className="text-sm font-medium text-gray-700"
            >
              Upload File (Optional)
            </Label>
            <Input
              id="attachment"
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const maxBytes = 10 * 1024 * 1024; // 10MB per file
                const valid = files.filter((f) => f.size <= maxBytes);
                setAttachmentFiles(valid);
              }}
              className="mt-1"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {attachmentFiles.length > 0 && (
              <div className="text-sm text-gray-600 mt-1 space-y-1">
                {attachmentFiles.map((f, idx) => (
                  <p key={idx}>Selected: {f.name}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Final Grand Total Display */}
      <div className="pt-6 border-t">
        <div className="flex justify-between items-center">
          <Label className="text-lg font-semibold">Grand Total</Label>
          <div className="text-xl font-bold">
            {purchaseType === "quotation" ? (
              <div className="text-xl font-bold">
                {formatCurrency(calculateSubtotalWithCosts())}
              </div>
            ) : (
              <div className="text-xl font-bold">
                {formatCurrency(calculateGrandTotal())}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <Button type="button" variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel || "Create Purchase"}
        </Button>
      </div>
    </form>
  );
}
