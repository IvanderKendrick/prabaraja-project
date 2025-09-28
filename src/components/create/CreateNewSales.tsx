import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Truck,
  User,
  Calendar,
  CreditCard,
  Package,
  Tag,
  MapPin,
  FileText,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import CustomerInfoSection from "@/components/sales/CustomerInfoSection";
import SalesItemsSection from "@/components/sales/SalesItemsSection";
import { SalesTaxCalculation } from "@/components/sales/SalesTaxCalculation";
import { formatPriceWithSeparator } from "@/utils/salesUtils";
import { useCreateSale } from "@/hooks/useSales";
import {
  useCreateOrderDelivery,
  useCreateQuotation,
} from "@/hooks/useSalesData";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SalesItemType {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
}

// Mock data for product catalog
const productCatalog = [
  { id: "prod-1", name: "Laptop Dell XPS 13", price: 15000000 },
  { id: "prod-2", name: "iPhone 15 Pro", price: 18000000 },
  { id: "prod-3", name: "Samsung Galaxy S24", price: 12000000 },
  { id: "prod-4", name: "Mechanical Keyboard", price: 1500000 },
  { id: "prod-5", name: "Wireless Mouse", price: 500000 },
  { id: "prod-6", name: "27-inch Monitor", price: 3500000 },
  { id: "prod-7", name: "Wireless Earbuds", price: 2000000 },
  { id: "prod-8", name: "USB-C Hub", price: 750000 },
];

interface LocationState {
  type: "delivery" | "order" | "quotation";
}

// Status data with colors and icons for Orders
const statusOptions = {
  pending_payment: {
    label: "Pending Payment",
    icon: <Clock className="h-4 w-4 text-amber-500" />,
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  in_progress: {
    label: "In Progress",
    icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  shipped: {
    label: "Shipped",
    icon: <Truck className="h-4 w-4 text-purple-500" />,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  delivered: {
    label: "Delivered",
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="h-4 w-4 text-red-500" />,
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

// Status data for Quotations with colors and icons
const quotationStatusOptions = {
  sent: {
    label: "Sent",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  accepted: {
    label: "Accepted",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle className="h-4 w-4" />,
    color: "bg-red-100 text-red-800 border-red-200",
  },
  expired: {
    label: "Expired",
    icon: <Clock className="h-4 w-4" />,
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  valid_until: {
    label: "Valid Until",
    icon: <Calendar className="h-4 w-4" />,
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
};

// Shipping method data with icons
const shippingMethods = [
  {
    value: "standard_courier",
    label: "Standard Courier",
    icon: <Truck className="h-4 w-4 text-blue-500" />,
  },
  {
    value: "express_courier",
    label: "Express Courier",
    icon: <Truck className="h-4 w-4 text-purple-600" />,
  },
  {
    value: "in_store_pickup",
    label: "In-store Pickup",
    icon: <MapPin className="h-4 w-4 text-green-500" />,
  },
  {
    value: "self_delivery",
    label: "Self-Delivery",
    icon: <Package className="h-4 w-4 text-amber-500" />,
  },
];

// Payment method data with icons
const paymentMethods = [
  {
    value: "credit_card",
    label: "Credit Card",
    icon: <CreditCard className="h-4 w-4 text-blue-500" />,
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    icon: <FileText className="h-4 w-4 text-green-500" />,
  },
  {
    value: "cash_on_delivery",
    label: "Cash on Delivery",
    icon: <Package className="h-4 w-4 text-amber-500" />,
  },
  {
    value: "digital_wallet",
    label: "Digital Wallet",
    icon: <User className="h-4 w-4 text-purple-500" />,
  },
];

const CreateNewSales = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { type = "delivery" } = (location.state as LocationState) || {};
  const { user } = useAuth();

  // Mutation hooks
  const createSale = useCreateSale();
  const createOrderDelivery = useCreateOrderDelivery();
  const createQuotation = useCreateQuotation();

  const [customerName, setCustomerName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState(
    type === "order"
      ? "pending_payment"
      : type === "quotation"
      ? "sent"
      : "unpaid"
  );
  const [items, setItems] = useState<SalesItemType[]>([
    { id: "1", name: "", quantity: 1, price: 0, discount: 0 },
  ]);

  // For Order & Delivery specific fields
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [shippingMethod, setShippingMethod] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");

  // For Quotation specific fields
  const [validUntil, setValidUntil] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");

  // Tax calculation state
  const [taxData, setTaxData] = useState({
    dpp: 0,
    ppn: 0,
    pph: 0,
    grandTotal: 0,
  });

  const [isFormValid, setIsFormValid] = useState(false);

  // Get page title based on type
  const getPageTitle = () => {
    switch (type) {
      case "delivery":
        return "Create Sales Invoice";
      case "order":
        return "Create Order & Delivery";
      case "quotation":
        return "Create Quotation";
      default:
        return "Create New Sales";
    }
  };

  useEffect(() => {
    // Generate a unique number for each document type
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    let generatedNumber;

    if (type === "order") {
      generatedNumber = `${timestamp}${randomNum}`;
    } else if (type === "quotation") {
      generatedNumber = `${timestamp}${randomNum}`;
    } else {
      generatedNumber = `${timestamp}${randomNum}`;
    }

    setInvoiceNumber(generatedNumber);

    // Set current date as default for invoice date
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setInvoiceDate(formattedDate);

    // Set default due date 14 days from now
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);
    setDueDate(dueDate.toISOString().split("T")[0]);

    // For quotation, set valid until date 30 days from now
    if (type === "quotation") {
      const validUntilDate = new Date();
      validUntilDate.setDate(today.getDate() + 30);
      setValidUntil(validUntilDate.toISOString().split("T")[0]);
    }

    // For order, set delivery date 7 days from now
    if (type === "order") {
      const deliveryDate = new Date();
      deliveryDate.setDate(today.getDate() + 7);
      setDueDate(deliveryDate.toISOString().split("T")[0]);
      setStatus("pending_payment");
    }
  }, [type]);

  useEffect(() => {
    // Set overflow hidden on html element
    const htmlElement = document.documentElement;
    htmlElement.style.overflow = "hidden";

    // Cleanup function to restore overflow when component unmounts
    return () => {
      htmlElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    // Validate form based on type
    const validateForm = () => {
      const commonFieldsValid =
        customerName !== "" && invoiceNumber !== "" && invoiceDate !== "";

      const itemsValid =
        items.length > 0 &&
        items.every(
          (item) => item.name !== "" && item.quantity > 0 && item.price > 0
        );

      switch (type) {
        case "delivery":
          return commonFieldsValid && dueDate !== "" && itemsValid;

        case "order":
          return (
            commonFieldsValid &&
            dueDate !== "" &&
            customerAddress !== "" &&
            customerPhone !== "" &&
            customerEmail !== "" &&
            shippingMethod !== "" &&
            paymentMethod !== "" &&
            itemsValid
          );

        case "quotation":
          return commonFieldsValid && validUntil !== "" && itemsValid;

        default:
          return false;
      }
    };

    setIsFormValid(validateForm());
  }, [
    customerName,
    invoiceNumber,
    invoiceDate,
    dueDate,
    items,
    type,
    customerAddress,
    customerPhone,
    customerEmail,
    shippingMethod,
    paymentMethod,
    validUntil,
  ]);

  // Calculate total with consideration for discounts
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const itemSubtotal = item.quantity * item.price;
      if (item.discount && item.discount > 0) {
        return total + (itemSubtotal - itemSubtotal * (item.discount / 100));
      }
      return total + itemSubtotal;
    }, 0);
  };

  // Handle tax calculation changes
  const handleTaxChange = (newTaxData: typeof taxData) => {
    setTaxData(newTaxData);
  };

  const formatPrice = (price: number) => {
    return formatPriceWithSeparator(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const calculatedTotal =
        type === "delivery" || type === "order" || type === "quotation"
          ? taxData.grandTotal || calculateTotal()
          : calculateTotal();
      const numericInvoiceNumber = parseInt(invoiceNumber);

      if (type === "delivery") {
        // Create Sales Invoice - map status to correct type
        let saleStatus: "Paid" | "Unpaid" | "Late Payment" | "Awaiting Payment";

        switch (status) {
          case "unpaid":
            saleStatus = "Unpaid";
            break;
          case "pending_payment":
            saleStatus = "Awaiting Payment";
            break;
          case "in_progress":
            saleStatus = "Awaiting Payment";
            break;
          default:
            saleStatus = "Unpaid";
        }

        const saleData = {
          number: numericInvoiceNumber,
          customer_name: customerName,
          invoice_date: invoiceDate,
          due_date: dueDate,
          status: saleStatus,
          items: items,
          grand_total: calculatedTotal,
          tax_details: taxData,
        };

        await createSale.mutateAsync(saleData);
        toast.success("Sales Invoice created successfully!");
      } else if (type === "order") {
        // Create Order Delivery
        const orderData = {
          number: numericInvoiceNumber,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          order_date: invoiceDate,
          delivery_date: dueDate,
          status:
            status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
          tracking_number: trackingNumber || `TRK-${Date.now()}`,
          shipping_address: customerAddress,
          shipping_method: shippingMethod,
          payment_method: paymentMethod,
          items: items,
          grand_total: calculatedTotal,
          notes: notes || null,
          tax_details: taxData,
        };

        await createOrderDelivery.mutateAsync(orderData);
        toast.success("Order & Delivery created successfully!");
      } else if (type === "quotation") {
        // Create Quotation
        const quotationData = {
          number: numericInvoiceNumber,
          customer_name: customerName,
          quotation_date: invoiceDate,
          valid_until: validUntil,
          status: "Sent",
          items: items,
          total: calculatedTotal,
          terms: termsAndConditions || null,
          tax_details: taxData,
        };

        await createQuotation.mutateAsync(quotationData);
        toast.success("Quotation created successfully!");
      }

      navigate("/sales");
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("Failed to create document. Please try again.");
    }
  };

  // Get the current status object from options
  const getCurrentStatusObject = () => {
    if (type === "quotation") {
      return quotationStatusOptions[status] || quotationStatusOptions.sent;
    }
    return statusOptions[status] || statusOptions.pending_payment;
  };

  // Render additional fields based on the document type
  const renderTypeSpecificFields = () => {
    switch (type) {
      case "order":
        return (
          <div className="space-y-4 bg-white p-6 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-medium">Shipping Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="trackingNumber"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Tag className="h-4 w-4 text-indigo-500" />
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  id="trackingNumber"
                  className="w-full p-2 border rounded-md"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number if available"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="status"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  Order Status
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <Badge
                        className={`flex items-center gap-2 ${
                          getCurrentStatusObject().color
                        }`}
                      >
                        {getCurrentStatusObject().icon}
                        <span>{getCurrentStatusObject().label}</span>
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusOptions).map(
                      ([value, { label, icon, color }]) => (
                        <SelectItem
                          key={value}
                          value={value}
                          className="flex items-center gap-2"
                        >
                          <Badge className={`flex items-center gap-2 ${color}`}>
                            {icon}
                            <span>{label}</span>
                          </Badge>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="shippingMethod"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Truck className="h-4 w-4 text-indigo-500" />
                  Shipping Method
                </label>
                <Select
                  value={shippingMethod}
                  onValueChange={setShippingMethod}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select shipping method">
                      {shippingMethod && (
                        <div className="flex items-center gap-2">
                          {
                            shippingMethods.find(
                              (m) => m.value === shippingMethod
                            )?.icon
                          }
                          <span>
                            {
                              shippingMethods.find(
                                (m) => m.value === shippingMethod
                              )?.label
                            }
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {shippingMethods.map(({ value, label, icon }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          {icon}
                          <span>{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="paymentMethod"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4 text-indigo-500" />
                  Payment Method
                </label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment method">
                      {paymentMethod && (
                        <div className="flex items-center gap-2">
                          {
                            paymentMethods.find(
                              (m) => m.value === paymentMethod
                            )?.icon
                          }
                          <span>
                            {
                              paymentMethods.find(
                                (m) => m.value === paymentMethod
                              )?.label
                            }
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(({ value, label, icon }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          {icon}
                          <span>{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case "quotation":
        return (
          <div className="space-y-4 bg-white p-6 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-medium">Quotation Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="validUntil"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Valid Until
                </label>
                <input
                  type="date"
                  id="validUntil"
                  className="w-full p-2 border rounded-md"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="quotationStatus"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-blue-500" />
                  Status
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {getCurrentStatusObject().icon}
                        <span>{getCurrentStatusObject().label}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    {Object.entries(quotationStatusOptions).map(
                      ([value, { label, icon, color }]) => (
                        <SelectItem
                          key={value}
                          value={value}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${color}`}
                            >
                              {icon}
                              <span>{label}</span>
                            </div>
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="termsAndConditions"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-blue-500" />
                  Terms and Conditions
                </label>
                <textarea
                  id="termsAndConditions"
                  className="w-full p-2 border rounded-md"
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getPageTitle()}
          description={
            type === "delivery"
              ? "Fill out details to create a new sales invoice"
              : type === "order"
              ? "Create and track orders for customers"
              : "Create price quotes for potential customers"
          }
        />

        <div className="p-6 flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <CustomerInfoSection
                customerName={customerName}
                setCustomerName={setCustomerName}
                invoiceNumber={invoiceNumber}
                setInvoiceNumber={setInvoiceNumber}
                invoiceDate={invoiceDate}
                setInvoiceDate={setInvoiceDate}
                dueDate={dueDate}
                setDueDate={setDueDate}
                status={status}
                setStatus={setStatus}
                type={type}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
                customerEmail={customerEmail}
                setCustomerEmail={setCustomerEmail}
                customerAddress={customerAddress}
                setCustomerAddress={setCustomerAddress}
                shippingMethod={shippingMethod}
                setShippingMethod={setShippingMethod}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                notes={notes}
                setNotes={setNotes}
              />

              {/* Render type-specific fields */}
              {renderTypeSpecificFields()}

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-medium">Order Items</h2>
                </div>
                <SalesItemsSection
                  items={items}
                  setItems={setItems}
                  calculateTotal={calculateTotal}
                  formatPrice={formatPrice}
                  allowProductSearch={type === "order"}
                  availableProducts={productCatalog}
                />
              </div>

              {/* Tax Calculation Section - only for Sales Invoices, Order & Delivery, and Quotations */}
              {(type === "delivery" ||
                type === "order" ||
                type === "quotation") && (
                <SalesTaxCalculation
                  subtotal={calculateTotal()}
                  onTaxChange={handleTaxChange}
                />
              )}

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-lg font-medium">Order Summary</h2>
                  </div>
                  <Badge className={getCurrentStatusObject().color}>
                    <div className="flex items-center gap-1">
                      {getCurrentStatusObject().icon}
                      <span>{getCurrentStatusObject().label}</span>
                    </div>
                  </Badge>
                </div>

                <div className="flex justify-end mt-4 space-x-4">
                  <h3 className="text-lg font-medium">
                    Total: Rp {formatPrice(calculateTotal())}
                  </h3>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/sales")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={
                    type === "order"
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : type === "quotation"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }
                  disabled={!isFormValid}
                >
                  Create{" "}
                  {type === "delivery"
                    ? "Invoice"
                    : type === "order"
                    ? "Order"
                    : "Quotation"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNewSales;
