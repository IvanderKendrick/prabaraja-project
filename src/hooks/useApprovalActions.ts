import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

// Action mapping for different approval types
export const APPROVAL_ACTIONS = {
  QUOTATION: {
    approve: "sendQuotationToOffer",
    reject: "rejectQuotation",
  },
  REQUEST: {
    approve: "sendRequestToOrder",
    reject: "rejectRequest",
  },
  SHIPMENT: {
    approve: "sendShipment",
    reject: "rejectShipment",
  },
  INVOICE: {
    approve: "sendInvoiceToCOA",
    reject: "rejectInvoice",
  },
  BILLING: {
    approve: "sendBillingToCOA",
    reject: "rejectBilling",
  },
} as const;

export type ApprovalType = keyof typeof APPROVAL_ACTIONS;

// Get auth token helper function
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

// Hook for handling approval actions
export const useApprovalActions = (type: ApprovalType) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async (id: string) => {
    try {
      setIsLoading(true);
      const token = getAuthToken();

      const response = await axios.post(
        "https://pbw-backend-api.vercel.app/api/purchases",
        {
          action: APPROVAL_ACTIONS[type].approve,
          id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && !response.data.error) {
        toast.success("Approval successful");
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to approve");
      }
    } catch (error) {
      console.error("Error approving:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || error.message || "Failed to approve";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to approve. Please try again.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setIsLoading(true);
      const token = getAuthToken();

      const response = await axios.patch(
        "https://pbw-backend-api.vercel.app/api/purchases",
        {
          action: APPROVAL_ACTIONS[type].reject,
          id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && !response.data.error) {
        toast.success("Rejection successful");
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to reject");
      }
    } catch (error) {
      console.error("Error rejecting:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || error.message || "Failed to reject";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to reject. Please try again.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleApprove,
    handleReject,
    isLoading,
  };
};
