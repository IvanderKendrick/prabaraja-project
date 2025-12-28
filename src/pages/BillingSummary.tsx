import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Eye, Edit, Printer } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
// import { PurchaseFilters } from "../components/purchases/PurchaseFilters";
// import { PurchaseAddButton } from "../components/purchases/PurchaseAddButton";
// import { AddPurchaseDialog } from "@/components/AddPurchaseDialog";
import { StatsCards } from "../components/purchases/StatsCards";
import { Pagination } from "@/components/Pagination";
import { handleError } from "@/utils/errorHandler";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatPriceWithSeparator } from "@/utils/salesUtils";

type BillingAction = "getBillingInvoice" | "getBillingOrder";
type BillingView = "invoice" | "order";

interface RawPurchaseRow {
  id?: string;
  vendor_name?: string;
  vendor?: { name?: string };
  invoice_date?: string;
  order_date?: string;
  date?: string;
  terms?: string;
  terms_discount?: string;
  total?: number;
  grand_total?: number;
  amount?: number;
  items?: unknown;
  status?: string;
  [key: string]: unknown;
}

interface ApiResponse {
  error?: boolean;
  message?: string;
  data?: RawPurchaseRow[];
  total?: number;
  totalPages?: number;
}

const getAuthToken = () => {
  const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!authDataRaw) throw new Error("No access token found in localStorage");
  const authData = JSON.parse(authDataRaw);
  const token = authData.access_token;
  if (!token) throw new Error("Access token missing in parsed auth data");
  return token;
};

const BillingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // support initializing tab via query param `?tab=order|invoice` or location.state.tab
  const getInitialAction = (): BillingAction => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = (params.get("tab") || (location.state && (location.state as any).tab) || "invoice").toString();
      return tab === "order" ? "getBillingOrder" : "getBillingInvoice";
    } catch (_e) {
      return "getBillingInvoice";
    }
  };

  const [action, setAction] = useState<BillingAction>(getInitialAction);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [rows, setRows] = useState<RawPurchaseRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simple stats calculation (these would ideally come from the API)
  const unpaidAmount = 0;
  const overdueCount = 0;
  const last30DaysPayments = 0;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const viewToAction: Record<BillingView, BillingAction> = {
    invoice: "getBillingInvoice",
    order: "getBillingOrder",
  };
  const actionToView: Record<BillingAction, BillingView> = {
    getBillingInvoice: "invoice",
    getBillingOrder: "order",
  };

  const mappedRows = useMemo<
    Array<{
      id: string;
      vendorName: string;
      date: string | null;
      number: string;
      remainBalance: number;
      paidAmount: number;
      totalAmount: number;
      status: string;
      readyForPayment: boolean;
      items: unknown;
    }>
  >(() => {
    return rows.map((r) => {
      let parsedItems: unknown = r.items;
      if (typeof parsedItems === "string") {
        try {
          parsedItems = JSON.parse(parsedItems);
        } catch (_e) {
          // leave as string if not JSON
        }
      }

      // determine if invoice has the required fields for Payment
      const paymentMethodField = typeof r.payment_method === "string" ? (r.payment_method as string) : String(r.payment_method ?? "");
      const vendorObjName = r.vendor && typeof r.vendor === "object" && (r.vendor as Record<string, unknown>).name ? String((r.vendor as Record<string, unknown>).name) : undefined;
      const hasVendor = Boolean(r.vendor_name || vendorObjName || r.vendor_COA);
      const hasPaymentCoaOrName = Boolean(r.payment_COA || r.payment_name);
      // For billing orders the API may use `installment_amount` as the amount to be paid
      // prefer paid_amount (invoices) but fall back to installment_amount (orders)
      const paidAmtNum = Number(r.paid_amount ?? r.installment_amount ?? 0);
      const installmentOk = paymentMethodField === "Partial Payment" ? Boolean(r.installment_type) : true;
      // For Billing Order tab the payment method may not be set; allow readyForPayment
      // when vendor, payment COA/name and amount are present. For invoices require payment method.
      const readyForPayment = action === "getBillingOrder" ? Boolean(hasVendor && hasPaymentCoaOrName && paidAmtNum > 0 && installmentOk) : Boolean(paymentMethodField && hasVendor && hasPaymentCoaOrName && paidAmtNum > 0 && installmentOk);

      return {
        id: r.id || `${r.vendor_name || r.vendor?.name || "-"}-${r.invoice_date || r.order_date || r.date || ""}`,
        vendorName: r.vendor_name || r.vendor?.name || "-",
        date: r.invoice_date || r.order_date || r.date || null,
        number: r.number || "-",
        // For billing invoice view we want to show the remain_balance field
        remainBalance: Number(r.remain_balance ?? 0),
        // Paid amount (take directly from API paid_amount when present)
        paidAmount: typeof r.paid_amount === "number" ? r.paid_amount : Number(r.paid_amount ?? 0),
        totalAmount: r.grand_total ?? r.amount ?? 0,
        status: r.status || "-",
        readyForPayment,
        items: parsedItems,
      };
    });
  }, [rows, action]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      const url = new URL("https://pbw-backend-api.vercel.app/api/purchases");
      url.searchParams.set("action", action);
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("page", String(page));

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const json: ApiResponse = await res.json();
      if (json.error) throw new Error(json.message || "Failed to fetch billing data");

      const data = json.data || [];
      setRows(data);
      const incomingTotal = json.total ?? data.length;
      setTotal(incomingTotal);
      if (json.totalPages) {
        setTotalPages(json.totalPages);
      } else {
        setTotalPages(Math.max(1, Math.ceil(incomingTotal / limit)));
      }
    } catch (err: unknown) {
      const appError = handleError(err, "Gagal memuat data billing.");
      setError(appError.message);
      setRows([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If location search or state changes (external navigation), update `action` accordingly
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") || (location.state && (location.state as any).tab);
    if (tab) {
      const nextAction = tab === "order" ? "getBillingOrder" : "getBillingInvoice";
      if (nextAction !== action) setAction(nextAction);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, page, limit, location.search, (location.state as any)?.tab]);

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header title="Billing Summary" description="Summary of charges per invoice with payment and print actions" />

        <div className="p-6">
          <div className="mb-4 space-y-3">
            <div className="">
              <StatsCards unpaidAmount={unpaidAmount} overdueCount={overdueCount} last30DaysPayments={last30DaysPayments} />
            </div>

            {/* Tabs for desktop, Select for mobile */}
            <div className="hidden md:block">
              <Tabs
                value={actionToView[action]}
                onValueChange={(v) => {
                  const next = viewToAction[v as BillingView];
                  setAction(next);
                  setPage(1);
                  // update query string so location.search matches selection and doesn't override
                  try {
                    navigate(`${location.pathname}?tab=${v}`, { replace: true });
                  } catch (_e) {
                    /* ignore */
                  }
                }}
              >
                <TabsList>
                  <TabsTrigger value="invoice">Billing Invoice</TabsTrigger>
                  <TabsTrigger value="order">Billing Order</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="md:hidden max-w-xs">
              <Select
                value={action}
                onValueChange={(val: BillingAction) => {
                  setAction(val);
                  setPage(1);
                  try {
                    navigate(`${location.pathname}?tab=${actionToView[val]}`, { replace: true });
                  } catch (_e) {
                    /* ignore */
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe billing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="getBillingInvoice">Billing Invoice</SelectItem>
                  <SelectItem value="getBillingOrder">Billing Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>

                  {/* ✅ Ubah nama kolom tanggal tergantung jenis billing */}
                  <TableHead>{action === "getBillingOrder" ? "Order Date" : "Invoice Date"}</TableHead>

                  {action === "getBillingInvoice" ? (
                    <>
                      {/* ✅ Billing Invoice */}
                      <TableHead>Transaction Number</TableHead>
                      <TableHead>Remain Balance</TableHead>
                    </>
                  ) : (
                    <>
                      {/* ✅ Billing Order */}
                      <TableHead>Transaction Number</TableHead>
                      <TableHead>Paid Amount</TableHead>
                    </>
                  )}

                  <TableHead>{action === "getBillingOrder" ? "Order Total Charges" : "Invoice Total Charges"}</TableHead>

                  <TableHead>Status</TableHead>
                  <TableHead>Payment Button</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : mappedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No billing data yet
                    </TableCell>
                  </TableRow>
                ) : (
                  mappedRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.vendorName}</TableCell>

                      {/* ✅ Format tanggal tetap sama, hanya label di header yang berubah */}
                      <TableCell>{row.date ? format(new Date(row.date), "dd/MM/yyyy") : "-"}</TableCell>

                      {action === "getBillingInvoice" ? (
                        <>
                          <TableCell>{String(row.number ?? "-")}</TableCell>
                          <TableCell>{typeof row.remainBalance === "number" ? `Rp ${formatPriceWithSeparator(row.remainBalance)}` : "-"}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{String(row.number ?? "-")}</TableCell>
                          <TableCell className="font-medium">{typeof row.paidAmount === "number" && row.paidAmount > 0 ? `Rp ${formatPriceWithSeparator(row.paidAmount)}` : "-"}</TableCell>
                        </>
                      )}

                      <TableCell className="font-medium">Rp {formatPriceWithSeparator(row.totalAmount)}</TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            row.status?.toLowerCase() === "completed"
                              ? "bg-green-100 text-green-800"
                              : row.status?.toLowerCase() === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : row.status?.toLowerCase() === "unpaid" || row.status?.toLowerCase() === "paid"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {row.status}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Button
                          size="sm"
                          className={`${row.status?.toLowerCase() === "completed" || !row.readyForPayment ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
                          onClick={async () => {
                            if (row.status?.toLowerCase() === "completed" || !row.readyForPayment) return;

                            // Tentukan action API berdasarkan tab aktif
                            const actionToSend = action === "getBillingInvoice" ? "sendBillingInvoiceToCOA" : "sendBillingOrderToCOA";

                            try {
                              setSendingId(String(row.id));
                              const token = getAuthToken();

                              const res = await fetch("https://pbw-backend-api.vercel.app/api/purchases", {
                                method: "POST",
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ action: actionToSend, id: row.id }),
                              });

                              const json = await res.json();

                              if (!res.ok || json.error) {
                                toast.error(json.message || "Failed to send to COA");
                                return;
                              }

                              toast.success("Successfully sent to COA");
                              fetchData(); // Refresh tabel
                            } catch (err: unknown) {
                              console.error(err);
                              toast.error("Failed to send to COA. Please try again.");
                            } finally {
                              setSendingId(null);
                            }
                          }}
                          disabled={sendingId === String(row.id) || row.status?.toLowerCase() === "completed" || !row.readyForPayment}
                        >
                          {sendingId === String(row.id) ? "Sending..." : "Payment"}
                        </Button>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem
                              onClick={() => {
                                // Navigate to the correct view page depending on current action
                                const target = action === "getBillingInvoice" ? `/billing-invoice/view/${row.id}` : `/billing-order/view/${row.id}`;
                                window.location.href = target;
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            {action === "getBillingOrder" ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  if (row.status?.toLowerCase() !== "completed") {
                                    window.location.href = `/billing-order/edit/${row.id}`;
                                  }
                                }}
                                disabled={row.status?.toLowerCase() === "completed"}
                                className={row.status?.toLowerCase() === "completed" ? "text-gray-400 cursor-not-allowed" : ""}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  if (row.status?.toLowerCase() === "pending" || row.status?.toLowerCase() === "unpaid") {
                                    window.location.href = `/billing-invoice/edit/${row.id}`;
                                  }
                                }}
                                disabled={row.status?.toLowerCase() === "completed"}
                                className={row.status?.toLowerCase() === "completed" ? "text-gray-400 cursor-not-allowed" : ""}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => {}}>
                              <Printer className="mr-2 h-4 w-4" />
                              Print
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={(val) => {
                setLimit(val);
                setPage(1);
              }}
              itemsPerPageOptions={[10, 20, 50]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSummary;
