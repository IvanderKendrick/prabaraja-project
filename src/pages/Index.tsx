
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { 
  FileText, 
  ShoppingBag, 
  Receipt, 
  Package, 
  BarChart, 
  CreditCard,
  UserRound,
  Save
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const ActionButton = ({ icon, label, onClick }: ActionButtonProps) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 gap-3 border border-gray-100 w-full max-w-[280px]"
  >
    <div className="text-blue-500">
      {icon}
    </div>
    <span className="text-gray-700 text-sm">{label}</span>
  </button>
);

const AdBanner = () => (
  <div className="bg-gradient-to-r from-[#818CF8] to-[#C084FC] rounded-lg p-6 text-white text-center max-w-3xl mx-auto my-8">
    <h2 className="text-xl font-bold mb-4">
      Boost your business productivity with<br />
      Prabaraja additional features
    </h2>
    <a 
      href="https://goldadvertising.shop" 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-block bg-white text-blue-600 px-5 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200 text-sm"
    >
      Prabaraja Marketplace
    </a>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleAction = (action: string) => {
    switch(action) {
      case 'sales-invoice':
        navigate('/create-new-sales');
        break;
      case 'sales-order':
        navigate('/sales');
        break;
      case 'purchase-invoice':
        navigate('/create-new-purchase');
        break;
      case 'new-product':
        navigate('/products');
        break;
      case 'profit-loss':
        navigate('/reports');
        break;
      case 'expense':
        navigate('/create-expense');
        break;
      default:
        console.log(`Action clicked: ${action}`);
    }
  };

  const actions = [
    { icon: <Receipt size={24} />, label: "Create sales invoice", action: "sales-invoice" },
    { icon: <ShoppingBag size={24} />, label: "Create sales order", action: "sales-order" },
    { icon: <FileText size={24} />, label: "Create purchase invoice", action: "purchase-invoice" },
    { icon: <Package size={24} />, label: "Add new product", action: "new-product" },
    { icon: <BarChart size={24} />, label: "See profit & loss report", action: "profit-loss" },
    { icon: <CreditCard size={24} />, label: "Create expense transaction", action: "expense" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-[#818CF8] to-[#C084FC] bg-[length:100%_200%] bg-[100%] p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold mb-2 text-white">Hello, {username}</h1>
              {/* Change username button removed as requested */}
            </div>
            <p className="text-white">What activity do you want to do?</p>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {actions.map((action) => (
              <ActionButton
                key={action.action}
                icon={action.icon}
                label={action.label}
                onClick={() => handleAction(action.action)}
              />
            ))}
          </div>
        </div>

        <AdBanner />
      </main>
    </div>
  );
};

export default Index;
