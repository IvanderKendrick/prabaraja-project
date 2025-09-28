
import { useState } from "react";
import { PurchaseType } from "@/types/purchase";
import { PurchaseInformationForm } from "@/components/purchases/PurchaseInformationForm";
import { PurchaseItemsForm } from "@/components/purchases/PurchaseItemsForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CreatePurchaseFormProps {
  purchaseType: PurchaseType;
  setPurchaseType: (type: PurchaseType) => void;
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
  isReadOnlyTypeAndNumber?: boolean;
}

export function CreatePurchaseForm({ 
  purchaseType, 
  setPurchaseType, 
  onSubmit,
  isLoading = false,
  isReadOnlyTypeAndNumber = false,
}: CreatePurchaseFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [number, setNumber] = useState(`INV-`);
  const [approver, setApprover] = useState("");
  const [status, setStatus] = useState<"pending" | "completed" | "cancelled" | "Half-paid">("pending");
  const [tags, setTags] = useState("");
  const [items, setItems] = useState([{ 
    id: Math.random().toString(36).substr(2, 9), 
    name: '', 
    quantity: 1, 
    unit: "kg" as const,
    price: 0 
  }]);

  // Request-specific fields
  const [requestedBy, setRequestedBy] = useState("");
  const [urgency, setUrgency] = useState<"High" | "Medium" | "Low">("Medium");

  // Offer-specific fields
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [discountTerms, setDiscountTerms] = useState("");

  // Order-specific fields
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);

  // Shipment-specific fields
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [shippingDate, setShippingDate] = useState(new Date().toISOString().split('T')[0]);

  // File upload for invoice, shipment, order, offer, request
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a flexible form data object that can accept any properties
    const formData: Record<string, any> = {
      type: purchaseType,
      date,
      dueDate,
      status,
      approver,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      items,
      taxCalculationMethod: false,
      ppnPercentage: 11,
      pphPercentage: 2,
      pphType: "",
      dpp: 0,
      ppn: 0,
      pph: 0,
      grandTotal: items.reduce((total, item) => total + (item.quantity * item.price), 0),
      attachmentFile: attachmentFile
    };

    // Add type-specific fields based on purchaseType
    switch (purchaseType) {
      case "request":
        formData.requestedBy = requestedBy || "Unknown";
        formData.urgency = urgency;
        break;
      case "offer":
        formData.expiryDate = expiryDate;
        formData.discountTerms = discountTerms;
        break;
      case "order":
        formData.orderDate = orderDate;
        break;
      case "shipment":
        formData.trackingNumber = trackingNumber;
        formData.carrier = carrier;
        formData.shippingDate = shippingDate;
        break;
    }
    
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PurchaseInformationForm
        purchaseType={purchaseType}
        setPurchaseType={setPurchaseType}
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

      {/* Request-specific fields */}
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
      
      <PurchaseItemsForm
        items={items}
        setItems={setItems}
        purchaseType={purchaseType}
      />

      {/* File upload for invoice, shipment, order, offer, request */}
      {(purchaseType === "invoice" || purchaseType === "shipment" || purchaseType === "order" || purchaseType === "offer" || purchaseType === "request") && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-900">Attachment</h3>
          <div className="space-y-2">
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
        </div>
      )}

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Purchase
        </Button>
      </div>
    </form>
  );
}
