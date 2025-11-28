import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CoaSelect, CoaOption } from "@/components/CoaSelect";
import { useAccountCOA } from "@/hooks/useAccountCOA";
// ChevronLeft removed (Back button moved to Cancel)
import { toast } from "sonner";

const getAuthToken = () => {
  const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!authDataRaw) throw new Error("No access token found in localStorage");
  const authData = JSON.parse(authDataRaw);
  const token = authData.access_token;
  if (!token) throw new Error("Access token missing in parsed auth data");
  return token;
};

const paymentMethodOptions = [
  { value: "Full Payment", label: "Full Payment" },
  { value: "Partial Payment", label: "Partial Payment" },
];

const EditBillingInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: coaData } = useAccountCOA();

  // Build consistent COA options (same format as CoaSelect uses)
  type LocalCoa = CoaOption & { value?: string; label: string };
  const coaOptions = React.useMemo<LocalCoa[]>(() => {
    return (coaData ?? []).map(
      (c: CoaOption) =>
        ({
          ...c,
          label: `${c.account_code ? c.account_code + " - " : ""}${c.name ?? ""}`,
          value: String(c.id ?? c.account_code ?? c.label ?? ""),
        } as LocalCoa)
    );
  }, [coaData]);

  // Form state
  const [vendorCOAId, setVendorCOAId] = useState<string | null>(null);
  const [vendorCOALabel, setVendorCOALabel] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("Full Payment");
  const [paymentCOAId, setPaymentCOAId] = useState<string | null>(null);
  const [paymentCOALabel, setPaymentCOALabel] = useState<string | null>(null);
  const [installmentType, setInstallmentType] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<number | "">("");
  const [paymentName, setPaymentName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [paymentDate, setPaymentDate] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  // One-time sync guard to initialize labels/names from COA after options load
  const [hasInitializedFromCOA, setHasInitializedFromCOA] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const fetchItem = async () => {
      try {
        setInitialLoading(true);
        const token = getAuthToken();
        const url = new URL("https://pbw-backend-api.vercel.app/api/purchases");
        url.searchParams.set("action", "getBillingInvoice");
        url.searchParams.set("search", id);
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const item = Array.isArray(json.data) ? json.data[0] : json.data || json;
        if (!mounted) return;
        if (item) {
          console.log("Fetched billing invoice data:", item);

          // Find vendor COA by account_code or ID
          if (item.vendor_COA) {
            const vendorCOA = coaOptions?.find((c) => String(c.account_code) === String(item.vendor_COA) || String(c.value) === String(item.vendor_COA));
            if (vendorCOA) {
              setVendorCOAId(vendorCOA.value);
              setVendorCOALabel(vendorCOA.label);
              // Prioritize vendor_name from database, fallback to COA label
              setVendorName(item.vendor_name ?? extractNameFromCOA(vendorCOA.label));
            } else {
              setVendorCOAId(item.vendor_COA);
              setVendorCOALabel(item.vendor_COA);
              setVendorName(item.vendor_name ?? "");
            }
          } else if (item.vendor_name) {
            // If no vendor_COA but vendor_name exists
            setVendorName(item.vendor_name);
          }

          setMemo(item.memo ?? "");
          setAttachmentUrl(item.attachment_url ?? "");
          // parse attachment_url which might be JSON array string or array
          try {
            const raw = item.attachment_url;
            if (Array.isArray(raw)) {
              setExistingFiles(raw.filter(Boolean));
            } else if (typeof raw === "string" && raw.trim().startsWith("[")) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) setExistingFiles(parsed.filter(Boolean));
              else if (parsed) setExistingFiles([String(parsed)]);
            } else if (typeof raw === "string" && raw.trim() !== "") {
              // single path string
              setExistingFiles([raw]);
            } else {
              setExistingFiles([]);
            }
          } catch (e) {
            // fallback: if parsing fails, and it's a non-empty string, store it
            if (item.attachment_url) setExistingFiles([String(item.attachment_url)]);
          }

          setPaymentMethod(item.payment_method ?? "Full Payment");

          // Find payment COA by account_code or ID
          if (item.payment_COA) {
            const paymentCOA = coaOptions?.find((c) => String(c.account_code) === String(item.payment_COA) || String(c.value) === String(item.payment_COA));
            if (paymentCOA) {
              setPaymentCOAId(paymentCOA.value);
              setPaymentCOALabel(paymentCOA.label);
              // Prioritize payment_name from database, fallback to COA label
              setPaymentName(item.payment_name ?? extractNameFromCOA(paymentCOA.label));
            } else {
              setPaymentCOAId(item.payment_COA);
              setPaymentCOALabel(item.payment_COA);
              setPaymentName(item.payment_name ?? "");
            }
          } else if (item.payment_name) {
            // If no payment_COA but payment_name exists
            setPaymentName(item.payment_name);
          }

          setInstallmentType(item.installment_type ?? "");
          setPaidAmount(item.paid_amount ?? "");
          setPaymentDate(item.payment_date ?? null);
          setPaymentAmount(item.payment_amount ?? null);
          setStatus(item.status ?? null);
        }
      } catch (err: unknown) {
        console.error(err);
        toast.error("Failed to fetch billing invoice details");
      } finally {
        if (mounted) setInitialLoading(false);
      }
    };
    fetchItem();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Initialize COA labels and names once when COA options become available to avoid empty fields
  useEffect(() => {
    if (hasInitializedFromCOA) return;
    if (!coaOptions || coaOptions.length === 0) return;

    // Initialize Vendor from COA if needed
    if (vendorCOAId || vendorCOALabel) {
      const vendorMatch = coaOptions.find((c) => String(c.value) === String(vendorCOAId) || String(c.account_code) === String(vendorCOALabel));
      if (vendorMatch) {
        if (!vendorCOALabel || !vendorCOALabel.includes(" - ")) setVendorCOALabel(vendorMatch.label);
        if (!vendorName) setVendorName(extractNameFromCOA(vendorMatch.label));
      }
    }

    // Initialize Payment from COA if needed
    if (paymentCOAId || paymentCOALabel) {
      const paymentMatch = coaOptions.find((c) => String(c.value) === String(paymentCOAId) || String(c.account_code) === String(paymentCOALabel));
      if (paymentMatch) {
        if (!paymentCOALabel || !paymentCOALabel.includes(" - ")) setPaymentCOALabel(paymentMatch.label);
        if (!paymentName) setPaymentName(extractNameFromCOA(paymentMatch.label));
      }
    }

    setHasInitializedFromCOA(true);
  }, [coaOptions, hasInitializedFromCOA, vendorCOAId, vendorCOALabel, vendorName, paymentCOAId, paymentCOALabel, paymentName]);

  // Auto-sync vendor name and vendor COA if one of them changes
  useEffect(() => {
    if (!coaOptions || coaOptions.length === 0) return;

    // If vendorName changed and COA not set, find corresponding COA
    if (vendorName && !vendorCOAId) {
      const matchingCOA = findCOAByName(vendorName);
      if (matchingCOA) {
        setVendorCOAId(matchingCOA.value);
        setVendorCOALabel(matchingCOA.label);
      }
    }

    // If COA changed but name not set, update vendorName
    if (vendorCOAId && !vendorName) {
      const coa = coaOptions.find((c) => String(c.value) === String(vendorCOAId));
      if (coa) {
        setVendorName(extractNameFromCOA(coa.label));
      }
    }
  }, [vendorName, vendorCOAId, coaOptions]);

  // Logic for enabling/disabling fields
  const isPartial = paymentMethod === "Partial Payment";
  const paymentDone = paymentDate || paymentAmount;

  // Helper function to extract name from COA label (e.g. "400101-7 - Unearned Revenue" -> "Unearned Revenue")
  const extractNameFromCOA = (label?: string | null) => {
    if (!label) return "";
    const parts = label.split(" - ");
    return parts.length > 1 ? parts[1] : label;
  };

  // Helper function to extract code from COA label (e.g. "400101-7 - Unearned Revenue" -> "400101-7")
  const extractCodeFromCOA = (label?: string | null) => {
    if (!label) return "";
    const parts = label.split(" - ");
    return parts.length > 1 ? parts[0] : label;
  };

  // Helper function to find COA by name in coaData
  const findCOAByName = (name?: string | null) => {
    if (!coaOptions || !name) return null;
    return coaOptions.find((coa) => extractNameFromCOA(coa.label) === name) ?? null;
  };

  // Helper function to get display value for COA
  const getDisplayValueForCOA = (label?: string | null) => {
    if (!label) return "";
    return extractCodeFromCOA(label);
  };

  // If partial and payment already done, only paidAmount is enabled
  const disableAllExceptPaidAmount = isPartial && paymentDone;

  // If partial and payment not done, all fields enabled
  // If full, all fields enabled except installment_type
  const disableInstallmentType = paymentMethod === "Full Payment";

  const handleSubmit = async () => {
    if (!id) return;
    // Basic client-side validation for mandatory fields
    if (!paymentMethod) {
      toast.error("Payment Method is required");
      return;
    }
    if (!vendorName && !vendorCOAId) {
      toast.error("Vendor Name or Vendor COA is required");
      return;
    }

    // Auto-fill vendor COA from name if missing
    if (!vendorCOAId && vendorName) {
      const matchingCOA = findCOAByName(vendorName);
      if (matchingCOA) {
        setVendorCOAId(matchingCOA.value);
        setVendorCOALabel(matchingCOA.label);
      }
    }

    if (!paymentCOAId || !paymentName) {
      toast.error("Payment COA and Payment Name are required");
      return;
    }
    if (paidAmount === "" || paidAmount === null || Number(paidAmount) <= 0) {
      toast.error("Paid Amount is required and must be greater than 0");
      return;
    }
    if (paymentMethod === "Partial Payment" && !installmentType) {
      toast.error("Installment Type is required when Payment Method is Partial Payment");
      return;
    }

    // File size validation (server may reject large uploads with 413)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
    const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50 MB total
    const oversized = attachments.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      const names = oversized.map((f) => f.name).join(", ");
      toast.error(`File terlalu besar: ${names}. Maks per-file ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB.`);
      return;
    }
    const totalBytes = attachments.reduce((s, f) => s + (f.size || 0), 0);
    if (totalBytes > MAX_TOTAL_SIZE) {
      toast.error(`Total ukuran file melebihi batas (${Math.round(MAX_TOTAL_SIZE / 1024 / 1024)} MB). Kurangi ukuran atau jumlah file.`);
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      // Get account_code from COA ID (convert UUID to COA code)
      const vendorCOA = coaOptions?.find((c) => String(c.value) === String(vendorCOAId));
      const paymentCOA = coaOptions?.find((c) => String(c.value) === String(paymentCOAId));

      const vendorCOACode = vendorCOA?.account_code ?? extractCodeFromCOA(vendorCOALabel);
      const paymentCOACode = paymentCOA?.account_code ?? extractCodeFromCOA(paymentCOALabel);

      console.log("=== SUBMITTING BILLING INVOICE DATA ===");
      console.log("vendorCOAId:", vendorCOAId);
      console.log("vendorCOACode:", vendorCOACode);
      console.log("vendorName:", vendorName);
      console.log("paymentCOAId:", paymentCOAId);
      console.log("paymentCOACode:", paymentCOACode);
      console.log("paymentName:", paymentName);
      console.log("paymentMethod:", paymentMethod);
      console.log("installmentType:", installmentType);
      console.log("paidAmount:", paidAmount);
      console.log("memo:", memo);

      const apiForm = new FormData();
      // API expects this action name and PATCH method for editing
      apiForm.append("action", "editNewBillingInvoice");
      apiForm.append("id", id);
      apiForm.append("vendor_COA", vendorCOACode ?? "");
      apiForm.append("vendor_name", vendorName);
      // also send alias keys for backend compatibility
      apiForm.append("vendorName", vendorName);
      apiForm.append("memo", memo);
      // Handle attachments:
      // - If user uploaded new files, append each file. ALSO send existing files list so backend preserves them.
      // - If no new files uploaded, send attachment_url as JSON array of existingFiles (backward compatible).
      if (attachments && attachments.length > 0) {
        // include existing files list so backend can preserve them
        if (existingFiles && existingFiles.length > 0) {
          apiForm.append("existingFiles", JSON.stringify(existingFiles));
          // also include common alternative key for compatibility
          try {
            apiForm.append("existing_files", JSON.stringify(existingFiles));
          } catch (_e) {
            /* ignore */
          }
          // Add also under attachment_url as JSON for backends that rely on this key to keep existing ones
          try {
            apiForm.append("attachment_url", JSON.stringify(existingFiles));
          } catch (_e) {
            apiForm.append("attachment_url", "[]");
          }
        }
        // Append new files using array-style keys to improve backend compatibility
        attachments.forEach((f) => {
          apiForm.append("attachment_url[]", f);
        });
        // Also append under 'attachments[]' for servers that expect that name
        attachments.forEach((f) => {
          apiForm.append("attachments[]", f);
        });
        // Also append each file under plain 'attachment_url' (repeated) for servers that expect repeated keys
        attachments.forEach((f) => {
          apiForm.append("attachment_url", f);
        });
      } else {
        try {
          // When no new files uploaded, send existing files as JSON under attachment_url
          apiForm.append("attachment_url", JSON.stringify(existingFiles ?? []));
        } catch (e) {
          apiForm.append("attachment_url", "[]");
        }
      }
      // send filesToDelete as JSON string so backend can remove those files
      if (filesToDelete && filesToDelete.length > 0) {
        apiForm.append("filesToDelete", JSON.stringify(filesToDelete));
      }
      apiForm.append("payment_method", paymentMethod);
      apiForm.append("payment_COA", paymentCOACode ?? "");
      apiForm.append("payment_name", paymentName);
      // also send alias keys for backend compatibility
      apiForm.append("paymentName", paymentName);
      apiForm.append("installment_type", installmentType);
      apiForm.append("paid_amount", String(paidAmount ?? ""));

      // Log FormData content
      console.log("=== FORM DATA TO BE SENT ===");
      for (const [key, value] of apiForm.entries()) {
        console.log(`${key}:`, value);
      }

      const res = await fetch("https://pbw-backend-api.vercel.app/api/purchases", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: apiForm,
      });

      // Handle non-OK responses with clearer messages (413 = file too large)
      if (!res.ok) {
        if (res.status === 413) {
          toast.error("Upload gagal: ukuran file terlalu besar (server menolak request). Kurangi ukuran file atau jumlah file.");
          return;
        }
        // Try to parse JSON error message if present
        try {
          const errJson = await res.json();
          const msg = errJson?.message || errJson?.error || `${res.status} ${res.statusText}`;
          toast.error(`Gagal mengupdate billing invoice: ${msg}`);
        } catch (_e) {
          // non-JSON response
          toast.error(`Gagal mengupdate billing invoice (HTTP ${res.status} ${res.statusText})`);
        }
        return;
      }

      const json = await res.json();
      console.log("Server response:", json);

      if (json?.error) {
        toast.error(json.message || "Gagal mengupdate billing invoice (server error)");
        console.error("API error:", json);
        return;
      }
      toast.success("Billing invoice updated successfully");
      console.log("Update successful, navigating to view page");
      navigate(`/billing-invoice/view/${id}`);
    } catch (err: unknown) {
      console.error(err);
      // Network or CORS errors often surface as TypeError: Failed to fetch
      if (err instanceof TypeError && String(err.message).toLowerCase().includes("failed to fetch")) {
        toast.error(
          "Failed to connect to server. This could be due to: network connectivity issues, server being unreachable, or CORS policy blocking the request. Please check your internet connection or contact support if the issue persists."
        );
      } else {
        toast.error("Failed to update billing invoice. Check browser console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Note: Removed sync useEffect to prevent overriding manually edited vendor_name and payment_name
  // Sync is now handled in:
  // 1. Initial data fetch (useEffect with fetchItem)
  // 2. CoaSelect onSelect event handlers
  // 3. Vendor/Payment Name select onValueChange handlers

  if (initialLoading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Edit Billing Invoice" description="Edit billing invoice details" />
        <div className="p-6 max-w-5xl mx-auto">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Two-column form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                {/* 1. Payment Method */}
                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={!!disableAllExceptPaidAmount}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethodOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Vendor COA */}
                <div>
                  <Label>Vendor COA</Label>
                  <CoaSelect
                    valueId={vendorCOAId}
                    valueLabel={getDisplayValueForCOA(vendorCOALabel)}
                    onSelect={(id, label) => {
                      setVendorCOAId(id);
                      setVendorCOALabel(label);
                      // Auto-set vendor name from selected COA
                      setVendorName(extractNameFromCOA(label));
                    }}
                    placeholder="Select Vendor COA"
                    disabled={Boolean(status && String(status).toLowerCase() === "pending")}
                  />
                </div>

                {/* 3. Vendor Name (editable input with optional COA auto-match on blur) */}
                <div>
                  <Label>Vendor Name</Label>
                  <Input
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    onBlur={() => {
                      // Try to auto-match a COA when the user finishes typing
                      if (vendorName && !vendorCOAId) {
                        const matchingCOA = findCOAByName(vendorName);
                        if (matchingCOA) {
                          setVendorCOAId(matchingCOA.value);
                          setVendorCOALabel(matchingCOA.label);
                        }
                      }
                    }}
                    disabled={!!disableAllExceptPaidAmount}
                    className="w-full"
                  />
                </div>

                {/* 4. Installment Type */}
                <div>
                  <Label>Installment Type</Label>
                  <Select value={installmentType} onValueChange={setInstallmentType} disabled={!!(disableInstallmentType || disableAllExceptPaidAmount)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select installment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage / %</SelectItem>
                      <SelectItem value="nominal">Nominal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* 1. Payment COA */}
                <div>
                  <Label>Payment COA</Label>
                  <CoaSelect
                    valueId={paymentCOAId}
                    valueLabel={getDisplayValueForCOA(paymentCOALabel)}
                    onSelect={(id, label) => {
                      setPaymentCOAId(id);
                      setPaymentCOALabel(label);
                      // Auto-set payment name from selected COA
                      setPaymentName(extractNameFromCOA(label));
                    }}
                    placeholder="Select Payment COA"
                    disabled={Boolean(status && String(status).toLowerCase() === "pending")}
                  />
                </div>

                {/* 2. Payment Name */}
                <div>
                  <Label>Payment Name</Label>
                  <Select
                    value={paymentName || ""}
                    onValueChange={(value) => {
                      setPaymentName(value);
                      const matchingCOA = findCOAByName(value);
                      if (matchingCOA) {
                        setPaymentCOAId(matchingCOA.value);
                        setPaymentCOALabel(matchingCOA.label);
                      }
                    }}
                    disabled={!!disableAllExceptPaidAmount}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Payment Name" />
                    </SelectTrigger>
                    <SelectContent>
                      {(coaOptions || []).map((coa) => {
                        const name = extractNameFromCOA(coa.label);
                        return name ? (
                          <SelectItem key={coa.value} value={name}>
                            {name}
                          </SelectItem>
                        ) : null;
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. Paid Amount */}
                <div>
                  <Label>Paid Amount</Label>
                  <Input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* 8. Memo */}
            <div>
              <Label>Memo</Label>
              <Textarea value={memo} onChange={(e) => setMemo(e.target.value)} disabled={!!disableAllExceptPaidAmount} />
            </div>

            {/* 9. Attachments (multiple files allowed) */}
            <div>
              <Label>Attachments</Label>
              <input
                type="file"
                multiple
                accept="*/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files) return;
                  const arr = Array.from(files as FileList);
                  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
                  const toAdd: File[] = [];
                  for (const f of arr) {
                    if (f.size > MAX_FILE_SIZE) {
                      toast.error(`File '${f.name}' terlalu besar. Maks per-file ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB.`);
                      continue;
                    }
                    toAdd.push(f);
                  }
                  setAttachments((prev) => {
                    const merged = [...prev];
                    for (const f of toAdd) {
                      const exists = merged.some((m) => m.name === f.name && m.size === f.size && m.lastModified === f.lastModified);
                      if (!exists) merged.push(f);
                    }
                    return merged;
                  });
                  // Clear existing attachment URL when uploading files
                  setAttachmentUrl("");
                }}
                className="mt-2 block w-full"
                disabled={!!disableAllExceptPaidAmount}
              />
              <p className="mt-1 text-sm text-muted-foreground">Maks per file: 10 MB. Total maksimal: 50 MB.</p>
              {/* Existing files list (readable) */}
              {existingFiles && existingFiles.length > 0 ? (
                <ul className="mt-2 divide-y rounded-md border p-2">
                  {existingFiles.map((path, idx) => {
                    const parts = String(path).split("/");
                    const name = parts[parts.length - 1] || path;
                    const isPending = status?.toLowerCase() === "pending"; // tambahkan ini
                    return (
                      <li key={idx} className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium">{name}</div>
                          <div className="text-xs text-muted-foreground">{path}</div>
                        </div>
                        <div>
                          <button
                            type="button"
                            className={`text-sm ${isPending ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:underline"}`}
                            disabled={isPending}
                            onClick={() => {
                              if (isPending) return;
                              setFilesToDelete((s) => [...s, path]);
                              setExistingFiles((s) => s.filter((p) => p !== path));
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              {attachments.length > 0 ? (
                <ul className="mt-2 divide-y rounded-md border p-2">
                  {attachments.map((f, idx) => {
                    const isPending = status?.toLowerCase() === "pending"; // tambahkan ini
                    return (
                      <li key={idx} className="flex items-center justify-between py-2">
                        <div className="text-sm">{f.name}</div>
                        <div>
                          <button
                            type="button"
                            className={`text-sm ${isPending ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:underline"}`}
                            disabled={isPending}
                            onClick={() => {
                              if (isPending) return;
                              setAttachments((s) => s.filter((_, i) => i !== idx));
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>

            <div className="pt-4 flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1 bg-sidebar-active hover:bg-green-600">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/billing-summary")}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBillingInvoice;
