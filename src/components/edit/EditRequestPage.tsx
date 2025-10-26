import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreatePurchaseForm } from "../create/CreatePurchaseForm";
import { PurchaseType } from "@/types/purchase";

export default function EditRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Normalisasi item agar langsung terbaca oleh PurchaseItemsForm
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
        sku: it.sku ?? "",
        quantity: it.qty ?? it.quantity ?? 1,
        unit: it.unit ?? "pcs",
        price: it.price ?? 0,
        // diskon siap pakai
        discountType: isRupiah ? "rupiah" : "percentage",
        discountPercent: isPercent ? it.disc_item ?? 0 : 0,
        discountPrice: isRupiah ? it.disc_item ?? 0 : 0,
        // opsi lain yang mungkin dipakai komponen
        stock: it.stock ?? false,
        return: it.return_unit ?? it.return ?? 0,
      };
    });
  };

  // ✅ Normalisasi payload API -> shape yang diharapkan CreatePurchaseForm
  const normalizeRequestData = (raw: any) => {
    if (!raw) return null;

    const items = normalizeItemsFromApi(raw.items || []);
    // tags: CreatePurchaseForm bisa terima string/array; state internal akan handle
    const tags = Array.isArray(raw.tags)
      ? raw.tags
      : (raw.tags ?? "").split(",").filter(Boolean);

    return {
      // yang dipakai CreatePurchaseForm
      number: raw.number ?? "",
      // penting: untuk request pakai `date`
      date: raw.date ?? "",
      // CreatePurchaseForm saat ini membaca `due_date` (snake)
      due_date: raw.due_date ?? "",
      status: raw.status ?? "",

      // vendor (CreatePurchaseForm membaca snake_case)
      vendor_name: raw.vendor_name ?? "",
      vendor_address: raw.vendor_address ?? "",
      vendor_phone: raw.vendor_phone ?? "",

      // khusus request (CreatePurchaseForm BUTUH nanti diisi via patch di bawah)
      requested_by: raw.requested_by ?? "",
      urgency: raw.urgency ?? "",
      installment_amount: raw.installment_amount ?? 0,

      // catatan & lampiran
      memo: raw.memo ?? "",
      attachment_url: raw.attachment_url ?? "",

      // pajak & total
      tax_method: raw.tax_method ?? "Before Calculate",
      ppn_percentage: raw.ppn_percentage ?? 11,
      pph_type: raw.pph_type ?? "23",
      pph_percentage: raw.pph_percentage ?? 2,
      dpp: raw.dpp ?? 0,
      ppn: raw.ppn ?? 0,
      pph: raw.pph ?? 0,
      total: raw.total ?? 0,
      grand_total: raw.grand_total ?? 0,

      // tags + items
      tags,
      items,
    };
  };

  // Fetch data by id
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = JSON.parse(
          localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token") || "{}"
        ).access_token;

        const res = await fetch(
          `https://pbw-backend-api.vercel.app/api/purchases?action=getRequest&search=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const json = await res.json();
        if (Array.isArray(json?.data) && json.data.length > 0) {
          setInitialData(normalizeRequestData(json.data[0]));
        } else {
          setInitialData(null);
        }
      } catch (e) {
        console.error(e);
        setInitialData(null);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const token = JSON.parse(
        localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token") || "{}"
      ).access_token;

      const apiFormData = new FormData();
      apiFormData.append("action", "editNewRequest");
      apiFormData.append("type", "Request");
      apiFormData.append("id", id || "");

      // --- map field inti yang backend minta secara eksplisit ---
      apiFormData.append("date", formData.date || "");
      apiFormData.append("due_date", formData.dueDate || "");
      apiFormData.append("status", (formData.status || "").toString());
      apiFormData.append("number", formData.number || "");

      apiFormData.append(
        "tags",
        Array.isArray(formData.tags)
          ? formData.tags.join(",")
          : formData.tags || ""
      );

      // items -> backend format
      const mappedItems = (formData.items || []).map((it: any) => {
        const dType =
          it.discountType ?? (it.discountPrice ? "rupiah" : "percentage");

        return {
          item_name: it.name ?? it.item_name ?? "",
          sku: it.sku ?? "",
          qty: it.quantity ?? it.qty ?? 0,
          unit: it.unit ?? "pcs",
          price: it.price ?? 0,
          ...(dType === "percentage"
            ? {
                disc_item: it.discountPercent ?? 0,
                disc_item_type: "percentage",
              }
            : { disc_item: it.discountPrice ?? 0, disc_item_type: "rupiah" }),
        };
      });
      apiFormData.append("items", JSON.stringify(mappedItems));

      // vendor
      apiFormData.append("vendor_name", formData.vendorName || "");
      apiFormData.append("vendor_address", formData.vendorAddress || "");
      apiFormData.append("vendor_phone", formData.vendorPhone || "");

      // request specifics
      apiFormData.append("requested_by", formData.requestedBy || "");
      apiFormData.append("urgency", formData.urgency || "");
      apiFormData.append(
        "installment_amount",
        String(formData.installmentAmount || 0)
      );

      // memo & attach
      apiFormData.append("memo", formData.memo || "");

      // pajak/total
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

      // ❗️Biarkan file lama (tidak dihapus)
      if (initialData?.attachment_url) {
        apiFormData.append("filesToDelete", initialData.attachment_url);
      }

      // lampirkan file baru (jika ada)
      (formData.attachmentFiles || []).forEach((file: File) => {
        apiFormData.append("attachment_url", file);
      });

      const res = await fetch(
        `https://pbw-backend-api.vercel.app/api/purchases`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: apiFormData,
        }
      );

      const result = await res.json();
      console.log("✅ Response:", result);
      navigate("/purchases/requests");
    } catch (error) {
      console.error("❌ Failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Request</h1>
      {initialData ? (
        <CreatePurchaseForm
          purchaseType={"request" as PurchaseType}
          setPurchaseType={() => {}}
          onSubmit={handleSubmit}
          initialData={initialData}
          isLoading={isLoading}
          isReadOnlyTypeAndNumber
          submitLabel="Update Request"
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
