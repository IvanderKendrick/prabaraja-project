import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  AreaChartIcon,
  LineChartIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useDashboardFinance } from "@/hooks/useDashboardFinance";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  amount: string;
  trend: string;
  isPositive: boolean;
}

const StatCard = ({ title, amount, trend, isPositive }: StatCardProps) => (
  <Card className="p-6 space-y-2">
    <p className="text-gray-500 text-[14px]">{title}</p>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-semibold">{amount}</span>
    </div>
    <div
      className={`flex items-center gap-1 text-sm ${
        isPositive ? "text-green-600" : "text-red-600"
      }`}
    >
      {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      <span>{trend}</span>
    </div>
  </Card>
);

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="p-6 space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-end gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </Card>
    ))}
  </div>
);

const Dashboard = () => {
  const [chartType, setChartType] = useState<"area" | "line">("area");
  const { data, loading, error } = useDashboardFinance();

  // Calculate percentage changes
  const salesPercentChange =
    data && data.previousMonthSales !== 0
      ? ((data.currentMonthSales - data.previousMonthSales) /
          data.previousMonthSales) *
        100
      : 0;

  const paymentsPercentChange =
    data && data.previousMonthPayments !== 0
      ? ((data.currentMonthPayments - data.previousMonthPayments) /
          data.previousMonthPayments) *
        100
      : 0;

  const renderChart = () => {
    if (!data?.monthlyData) return null;

    if (chartType === "area") {
      return (
        <AreaChart data={data.monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            width={120}
            tickFormatter={(value) => formatCurrency(Number(value))}
          />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Area
            type="monotone"
            dataKey="profit"
            stackId="1"
            stroke="#0EA5E9"
            fill="#0EA5E9"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="loss"
            stackId="1"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.6}
          />
        </AreaChart>
      );
    } else {
      return (
        <LineChart data={data.monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            width={120}
            tickFormatter={(value) => formatCurrency(Number(value))}
          />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#0EA5E9"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="loss"
            stroke="#EF4444"
            strokeWidth={2}
          />
        </LineChart>
      );
    }
  };

  if (error) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header
            title="Dashboard Overview"
            description="Welcome back! Here's what's happening with your business today."
          />

          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <Card className="p-6">
                <div className="text-center text-red-600">
                  <h3 className="text-lg font-semibold mb-2">
                    Error Loading Dashboard Data
                  </h3>
                  <p>{error}</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          title="Dashboard Overview"
          description="Welcome back! Here's what's happening with your business today."
        />

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="space-y-8">
            {loading ? (
              <LoadingSkeleton />
            ) : data ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard
                  title="Total Sales (Current Month)"
                  amount={formatCurrency(data.currentMonthSales)}
                  trend={`${salesPercentChange.toFixed(1)}% vs last month`}
                  isPositive={salesPercentChange >= 0}
                />
                <StatCard
                  title="Total Sales (Previous Month)"
                  amount={formatCurrency(data.previousMonthSales)}
                  trend="Compared to current"
                  isPositive={true}
                />
                <StatCard
                  title="Payments Received (Current Month)"
                  amount={formatCurrency(data.currentMonthPayments)}
                  trend={`${paymentsPercentChange.toFixed(1)}% vs last month`}
                  isPositive={paymentsPercentChange >= 0}
                />
                <StatCard
                  title="Payments Received (Previous Month)"
                  amount={formatCurrency(data.previousMonthPayments)}
                  trend="Compared to current"
                  isPositive={true}
                />
              </div>
            ) : null}

            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Monthly Profit & Loss</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChartType("area")}
                    className={`p-2 rounded ${
                      chartType === "area" ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    <AreaChartIcon
                      className={`w-5 h-5 ${
                        chartType === "area" ? "text-blue-600" : "text-gray-500"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => setChartType("line")}
                    className={`p-2 rounded ${
                      chartType === "line" ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    <LineChartIcon
                      className={`w-5 h-5 ${
                        chartType === "line"
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
