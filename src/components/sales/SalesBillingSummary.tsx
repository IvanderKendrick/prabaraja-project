import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SalesStatsCards } from "@/components/sales/SalesStatsCards";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Printer } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/Pagination";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatPriceWithSeparator } from "@/utils/salesUtils";
import { getAuthToken } from "@/utils/errorHandler"; // reuse getAuthToken from BillingSummary? fallback below

type SalesBillingView = "receivable" | "order";

type RawRow = Record<string, any>;

const safeGetToken = () => {
  try {
    const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
    if (!authDataRaw) return null;
    const authData = JSON.parse(authDataRaw);
    return authData.access_token;
  } catch (e) {
    return null;
  }
};

export function SalesBillingSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const getInitialView = (): SalesBillingView => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = (params.get("tab") || (location.state && (location.state as any).tab) || "receivable").toString();
      return tab === "order" ? "order" : "receivable";
    } catch (_e) {
      return "receivable";
    }
  };

  const [view, setView] = useState<SalesBillingView>(getInitialView);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [rows, setRows] = useState<RawRow[]>([]);
  const [unpaidAmount, setUnpaidAmount] = useState(0);
  const [last30DaysReceived, setLast30DaysReceived] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const action = useMemo(() => (view === "receivable" ? "getReceivableSummary" : "getBillingOrder"), [view]);

  const mappedRows = useMemo(() => {
    return rows.map((r) => ({
      id: r.id || r.number || Math.random().toString(36).slice(2),
      customerName: r.customer_name || r.customer || "-",
      date: r.invoice_date || r.order_date || r.date || null,
      number: r.number || "-",
      remainBalance: Number(r.remain_balance ?? r.remain_balance ?? 0),
      paidAmount: Number(r.paid_amount ?? 0),
      totalAmount: Number(r.grand_total ?? r.total ?? 0),
      status: r.status || "-",
      raw: r,
    }));
  }, [rows]);

  // Fetch stats for cards
  const fetchStats = async () => {
    try {
      const token = safeGetToken();
      if (!token) throw new Error("No auth token");
      const url = new URL("https://pbw-backend-api.vercel.app/api/sales");
      url.searchParams.set("action", "getReceivableSummaryStats");
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setUnpaidAmount(Number(json.unpaidAmount ?? 0));
      setLast30DaysReceived(Number(json.last30DaysReceived ?? 0));
    } catch (err) {
      setUnpaidAmount(0);
      setLast30DaysReceived(0);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = safeGetToken();
      if (!token) throw new Error("No auth token");

      const url = new URL("https://pbw-backend-api.vercel.app/api/sales");
      url.searchParams.set("action", action);
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("page", String(page));
      if (searchValue) url.searchParams.set("search", searchValue);

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setRows(json.data || []);
      const incomingTotal = json.total ?? (json.data ? json.data.length : 0);
      setTotal(incomingTotal);
      setTotalPages(json.totalPages ?? Math.max(1, Math.ceil(incomingTotal / limit)));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load data");
      setRows([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, page, limit, searchValue]);

  // respond to external navigation that may include ?tab=order or location.state.tab
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = params.get("tab") || (location.state && (location.state as any).tab);
      if (tab) {
        const next = tab === "order" ? "order" : "receivable";
        if (next !== view) setView(next as SalesBillingView);
      }
    } catch (_e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, (location.state as any)?.tab]);

  const handleSendPayment = async (id: string) => {
    try {
      setSendingId(id);
      const token = safeGetToken();
      if (!token) throw new Error("No auth token");
      const sendAction = view === "receivable" ? "sendReceivableSummaryToCOA" : "sendBillingOrderToCOA";
      const res = await fetch("https://pbw-backend-api.vercel.app/api/sales", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: sendAction, id }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        toast.error(json.message || "Failed to send to COA");
        return;
      }
      toast.success("Successfully sent to COA");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send to COA");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="rounded-md border p-4">
      <SalesStatsCards unpaidAmount={unpaidAmount} last30DaysReceived={last30DaysReceived} />
      <div className="mb-4">
        <div className="hidden md:block">
          <Tabs
            value={view}
            onValueChange={(v) => {
              setView(v as SalesBillingView);
              setPage(1);
              try {
                navigate(`${location.pathname}?tab=${v}`, { replace: true });
              } catch (_e) {
                /* ignore */
              }
            }}
          >
            <TabsList>
              <TabsTrigger value="receivable">Receivable Summary</TabsTrigger>
              <TabsTrigger value="order">Billing Order</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="md:hidden max-w-xs">
          <Select
            value={action}
            onValueChange={(val: string) => {
              const nextView = val === "getReceivableSummary" ? "receivable" : "order";
              setView(nextView as SalesBillingView);
              setPage(1);
              try {
                navigate(`${location.pathname}?tab=${nextView === "order" ? "order" : "receivable"}`, { replace: true });
              } catch (_e) {
                /* ignore */
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="getReceivableSummary">Receivable Summary</SelectItem>
              <SelectItem value="getBillingOrder">Billing Order</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>{view === "order" ? "Order Date" : "Invoice Date"}</TableHead>
            <TableHead>Transaction Number</TableHead>
            <TableHead>{view === "order" ? "Paid Amount" : "Remain Balance"}</TableHead>
            <TableHead>{view === "order" ? "Order Total Charges" : "Invoice Total Charges"}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Button</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          ) : mappedRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No data
              </TableCell>
            </TableRow>
          ) : (
            mappedRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.customerName}</TableCell>
                <TableCell>{row.date ? format(new Date(row.date), "dd/MM/yyyy") : "-"}</TableCell>
                <TableCell>{row.number}</TableCell>
                <TableCell className="font-medium">{view === "order" ? (row.paidAmount > 0 ? `Rp ${formatPriceWithSeparator(row.paidAmount)}` : "-") : `Rp ${formatPriceWithSeparator(row.remainBalance)}`}</TableCell>
                <TableCell className="font-medium">Rp {formatPriceWithSeparator(row.totalAmount)}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      row.status?.toLowerCase() === "completed" ? "bg-green-100 text-green-800" : row.status?.toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {row.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    className={row.status?.toLowerCase() === "completed" ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}
                    onClick={() => {
                      if (row.status?.toLowerCase() === "completed") return;
                      handleSendPayment(row.id);
                    }}
                    disabled={sendingId === String(row.id) || row.status?.toLowerCase() === "completed"}
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
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          navigate(view === "receivable" ? `/sales-receivable-summary/${row.id}` : `/sales-billing-order/${row.id}`);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (row.status?.toLowerCase() === "completed") return;
                          navigate(view === "receivable" ? `/sales-receivable-summary/edit/${row.id}` : `/sales-billing-order/edit/${row.id}`);
                        }}
                        disabled={row.status?.toLowerCase() === "completed"}
                        className={row.status?.toLowerCase() === "completed" ? "text-gray-400 cursor-not-allowed" : ""}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          /* TODO: implement print */
                        }}
                      >
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
  );
}
