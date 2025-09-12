
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface InvoiceSummaryProps {
  number: string;
  date: Date;
  dueDate: Date | null;
  status: string;
  isOverdue: boolean;
  isPaid: boolean;
}

export const InvoiceSummary = ({ 
  number, 
  date, 
  dueDate, 
  status, 
  isOverdue, 
  isPaid 
}: InvoiceSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Invoice Summary</span>
          {isPaid && (
            <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
              PAID
            </span>
          )}
          {isOverdue && (
            <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full">
              OVERDUE
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Invoice Number</p>
            <p className="font-medium">{number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Invoice Date</p>
            <p className="font-medium">{format(date, 'PP')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Due Date</p>
            <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
              {dueDate ? format(dueDate, 'PP') : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`px-2 py-1 rounded-full text-sm inline-block mt-1 ${
              status === 'completed' ? 'bg-green-100 text-green-800' : 
              status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
