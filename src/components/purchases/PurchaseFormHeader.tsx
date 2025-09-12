import { FileText, Truck, ShoppingCart, Tag, HelpCircle, ArrowLeft, Quote } from "lucide-react"; // Added ArrowLeft
import { PurchaseType } from "@/types/purchase";
import { Link } from "react-router-dom"; // Import Link for navigation

interface PurchaseFormHeaderProps {
  purchaseType: PurchaseType;
}

export function PurchaseFormHeader({ purchaseType }: PurchaseFormHeaderProps) {
  const getTypeIcon = () => {
    switch (purchaseType) {
      case "invoice": return <FileText className="h-6 w-6 text-purple-500" />;
      case "shipment": return <Truck className="h-6 w-6 text-orange-500" />;
      case "order": return <ShoppingCart className="h-6 w-6 text-blue-500" />;
      case "offer": return <Tag className="h-6 w-6 text-green-500" />;
      case "request": return <HelpCircle className="h-6 w-6 text-pink-500" />;
      case "quotation": return <Quote className="h-6 w-6 text-cyan-500" />;
    }
  };

  const getTypeTitle = () => {
    switch (purchaseType) {
      case "invoice": return "Invoice";
      case "shipment": return "Shipment";
      case "order": return "Order";
      case "offer": return "Offer";
      case "request": return "Request";
      case "quotation": return "Purchase Quotation";
    }
  };

  return (
    <div className="bg-gradient-to-b from-purple-400 to-indigo-500 p-6">
      <div className="flex items-center">
        {/* Back Arrow Button */}
        <Link
          to="/purchases"
          className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </Link>

        {/* Type Icon and Title */}
        <div className="flex items-center ml-4">
          {getTypeIcon()}
          <h1 className="text-2xl font-semibold text-white ml-2">Create New {getTypeTitle()}</h1>
        </div>
      </div>
    </div>  
  );
}