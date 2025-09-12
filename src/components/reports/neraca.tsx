    // pages/Neraca.tsx
    import { useState } from "react";
    import { Sidebar } from "@/components/Sidebar";
    import { Button } from "@/components/ui/button";
    import { NeracaFilter } from "@/components/reports/neracafilter";
    import { NeracaTable } from "@/components/reports/neracatable";

    // Dummy data for assets, liabilities, and equity
    const dummyData = {
    assets: [
        { id: 1, name: "Cash and Cash Equivalents", amount: 5000000 },
        { id: 2, name: "Accounts Receivable", amount: 3000000 },
        { id: 3, name: "Inventory", amount: 2000000 },
        { id: 4, name: "Property, Plant, and Equipment", amount: 10000000 },
    ],
    liabilities: [
        { id: 1, name: "Accounts Payable", amount: 2000000 },
        { id: 2, name: "Short-Term Debt", amount: 1500000 },
        { id: 3, name: "Long-Term Debt", amount: 5000000 },
    ],
    equity: [
        { id: 1, name: "Owner's Capital", amount: 10000000 },
        { id: 2, name: "Retained Earnings", amount: 3000000 },
        { id: 3, name: "Accumulated Other Comprehensive Income", amount: 500000 },
    ],
    };

    const Neraca = () => {
    const [filter, setFilter] = useState("daily"); // Default filter
    const [startDate, setStartDate] = useState<Date | null>(null); // For custom filter
    const [endDate, setEndDate] = useState<Date | null>(null); // For custom filter

    // Handle filter change
    const handleFilterChange = (value: string) => {
        setFilter(value);
        // Fetch or calculate data based on the filter
        console.log("Filter:", value);
    };

    // Handle custom date range change
    const handleCustomDateChange = (start: Date | null, end: Date | null) => {
        setStartDate(start);
        setEndDate(end);
        // Fetch or calculate data based on the custom date range
        console.log("Start Date:", start, "End Date:", end);
    };

    return (
        <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
            {/* Header with Gradient Background */}
            <div className="bg-gradient-to-b from-[#818CF8] to-[#C084FC] p-6">
            <h1 className="text-2xl font-semibold text-white">Neraca</h1>
            <p className="text-white/80">View your company's financial balance sheet</p>
            </div>

            {/* Main Content */}
            <div className="p-6">
            {/* Action Bar */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="bg-[#F8F7FF] p-5 rounded-lg inline-block">
                <Button className="bg-[#8B5CF6] text-white hover:bg-[#7C3AED]">
                    Generate Report
                </Button>
                </div>

                {/* Filter Component */}
                <NeracaFilter
                filter={filter}
                onFilterChange={handleFilterChange}
                onDateChange={handleCustomDateChange}
                />
            </div>

            {/* Table Component */}
            <NeracaTable
                assets={dummyData.assets}
                liabilities={dummyData.liabilities}
                equity={dummyData.equity}
            />
            </div>
        </main>
        </div>
    );
    };

    export default Neraca;