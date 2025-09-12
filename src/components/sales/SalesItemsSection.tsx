
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import { formatInputCurrency, parseInputCurrency } from "@/lib/utils";

interface SalesItemType {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
}

interface SalesItemsSectionProps {
  items: SalesItemType[];
  setItems: React.Dispatch<React.SetStateAction<SalesItemType[]>>;
  calculateTotal: () => number;
  formatPrice: (price: number) => string;
  allowProductSearch?: boolean;
  availableProducts?: Array<{id: string, name: string, price: number}>;
}

const SalesItemsSection = ({ 
  items, 
  setItems, 
  calculateTotal,
  formatPrice,
  allowProductSearch = false,
  availableProducts = []
}: SalesItemsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  
  const formatPriceDisplay = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handlePriceChange = (id: string, value: string) => {
    const numericValue = parseInputCurrency(value);
    updateItem(id, 'price', numericValue);
  };
  
  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), name: '', quantity: 1, price: 0, discount: 0 }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof SalesItemType, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };
  
  const handleProductSelect = (id: string, product: {id: string, name: string, price: number}) => {
    updateItem(id, 'name', product.name);
    updateItem(id, 'price', product.price);
    setShowProductSearch(false);
    setSearchTerm("");
  };
  
  const filteredProducts = availableProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate item subtotal with discount consideration
  const calculateItemSubtotal = (item: SalesItemType) => {
    const subtotal = item.quantity * item.price;
    if (item.discount && item.discount > 0) {
      return subtotal - (subtotal * (item.discount / 100));
    }
    return subtotal;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Items</CardTitle>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• <strong>Item Name:</strong> Enter the product or service name</p>
          <p>• <strong>Qty:</strong> Quantity of items being sold</p>
          <p>• <strong>Price:</strong> Unit price per item (in Rupiah)</p>
          {allowProductSearch && <p>• <strong>%:</strong> Discount percentage (optional)</p>}
          <p>• <strong>Subtotal:</strong> Calculated automatically (Qty × Price - Discount)</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="space-y-4">
              {/* Labels Row */}
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                <div className={allowProductSearch ? "col-span-4" : "col-span-5"}>Item Name</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Price</div>
                {allowProductSearch && <div className="col-span-1">%</div>}
                <div className="col-span-2">Subtotal</div>
                <div className="col-span-1"></div>
              </div>
              
              {/* Input Row */}
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className={allowProductSearch ? "col-span-4" : "col-span-5"}>
                  {allowProductSearch ? (
                  <div className="relative">
                    <Input 
                      placeholder="Search product" 
                      value={item.name}
                      onChange={(e) => {
                        updateItem(item.id, 'name', e.target.value);
                        setSearchTerm(e.target.value);
                        if (!showProductSearch) setShowProductSearch(true);
                      }}
                      onFocus={() => setShowProductSearch(true)}
                    />
                    {showProductSearch && searchTerm && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <div 
                              key={product.id} 
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleProductSelect(item.id, product)}
                            >
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">Rp {formatPrice(product.price)}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No products found</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Input 
                    placeholder="Item name" 
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  />
                )}
              </div>
              <div className="col-span-2">
                <Input 
                  type="number" 
                  min="1"
                  placeholder="Qty" 
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-2">
                <Input 
                  type="text"
                  inputMode="numeric"
                  placeholder="0" 
                  value={formatPriceDisplay(item.price)}
                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                />
              </div>
              {allowProductSearch && (
                <div className="col-span-1">
                  <Input 
                    type="number" 
                    min="0"
                    max="100"
                    placeholder="%" 
                    value={item.discount || 0}
                    onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
              <div className="col-span-2 text-right">
                Rp {formatPrice(calculateItemSubtotal(item))}
              </div>
              <div className="col-span-1 flex justify-center">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            type="button"
            variant="outline" 
            className="w-full mt-4"
            onClick={addItem}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          
          <div className="flex justify-end mt-6">
            <div className="w-1/3 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp {formatPrice(calculateTotal())}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>Rp {formatPrice(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesItemsSection;
