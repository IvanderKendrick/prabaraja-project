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
      apiFormData.append("status", formData.status || quotation.status);
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
        (formData.total || quotation.total || 0).toString()
      );
      apiFormData.append(
        "grand_total",
        (formData.grandTotal || quotation.grand_total || 0).toString()
      );
      apiFormData.append(
        "dpp",
        (formData.dpp || quotation.dpp || 0).toString()
      );
      apiFormData.append(
        "ppn",
        (formData.ppn || quotation.ppn || 0).toString()
      );
      apiFormData.append(
        "pph",
        (formData.pph || quotation.pph || 0).toString()
      );
      apiFormData.append(
        "ppn_percentage",
        (formData.ppnPercentage || quotation.ppn_percentage || 11).toString()
      );
      apiFormData.append(
        "pph_percentage",
        (formData.pphPercentage || quotation.pph_percentage || 2).toString()
      );
      apiFormData.append(
        "pph_type",
        (formData.pphType || quotation.pph_type || "23").toString()
      );

      // 🧾 Items
      const mappedItems = (formData.items || quotation.items || []).map(
        (it: any) => {
          const itemData: any = {
            item_name: it.item_name || it.name || "",
            qty: it.qty || it.quantity || 0,
            unit: it.unit || "pcs",
            price: it.price || 0,
          };
          if (it.disc_item && it.disc_item_type) {
            itemData.disc_item = it.disc_item;
            itemData.disc_item_type = it.disc_item_type;
          }
          return itemData;
        }
      );
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
        navigate(`/purchase-quotations/${id}`);
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
