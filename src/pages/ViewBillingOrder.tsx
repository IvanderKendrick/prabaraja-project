import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPriceWithSeparator } from "@/utils/salesUtils";

interface BillingItem {
  qty: number;
  sku: string;
  unit: string;
  price: number;
  disc_item: number;
  item_name: string;
  disc_item_type: "percentage" | "rupiah";
  total_per_item: number;
}

interface BillingOrderDetails {
  id: string;
  vendor_name: string;
  order_date: string;
  number: string;
  memo: string;
  attachment_url: string;
  items: BillingItem[];
  installment_name: string;
  installment_amount: number;
  installment_COA: string;
  payment_name: string;
  payment_COA: string;
  status: string;
  ppn: number;
  paid_amount: number;
  grand_total: number;
}

const getAuthToken = () => {
  const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!authDataRaw) throw new Error("No access token found in localStorage");
  const authData = JSON.parse(authDataRaw);
  const token = authData.access_token;
  if (!token) throw new Error("Access token missing in parsed auth data");
  return token;
};

const ViewBillingOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BillingOrderDetails | null>(null);

  useEffect(() => {
    const fetchBillingDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = getAuthToken();
        const url = new URL("https://pbw-backend-api.vercel.app/api/purchases");
        url.searchParams.set("action", "getBillingOrder");
        url.searchParams.set("search", id || "");

        console.log("Fetching URL:", url.toString());
        console.log("With token:", token);

        const res = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();
        console.log("Raw API Response:", json);

        if (json.error) throw new Error(json.message || "Failed to fetch billing details");

        // Data comes in an array, get the first item
        const billingData = json.data?.[0];
        console.log("Processed data:", billingData);

        if (!billingData) throw new Error("No data received from server");

        // Validate required fields and show which fields are missing
        const missingFields = [];
        if (!billingData.id) missingFields.push("id");
        if (!billingData.vendor_name) missingFields.push("vendor_name");
        if (!billingData.number) missingFields.push("number");

        if (missingFields.length > 0) {
          console.log("Missing fields from data:", missingFields);
          console.log("Available fields:", Object.keys(billingData));
          throw new Error(`Incomplete billing data received. Missing fields: ${missingFields.join(", ")}`);
        }

        setData(billingData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBillingDetails();
    }
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!data) {
    return <div className="text-gray-500 p-4">No billing data found</div>;
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header title="View Billing Order" description={`Details for billing order ${data.number}`} />

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Basic Information</CardTitle>
              <button onClick={() => navigate("/billing-summary")} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2 text-sm font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Billing Summary
              </button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Vendor Name</p>
                <p className="mt-1">{data.vendor_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Order Date</p>
                <p className="mt-1">{data.order_date && !isNaN(new Date(data.order_date).getTime()) ? format(new Date(data.order_date), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Transaction Number</p>
                <p className="mt-1">{data.number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                    data.status?.toLowerCase() === "completed"
                      ? "bg-green-100 text-green-800"
                      : data.status?.toLowerCase() === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : data.status?.toLowerCase() === "unpaid" || data.status?.toLowerCase() === "paid"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {data.status}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Memo</p>
                <p className="mt-1">{data.memo || "-"}</p>
              </div>
              <div className="col-span-2">{/* Attachments removed as per UI request */}</div>
            </CardContent>
          </Card>

          {/* Billing Items */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Billing Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>Rp {formatPriceWithSeparator(item.price)}</TableCell>
                      <TableCell>
                        {item.disc_item} {item.disc_item_type === "percentage" ? "%" : "Rp"}
                      </TableCell>
                      <TableCell>Rp {formatPriceWithSeparator(item.total_per_item)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Installment Name</p>
                <p className="mt-1">{data.installment_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Installment Amount</p>
                <p className="mt-1">Rp {formatPriceWithSeparator(data.installment_amount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Installment COA</p>
                <p className="mt-1">{data.installment_COA}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Name</p>
                <p className="mt-1">{data.payment_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Payment COA</p>
                <p className="mt-1">{data.payment_COA}</p>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">PPN</p>
                <p className="mt-1">Rp {formatPriceWithSeparator(data.ppn)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                <p className="mt-1">Rp {formatPriceWithSeparator(data.paid_amount)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewBillingOrder;
