
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PurchasePriority, PurchaseStatus, PurchaseType } from "@/types/purchase";

interface PurchaseFormFieldsProps {
  formData: {
    date: string;
    number: string;
    approver: string;
    dueDate: string;
    status: PurchaseStatus;
    itemCount: number;
    priority: PurchasePriority;
    tags: string[];
    type: PurchaseType;
    // Type-specific fields
    trackingNumber?: string;
    carrier?: string;
    shippingDate?: string;
    orderDate?: string;
    discountTerms?: string;
    expiryDate?: string;
    requestedBy?: string;
    urgency?: string;
  };
  setFormData: (data: any) => void;
  generateDefaultNumber: (type: string) => string;
}

export function PurchaseFormFields({ 
  formData, 
  setFormData, 
  generateDefaultNumber 
}: PurchaseFormFieldsProps) {
  
  const typeLabels = {
    invoice: "Invoice",
    shipment: "Shipment",
    order: "Order",
    offer: "Offer",
    request: "Request"
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="type" className="text-right">
          Type
        </Label>
        <Select
          value={formData.type}
          onValueChange={(value: PurchaseType) => {
            setFormData({ 
              ...formData, 
              type: value,
              number: generateDefaultNumber(value)
            });
          }}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="shipment">Shipment</SelectItem>
            <SelectItem value="order">Order</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="request">Request</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="date" className="text-right">
          Date
        </Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="number" className="text-right">
          Number
        </Label>
        <Input
          id="number"
          value={formData.number}
          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
          className="col-span-3"
          placeholder={generateDefaultNumber(formData.type)}
        />
      </div>
      
      {/* Type-specific fields */}
      {formData.type === "shipment" && (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trackingNumber" className="text-right">
              Tracking Number
            </Label>
            <Input
              id="trackingNumber"
              value={formData.trackingNumber || ""}
              onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="carrier" className="text-right">
              Carrier
            </Label>
            <Input
              id="carrier"
              value={formData.carrier || ""}
              onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shippingDate" className="text-right">
              Shipping Date
            </Label>
            <Input
              id="shippingDate"
              type="date"
              value={formData.shippingDate || ""}
              onChange={(e) => setFormData({ ...formData, shippingDate: e.target.value })}
              className="col-span-3"
            />
          </div>
        </>
      )}

      {formData.type === "order" && (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="orderDate" className="text-right">
              Order Date
            </Label>
            <Input
              id="orderDate"
              type="date"
              value={formData.orderDate || ""}
              onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
              className="col-span-3"
            />
          </div>
        </>
      )}

      {formData.type === "offer" && (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discountTerms" className="text-right">
              Discount Terms
            </Label>
            <Input
              id="discountTerms"
              value={formData.discountTerms || ""}
              onChange={(e) => setFormData({ ...formData, discountTerms: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expiryDate" className="text-right">
              Expiry Date
            </Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate || ""}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="col-span-3"
            />
          </div>
        </>
      )}

      {formData.type === "request" && (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="requestedBy" className="text-right">
              Requested By
            </Label>
            <Input
              id="requestedBy"
              value={formData.requestedBy || ""}
              onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="urgency" className="text-right">
              Urgency
            </Label>
            <Select
              value={formData.urgency || "Medium"}
              onValueChange={(value) => setFormData({ ...formData, urgency: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      
      {/* Common fields for all types */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="approver" className="text-right">
          Approver
        </Label>
        <Input
          id="approver"
          value={formData.approver}
          onChange={(e) => setFormData({ ...formData, approver: e.target.value })}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="dueDate" className="text-right">
          Due Date
        </Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">
          Status
        </Label>
        <Select
          value={formData.status}
          onValueChange={(value: PurchaseStatus) =>
            setFormData({ ...formData, status: value })
          }
        >
          <SelectTrigger className="col-span-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="itemCount" className="text-right">
          Items
        </Label>
        <Input
          id="itemCount"
          type="number"
          value={formData.itemCount}
          onChange={(e) => setFormData({ ...formData, itemCount: Number(e.target.value) })}
          className="col-span-3"
          min="0"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="priority" className="text-right">
          Priority
        </Label>
        <Select
          value={formData.priority}
          onValueChange={(value: PurchasePriority) =>
            setFormData({ ...formData, priority: value })
          }
        >
          <SelectTrigger className="col-span-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="tags" className="text-right">
          Tags
        </Label>
        <Input
          id="tags"
          value={formData.tags.join(", ")}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(", ") })}
          className="col-span-3"
          placeholder="Comma-separated tags"
        />
      </div>
    </div>
  );
}
