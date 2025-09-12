
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

export const VendorInformation = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vendor Information</CardTitle>
        <Building className="h-5 w-5 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Vendor Name</p>
            <p className="font-medium">Global Supplies Co.</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Vendor ID</p>
            <p className="font-medium">V-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Contact Information</p>
            <p className="font-medium">accounts@globalsupplies.com</p>
            <p className="text-sm text-gray-500">+1 (555) 987-6543</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="text-gray-700">
              1234 Vendor Street<br />
              Supplier City, SC 54321
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
