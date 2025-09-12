import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Wallet,
  Edit,
} from "lucide-react";
import { formatPriceWithSeparator } from "@/utils/salesUtils";
import { useContacts } from "@/hooks/useContacts";
import { Contact } from "@/hooks/useContacts";

// Mock transaction data - this would ideally come from a sales/purchases hook
const salesTransactions = [
  {
    id: "S001",
    contactId: "1",
    date: "2023-07-12",
    invoiceNumber: "INV-2023-001",
    amount: 5000000,
    status: "Paid",
    items: [
      {
        id: 1,
        name: "Office Supplies",
        quantity: 10,
        price: 250000,
        total: 2500000,
      },
      {
        id: 2,
        name: "Computer Equipment",
        quantity: 1,
        price: 2500000,
        total: 2500000,
      },
    ],
  },
];

const purchaseTransactions = [
  {
    id: "P001",
    contactId: "2",
    date: "2023-06-10",
    invoiceNumber: "PO-2023-001",
    amount: 4500000,
    status: "Paid",
    items: [
      {
        id: 1,
        name: "Industrial Equipment",
        quantity: 1,
        price: 4500000,
        total: 4500000,
      },
    ],
  },
];

const ContactDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [salesData, setSalesData] = useState<any[]>([]);
  const [purchasesData, setPurchasesData] = useState<any[]>([]);

  const { data: contacts = [], isLoading, error } = useContacts();

  // Find the contact by ID from the real backend data
  const contact = contacts.find((c: Contact) => c.id === id);

  // Function to handle the back button click
  const handleGoBack = () => {
    if (
      document.referrer &&
      document.referrer.includes(window.location.hostname)
    ) {
      navigate(-1);
    } else {
      navigate("/contacts");
    }
  };

  useEffect(() => {
    if (contact) {
      // Filter transactions by contact ID (using string comparison for mock data)
      const contactIdString = contact.id;

      const legacySales = salesTransactions.filter(
        (t) => t.contactId === contactIdString
      );
      const purchases = purchaseTransactions.filter(
        (t) => t.contactId === contactIdString
      );

      setSalesData(legacySales);
      setPurchasesData(purchases);
    }
  }, [contact]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="mt-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading contact details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="mt-8 text-center text-red-600">
            <p>Error loading contact: {error.message}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold">Contact not found</h2>
            <p className="mt-2 text-gray-500">
              The contact you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const totalIncome = salesData.reduce((sum, sale) => sum + sale.amount, 0);
  const totalExpenses = purchasesData.reduce(
    (sum, purchase) => sum + purchase.amount,
    0
  );

  const getEmptyPurchasesMessage = () => {
    if (contact.category === "Customer") {
      return `${contact.name} hasn't made any purchases yet.`;
    } else {
      return "No purchases found for this contact.";
    }
  };

  const getEmptySuppliedMessage = () => {
    if (contact.category === "Vendor") {
      return `You haven't received any items from ${contact.name} yet.`;
    } else {
      return "No supplied items found for this contact.";
    }
  };

  const getEmptyTransactionsMessage = () => {
    if (contact.category === "Employee") {
      return `No transactions made with ${contact.name}`;
    } else if (contact.category === "Customer") {
      return `You haven't made any transactions with ${contact.name} yet.`;
    } else if (contact.category === "Vendor") {
      return `You haven't made any transactions with ${contact.name} yet.`;
    } else {
      return `You haven't made any transactions with ${contact.name} yet.`;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <div className="px-8 pt-8">
          <Button
            variant="outline"
            className="mb-4 bg-white"
            onClick={handleGoBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-semibold mb-1">{contact.name}</h1>
              <p className="">
                #{contact.number} • {contact.category}
              </p>
            </div>
            <Button
              onClick={() => navigate(`/contact-details/${contact.id}/edit`)}
              className="bg-white text-black-600 hover:bg-gray-100"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Contact
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                  Total Income
                </CardTitle>
                <CardDescription>
                  Money received from this contact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  Rp {formatPriceWithSeparator(totalIncome)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Wallet className="h-5 w-5 mr-2 text-red-500" />
                  Total Expenses
                </CardTitle>
                <CardDescription>Money paid to this contact</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  Rp {formatPriceWithSeparator(totalExpenses)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="info">Contact Information</TabsTrigger>
              {contact.category === "Customer" && (
                <TabsTrigger value="purchases">Purchases</TabsTrigger>
              )}
              {contact.category === "Vendor" && (
                <TabsTrigger value="supplied">Supplied Items</TabsTrigger>
              )}
              {contact.category === "Customer" ||
              contact.category === "Vendor" ? null : (
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              )}
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                  <CardDescription>
                    Basic information about {contact.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Email Address</h4>
                      <p>{contact.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Phone Number</h4>
                      <p>{contact.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Address</h4>
                      <p>{contact.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {contact.category === "Customer" && (
              <TabsContent value="purchases">
                <Card>
                  <CardHeader>
                    <CardTitle>Items Purchased</CardTitle>
                    <CardDescription>
                      Products purchased by {contact.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {salesData.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesData.flatMap((sale) =>
                            sale.items && sale.items.length > 0 ? (
                              sale.items.map((item: any) => (
                                <TableRow key={`${sale.id}-${item.id}`}>
                                  <TableCell>
                                    <Button
                                      variant="link"
                                      className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800 hover:underline"
                                      onClick={() =>
                                        navigate(`/sales-invoice/${sale.id}`)
                                      }
                                    >
                                      {sale.invoiceNumber}
                                    </Button>
                                  </TableCell>
                                  <TableCell>{sale.date}</TableCell>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>
                                    Rp {formatPriceWithSeparator(item.price)}
                                  </TableCell>
                                  <TableCell>
                                    Rp {formatPriceWithSeparator(item.total)}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow key={sale.id}>
                                <TableCell>
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800 hover:underline"
                                    onClick={() =>
                                      navigate(`/sales-invoice/${sale.id}`)
                                    }
                                  >
                                    {sale.invoiceNumber}
                                  </Button>
                                </TableCell>
                                <TableCell>{sale.date}</TableCell>
                                <TableCell colSpan={4}>
                                  <span className="text-gray-500 italic">
                                    Item details not available
                                  </span>
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {getEmptyPurchasesMessage()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {contact.category === "Vendor" && (
              <TabsContent value="supplied">
                <Card>
                  <CardHeader>
                    <CardTitle>Items Supplied</CardTitle>
                    <CardDescription>
                      Products or services supplied by {contact.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {purchasesData.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>PO #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchasesData.flatMap((purchase) =>
                            purchase.items.map((item: any) => (
                              <TableRow key={`${purchase.id}-${item.id}`}>
                                <TableCell>
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800 hover:underline"
                                    onClick={() =>
                                      navigate(`/invoices/${purchase.id}`)
                                    }
                                  >
                                    {purchase.invoiceNumber}
                                  </Button>
                                </TableCell>
                                <TableCell>{purchase.date}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>
                                  Rp {formatPriceWithSeparator(item.price)}
                                </TableCell>
                                <TableCell>
                                  Rp {formatPriceWithSeparator(item.total)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {getEmptySuppliedMessage()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    All financial transactions with {contact.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {salesData.length > 0 || purchasesData.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Transaction Type</TableHead>
                          <TableHead>Reference #</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          ...salesData.map((s) => ({ ...s, type: "Sale" })),
                          ...purchasesData.map((p) => ({
                            ...p,
                            type: "Purchase",
                          })),
                        ]
                          .sort((a, b) => {
                            const dateA = a.date.includes("-")
                              ? new Date(a.date)
                              : new Date(a.date.split("/").reverse().join("-"));
                            const dateB = b.date.includes("-")
                              ? new Date(b.date)
                              : new Date(b.date.split("/").reverse().join("-"));

                            return dateB.getTime() - dateA.getTime();
                          })
                          .map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>{transaction.date}</TableCell>
                              <TableCell>{transaction.type}</TableCell>
                              <TableCell>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800 hover:underline"
                                  onClick={() => {
                                    const path =
                                      transaction.type === "Sale"
                                        ? `/sales-invoice/${transaction.id}`
                                        : `/invoices/${transaction.id}`;
                                    navigate(path);
                                  }}
                                >
                                  {transaction.invoiceNumber}
                                </Button>
                              </TableCell>
                              <TableCell
                                className={
                                  transaction.type === "Sale"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {transaction.type === "Sale" ? "+" : "-"}Rp{" "}
                                {formatPriceWithSeparator(transaction.amount)}
                              </TableCell>
                              <TableCell>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {transaction.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {contact.category === "Employee"
                        ? `No transactions made with ${contact.name}`
                        : getEmptyTransactionsMessage()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ContactDetails;
