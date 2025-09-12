
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface PaymentInformationProps {
  isPaid: boolean;
  isOverdue: boolean;
  date: Date;
}

export const PaymentInformation = ({ isPaid, isOverdue, date }: PaymentInformationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Payment Terms</p>
            <p className="font-medium">Net 30</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Method</p>
            <p className="font-medium">Bank Transfer</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bank Account</p>
            <p className="font-medium">Global Supplies Bank Account</p>
            <p className="text-sm text-gray-500">Account #: XXXX-XXXX-1234</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Status</p>
            <p className={`font-medium ${isPaid ? 'text-green-600' : isOverdue ? 'text-red-600' : ''}`}>
              {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
            </p>
            {isPaid && (
              <p className="text-sm text-gray-500">
                Paid on {format(new Date(date.getTime() + 864000000), 'PP')}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
