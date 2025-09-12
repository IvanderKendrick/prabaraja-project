import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface Account {
  code: string;
  name: string;
  balance: string;
  bankName?: string;
  accountNumber?: string;
  archived?: boolean;
}

interface AccountSummaryCardsProps {
  accounts: Account[];
  calculateTotal: (accounts: Account[]) => number;
}

export function AccountSummaryCards({ accounts, calculateTotal }: AccountSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-[#F3F4F6]">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            Cash & Bank Balance
            <span className="ml-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">{accounts.filter((a) => !a.archived).length}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-xl font-semibold">{formatCurrency(calculateTotal(accounts.filter((a) => !a.archived)))}</div>
        </CardContent>
      </Card>

      <Card className="bg-[#FEF2F2]">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            Credit Card alance
            <span className="ml-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-xl font-semibold">Rp 130.545.869</div>
        </CardContent>
      </Card>
    </div>
  );
}
