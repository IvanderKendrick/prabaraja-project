import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreatePurchaseForm } from "../create/CreatePurchaseForm";
import { PurchaseType } from "@/types/purchase";

export default function EditInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Normalisasi items agar sesuai format PurchaseItemsForm
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
        name: it.item_name ?? "",
        sku: it.sku ?? "",
        memo: it.memo ?? "",
        coa: it.coa ?? "",
        quantity: it.qty ?? 1,
        unit: it.unit ?? "pcs",
        price: it.price ?? 0,
        return: it.return_unit ?? 0,
        stock: it.addToStock ?? it.checkbox ?? false,
        discountType: isRupiah ? "rupiah" : "percentage",
        discountPercent: isPercent ? it.disc_item ?? 0 : 0,
        discountPrice: isRupiah ? it.disc_item ?? 0 : 0,
        total_per_item: it.total_per_item ?? 0,
        coa: it.coa ?? "",
      };
    });
  };

  // 🔹 Normalisasi data invoice dari API
  const normalizeInvoiceData = (raw: any) => {
    if (!raw) return null;

    return {
      id: raw.id,
      number: raw.number ?? "",
      date: raw.date ?? "",
      due_date: raw.due_date ?? "",
      status: raw.status ?? "",
      approver: raw.approver ?? "",
      tags: Array.isArray(raw.tags) ? raw.tags : (raw.tags ?? "").split(","),
      items: normalizeItemsFromApi(raw.items || []),
      memo: raw.memo ?? "",
      attachment_url: raw.attachment_url ?? "",
      vendor_name: raw.vendor_name ?? "",
      vendor_address: raw.vendor_address ?? "",
      vendor_phone: raw.vendor_phone ?? "",
      vendor_coa: raw.vendor_COA ?? "",
      freight_in: raw.freight_in ?? 0,
      insurance: raw.insurance ?? 0,
      terms: raw.terms ?? "",
      tax_method: raw.tax_method ?? "Before Calculate",
      ppn_percentage: raw.ppn_percentage ?? 11,
      pph_type: raw.pph_type ?? "23",
      pph_percentage: raw.pph_percentage ?? 2,
      dpp: raw.dpp ?? 0,
      ppn: raw.ppn ?? 0,
      pph: raw.pph ?? 0,
      total: raw.total ?? 0,
      grand_total: raw.grand_total ?? 0,
    };
  };

  // 🔹 Fetch data by id
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = JSON.parse(
          localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token") || "{}"
        ).access_token;

        const res = await fetch(
          `https://pbw-backend-api.vercel.app/api/purchases?action=getInvoice&search=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          const normalized = normalizeInvoiceData(json.data[0]);
          setInitialData(normalized);
        } else {
          setInitialData(null);
        }
      } catch (e) {
        console.error("❌ Fetch Invoice Error:", e);
      }
    };

    fetchData();
  }, [id]);

  // 🔹 Handle submit (PUT editNewInvoice)
  const handleSubmit = async (formData: any) => {
    setIsLoading(true);

    try {
      const token = JSON.parse(
        localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token") || "{}"
      ).access_token;

      const apiFormData = new FormData();
      apiFormData.append("action", "editNewInvoice");
      apiFormData.append("type", "Invoice");
      apiFormData.append("id", id || "");

      apiFormData.append("date", formData.date || "");
      apiFormData.append("due_date", formData.dueDate || "");
      apiFormData.append("status", formData.status || "");
      apiFormData.append("number", formData.number || "");
      apiFormData.append("approver", formData.approver || "");
      apiFormData.append(
        "tags",
        Array.isArray(formData.tags)
          ? formData.tags.join(",")
          : formData.tags || ""
      );

      // items mapping
      const mappedItems = (formData.items || []).map((it: any) => {
        const dType =
          it.discountType ?? (it.discountPrice ? "rupiah" : "percentage");

        return {
          coa: it.coa ?? "",
          item_name: it.name ?? "",
          sku: it.sku ?? "",
          qty: it.quantity ?? 0,
          unit: it.unit ?? "pcs",
          price: it.price ?? 0,
          memo: it.memo ?? "",
          return_unit: it.return ?? 0,
          addToStock: it.stock ?? false,
          ...(dType === "percentage"
            ? {
                disc_item: it.discountPercent ?? 0,
                disc_item_type: "percentage",
              }
            : { disc_item: it.discountPrice ?? 0, disc_item_type: "rupiah" }),
        };
      });
      apiFormData.append("items", JSON.stringify(mappedItems));

      // vendor info
      apiFormData.append("vendor_name", formData.vendorName || "");
      apiFormData.append("vendor_address", formData.vendorAddress || "");
      apiFormData.append("vendor_phone", formData.vendorPhone || "");
      //   apiFormData.append("vendor_COA", formData.vendorCoa || "");
      apiFormData.append("vendor_COA", formData.vendorCoaAccountId || "");

      apiFormData.append("freight_in", String(formData.freightIn ?? 0));
      apiFormData.append("insurance", String(formData.insuranceCost ?? 0));
      apiFormData.append("terms", formData.terms || "");
      apiFormData.append("memo", formData.memo || "");

      // pajak
      apiFormData.append(
        "tax_method",
        formData.taxCalculationMethod ? "After Calculate" : "Before Calculate"
      );
      apiFormData.append(
        "ppn_percentage",
        String(formData.ppnPercentage ?? 11)
      );
      apiFormData.append(
        "pph_type",
        formData.pphType ? String(formData.pphType).replace(/[^\d]+/, "") : "23"
      );
      apiFormData.append("pph_percentage", String(formData.pphPercentage ?? 2));
      apiFormData.append("dpp", String(formData.dpp ?? 0));
      apiFormData.append("ppn", String(formData.ppn ?? 0));
      apiFormData.append("pph", String(formData.pph ?? 0));
      apiFormData.append(
        "total",
        String(formData.subtotalWithCosts ?? formData.total ?? 0)
      );
      apiFormData.append("grand_total", String(formData.grandTotal ?? 0));

      // file lama tetap
      if (initialData?.attachment_url) {
        apiFormData.append("filesToDelete", initialData.attachment_url);
      }

      // file baru
      (formData.attachmentFiles || []).forEach((file: File) =>
        apiFormData.append("attachment_url", file)
      );

      const res = await fetch(
        "https://pbw-backend-api.vercel.app/api/purchases",
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: apiFormData,
        }
      );

      const result = await res.json();
      console.log("✅ Invoice Updated:", result);
      navigate("/purchases/invoices");
    } catch (error) {
      console.error("❌ Failed Update Invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Invoice</h1>
      {initialData ? (
        <CreatePurchaseForm
          purchaseType={"invoice" as PurchaseType}
          setPurchaseType={() => {}}
          onSubmit={handleSubmit}
          initialData={initialData}
          isLoading={isLoading}
          isReadOnlyTypeAndNumber
          submitLabel="Update Invoice"
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
