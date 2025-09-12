import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExpenseTabsProps {
  activeTab: "expenses" | "approval";
  onTabChange: (tab: "expenses" | "approval") => void;
}

export const ExpenseTabs = ({ activeTab, onTabChange }: ExpenseTabsProps) => {
  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={(value) => onTabChange(value as "expenses" | "approval")}
    >
      <TabsList className="w-full max-w-md rounded-xl overflow-hidden bg-white border border-gray-200 p-1">
        <TabsTrigger
          value="expenses"
          className={`flex-1 rounded-lg py-3 text-sm font-medium ${
            activeTab === "expenses"
              ? "bg-indigo-600 text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Expenses
        </TabsTrigger>
        <TabsTrigger
          value="approval"
          className={`flex-1 rounded-lg py-3 text-sm font-meidum ${
            activeTab === "approval"
              ? "bg-indigo-600 text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Require Approval
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
