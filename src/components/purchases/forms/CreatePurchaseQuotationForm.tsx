import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, FileText, User, Package, Plus, Building2, Calculator, Receipt, Truck, Tag, AlertCircle, Quote, Loader2, Upload } from "lucide-react";
import { PurchaseType } from "@/types/purchase";
import { toast } from "sonner";
import { formatInputCurrency, parseInputCurrency, formatCurrency } from "@/lib/utils";
import { useContacts, useCreateContact } from "@/hooks/useContacts";
import { SalesTaxCalculation } from "@/components/sales/SalesTaxCalculation";
import { PurchaseInformationForm } from "@/components/purchases/PurchaseInformationForm";
import { PurchaseItemsForm } from "@/components/purchases/PurchaseItemsForm";
import axios from "axios";

interface QuotationItem {
  id: string;
  name: string;
  quantity: number;
  unit: "kg" | "buah";
  price: number;
  discount?: number;
}

type QuotationStatus = "Unpaid" | "Paid" | "Awaiting Payment" | "Late Payment";

interface CreatePurchaseQuotationFormProps {
  onSubmit: (data: any) => void;
  isReadOnlyTypeAndNumber?: boolean;
}

export function CreatePurchaseQuotationForm({ onSubmit, isReadOnlyTypeAndNumber = false }: CreatePurchaseQuotationFormProps) {
  const navigate = useNavigate();
  const { data: contacts } = useContacts();
  const createContactMutation = useCreateContact();
  
  // Type switcher and form state - following CreatePurchaseForm pattern
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("quotation");
  
  // Common purchase fields
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [number, setNumber] = useState("");
  const [approver, setApprover] = useState("");
  const [status, setStatus] = useState<"pending" | "completed" | "cancelled" | "Half-paid">("pending");
  const [tags, setTags] = useState("");
  const [items, setItems] = useState<QuotationItem[]>([{ 
    id: Math.random().toString(36).substr(2, 9), 
    name: '', 
    quantity: 1, 
    unit: "kg",
    price: 0,
    discount: 0
  }]);

  // Type-specific fields from CreatePurchaseForm
  const [requestedBy, setRequestedBy] = useState("");
  const [urgency, setUrgency] = useState<"High" | "Medium" | "Low">("Medium");
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [discountTerms, setDiscountTerms] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [shippingDate, setShippingDate] = useState(new Date().toISOString().split('T')[0]);

  // Quotation-specific fields
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [terms, setTerms] = useState("");
  
  // New vendor dialog state
  const [isNewVendorDialogOpen, setIsNewVendorDialogOpen] = useState(false);
  const [newVendorData, setNewVendorData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  
  // Tax calculation state
  const [taxData, setTaxData] = useState({
    dpp: 0,
    ppn: 0,
    pph: 0,
    grandTotal: 0
  });

  // File upload state
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate quotation number on component mount
  useEffect(() => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const generatedNumber = `QUO-`;
    setNumber(generatedNumber);
    
    // Set current date as default
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);
    
    // Set valid until date 30 days from now
    const validUntilDate = new Date();
    validUntilDate.setDate(today.getDate() + 30);
    setValidUntil(validUntilDate.toISOString().split('T')[0]);
  }, []);

  // Get vendor options
  const vendorContacts = contacts?.filter(contact => contact.category === "Vendor") || [];

  // Get auth token helper function
  const getAuthToken = () => {
    const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
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
  
  // Type configuration
  const typeConfig = {
    invoice: { 
      icon: <FileText className="h-4 w-4 text-purple-500" />, 
      label: "Invoice" 
    },
    shipment: { 
      icon: <Truck className="h-4 w-4 text-orange-500" />, 
      label: "Shipment" 
    },
    order: { 
      icon: <Package className="h-4 w-4 text-blue-500" />, 
      label: "Order" 
    },
    offer: { 
      icon: <Tag className="h-4 w-4 text-green-500" />, 
      label: "Offer" 
    },
    request: { 
      icon: <AlertCircle className="h-4 w-4 text-pink-500" />, 
      label: "Request" 
    },
    quotation: { 
      icon: <Quote className="h-4 w-4 text-cyan-500" />, 
      label: "Quotation" 
    }
  };
  
  // Handle purchase type change
  const handleTypeChange = (newType: PurchaseType) => {
    if (newType !== "quotation") {
      // Navigate to the regular create purchase form with the selected type
      navigate(`/create-purchase?type=${newType}`);
    }
  };
  
  // Validate form
  const isFormValid = () => {
    const commonFieldsValid = 
      (selectedVendorId !== "" || vendorName !== "") && 
      number !== "" && 
      date !== "" &&
      validUntil !== "";
      
    const itemsValid = items.length > 0 && 
      items.every(item => item.name !== "" && item.quantity > 0 && item.price > 0);
    
    return commonFieldsValid && itemsValid;
  };

  // Calculate subtotal with consideration for discounts
  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const itemSubtotal = item.quantity * item.price;
      if (item.discount && item.discount > 0) {
        return total + (itemSubtotal - (itemSubtotal * (item.discount / 100)));
      }
      return total + itemSubtotal;
    }, 0);
  };
  
  // Format price display for inputs
  const formatPriceDisplay = (price: number) => {
    return formatInputCurrency(price.toString());
  };

  // Handle item changes
  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };
  
  // Handle price changes with formatting
  const handlePriceChange = (index: number, value: string) => {
    const numericValue = parseInputCurrency(value);
    updateItem(index, 'price', numericValue);
  };

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unit: 'kg',
      price: 0,
      discount: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };
  
  // Handle vendor selection
  const handleVendorChange = (vendorId: string) => {
    if (vendorId === "create_new") {
      setIsNewVendorDialogOpen(true);
      setSelectedVendorId("");
      setVendorName("");
    } else {
      setSelectedVendorId(vendorId);
      const selectedVendor = vendorContacts.find(v => v.id === vendorId);
      setVendorName(selectedVendor?.name || "");
    }
  };
  
  // Handle new vendor creation
  const handleCreateNewVendor = async () => {
    try {
      await createContactMutation.mutateAsync({
        category: "Vendor",
        name: newVendorData.name,
        email: newVendorData.email,
        phone: newVendorData.phone,
        address: newVendorData.address,
        number: Date.now()
      });
      
      setVendorName(newVendorData.name);
      setIsNewVendorDialogOpen(false);
      setNewVendorData({ name: "", email: "", phone: "", address: "" });
      toast.success("Vendor created successfully!");
    } catch (error) {
      toast.error("Failed to create vendor");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      
      // Create FormData for multipart request
      const formData = new FormData();
      
      // Add all required fields
      formData.append('action', 'addNewQuotation');
      formData.append('type', 'Quotation');
      formData.append('quotation_date', date);
      formData.append('request_by', requestedBy || '');
      formData.append('urgency', urgency);
      formData.append('due_date', dueDate);
      formData.append('status', status);
      formData.append('tags', JSON.stringify(tags.split(',').map(tag => tag.trim()).filter(tag => tag)));
      // Map items to include unit in qty
      const mappedItems = items.map((item) => ({
        item_name: item.name,
        qty: `${item.quantity} ${item.unit}`,
        price: item.price,
        discount: item.discount || 0,
      }));
      formData.append('items', JSON.stringify(mappedItems));
      formData.append('grand_total', (taxData.grandTotal || calculateSubtotal()).toString());
      formData.append('memo', terms || '');
      
      // Add file if selected
      if (attachmentFile) {
        formData.append('attachment_url', attachmentFile);
      }
      
      // Vendor information
      const finalVendorName = selectedVendorId ? vendorContacts.find(v => v.id === selectedVendorId)?.name : vendorName;
      formData.append('vendor_name', finalVendorName || '');
      
      // Get vendor address and phone from selected vendor
      const selectedVendor = vendorContacts.find(v => v.id === selectedVendorId);
      formData.append('vendor_address', selectedVendor?.address || '');
      formData.append('vendor_phone', selectedVendor?.phone || '');
      
      formData.append('start_date', date);
      formData.append('tax_details', JSON.stringify(taxData));
      formData.append('tax_method', 'false'); // Based on existing code
      formData.append('dpp', taxData.dpp.toString());
      formData.append('ppn', taxData.ppn.toString());
      formData.append('pph', taxData.pph.toString());
      formData.append('valid_until', validUntil);
      formData.append('terms', terms || '');
      formData.append('total', (taxData.grandTotal || calculateSubtotal()).toString());
      formData.append('number', number);

      // Make POST request to the API
      const response = await axios.post(
        'https://pbw-backend-api.vercel.app/api/purchases',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type, let axios handle multipart boundary
          },
        }
      );

      if (response.data && !response.data.error) {
        toast.success("Purchase quotation created successfully!");
        navigate("/purchases");
      } else {
        throw new Error(response.data?.message || 'Failed to create purchase quotation');
      }

    } catch (error) {
      console.error('Error creating purchase quotation:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create purchase quotation';
        toast.error(errorMessage);
      } else {
        toast.error("Failed to create purchase quotation. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      <form onSubmit={handleSubmit} className="space-y-6">

        <PurchaseInformationForm
          purchaseType={purchaseType}
          setPurchaseType={(newType) => {
            setPurchaseType(newType);
            if (newType !== "quotation") {
              navigate(`/create-purchase?type=${newType}`);
            }
          }}
          date={date}
          setDate={setDate}
          number={number}
          setNumber={setNumber}
          isReadOnlyTypeAndNumber={isReadOnlyTypeAndNumber}
          approver={approver}
          setApprover={setApprover}
          dueDate={dueDate}
          setDueDate={setDueDate}
          status={status}
          setStatus={setStatus}
          tags={tags}
          setTags={setTags}
        />

        {/* Type-specific fields */}
        {purchaseType === "request" && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-gray-900">Request Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestedBy">Requested By</Label>
                <Input
                  id="requestedBy"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  placeholder="Enter requester name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={urgency} onValueChange={(value: "High" | "Medium" | "Low") => setUrgency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Offer-specific fields */}
        {purchaseType === "offer" && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-gray-900">Offer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountTerms">Discount Terms</Label>
                <Input
                  id="discountTerms"
                  value={discountTerms}
                  onChange={(e) => setDiscountTerms(e.target.value)}
                  placeholder="Enter discount terms"
                />
              </div>
            </div>
          </div>
        )}

        {/* Order-specific fields */}
        {purchaseType === "order" && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-gray-900">Order Details</h3>
            <div className="space-y-2">
              <Label htmlFor="orderDate">Order Date</Label>
              <Input
                id="orderDate"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Shipment-specific fields */}
        {purchaseType === "shipment" && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-gray-900">Shipment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carrier">Carrier</Label>
                <Input
                  id="carrier"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="Enter carrier name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingDate">Shipping Date</Label>
                <Input
                  id="shippingDate"
                  type="date"
                  value={shippingDate}
                  onChange={(e) => setShippingDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Quotation-specific vendor and terms */}
        {purchaseType === "quotation" && (
          <>
            {/* Vendor Information */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Building2 className="h-5 w-5 text-gray-600" />
                  Vendor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="vendorSelect" className="text-sm font-medium text-gray-700">Vendor *</Label>
                    <Select value={selectedVendorId} onValueChange={handleVendorChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select vendor or create new" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendorContacts.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-blue-500" />
                              {vendor.name}
                            </div>
                          </SelectItem>
                        ))}
                        <SelectItem value="create_new">
                          <div className="flex items-center gap-2 text-green-600">
                            <Plus className="h-4 w-4" />
                            Create New Vendor
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {!selectedVendorId && (
                      <Input
                        className="mt-2"
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        placeholder="Or enter vendor name manually"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quotation Details */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <CalendarDays className="h-5 w-5 text-gray-600" />
                  Quotation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="validUntil" className="text-sm font-medium text-gray-700">Valid Until *</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="terms" className="text-sm font-medium text-gray-700">Terms & Conditions</Label>
                  <Textarea
                    id="terms"
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="Enter terms and conditions (optional)"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}
        
        <PurchaseItemsForm
          items={items}
          setItems={setItems}
          purchaseType={purchaseType}
        />
        {/* Tax Calculation */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Calculator className="h-5 w-5 text-gray-600" />
              Tax Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <SalesTaxCalculation 
              subtotal={calculateSubtotal()} 
              onTaxChange={setTaxData}
            />
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Upload className="h-5 w-5 text-gray-600" />
              Attachment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label htmlFor="attachment" className="text-sm font-medium text-gray-700">Upload File (Optional)</Label>
              <Input
                id="attachment"
                type="file"
                onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                className="mt-1"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              {attachmentFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {attachmentFile.name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/purchases")}
            className="px-8 py-2"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!isFormValid() || isSubmitting}
            className="px-8 py-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : purchaseType === "quotation" ? (
              <>
                <Quote className="mr-2 h-4 w-4" />
                Create Quotation
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Create {purchaseType.charAt(0).toUpperCase() + purchaseType.slice(1)}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* New Vendor Dialog */}
      <Dialog open={isNewVendorDialogOpen} onOpenChange={setIsNewVendorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Create New Vendor
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="newVendorName">Vendor Name *</Label>
              <Input
                id="newVendorName"
                value={newVendorData.name}
                onChange={(e) => setNewVendorData({ ...newVendorData, name: e.target.value })}
                placeholder="Enter vendor name"
                required
              />
            </div>
            <div>
              <Label htmlFor="newVendorEmail">Email *</Label>
              <Input
                id="newVendorEmail"
                type="email"
                value={newVendorData.email}
                onChange={(e) => setNewVendorData({ ...newVendorData, email: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <Label htmlFor="newVendorPhone">Phone *</Label>
              <Input
                id="newVendorPhone"
                value={newVendorData.phone}
                onChange={(e) => setNewVendorData({ ...newVendorData, phone: e.target.value })}
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <Label htmlFor="newVendorAddress">Address *</Label>
              <Textarea
                id="newVendorAddress"
                value={newVendorData.address}
                onChange={(e) => setNewVendorData({ ...newVendorData, address: e.target.value })}
                placeholder="Enter address"
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsNewVendorDialogOpen(false);
                  setNewVendorData({ name: "", email: "", phone: "", address: "" });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNewVendor}
                disabled={!newVendorData.name || !newVendorData.email || !newVendorData.phone || !newVendorData.address}
              >
                Create Vendor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}