    // components/ui/NeracaTable.tsx
    import { formatCurrency } from "@/lib/utils";

    interface NeracaTableProps {
    assets: { id: number; name: string; amount: number }[];
    liabilities: { id: number; name: string; amount: number }[];
    equity: { id: number; name: string; amount: number }[];
    }

    export const NeracaTable = ({ assets, liabilities, equity }: NeracaTableProps) => {
    // Calculate totals
    const totalAssets = assets.reduce((sum, asset) => sum + asset.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);
    const totalEquity = equity.reduce((sum, equityItem) => sum + equityItem.amount, 0);
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
        {/* Assets Section */}
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Assets</h2>
            <table className="w-full">
            <tbody>
                {assets.map((asset) => (
                <tr key={asset.id}>
                    <td className="pl-4">{asset.name}</td>
                    <td className="text-right">{formatCurrency(asset.amount)}</td>
                </tr>
                ))}
                <tr className="border-t">
                <td className="font-semibold pl-4">Total Assets</td>
                <td className="text-right font-semibold">{formatCurrency(totalAssets)}</td>
                </tr>
            </tbody>
            </table>
        </div>

        {/* Liabilities and Equity Section */}
        <div>
            <h2 className="text-xl font-semibold mb-4">Liabilities and Equity</h2>
            <table className="w-full">
            <tbody>
                {/* Liabilities */}
                {liabilities.map((liability) => (
                <tr key={liability.id}>
                    <td className="pl-4">{liability.name}</td>
                    <td className="text-right">{formatCurrency(liability.amount)}</td>
                </tr>
                ))}
                <tr className="border-t">
                <td className="font-semibold pl-4">Total Liabilities</td>
                <td className="text-right font-semibold">{formatCurrency(totalLiabilities)}</td>
                </tr>

                {/* Equity */}
                {equity.map((equityItem) => (
                <tr key={equityItem.id}>
                    <td className="pl-4">{equityItem.name}</td>
                    <td className="text-right">{formatCurrency(equityItem.amount)}</td>
                </tr>
                ))}
                <tr className="border-t">
                <td className="font-semibold pl-4">Total Equity</td>
                <td className="text-right font-semibold">{formatCurrency(totalEquity)}</td>
                </tr>

                {/* Total Liabilities and Equity */}
                <tr className="border-t">
                <td className="font-semibold pl-4">Total Liabilities and Equity</td>
                <td className="text-right font-semibold">{formatCurrency(totalLiabilitiesAndEquity)}</td>
                </tr>
            </tbody>
            </table>
        </div>
        </div>
    );
    };