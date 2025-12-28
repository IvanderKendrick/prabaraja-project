import { useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = "http://localhost:3000/api/sales";

export const useSalesDeleteActions = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const getAuthToken = () => {
    const authData = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
    if (authData) {
      const parsedData = JSON.parse(authData);
      return parsedData.access_token;
    }
    return null;
  };

  const deleteItem = async (action: string, id: string, itemType: string) => {
    setIsDeleting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found. Please login again.",
          variant: "destructive",
        });
        return false;
      }

      const response = await axios.delete(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          action,
          id,
        },
      });

      if (response.status === 200) {
        toast({
          title: `${itemType} deleted`,
          description: `The ${itemType.toLowerCase()} has been successfully deleted.`,
        });
        return true;
      }

      return false;
    } catch (error: any) {
      console.error(`Error deleting ${itemType}:`, error);
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to delete ${itemType.toLowerCase()}.`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteQuotation = (id: string) => {
    return deleteItem("deleteQuotation", id, "Quotation");
  };

  const deleteOrder = (id: string) => {
    return deleteItem("deleteOrder", id, "Order");
  };

  const deleteShipment = (id: string) => {
    return deleteItem("deleteShipment", id, "Shipment");
  };

  const deleteInvoice = (id: string) => {
    return deleteItem("deleteInvoice", id, "Invoice");
  };

  return {
    deleteQuotation,
    deleteOrder,
    deleteShipment,
    deleteInvoice,
    isDeleting,
  };
};
