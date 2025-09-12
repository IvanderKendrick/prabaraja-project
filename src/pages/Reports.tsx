
// pages/Reports.tsx
import { Sidebar } from "@/components/Sidebar";
import { ReportBox } from "@/components/reports/Reportbox";

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
        {/* Header with Gradient Background */}
        <div className="bg-gradient-to-b from-[#818CF8] to-[#C084FC] p-6">
          <h1 className="text-2xl font-semibold text-white">Reports</h1>
          <p className="text-white/80">View your company reports</p>
        </div>

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
