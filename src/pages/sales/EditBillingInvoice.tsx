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

const EditBillingInvoiceSales: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();
  const { data: coaOptions } = useAccountCOA();

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
  const [hasInitializedFromCOA, setHasInitializedFromCOA] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const fetchItem = async () => {
      try {
        setInitialLoading(true);
        const token = getAuthToken();
        const url = new URL("https://pbw-backend-api.vercel.app/api/sales");
        url.searchParams.set("action", "getReceivableSummary");
        url.searchParams.set("search", id);
        const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const item = Array.isArray(json.data) ? json.data[0] : json.data || json;
        if (!mounted) return;
        if (item) {
          // Sales uses customer_* fields; map them into the form fields/state used by this component
          if (item.customer_COA) {
            const customerCOA = coaOptions?.find((c) => String(c.account_code) === String(item.customer_COA) || String(c.id ?? c.account_code) === String(item.customer_COA));
            if (customerCOA) {
              const idValue = String(customerCOA.id ?? customerCOA.account_code ?? customerCOA.label ?? item.customer_COA);
              const labelValue = customerCOA.label ?? `${customerCOA.account_code ?? ""}${customerCOA.name ? " - " + customerCOA.name : ""}`;
              setVendorCOAId(idValue);
              setVendorCOALabel(labelValue);
              setVendorName(item.customer_name ?? extractNameFromCOA(labelValue));
            } else {
              setVendorCOAId(String(item.customer_COA));
              setVendorCOALabel(String(item.customer_COA));
              setVendorName(item.customer_name ?? "");
            }
          } else if (item.customer_name) {
            setVendorName(item.customer_name);
          }

          setMemo(item.memo ?? "");
          setAttachmentUrl(item.attachment_url ?? "");
          try {
            const raw = item.attachment_url;
            if (Array.isArray(raw)) setExistingFiles(raw.filter(Boolean));
            else if (typeof raw === "string" && raw.trim().startsWith("[")) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) setExistingFiles(parsed.filter(Boolean));
              else if (parsed) setExistingFiles([String(parsed)]);
            } else if (typeof raw === "string" && raw.trim() !== "") setExistingFiles([raw]);
            else setExistingFiles([]);
          } catch (e) {
            if (item.attachment_url) setExistingFiles([String(item.attachment_url)]);
          }

          setPaymentMethod(item.payment_method ?? "Full Payment");

          if (item.payment_COA) {
            const paymentCOA = coaOptions?.find((c) => String(c.account_code) === String(item.payment_COA) || String(c.id ?? c.account_code) === String(item.payment_COA));
            if (paymentCOA) {
              const payId = String(paymentCOA.id ?? paymentCOA.account_code ?? paymentCOA.label ?? item.payment_COA);
              const payLabel = paymentCOA.label ?? `${paymentCOA.account_code ?? ""}${paymentCOA.name ? " - " + paymentCOA.name : ""}`;
              setPaymentCOAId(payId);
              setPaymentCOALabel(payLabel);
              setPaymentName(item.payment_name ?? extractNameFromCOA(payLabel));
            } else {
              setPaymentCOAId(String(item.payment_COA));
              setPaymentCOALabel(String(item.payment_COA));
              setPaymentName(item.payment_name ?? "");
            }
          } else if (item.payment_name) setPaymentName(item.payment_name);

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
  }, [id, coaOptions]);

  useEffect(() => {
    if (hasInitializedFromCOA) return;
    if (!coaOptions || coaOptions.length === 0) return;

    if (vendorCOAId || vendorCOALabel) {
      const vendorMatch = coaOptions.find((c) => String(c.value) === String(vendorCOAId) || String(c.account_code) === String(vendorCOALabel));
      if (vendorMatch) {
        if (!vendorCOALabel || !vendorCOALabel.includes(" - ")) setVendorCOALabel(vendorMatch.label);
        if (!vendorName) setVendorName(extractNameFromCOA(vendorMatch.label));
      }
    }

    if (paymentCOAId || paymentCOALabel) {
      const paymentMatch = coaOptions.find((c) => String(c.value) === String(paymentCOAId) || String(c.account_code) === String(paymentCOALabel));
      if (paymentMatch) {
        if (!paymentCOALabel || !paymentCOALabel.includes(" - ")) setPaymentCOALabel(paymentMatch.label);
        if (!paymentName) setPaymentName(extractNameFromCOA(paymentMatch.label));
      }
    }

    setHasInitializedFromCOA(true);
  }, [coaOptions, hasInitializedFromCOA, vendorCOAId, vendorCOALabel, vendorName, paymentCOAId, paymentCOALabel, paymentName]);

  // Keep paymentName in sync when payment COA changes
  useEffect(() => {
    if (!coaOptions || coaOptions.length === 0) return;
    if (paymentCOAId || paymentCOALabel) {
      const match = coaOptions.find((c) => String(c.value) === String(paymentCOAId) || String(c.account_code) === String(paymentCOALabel));
      if (match) {
        const name = extractNameFromCOA(match.label);
        if (name && name !== paymentName) setPaymentName(name);
      }
    }
  }, [paymentCOAId, paymentCOALabel, coaOptions]);

  useEffect(() => {
    if (!coaOptions || coaOptions.length === 0) return;
    if (vendorName && !vendorCOAId) {
      const matchingCOA = findCOAByName(vendorName);
      if (matchingCOA) {
        setVendorCOAId(matchingCOA.value);
        setVendorCOALabel(matchingCOA.label);
      }
    }
    if (vendorCOAId && !vendorName) {
      const coa = coaOptions.find((c) => String(c.value) === String(vendorCOAId));
      if (coa) setVendorName(extractNameFromCOA(coa.label));
    }
  }, [vendorName, vendorCOAId, coaOptions]);

  const isPartial = paymentMethod === "Partial Payment";
  const paymentDone = paymentDate || paymentAmount;

  const extractNameFromCOA = (label?: string | null) => {
    if (!label) return "";
    const parts = label.split(" - ");
    return parts.length > 1 ? parts[1] : label;
  };
  const extractCodeFromCOA = (label?: string | null) => {
    if (!label) return "";
    const parts = label.split(" - ");
    return parts.length > 1 ? parts[0] : label;
  };
  const findCOAByName = (name?: string | null) => {
    if (!coaOptions || !name) return null;
    return coaOptions.find((coa) => extractNameFromCOA(coa.label) === name) ?? null;
  };
  const getDisplayValueForCOA = (label?: string | null) => {
    if (!label) return "";
    return extractCodeFromCOA(label);
  };

  const disableAllExceptPaidAmount = isPartial && paymentDone;
  const disableInstallmentType = paymentMethod === "Full Payment";

  const handleSubmit = async () => {
    if (!id) return;
    if (!paymentMethod) {
      toast.error("Payment Method is required");
      return;
    }
    if (!vendorName && !vendorCOAId) {
      toast.error("Vendor Name or Vendor COA is required");
      return;
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

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
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
      const vendorCOA = coaOptions?.find((c) => String(c.value) === String(vendorCOAId));
      const paymentCOA = coaOptions?.find((c) => String(c.value) === String(paymentCOAId));
      const vendorCOACode = vendorCOA?.account_code ?? extractCodeFromCOA(vendorCOALabel);
      const paymentCOACode = paymentCOA?.account_code ?? extractCodeFromCOA(paymentCOALabel);

      const apiForm = new FormData();
      apiForm.append("action", "editNewReceivableSummary");
      apiForm.append("id", id);
      apiForm.append("customer_COA", vendorCOACode ?? "");
      apiForm.append("customer_name", vendorName);
      apiForm.append("customerName", vendorName);
      apiForm.append("memo", memo);

      if (attachments && attachments.length > 0) {
        if (existingFiles && existingFiles.length > 0) {
          apiForm.append("existingFiles", JSON.stringify(existingFiles));
          try {
            apiForm.append("existing_files", JSON.stringify(existingFiles));
          } catch (_e) {}
          try {
            apiForm.append("attachment_url", JSON.stringify(existingFiles));
          } catch (_e) {
            apiForm.append("attachment_url", "[]");
          }
        }
        attachments.forEach((f) => apiForm.append("attachment_url[]", f));
        attachments.forEach((f) => apiForm.append("attachments[]", f));
        attachments.forEach((f) => apiForm.append("attachment_url", f));
      } else {
        try {
          apiForm.append("attachment_url", JSON.stringify(existingFiles ?? []));
        } catch (e) {
          apiForm.append("attachment_url", "[]");
        }
      }
      if (filesToDelete && filesToDelete.length > 0) apiForm.append("filesToDelete", JSON.stringify(filesToDelete));

      apiForm.append("payment_method", paymentMethod);
      apiForm.append("payment_COA", paymentCOACode ?? "");
      apiForm.append("payment_name", paymentName);
      apiForm.append("paymentName", paymentName);
      apiForm.append("installment_type", installmentType);
      apiForm.append("paid_amount", String(paidAmount ?? ""));

      for (const [key, value] of apiForm.entries()) console.log(`${key}:`, value);

      const res = await fetch("https://pbw-backend-api.vercel.app/api/sales", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: apiForm,
      });

      if (!res.ok) {
        if (res.status === 413) {
          toast.error("Upload gagal: ukuran file terlalu besar (server menolak request). Kurangi ukuran file atau jumlah file.");
          return;
        }
        try {
          const errJson = await res.json();
          const msg = errJson?.message || errJson?.error || `${res.status} ${res.statusText}`;
          toast.error(`Failed to update billing invoice: ${msg}`);
        } catch (_e) {
          toast.error(`Failed to update billing invoice (HTTP ${res.status} ${res.statusText})`);
        }
        return;
      }

      const json = await res.json();
      if (json?.error) {
        toast.error(json.message || "Failed to update billing invoice (server error)");
        return;
      }
      toast.success("Billing invoice updated successfully");
      navigate(`/sales-receivable-summary/${id}`);
    } catch (err: unknown) {
      console.error(err);
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

  if (initialLoading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Edit Receivable Summary" description="Edit receivable summary details (Sales)" />
        <div className="p-6 max-w-5xl mx-auto">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
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

                <div>
                  <Label>Customer COA</Label>
                  <CoaSelect
                    valueId={vendorCOAId}
                    valueLabel={getDisplayValueForCOA(vendorCOALabel)}
                    onSelect={(id, label) => {
                      setVendorCOAId(id);
                      setVendorCOALabel(label);
                      setVendorName(extractNameFromCOA(label));
                    }}
                    placeholder="Select Vendor COA"
                    disabled={Boolean(status && String(status).toLowerCase() === "pending")}
                  />
                </div>

                <div>
                  <Label>Customer Name</Label>
                  <Input
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    onBlur={() => {
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

              <div className="space-y-6">
                <div>
                  <Label>Payment COA</Label>
                  <CoaSelect
                    valueId={paymentCOAId}
                    valueLabel={getDisplayValueForCOA(paymentCOALabel)}
                    onSelect={(id, label) => {
                      setPaymentCOAId(id);
                      setPaymentCOALabel(label);
                      setPaymentName(extractNameFromCOA(label));
                    }}
                    placeholder="Select Payment COA"
                    disabled={Boolean(status && String(status).toLowerCase() === "pending")}
                  />
                </div>

                <div>
                  <Label>Payment Name</Label>
                  <CoaSelect
                    valueId={paymentCOAId}
                    valueLabel={paymentName || getDisplayValueForCOA(paymentCOALabel)}
                    onSelect={(id, label) => {
                      setPaymentCOAId(id);
                      setPaymentCOALabel(label);
                      const name = extractNameFromCOA(label);
                      setPaymentName(name);
                    }}
                    placeholder="Select Payment Name"
                    disabled={!!disableAllExceptPaidAmount}
                  />
                </div>

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

            <div>
              <Label>Memo</Label>
              <Textarea value={memo} onChange={(e) => setMemo(e.target.value)} disabled={!!disableAllExceptPaidAmount} />
            </div>

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
                  const MAX_FILE_SIZE = 10 * 1024 * 1024;
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
                  setAttachmentUrl("");
                }}
                className="mt-2 block w-full"
                disabled={!!disableAllExceptPaidAmount}
              />
              <p className="mt-1 text-sm text-muted-foreground">Maks per file: 10 MB. Total maksimal: 50 MB.</p>
              {existingFiles && existingFiles.length > 0 ? (
                <ul className="mt-2 divide-y rounded-md border p-2">
                  {existingFiles.map((path, idx) => {
                    const parts = String(path).split("/");
                    const name = parts[parts.length - 1] || path;
                    const isPending = status?.toLowerCase() === "pending";
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
                    const isPending = status?.toLowerCase() === "pending";
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
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/sales/billing-summary?tab=receivable")}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBillingInvoiceSales;
