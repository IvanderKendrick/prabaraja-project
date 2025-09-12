import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Package, DollarSign, AlertCircle, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ShipmentItem {
  id: string;
  name: string;
  quantity: number;
  unit_price?: number;
  price?: number;
  total?: number;
}

interface Shipment {
  id: string;
  user_id: string;
  number: number;
  date: string;
  shipping_date: string;
  due_date: string;
  status: string;
  tracking_number: string;
  carrier: string;
  items: ShipmentItem[];
  grand_total: number;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

const ShipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: shipment, isLoading, error } = useQuery({
    queryKey: ['shipment', id],
    queryFn: async () => {
      if (!id) throw new Error('Shipment ID is required');
      
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching shipment:', error);
        throw error;
      }

      const transformedShipment: Shipment = {
        id: data.id,
        user_id: data.user_id,
        number: data.number,
        date: data.date,
        shipping_date: data.shipping_date,
        due_date: data.due_date,
        status: data.status,
        tracking_number: data.tracking_number,
        carrier: data.carrier,
        items: Array.isArray(data.items) ? (data.items as unknown as ShipmentItem[]) : [],
        grand_total: data.grand_total,
        tags: data.tags || [],
        created_at: data.created_at,
        updated_at: data.updated_at || undefined,
      };

      return transformedShipment;
    },
    enabled: !!id && !!user,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 overflow-auto">
          <div className="bg-gradient-to-b from-[#818CF8] to-[#C084FC] p-6">
            <h1 className="text-2xl font-semibold text-white">Shipment Details</h1>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading shipment details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 overflow-auto">
          <div className="bg-gradient-to-b from-[#818CF8] to-[#C084FC] p-6">
            <h1 className="text-2xl font-semibold text-white">Shipment Details</h1>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Shipment Not Found</h3>
              <p className="text-gray-600 mb-4">
                The shipment you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Link to="/purchases">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Purchases
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 overflow-auto">
        <div className="bg-gradient-to-b from-[#818CF8] to-[#C084FC] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Shipment Details</h1>
              <p className="text-white/80">Shipment #{shipment.number}</p>
            </div>
            <Link to="/purchases">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Purchases
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Shipment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Shipment Date</p>
                  <p className="font-medium">{shipment.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shipping Date</p>
                  <p className="font-medium">{shipment.shipping_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium">{shipment.due_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(shipment.status)}>
                    {shipment.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-medium">{shipment.tracking_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Carrier</p>
                  <p className="font-medium">{shipment.carrier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="font-medium">{shipment.items.length}</p>
                </div>
                {shipment.tags && shipment.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {shipment.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    Rp. {(shipment.grand_total || 0).toLocaleString("id-ID")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Shipment Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shipment.items && shipment.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-gray-600">Item</th>
                        <th className="text-right p-3 font-medium text-gray-600">Quantity</th>
                        <th className="text-right p-3 font-medium text-gray-600">Unit Price</th>
                        <th className="text-right p-3 font-medium text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipment.items.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{item.name}</p>
                            </div>
                          </td>
                          <td className="text-right p-3">{item.quantity || 0}</td>
                          <td className="text-right p-3">
                            Rp. {((item.unit_price || item.price) || 0).toLocaleString("id-ID")}
                          </td>
                          <td className="text-right p-3 font-medium">
                            Rp. {(item.total || ((item.quantity || 0) * ((item.unit_price || item.price) || 0))).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300">
                        <td colSpan={3} className="p-3 text-right font-medium">
                          Grand Total:
                        </td>
                        <td className="text-right p-3 font-bold text-green-600">
                          Rp. {(shipment.grand_total || 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items found for this shipment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetail;