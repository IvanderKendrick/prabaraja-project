import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { CreatePurchaseForm } from "../create/CreatePurchaseForm";
import { PurchaseType } from "@/types/purchase";
import { toast } from "sonner";
import axios from "axios";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function EditShipmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 Normalisasi items dari API agar sesuai PurchaseItemsForm
  const normalizeItemsFromApi = (raw: any[] = []) => {
    return raw.map((it) => {
      const isPercent = it.disc_item_type === "percentage";
      const isRupiah = it.disc_item_type === "rupiah";

      return {
        id: it.id ?? (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
        name: it.item_name ?? "",
        sku: it.sku ?? "",
        memo: it.memo ?? "",
        quantity: it.qty ?? 1,
        unit: it.unit ?? "pcs",
        price: it.price ?? 0,
        return: it.return_unit ?? 0,
        discountType: isRupiah ? "rupiah" : "percentage",
        discountPercent: isPercent ? it.disc_item ?? 0 : 0,
        discountPrice: isRupiah ? it.disc_item ?? 0 : 0,
        total_per_item: it.total_per_item ?? 0,
      };
    });
  };

  // 🔹 Normalisasi data shipment dari API ke struktur CreatePurchaseForm
  const normalizeShipmentData = (raw: any) => {
    if (!raw) return null;

    return {
      id: raw.id,
      number: raw.number ?? "",
      date: raw.date ?? "",
      due_date: raw.due_date ?? "",
      status: raw.status ?? "",
      tags: Array.isArray(raw.tags) ? raw.tags : (raw.tags ?? "").split(","),
      items: normalizeItemsFromApi(raw.items || []),
      memo: raw.memo ?? "",
      attachment_url: raw.attachment_url ?? "",
      vendor_name: raw.vendor_name ?? "",
      vendor_address: raw.vendor_address ?? "",
      vendor_phone: raw.vendor_phone ?? "",

      // khusus shipment
      tracking_number: raw.tracking_number ?? "",
      carrier: raw.carrier ?? "",
      shipping_date: raw.shipping_date ?? "",

      // pajak
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

  // 🔹 Fetch data shipment berdasarkan ID
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = JSON.parse(localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token") || "{}").access_token;

        const res = await fetch(`https://pbw-backend-api.vercel.app/api/purchases?action=getShipment&search=${id}`, { headers: { Authorization: `Bearer ${token}` } });

        const json = await res.json();
        if (Array.isArray(json?.data) && json.data.length > 0) {
          setInitialData(normalizeShipmentData(json.data[0]));
        } else {
          setInitialData(null);
        }
      } catch (error) {
        console.error("❌ Gagal fetch shipment:", error);
        setInitialData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 🔹 Submit update shipment
  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token") || "{}").access_token;

      const apiFormData = new FormData();
      apiFormData.append("action", "editNewShipment");
      apiFormData.append("type", "Shipment");
      apiFormData.append("id", id || "");

      // Field utama
      apiFormData.append("date", formData.date || "");
      apiFormData.append("due_date", formData.dueDate || "");
      apiFormData.append("status", "Pending");
      apiFormData.append("number", formData.number || "");

      apiFormData.append("tags", Array.isArray(formData.tags) ? formData.tags.join(",") : formData.tags || "");

      // items mapping
      // const mappedItems = (formData.items || []).map((it: any) => {
      //   const dType =
      //     it.discountType ?? (it.discountPrice ? "rupiah" : "percentage");
      //   return {
      //     item_name: it.name ?? "",
      //     sku: it.sku ?? "",
      //     qty: it.quantity ?? 0,
      //     unit: it.unit ?? "pcs",
      //     price: it.price ?? 0,
      //     memo: it.memo ?? "",
      //     return_unit: it.return ?? 0,
      //     ...(dType === "percentage"
      //       ? {
      //           disc_item: it.discountPercent ?? 0,
      //           disc_item_type: "percentage",
      //         }
      //       : { disc_item: it.discountPrice ?? 0, disc_item_type: "rupiah" }),
      //   };
      // });
      // apiFormData.append("items", JSON.stringify(mappedItems));

      const mappedItems = (formData.items || []).map((it: any) => {
        const itemData: any = {
          item_name: it.name ?? it.item_name ?? "", // nama item
          sku: it.sku ?? "", // kode SKU
          qty: it.quantity ?? it.qty ?? 0, // jumlah
          unit: it.unit ?? "pcs", // satuan
          price: it.price ?? 0, // harga
          return_unit: it.return ?? it.return_unit ?? 0, // jumlah retur (default 0)
          memo: it.memo ?? "-", // catatan per item
        };

        // Handle discount (percentage or rupiah)
        if (it.discountPercent && it.discountPercent > 0) {
          itemData.disc_item = it.discountPercent;
          itemData.disc_item_type = "percentage";
        } else if (it.discountPrice && it.discountPrice > 0) {
          itemData.disc_item = it.discountPrice;
          itemData.disc_item_type = "rupiah";
        }

        return itemData;
      });

      apiFormData.append("items", JSON.stringify(mappedItems));

      // vendor info
      apiFormData.append("vendor_name", formData.vendorName || "");
      apiFormData.append("vendor_address", formData.vendorAddress || "");
      apiFormData.append("vendor_phone", formData.vendorPhone || "");

      // shipment specific
      apiFormData.append("tracking_number", formData.trackingNumber || "");
      apiFormData.append("carrier", formData.carrier || "");
      apiFormData.append("shipping_date", formData.shippingDate || "");

      // memo
      apiFormData.append("memo", formData.memo || "");

      // pajak dan total
      apiFormData.append("tax_method", formData.taxCalculationMethod ? "After Calculate" : "Before Calculate");
      apiFormData.append("ppn_percentage", String(formData.ppnPercentage ?? 11));
      apiFormData.append("pph_type", formData.pphType ? String(formData.pphType).replace(/[^\d]+/, "") : "23");
      apiFormData.append("pph_percentage", String(formData.pphPercentage ?? 2));
      apiFormData.append("dpp", String(formData.dpp ?? 0));
      apiFormData.append("ppn", String(formData.ppn ?? 0));
      apiFormData.append("pph", String(formData.pph ?? 0));
      apiFormData.append("total", String(formData.subtotalWithCosts ?? formData.total ?? 0));
      apiFormData.append("grand_total", String(formData.grandTotal ?? 0));

      // biarkan file lama tetap
      if (initialData?.attachment_url) {
        apiFormData.append("filesToDelete", initialData.attachment_url);
      }

      // upload file baru
      (formData.attachmentFiles || []).forEach((file: File) => {
        apiFormData.append("attachment_url", file);
      });

      //   const res = await fetch(
      //     "https://pbw-backend-api.vercel.app/api/purchases",
      //     {
      //       method: "PUT",
      //       headers: { Authorization: `Bearer ${token}` },
      //       body: apiFormData,
      //     }
      //   );

      //   const result = await res.json();
      //   console.log("✅ Shipment updated:", result);
      //   navigate("/purchases/shipments");
      // } catch (error) {
      //   console.error("❌ Gagal update shipment:", error);
      // } finally {
      //   setIsLoading(false);
      // }

      // 🚀 API call pakai axios
      const res = await axios.put("https://pbw-backend-api.vercel.app/api/purchases", apiFormData, { headers: { Authorization: `Bearer ${token}` } });

      // ✅ Cek hasil respons
      if (res.data && !res.data.error) {
        toast.success("Shipment updated successfully");
        console.log("✅ Shipment updated:", res.data);
        navigate("/purchases/shipments");
      } else {
        throw new Error(res.data?.message || "Failed to update shipment");
      }
    } catch (err: any) {
      console.error("❌ Failed to update shipment:", err);
      toast.error(err.message || "Failed to update shipment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title={`Edit Shipment ${initialData?.number || ""}`} description="Edit purchase shipment" />
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Loading shipment details...
              </div>
            ) : initialData ? (
              <CreatePurchaseForm purchaseType={"shipment" as PurchaseType} setPurchaseType={() => {}} onSubmit={handleSubmit} initialData={initialData} isLoading={isLoading} isReadOnlyTypeAndNumber submitLabel="Update Shipment" />
            ) : (
              <div className="text-center py-20 text-gray-500">Shipment not found or failed to load.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
