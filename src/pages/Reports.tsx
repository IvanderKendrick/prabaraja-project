
// pages/Reports.tsx
import { Sidebar } from "@/components/Sidebar";
import { ReportBox } from "@/components/reports/Reportbox";
import { Header } from "@/components/Header";

import {
  FileText,
  BarChart,
  CreditCard,
  BookOpen,
  Book,
  Scale,
  TrendingUp,
  ClipboardList,
  PieChart,
  Settings,
} from "lucide-react";

const Reports = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          title="Reports"
          description="View your company reports"
        />

        {/* Progress Message */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-4">
              <Settings className="w-16 h-16 text-gray-400 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Reports Feature</h2>
            <p className="text-gray-500 text-lg">The feature is on progress.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
