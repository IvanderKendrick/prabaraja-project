import { toast } from "@/components/ui/use-toast";
import axios from "axios";

export type ApprovalSalesType = "QUOTATION" | "ORDER" | "INVOICE";

// Get auth token helper function
const getAuthToken = () => {
  const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!authDataRaw) {
    console.warn("No access token found in localStorage");
    return null;
  }
  const authData = JSON.parse(authDataRaw);
  return authData.access_token || null;
};

export const useApprovalSalesActions = (type: ApprovalSalesType) => {
  const handleApprove = async (id: string): Promise<boolean> => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Determine action based on type
      let action = "";
      let itemType = "";

      switch (type) {
        case "QUOTATION":
          action = "sendQuotationToOffer";
          itemType = "quotation";
          break;
        case "ORDER":
          action = "sendOrder";
          itemType = "order";
          break;
        case "INVOICE":
          action = "sendInvoiceToCOA";
          itemType = "invoice";
          break;
      }

      const response = await axios.post("https://pbw-backend-api.vercel.app/api/sales", { id, action }, { headers });

      if (response.data?.error) {
        throw new Error(response.data.message || "Failed to approve");
      }

      toast({
        title: "Success",
        description: `Sales ${itemType} approved successfully`,
      });

      return true;
    } catch (err) {
      console.error("Error approving:", err);

      let errorMessage = "Failed to approve";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  };

  const handleReject = async (id: string): Promise<boolean> => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Determine action based on type
      let action = "";
      let itemType = "";

      switch (type) {
        case "QUOTATION":
          action = "rejectQuotation";
          itemType = "quotation";
          break;
        case "ORDER":
          action = "rejectOrder";
          itemType = "order";
          break;
        case "INVOICE":
          action = "rejectInvoice";
          itemType = "invoice";
          break;
      }

      const response = await axios.patch("https://pbw-backend-api.vercel.app/api/sales", { id, action }, { headers });

      if (response.data?.error) {
        throw new Error(response.data.message || "Failed to reject");
      }

      toast({
        title: "Success",
        description: `Sales ${itemType} rejected successfully`,
      });

      return true;
    } catch (err) {
      console.error("Error rejecting:", err);

      let errorMessage = "Failed to reject";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  };

  return {
    handleApprove,
    handleReject,
  };
};
