
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import ChevronDropdown from "@/components/ChevronDropdown";
import { Check, ChevronDown, Search, Phone, Mail, Home, Plus, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useContacts } from "@/hooks/useContacts";

interface CustomerInfoSectionProps {
  customerName: string;
  setCustomerName: (name: string) => void;
  invoiceNumber: string;
  setInvoiceNumber: (number: string) => void;
  invoiceDate: string;
  setInvoiceDate: (date: string) => void;
  dueDate: string;
  setDueDate: (date: string) => void;
  status: string;
  setStatus: (status: string) => void;
  type?: "delivery" | "order" | "quotation";
  // New fields for Order & Delivery
  customerPhone?: string;
  setCustomerPhone?: (phone: string) => void;
  customerEmail?: string;
  setCustomerEmail?: (email: string) => void;
  customerAddress?: string;
  setCustomerAddress?: (address: string) => void;
  shippingMethod?: string;
  setShippingMethod?: (method: string) => void;
  paymentMethod?: string;
  setPaymentMethod?: (method: string) => void;
  notes?: string;
  setNotes?: (notes: string) => void;
}

const CustomerInfoSection = ({
  customerName,
  setCustomerName,
  invoiceNumber,
  setInvoiceNumber,
  invoiceDate,
  setInvoiceDate,
  dueDate,
  setDueDate,
  status,
  setStatus,
  type = "delivery",
  // New props for Order & Delivery
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  customerAddress,
  setCustomerAddress,
  shippingMethod,
  setShippingMethod,
  paymentMethod,
  setPaymentMethod,
  notes,
  setNotes
}: CustomerInfoSectionProps) => {
  const navigate = useNavigate();
  const { data: contacts = [], isLoading } = useContacts();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerPopover, setShowCustomerPopover] = useState(false);
  
  // Filter contacts to only show customers and apply search filter
  const customerContacts = contacts.filter(contact => 
    contact.category === 'Customer' && 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle customer selection
  const handleCustomerSelect = (contact: any) => {
    setCustomerName(contact.name);
    setSearchTerm(contact.name);
    
    // Auto-fill customer details for Order & Delivery type
    if (type === "order" && setCustomerPhone && setCustomerEmail && setCustomerAddress) {
      setCustomerPhone(contact.phone || "");
      setCustomerEmail(contact.email || "");
      setCustomerAddress(contact.address || "");
    }
    
    setShowCustomerPopover(false);
  };
  
  // Handle input change
  const handleCustomerInputChange = (value: string) => {
    setCustomerName(value);
    setSearchTerm(value);
    if (!showCustomerPopover) {
      setShowCustomerPopover(true);
    }
  };
  
  // Navigate to create contact page
  const handleAddNewContact = () => {
    navigate("/create-contact");
  };
  
  // Status options based on document type
  const getStatusOptions = () => {
    switch(type) {
      case "delivery":
        return [
          { label: "Paid", value: "paid" },
          { label: "Unpaid", value: "unpaid" },
          { label: "Awaiting Payment", value: "awaiting" },
          { label: "Late Payment", value: "late" }
        ];
      case "order":
        return [
          { label: "Pending Payment", value: "pending_payment" },
          { label: "In Progress", value: "in_progress" },
          { label: "Shipped", value: "shipped" },
          { label: "Delivered", value: "delivered" },
          { label: "Cancelled", value: "cancelled" }
        ];
      case "quotation":
        return [
          { label: "Sent", value: "sent" },
          { label: "Accepted", value: "accepted" },
          { label: "Rejected", value: "rejected" },
          { label: "Expired", value: "expired" }
        ];
      default:
        return [
          { label: "Paid", value: "paid" },
          { label: "Unpaid", value: "unpaid" }
        ];
    }
  };
  
  const statusOptions = getStatusOptions();
  
  // Shipping method options for Order & Delivery
  const shippingMethodOptions = [
    { label: "Standard Courier", value: "standard_courier" },
    { label: "Express Courier", value: "express_courier" },
    { label: "In-store Pickup", value: "in_store_pickup" },
    { label: "Self-Delivery", value: "self_delivery" }
  ];
  
  // Payment method options for Order & Delivery
  const paymentMethodOptions = [
    { label: "Credit Card", value: "credit_card" },
    { label: "Bank Transfer", value: "bank_transfer" },
    { label: "Cash on Delivery", value: "cash_on_delivery" },
    { label: "Digital Wallet", value: "digital_wallet" }
  ];

  // Get the title based on document type
  const getDocumentTitle = () => {
    switch(type) {
      case "delivery": return "Sales Invoice";
      case "order": return "Order";
      case "quotation": return "Quotation";
      default: return "Document";
    }
  };
  
  // Get the second date field label based on document type
  const getSecondDateLabel = () => {
    switch(type) {
      case "delivery": return "Due Date";
      case "order": return "Delivery Date";
      default: return "Due Date";
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-lg font-medium mb-4">Customer Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer selection */}
        <div className="space-y-2">
          <label htmlFor="customer" className="text-sm font-medium">
            Customer
          </label>
          <div className="space-y-2">
            <Popover open={showCustomerPopover} onOpenChange={setShowCustomerPopover}>
              <PopoverTrigger asChild>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <input
                    id="customer"
                    className="flex-1 p-2 outline-none"
                    placeholder="Search for customer..."
                    value={customerName}
                    onChange={(e) => handleCustomerInputChange(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 px-2"
                    onClick={() => setShowCustomerPopover(!showCustomerPopover)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-2 w-[300px] bg-white" align="start">
                <div className="space-y-1">
                  {isLoading ? (
                    <p className="text-center text-sm text-gray-500 py-2">
                      Loading customers...
                    </p>
                  ) : customerContacts.length > 0 ? (
                    customerContacts.map((contact) => (
                      <Button
                        key={contact.id}
                        variant="ghost"
                        className="w-full justify-start text-left"
                        onClick={() => handleCustomerSelect(contact)}
                      >
                        <div className="flex items-center w-full">
                          {contact.name === customerName && (
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-xs text-gray-500">{contact.email}</div>
                          </div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <p className="text-center text-sm text-gray-500 py-2">
                      No customers found
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Add New Contact Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleAddNewContact}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Contact
            </Button>
          </div>
        </div>

        {/* Document number */}
        <div className="space-y-2">
          <label htmlFor="invoiceNumber" className="text-sm font-medium">
            {getDocumentTitle()} Number
          </label>
          <input
            id="invoiceNumber"
            type="text"
            className="w-full p-2 border rounded-md"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            readOnly={type === "order"} // Make read-only for auto-generated order numbers
          />
        </div>
        
        {/* For Order & Delivery type, show additional customer fields */}
        {type === "order" && setCustomerPhone && setCustomerEmail && (
          <>
            <div className="space-y-2">
              <label htmlFor="customerPhone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                Phone Number
              </label>
              <Input
                id="customerPhone"
                type="tel"
                className="w-full"
                placeholder="e.g., +62 812-3456-7890"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="customerEmail" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                Email Address
              </label>
              <Input
                id="customerEmail"
                type="email"
                className="w-full"
                placeholder="e.g., customer@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Invoice date */}
        <div className="space-y-2">
          <label htmlFor="invoiceDate" className="text-sm font-medium">
            {getDocumentTitle()} Date
          </label>
          <input
            id="invoiceDate"
            type="date"
            className="w-full p-2 border rounded-md"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
          />
        </div>

        {/* Due date / Delivery date / Valid until */}
        <div className="space-y-2">
          <label htmlFor="dueDate" className="text-sm font-medium">
            {getSecondDateLabel()}
          </label>
          <input
            id="dueDate"
            type="date"
            className="w-full p-2 border rounded-md"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        
        {/* For Order & Delivery type, show additional shipping fields */}
        {type === "order" && setCustomerAddress && (
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="customerAddress" className="text-sm font-medium flex items-center gap-2">
              <Home className="h-4 w-4 text-gray-500" />
              Shipping Address
            </label>
            <textarea
              id="customerAddress"
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Enter complete shipping address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
          </div>
        )}

        {/* Status - only show for non-order types */}
        {type !== "order" && (
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <div className="relative">
              <select
                id="status"
                className="w-full p-2 border rounded-md appearance-none bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInfoSection;
