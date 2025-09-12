import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow,
} from "@/components/ui/table";
import { Sidebar } from "@/components/Sidebar";
import { Wallet, FileText, Banknote, ArrowLeft, Trash, Link as LinkIcon, UploadCloud } from "lucide-react";
import { formatCurrency, formatInputCurrency, parseInputCurrency } from "@/lib/utils";
import { toast, Toaster } from "sonner";
import { useInvoices, useUpdateInvoice } from "@/hooks/usePurchases";
import { useCreateReceivePaymentTransaction } from "@/hooks/useReceivePayment";

    interface InvoiceItem {
    name: string;
    quantity: number;
    price: number;
    }

    interface Attachment {
    type: "file" | "link";
    name: string;
    url?: string;
    file?: File;
    }

export function ReceivePaymentPage() {
const { invoiceId } = useParams<{ invoiceId: string }>();
const navigate = useNavigate();
const [paymentMethod, setPaymentMethod] = useState<string>("");
const [paymentAmount, setPaymentAmount] = useState<string>("");
const [proformaItems, setProformaItems] = useState<InvoiceItem[]>([]);
const [attachments, setAttachments] = useState<Attachment[]>([]);
const [linkUrl, setLinkUrl] = useState<string>("");

// Fetch invoice data from Supabase
const { data: invoices = [], isLoading } = useInvoices();
const updateInvoiceMutation = useUpdateInvoice();
const createPaymentMutation = useCreateReceivePaymentTransaction();

const invoice = invoices.find(inv => inv.id === invoiceId);
const loading = isLoading;
const error = !loading && !invoice ? "Invoice not found" : null;

// Data is fetched via hooks above, no useEffect needed

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoice) return;

    try {
        const numericAmount = parseInputCurrency(paymentAmount);
        
        // Create payment transaction record
        await createPaymentMutation.mutateAsync({
            transaction_date: new Date().toISOString().split('T')[0],
            description: `Payment received for Invoice #${invoice.number}`,
            coa_code: paymentMethod === "cash" ? "101" : "102", // Basic COA codes
            credit: numericAmount, // Credit for payment received
        });

        // Update invoice status based on payment
        const currentPaidAmount = (invoice as any).paid_amount || 0;
        const newPaidAmount = currentPaidAmount + numericAmount;
        const newStatus = newPaidAmount >= invoice.grand_total ? "completed" : 
                          newPaidAmount > 0 ? "Half-paid" : "pending";

        await updateInvoiceMutation.mutateAsync({
            id: invoice.id,
            updates: { 
                status: newStatus,
                ...(newPaidAmount && { paid_amount: newPaidAmount }),
                ...(paymentMethod && { payment_method: paymentMethod }),
                payment_date: new Date().toISOString().split('T')[0],
                payment_reference: `Payment-${invoice.number}-${Date.now()}`
            } as any
        });

        const remainingAmount = invoice.grand_total - newPaidAmount;
        toast.success("Payment received successfully!", {
            description: `Status: ${newStatus}, Remaining: ${formatCurrency(remainingAmount)}`
        });
        navigate("/purchases");
    } catch (error) {
        console.error('Error processing payment:', error);
        toast.error("Failed to process payment");
    }
};

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size <= 10 * 1024 * 1024) {
        setAttachments(prev => [
            ...prev,
            { type: "file", name: file.name, file },
        ]);
        } else {
        toast.error("File size must be less than 10MB");
        }
    };

    const handleAddLink = () => {
        if (linkUrl) {
        setAttachments(prev => [
            ...prev,
            { type: "link", name: "External Link", url: linkUrl },
        ]);
        setLinkUrl("");
        }
    };

    const handleDeleteProformaItem = (index: number) => {
        setProformaItems(prev => prev.filter((_, i) => i !== index));
    };

const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!invoice) return;
    
    const rawValue = e.target.value;
    const numericValue = parseInputCurrency(rawValue);
    const maxAmount = invoice.grand_total - ((invoice as any).paid_amount || 0);
    const correctedValue = Math.min(numericValue, maxAmount);

    setPaymentAmount(formatInputCurrency(correctedValue.toString()));
};

    const isFormValid = () => {
        if (!invoice) return false;
        
        if (paymentMethod === "cash" || paymentMethod === "bank") {
        return paymentAmount.trim() !== "" && parseInputCurrency(paymentAmount) > 0;
        } 
        if (paymentMethod === "proforma") {
        return proformaItems.every(item => 
            item.name.trim() !== "" && item.quantity > 0 && item.price > 0
        );
        }
        return false;
    };

    if (loading) {
        return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex items-center justify-center">
            <p>Loading invoice data...</p>
            </div>
        </div>
        );
    }

    if (error || !invoice) {
        return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <p className="text-red-500">{error || "Invoice not found"}</p>
            <Button onClick={() => navigate("/purchases")}>
                Back to Invoices
            </Button>
            </div>
        </div>
        );
    }

const totalInvoiceAmount = invoice.grand_total;
const getPaidAmount = () => (invoice as any)?.paid_amount || 0;

    return (
        <div className="flex h-screen bg-background">
        <Toaster position="top-right" />
        <Sidebar />
        <div className="flex-1 overflow-auto">
            <div className="bg-gradient-to-b from-[#818CF8] to-[#C084FC] p-6">
            <div className="flex items-center">
                <Button
                variant="ghost"
                onClick={() => navigate("/purchases")}
                className="p-2 hover:bg-white/20"
                >
                <ArrowLeft className="h-6 w-6 text-white" />
                </Button>
                <div className="ml-4">
                <h1 className="text-2xl font-semibold text-white">
                    Receive Payment for #{invoice.number}
                </h1>
                <p className="text-white/80">
                    Remaining: {formatCurrency(totalInvoiceAmount - getPaidAmount())}
                </p>
                </div>
            </div>
            </div>

            <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <h2 className="text-lg font-semibold mb-4">Invoice Items</h2>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total Price</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {invoice.items.map((item, index) => (
                        <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                            {formatCurrency(item.price * item.quantity)}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>

                <div className="space-y-4">
                <div>
                    <label className="block text-lg font-medium mb-2">Payment Method</label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="w-full rounded-xl">
                        <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-green-500" />
                            <span>Cash</span>
                        </div>
                        </SelectItem>
                        <SelectItem value="bank">
                        <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4 text-purple-500" />
                            <span>Bank Transfer</span>
                        </div>
                        </SelectItem>
                        <SelectItem value="proforma">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span>Proforma</span>
                        </div>
                        </SelectItem>
                    </SelectContent>
                    </Select>
                </div>

                {(paymentMethod === "cash" || paymentMethod === "bank") && (
                    <div className="space-y-4">
                    <div>
                        <label className="block text-lg font-medium mb-2">
                        Payment Amount (IDR)
                        </label>
                        <Input
                        type="text"
                        value={paymentAmount}
                        onChange={handlePaymentAmountChange}
                        placeholder={`Max: ${formatCurrency(totalInvoiceAmount - getPaidAmount())}`}
                        className="rounded-xl"
                        />
                    </div>
                    </div>
                )}

                {paymentMethod === "proforma" && (
                    <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Proforma Items</h2>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {proformaItems.map((item, index) => (
                            <TableRow key={index}>
                            <TableCell>
                                <Input
                                value={item.name}
                                onChange={(e) => {
                                    const newItems = [...proformaItems];
                                    newItems[index].name = e.target.value;
                                    setProformaItems(newItems);
                                }}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                    const newItems = [...proformaItems];
                                    newItems[index].quantity = Number(e.target.value);
                                    setProformaItems(newItems);
                                }}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                type="number"
                                value={item.price}
                                onChange={(e) => {
                                    const newItems = [...proformaItems];
                                    newItems[index].price = Number(e.target.value);
                                    setProformaItems(newItems);
                                }}
                                />
                            </TableCell>
                            <TableCell>
                                <Button
                                variant="ghost"
                                onClick={() => handleDeleteProformaItem(index)}
                                className="text-red-500"
                                >
                                <Trash className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    <Button
                        type="button"
                        onClick={() => setProformaItems([...proformaItems, { name: "", quantity: 1, price: 0 }])}
                        className="mt-2"
                    >
                        Add Item
                    </Button>
                    </div>
                )}

                <div>
                    <label className="block text-lg font-medium mb-2">
                    Attachments (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <UploadCloud className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">Drop files to upload or click here</p>
                        <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        />
                        <label
                        htmlFor="file-upload"
                        className="cursor-pointer text-indigo-600 hover:text-indigo-700"
                        >
                        Browse files
                        </label>
                    </div>
                    <div className="mt-4">
                        <Input
                        type="text"
                        placeholder="Or paste a link (YouTube, Vimeo, etc.)"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="rounded-xl"
                        />
                        <Button
                        type="button"
                        onClick={handleAddLink}
                        className="mt-2"
                        >
                        Add Link
                        </Button>
                    </div>
                    <div className="mt-4 space-y-2">
                        {attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                            <div className="flex items-center gap-2">
                            {attachment.type === "file" ? (
                                <FileText className="h-4 w-4 text-blue-500" />
                            ) : (
                                <LinkIcon className="h-4 w-4 text-green-500" />
                            )}
                            <span>{attachment.name}</span>
                            </div>
                            <Button
                            variant="ghost"
                            onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                            className="text-red-500"
                            >
                            <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={!isFormValid()}
                    >
                    Submit Payment
                    </Button>
                </div>
                </div>
            </form>
            </div>
        </div>
        </div>
    );
    }