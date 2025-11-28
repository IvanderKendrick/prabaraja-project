import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { CreatePurchaseForm } from "../create/CreatePurchaseForm";

export default function EditQuotationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const tokenKey = "sb-xwfkrjtqcqmmpclioakd-auth-token";

  const getAuthToken = () => {
    const raw = localStorage.getItem(tokenKey);
    if (!raw) throw new Error("No access token found");
    const parsed = JSON.parse(raw);
    return parsed.access_token;
  };

  // ✅ Fetch quotation by ID
  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const token = getAuthToken();
        const res = await axios.get(
          `https://pbw-backend-api.vercel.app/api/purchases?action=getQuotation&search=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.data?.data?.length) throw new Error("Quotation not found");
        setQuotation(res.data.data[0]);
      } catch (err: any) {
        console.error("Fetch failed:", err);
        toast.error(err.message || "Failed to fetch quotation data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchQuotation();
  }, [id]);

  // ✅ Handle update
  const handleUpdate = async (formData: any) => {
    try {
      setUpdating(true);
      const token = getAuthToken();
      const apiFormData = new FormData();

      // 🧱 action & type
      apiFormData.append("action", "editNewQuotation");
      apiFormData.append("type", "Quotation");

      // 🧾 Basic info
      apiFormData.append("id", quotation.id);
      apiFormData.append("number", formData.number || quotation.number);
      apiFormData.append(
        "quotation_date",
        formData.quotationDate || quotation.quotation_date
      );
      apiFormData.append("due_date", formData.dueDate || quotation.due_date);
      apiFormData.append("status", "Pending");
      apiFormData.append(
        "valid_until",
        formData.validUntil || quotation.valid_until
      );
      apiFormData.append("terms", formData.terms || quotation.terms || "");
      apiFormData.append("memo", formData.memo || quotation.memo || "");

      // 🧩 Vendor info
      apiFormData.append(
        "vendor_name",
        formData.vendorName || quotation.vendor_name || ""
      );
      apiFormData.append(
        "vendor_address",
        formData.vendorAddress || quotation.vendor_address || ""
      );
      apiFormData.append(
        "vendor_phone",
        formData.vendorPhone || quotation.vendor_phone || ""
      );
      apiFormData.append(
        "start_date",
        formData.startDate || quotation.start_date || ""
      );

      // 🏷️ Tags
      const tagsValue = Array.isArray(formData.tags)
        ? formData.tags.join(",")
        : formData.tags || quotation.tags?.join(",") || "";
      apiFormData.append("tags", tagsValue);

      // 🧮 Tax & totals
      apiFormData.append(
        "tax_method",
        formData.taxCalculationMethod ? "After Calculate" : "Before Calculate"
      );
      apiFormData.append(
        "total",
        (formData.total || quotation.grand_total || 0).toString()
      );
      apiFormData.append(
        "grand_total",
        (formData.grandTotal || quotation.grand_total || 0).toString()
      );
      apiFormData.append("dpp", (0).toString());
      apiFormData.append("ppn", (0).toString());
      apiFormData.append("pph", (0).toString());
      apiFormData.append("ppn_percentage", (0).toString());
      apiFormData.append("pph_percentage", (0).toString());
      apiFormData.append("pph_type", "custom");

      // 🧾 Items
      // const mappedItems = (formData.items || quotation.items || []).map(
      //   (it: any) => {
      //     const itemData: any = {
      //       item_name: it.name ?? it.item_name ?? "",
      //       qty: it.quantity ?? it.qty ?? 0,
      //       unit: it.unit ?? "pcs",
      //       price: it.price ?? 0,
      //     };

      //     // Tambahkan diskon jika ada
      //     if (it.discountPercent && it.discountPercent > 0) {
      //       itemData.disc_item = it.discountPercent;
      //       itemData.disc_item_type = "percentage";
      //     } else if (it.discountPrice && it.discountPrice > 0) {
      //       itemData.disc_item = it.discountPrice;
      //       itemData.disc_item_type = "rupiah";
      //     }

      //     return itemData;
      //   }
      // );

      // apiFormData.append("items", JSON.stringify(mappedItems));

      // Map items with discount support
      const mappedItems = (formData.items || []).map((it: any) => {
        const itemData: any = {
          item_name: it.name ?? it.item_name ?? "",
          qty: it.quantity ?? it.qty ?? 0,
          unit: it.unit ?? "kg",
          price: it.price ?? 0,
        };

        // Add discount if exists
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

      // 🖼️ Attachment handling
      const oldAttachment = quotation.attachment_url || "";
      apiFormData.append("filesToDelete", oldAttachment);

      if (formData.attachmentFiles && formData.attachmentFiles.length > 0) {
        apiFormData.append("attachment_url", formData.attachmentFiles[0]);
      }

      // 🚀 API call
      const res = await axios.put(
        "https://pbw-backend-api.vercel.app/api/purchases",
        apiFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && !res.data.error) {
        toast.success("Quotation updated successfully");
        navigate("/purchases/quotations");
      } else {
        throw new Error(res.data?.message || "Failed to update quotation");
      }
    } catch (err: any) {
      console.error("Update failed:", err);
      toast.error(err.message || "Failed to update quotation");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading quotation details...
      </div>
    );

  if (!quotation)
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Quotation not found or failed to load.
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Quotation</h1>
      <CreatePurchaseForm
        purchaseType="quotation"
        setPurchaseType={() => {}}
        isReadOnlyTypeAndNumber={true}
        onSubmit={handleUpdate}
        initialData={quotation}
        submitLabel={updating ? "Updating..." : "Update Quotation"}
      />
    </div>
  );
}
