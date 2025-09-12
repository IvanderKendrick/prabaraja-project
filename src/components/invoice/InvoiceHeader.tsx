
import { ArrowLeft, Download, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface InvoiceHeaderProps {
  number: string;
  date: Date;
}

export const InvoiceHeader = ({ number, date }: InvoiceHeaderProps) => {
  return (
    <>
      <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-6">
        <div className="flex items-center">
          <Link to="/purchases" className="mr-4">
            <Button variant="outline" size="icon" className="bg-white/80 hover:bg-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-white flex items-center">
              <FileText className="mr-2 h-5 w-5" /> 
              {number}
            </h1>
            <p className="text-white/80 text-sm">Purchase Invoice from {format(date, 'PP')}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Invoice Details</h2>
            <p className="text-gray-500">View and manage purchase invoice information</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
