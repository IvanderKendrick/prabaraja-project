import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CoaSelect, CoaOption } from "@/components/CoaSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccountCOA } from "@/hooks/useAccountCOA";
import { toast } from "sonner";

const getAuthToken = () => {
  const authDataRaw = localStorage.getItem(
    "sb-xwfkrjtqcqmmpclioakd-auth-token"
  );
  if (!authDataRaw) throw new Error("No access token found in localStorage");
  const authData = JSON.parse(authDataRaw);
  const token = authData.access_token;
  if (!token) throw new Error("Access token missing in parsed auth data");
  return token;
};

const extractCodeFromLabel = (label?: string | null) => {
  if (!label) return "";
  const parts = label.split(" - ");
  return parts[0] ?? label; // hanya ambil kode COA
};

const extractNameFromLabel = (label?: string | null) => {
  if (!label) return "";
  const parts = label.split(" - ");
  return parts[1] ?? label; // ambil nama COA
};

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

const EditBillingOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: coaData } = useAccountCOA();

  const [downPayment, setDownPayment] = useState<number>(0);
  const [installmentCOAId, setInstallmentCOAId] = useState<string | null>(null);
  const [installmentCOALabel, setInstallmentCOALabel] = useState<string | null>(
    null
  );
  const [installmentName, setInstallmentName] = useState<string | null>(null);
  const [paymentCOAId, setPaymentCOAId] = useState<string | null>(null);
  const [paymentCOALabel, setPaymentCOALabel] = useState<string | null>(null);
  const [paymentName, setPaymentName] = useState<string | null>(null);
  const [memo, setMemo] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [vendorName, setVendorName] = useState<string>(""); // ✅ Ditambahkan
  const [hasInitializedFromCOA, setHasInitializedFromCOA] = useState(false);

  // Helper functions
  const findCOAByName = (name?: string | null) => {
    if (!coaData || !name) return null;
    return coaData.find(
      (coa: any) => extractNameFromCOA(coa.label ?? coa.name ?? "") === name
    );
  };

  const getDisplayValueForCOA = (label?: string | null) => {
    if (!label) return "";
    return extractCodeFromCOA(label);
  };

  // Initialize COA labels/names once COA options are available to avoid stale display
  useEffect(() => {
    if (hasInitializedFromCOA) return;
    const list = (coaData as CoaOption[] | undefined) ?? [];
    if (!list || list.length === 0) return;

    // Installment COA/name
    if (installmentCOAId || installmentCOALabel) {
      const match = list.find(
        (c) =>
          String(c.id ?? (c as { value?: string }).value ?? c.account_code) ===
            String(installmentCOAId) ||
          String(c.account_code) === String(installmentCOALabel)
      );
      if (match) {
        const label = match.label ?? `${match.account_code} - ${match.name}`;
        if (
          !installmentCOALabel ||
          !String(installmentCOALabel).includes(" - ")
        )
          setInstallmentCOALabel(label);
        if (!installmentName) setInstallmentName(extractNameFromCOA(label));
      }
    }

    // Payment COA/name
    if (paymentCOAId || paymentCOALabel) {
      const match = list.find(
        (c) =>
          String(c.id ?? (c as { value?: string }).value ?? c.account_code) ===
            String(paymentCOAId) ||
          String(c.account_code) === String(paymentCOALabel)
      );
      if (match) {
        const label = match.label ?? `${match.account_code} - ${match.name}`;
        if (!paymentCOALabel || !String(paymentCOALabel).includes(" - "))
          setPaymentCOALabel(label);
        if (!paymentName) setPaymentName(extractNameFromCOA(label));
      }
    }

    setHasInitializedFromCOA(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coaData]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const fetchItem = async () => {
      try {
        setInitialLoading(true);
        const token = getAuthToken();
        const url = new URL("https://pbw-backend-api.vercel.app/api/purchases");
        url.searchParams.set("action", "getBillingOrder");
        url.searchParams.set("id", id);
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const item = Array.isArray(json.data)
          ? json.data[0]
          : json.data || json;
        if (!mounted) return;
        if (item) {
          console.log("Fetched billing order data:", item);

          // Use installment_amount for Down Payment as requested
          setDownPayment(
            Number(item.installment_amount ?? item.paid_amount ?? 0)
          );
          setMemo(item.memo ?? "");

          if (item.installment_COA) {
            // item.installment_COA bisa berupa account_code (700101) atau ID (UUID)
            // Cari berdasarkan account_code dulu, lalu ID
            const list = (coaData as CoaOption[] | undefined) ?? [];
            const coa = list.find(
              (c) =>
                String(c.account_code) === String(item.installment_COA) ||
                String(c.id ?? (c as { value?: string }).value) ===
                  String(item.installment_COA)
            );
            if (coa) {
              setInstallmentCOAId(
                String(
                  coa.id ??
                    (coa as { value?: string }).value ??
                    coa.account_code
                )
              );
              setInstallmentCOALabel(
                coa.label ?? `${coa.account_code} - ${coa.name}`
              );
              // Fallback: jika installment_name kosong di DB, turunkan dari label COA
              if (!item.installment_name) {
                setInstallmentName(
                  extractNameFromCOA(
                    coa.label ?? `${coa.account_code} - ${coa.name}`
                  )
                );
              }
            } else {
              // Jika tidak ditemukan, simpan apa adanya
              setInstallmentCOAId(String(item.installment_COA));
              setInstallmentCOALabel(String(item.installment_COA));
            }
          }
          if (item.installment_name)
            setInstallmentName(
              extractNameFromLabel(String(item.installment_name))
            );

          if (item.payment_COA) {
            // item.payment_COA bisa berupa account_code (100101) atau ID (UUID)
            // Cari berdasarkan account_code dulu, lalu ID
            const list2 = (coaData as CoaOption[] | undefined) ?? [];
            const coa = list2.find(
              (c) =>
                String(c.account_code) === String(item.payment_COA) ||
                String(c.id ?? (c as { value?: string }).value) ===
                  String(item.payment_COA)
            );
            if (coa) {
              setPaymentCOAId(
                String(
                  coa.id ??
                    (coa as { value?: string }).value ??
                    coa.account_code
                )
              );
              setPaymentCOALabel(
                coa.label ?? `${coa.account_code} - ${coa.name}`
              );
              // Fallback: jika payment_name kosong di DB, turunkan dari label COA
              if (!item.payment_name) {
                setPaymentName(
                  extractNameFromCOA(
                    coa.label ?? `${coa.account_code} - ${coa.name}`
                  )
                );
              }
            } else {
              // Jika tidak ditemukan, simpan apa adanya
              setPaymentCOAId(String(item.payment_COA));
              setPaymentCOALabel(String(item.payment_COA));
            }
          }
          if (item.payment_name)
            setPaymentName(extractNameFromLabel(String(item.payment_name)));

          // Parse attachment_url (similar to EditBillingInvoice)
          if (item.attachment_url) {
            const raw = item.attachment_url;
            if (Array.isArray(raw)) {
              setExistingFiles(raw.filter(Boolean));
            } else if (typeof raw === "string") {
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed))
                  setExistingFiles(parsed.filter(Boolean));
                else if (parsed) setExistingFiles([String(parsed)]);
              } catch {
                if (raw) setExistingFiles([raw]);
                else setExistingFiles([]);
              }
            } else {
              if (item.attachment_url)
                setExistingFiles([String(item.attachment_url)]);
            }
          }
        }
      } catch (err: unknown) {
        console.error(err);
        toast.error("Failed to fetch billing order details");
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

  const handleSubmit = async () => {
    if (!id) return;

    // Validation for mandatory fields
    if (downPayment <= 0) {
      toast.error("Down Payment Amount is required and must be greater than 0");
      return;
    }
    if (!installmentCOAId || !installmentName) {
      toast.error("Installment COA and Installment Name are required");
      return;
    }
    if (!paymentCOAId || !paymentName) {
      toast.error("Payment COA and Payment Name are required");
      return;
    }

    // File size validation
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
    const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50 MB total
    const oversized = attachments.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      const names = oversized.map((f) => f.name).join(", ");
      toast.error(
        `File terlalu besar: ${names}. Maks per-file ${Math.round(
          MAX_FILE_SIZE / 1024 / 1024
        )} MB.`
      );
      return;
    }
    const totalBytes = attachments.reduce((s, f) => s + (f.size || 0), 0);
    if (totalBytes > MAX_TOTAL_SIZE) {
      toast.error(
        `Total ukuran file melebihi batas (${Math.round(
          MAX_TOTAL_SIZE / 1024 / 1024
        )} MB). Kurangi ukuran atau jumlah file.`
      );
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      // Get account_code from COA ID
      const listAll = (coaData as CoaOption[] | undefined) ?? [];
      const installmentCOA = listAll.find(
        (c) =>
          String(c.id ?? (c as { value?: string }).value ?? c.account_code) ===
          String(installmentCOAId)
      );
      const paymentCOA = listAll.find(
        (c) =>
          String(c.id ?? (c as { value?: string }).value ?? c.account_code) ===
          String(paymentCOAId)
      );

      const installmentCOACode =
        installmentCOA?.account_code ?? extractCodeFromCOA(installmentCOALabel);
      const paymentCOACode =
        paymentCOA?.account_code ?? extractCodeFromCOA(paymentCOALabel);

      console.log("=== SUBMITTING DATA ===");
      console.log("installmentCOAId:", installmentCOAId);
      console.log("installmentCOALabel:", installmentCOALabel);
      console.log("installmentCOACode:", installmentCOACode);
      console.log("installmentName:", installmentName);
      console.log("paymentCOAId:", paymentCOAId);
      console.log("paymentCOALabel:", paymentCOALabel);
      console.log("paymentCOACode:", paymentCOACode);
      console.log("paymentName:", paymentName);
      console.log("downPayment:", downPayment);
      console.log("memo:", memo);

      const apiForm = new FormData();
      apiForm.append("action", "editNewBillingOrder");
      apiForm.append("id", id);
      apiForm.append("installment_COA", installmentCOACode ?? "");
      apiForm.append("installment_name", installmentName ?? "");
      // also send alias for compatibility
      apiForm.append("payment_COA", paymentCOACode ?? "");
      apiForm.append("payment_name", paymentName ?? "");
      apiForm.append("memo", memo ?? "");
      apiForm.append("installment_amount", String(downPayment ?? 0));

      // Log FormData content
      console.log("=== FORM DATA TO BE SENT ===");
      for (const [key, value] of apiForm.entries()) {
        console.log(`${key}:`, value);
      }

      // ✅ Gabungkan file lama dan baru, dan kirim dengan struktur yang backend pahami
      const allExistingFiles = existingFiles.filter(
        (f) => !filesToDelete.includes(f)
      );

      // Kirim list file lama sebagai JSON agar backend tahu mana yang dipertahankan
      if (allExistingFiles.length > 0) {
        apiForm.append("existingFiles", JSON.stringify(allExistingFiles));
        try {
          apiForm.append("existing_files", JSON.stringify(allExistingFiles));
        } catch (_e) {
          // ignore non-fatal append errors
        }
        try {
          apiForm.append("attachment_url", JSON.stringify(allExistingFiles));
        } catch (_e) {
          apiForm.append("attachment_url", "[]");
        }
      }

      // Tambahkan file baru (yang belum diunggah) dengan beberapa key variant untuk kompatibilitas
      if (attachments && attachments.length > 0) {
        attachments.forEach((file) => {
          apiForm.append("attachment_url[]", file);
        });
        attachments.forEach((file) => {
          apiForm.append("attachments[]", file);
        });
        // also append repeated attachment_url for some backends
        attachments.forEach((file) => {
          apiForm.append("attachment_url", file);
        });
      } else {
        // When no new files uploaded, send existing files as JSON under attachment_url for compatibility
        try {
          apiForm.append(
            "attachment_url",
            JSON.stringify(allExistingFiles ?? [])
          );
        } catch (e) {
          apiForm.append("attachment_url", "[]");
        }
      }

      // Jika user menghapus file, kirim juga list-nya
      if (filesToDelete.length > 0) {
        apiForm.append("filesToDelete", JSON.stringify(filesToDelete));
      }

      // Also include COA id variants so backend can match by ID when it expects an id instead of account_code
      try {
        if (installmentCOAId != null)
          apiForm.append("installment_COA_id", String(installmentCOAId));
      } catch (_e) {
        // ignore
      }
      try {
        if (paymentCOAId != null)
          apiForm.append("payment_COA_id", String(paymentCOAId));
      } catch (_e) {
        // ignore
      }

      const res = await fetch(
        "https://pbw-backend-api.vercel.app/api/purchases",
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: apiForm,
        }
      );

      // Handle non-OK responses with clearer messages
      if (!res.ok) {
        if (res.status === 413) {
          toast.error(
            "Upload gagal: ukuran file terlalu besar (server menolak request). Kurangi ukuran file atau jumlah file."
          );
          return;
        }
        // Try to parse JSON error message if present
        try {
          const errJson = await res.json();
          const msg =
            errJson?.message ||
            errJson?.error ||
            `${res.status} ${res.statusText}`;
          toast.error(`Gagal mengupdate billing order: ${msg}`);
          console.error("Server error:", errJson);
        } catch (_e) {
          // non-JSON response
          toast.error(
            `Gagal mengupdate billing order (HTTP ${res.status} ${res.statusText})`
          );
        }
        return;
      }

      const json = await res.json();
      console.log("Server response:", json);

      if (json?.error) {
        toast.error(
          json.message || "Gagal mengupdate billing order (server error)"
        );
        console.error("API error:", json);
        return;
      }

      toast.success("Billing order updated successfully");
      console.log("Update successful, navigating to billing-summary");
      navigate("/billing-summary");
    } catch (err: unknown) {
      console.error("Error updating billing order:", err);
      // Network or CORS errors often surface as TypeError: Failed to fetch
      if (
        err instanceof TypeError &&
        String(err.message).toLowerCase().includes("failed to fetch")
      ) {
        toast.error(
          "Failed to connect to server. This could be due to: network connectivity issues, server being unreachable, or CORS policy blocking the request. Please check your internet connection or contact support if the issue persists."
        );
      } else if (err instanceof Error) {
        toast.error(`Failed to update billing order: ${err.message}`);
      } else {
        toast.error(
          "Failed to update billing order. Check browser console for details."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Note: send to COA is handled from Billing Summary 'Payment' button.

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header
          title="Edit Billing Order"
          description="Edit billing order details and send to COA"
        />

        <div className="p-8 max-w-4xl mx-auto">
          {initialLoading ? (
            <div className="text-gray-600 text-center mt-20">Loading...</div>
          ) : (
            <div className="bg-white shadow-sm rounded-2xl p-8 space-y-6 border border-gray-100">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="downPayment">
                    Down Payment Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="downPayment"
                    type="number"
                    value={downPayment}
                    onChange={(e) =>
                      setDownPayment(Number(e.target.value || 0))
                    }
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label>
                    Installment COA <span className="text-red-500">*</span>
                  </Label>
                  <CoaSelect
                    valueId={installmentCOAId}
                    valueLabel={installmentCOALabel ?? ""}
                    onSelect={(id, label) => {
                      const code = extractCodeFromLabel(label);
                      const name = extractNameFromLabel(label);
                      setInstallmentCOAId(id);
                      setInstallmentCOALabel(code); // hanya tampilkan kode COA
                      setInstallmentName(name); // sinkron ke nama
                    }}
                    placeholder="Select Installment COA"
                  />
                </div>

                <div>
                  <Label>
                    Installment Name <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={installmentName ?? ""}
                    onValueChange={(value) => {
                      setInstallmentName(value);
                      const matching = findCOAByName(value);
                      if (matching) {
                        const code = extractCodeFromLabel(
                          matching.label ??
                            `${matching.account_code} - ${matching.name}`
                        );
                        setInstallmentCOAId(
                          matching.id ?? matching.account_code
                        );
                        setInstallmentCOALabel(code); // hanya kode COA
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Installment Name" />
                    </SelectTrigger>
                    <SelectContent>
                      {((coaData as CoaOption[] | undefined) ?? []).map(
                        (coa) => {
                          const name = extractNameFromCOA(
                            coa.label ?? coa.name ?? ""
                          );
                          const key = (coa.id ??
                            (coa as { value?: string }).value ??
                            coa.account_code) as string | undefined;
                          return name && key ? (
                            <SelectItem key={key} value={name}>
                              {name}
                            </SelectItem>
                          ) : null;
                        }
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>
                    Payment COA <span className="text-red-500">*</span>
                  </Label>
                  <CoaSelect
                    valueId={paymentCOAId}
                    valueLabel={paymentCOALabel ?? ""}
                    onSelect={(id, label) => {
                      const code = extractCodeFromLabel(label);
                      const name = extractNameFromLabel(label);
                      setPaymentCOAId(id);
                      setPaymentCOALabel(code); // hanya kode COA
                      setPaymentName(name); // sinkron ke name
                    }}
                    placeholder="Select Payment COA"
                  />
                </div>

                <div>
                  <Label>
                    Payment Name <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={paymentName ?? ""}
                    onValueChange={(value) => {
                      setPaymentName(value);
                      const matching = findCOAByName(value);
                      if (matching) {
                        const code = extractCodeFromLabel(
                          matching.label ??
                            `${matching.account_code} - ${matching.name}`
                        );
                        setPaymentCOAId(matching.id ?? matching.account_code);
                        setPaymentCOALabel(code); // hanya kode COA
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Payment Name" />
                    </SelectTrigger>
                    <SelectContent>
                      {((coaData as CoaOption[] | undefined) ?? []).map(
                        (coa) => {
                          const name = extractNameFromCOA(
                            coa.label ?? coa.name ?? ""
                          );
                          const key = (coa.id ??
                            (coa as { value?: string }).value ??
                            coa.account_code) as string | undefined;
                          return name && key ? (
                            <SelectItem key={key} value={name}>
                              {name}
                            </SelectItem>
                          ) : null;
                        }
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="memo">Memo (Optional)</Label>
                  <Textarea
                    id="memo"
                    placeholder="Enter memo here..."
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label>Attachments (Optional)</Label>
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
                          toast.error(
                            `File '${
                              f.name
                            }' terlalu besar. Maks per-file ${Math.round(
                              MAX_FILE_SIZE / 1024 / 1024
                            )} MB.`
                          );
                          continue;
                        }
                        toAdd.push(f);
                      }
                      setAttachments((prev) => {
                        const merged = [...prev];
                        for (const f of toAdd) {
                          const exists = merged.some(
                            (m) =>
                              m.name === f.name &&
                              m.size === f.size &&
                              m.lastModified === f.lastModified
                          );
                          if (!exists) merged.push(f);
                        }
                        return merged;
                      });
                    }}
                    className="mt-2 block w-full"
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Maks per file: 10 MB. Total maksimal: 50 MB.
                  </p>

                  {/* Existing files list */}
                  {existingFiles && existingFiles.length > 0 ? (
                    <ul className="mt-2 divide-y rounded-md border p-2">
                      {existingFiles.map((path, idx) => {
                        const parts = String(path).split("/");
                        const name = parts[parts.length - 1] || path;
                        return (
                          <li
                            key={idx}
                            className="flex items-center justify-between py-2"
                          >
                            <div>
                              <div className="text-sm font-medium">{name}</div>
                              <div className="text-xs text-muted-foreground">
                                {path}
                              </div>
                            </div>
                            <div>
                              <button
                                type="button"
                                className="text-sm text-red-600 hover:underline"
                                onClick={() => {
                                  setFilesToDelete((s) => [...s, path]);
                                  setExistingFiles((s) =>
                                    s.filter((p) => p !== path)
                                  );
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

                  {/* New attachments list */}
                  {attachments.length > 0 ? (
                    <ul className="mt-2 divide-y rounded-md border p-2">
                      {attachments.map((f, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between py-2"
                        >
                          <div>
                            <div className="text-sm font-medium">{f.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {(f.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-sm text-red-600 hover:underline"
                            onClick={() => {
                              setAttachments((prev) =>
                                prev.filter((_, i) => i !== idx)
                              );
                            }}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditBillingOrder;
