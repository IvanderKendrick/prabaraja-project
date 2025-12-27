import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Import all pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPass from "./pages/ForgotPass";
import Dashboard from "./pages/Dashboard";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import AddWarehouse from "./pages/AddWarehouse";
import AdjustStock from "./pages/AdjustStock";
import Contacts from "./pages/Contacts";
import CreateContact from "./pages/CreateContact";
import EditContact from "./pages/EditContact";
import ContactDetails from "./pages/ContactDetails";
import CashnBank from "./pages/CashnBank";
import CashflowAnalysis from "./pages/CashflowAnalysis";
import Assets from "./pages/Assets";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import MasterData from "./pages/MasterData";
import NoteJournal from "./pages/NoteJournal";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { ReceivePaymentPage } from "./pages/ReceivePaymentPage";
import Neraca from "./components/reports/neraca";
import BillingSummary from "./pages/BillingSummary";

// Import approval pages
import Approval from "./pages/Approval";

// Import detail components
import InvoiceDetail from "./components/detail/InvoiceDetail";
import SalesInvoiceDetail from "./components/detail/SalesInvoiceDetail";
import OrderDeliveryDetail from "./components/detail/OrderDeliveryDetail";
import QuotationDetail from "./components/detail/QuotationDetail";
import OrderDetail from "./components/detail/OrderDetail";
import OfferDetail from "./components/detail/OfferDetail";
import ShipmentDetail from "./components/detail/ShipmentDetail";
import ExpenseDetail from "./components/detail/ExpenseDetail";
import RequestDetail from "./components/detail/RequestDetail";
import { PurchaseQuotationDetail } from "./components/detail/PurchaseQuotationDetail";
import { PurchaseOffersDetail } from "./components/detail/PurchaseOffersDetail";

// Import create components
import CreateNewPurchase from "./components/create/CreateNewPurchase";
import EditPurchase from "./components/EditPurchase";
import CreateNewSales from "./components/create/CreateNewSales";
import CreateExpense from "./components/create/CreateExpense";
import { PurchaseRequestDetail } from "./components/detail/PurchaseRequestDetail";
import { PurchaseOrderDetail } from "./components/detail/PurchaseOrderDetail";
import { PurchaseShipmentDetail } from "./components/detail/PurchaseShipmentDetail";
import { PurchaseInvoiceDetail } from "./components/detail/PurchaseInvoiceDetail";
import EditQuotationPage from "./components/edit/EditQuotationPage";
import EditBillingInvoice from "./pages/EditBillingInvoice";
import ViewBillingInvoice from "./pages/ViewBillingInvoice";
import ViewBillingOrder from "./pages/ViewBillingOrder";
import EditBillingOrder from "./pages/EditBillingOrder";
import EditRequestPage from "./components/edit/EditRequestPage";
import EditShipmentPage from "./components/edit/EditShipmentPage";
import EditInvoicePage from "./components/edit/EditInvoicePage";
import Inventory from "./pages/Inventory/Inventory";
import StockDetail from "./pages/Inventory/Stock/StockDetail";
import ProductDetail from "./pages/Inventory/Product/ProductDetail";
import AddNewProduct from "./pages/Inventory/Product/AddNewProduct";
import Manufacture from "./pages/Manufacture/Manufacture";
import AddNewBom from "./pages/Manufacture/BoM/AddNewBom";
import EditProductionPlan from "./pages/Manufacture/PP/EditProductionPlan";
import EditWorkInProcess from "./pages/Manufacture/WiP/EditWorkInProcess";
import EditBom from "./pages/Manufacture/BoM/EditBom";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPass />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/purchases"
                element={
                  <ProtectedRoute>
                    <Purchases />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/purchases/:tab"
                element={
                  <ProtectedRoute>
                    <Purchases />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory/:tab"
                element={
                  <ProtectedRoute>
                    <Inventory />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory/stock/:id"
                element={
                  <ProtectedRoute>
                    <StockDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory/product/:id"
                element={
                  <ProtectedRoute>
                    <ProductDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory/product/add"
                element={
                  <ProtectedRoute>
                    <AddNewProduct />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/manufacture"
                element={
                  <ProtectedRoute>
                    <Manufacture />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/addnewbom"
                element={
                  <ProtectedRoute>
                    <AddNewBom />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/editbom/:id"
                element={
                  <ProtectedRoute>
                    <EditBom />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/editproductionplan/:id"
                element={
                  <ProtectedRoute>
                    <EditProductionPlan />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/editworkinprocess/:id"
                element={
                  <ProtectedRoute>
                    <EditWorkInProcess />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/sales"
                element={
                  <ProtectedRoute>
                    <Sales />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales/:tab"
                element={
                  <ProtectedRoute>
                    <Sales />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/add-product"
                element={
                  <ProtectedRoute>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit-product/:id"
                element={
                  <ProtectedRoute>
                    <EditProduct />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/add-warehouse"
                element={
                  <ProtectedRoute>
                    <AddWarehouse />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/adjust-stock"
                element={
                  <ProtectedRoute>
                    <AdjustStock />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/contacts"
                element={
                  <ProtectedRoute>
                    <Contacts />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create-contact"
                element={
                  <ProtectedRoute>
                    <CreateContact />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/contact-details/:id"
                element={
                  <ProtectedRoute>
                    <ContactDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/contact-details/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditContact />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cashnbank"
                element={
                  <ProtectedRoute>
                    <CashnBank />
                  </ProtectedRoute>
                }
              />

              {/* Add missing cash-bank route that redirects to cashnbank */}
              <Route
                path="/cash-bank"
                element={<Navigate to="/cashnbank" replace />}
              />

              <Route
                path="/cashflow-analysis"
                element={
                  <ProtectedRoute>
                    <CashflowAnalysis />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/assets"
                element={
                  <ProtectedRoute>
                    <Assets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assets/:tab"
                element={
                  <ProtectedRoute>
                    <Assets />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/expenses"
                element={
                  <ProtectedRoute>
                    <Expenses />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/master-data"
                element={
                  <ProtectedRoute>
                    <MasterData />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/note-journal"
                element={
                  <ProtectedRoute>
                    <NoteJournal />
                  </ProtectedRoute>
                }
              />

              {/* Add missing Neraca route */}
              <Route
                path="/neraca"
                element={
                  <ProtectedRoute>
                    <Neraca />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Billing Summary */}
              <Route
                path="/billing-summary"
                element={
                  <ProtectedRoute>
                    <BillingSummary />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/receive-payment/:invoiceId"
                element={
                  <ProtectedRoute>
                    <ReceivePaymentPage />
                  </ProtectedRoute>
                }
              />

              {/* Create routes - Make sure these are properly defined */}
              <Route
                path="/create-purchase"
                element={
                  <ProtectedRoute>
                    <CreateNewPurchase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-purchase/:id"
                element={
                  <ProtectedRoute>
                    <EditPurchase />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create-sales"
                element={
                  <ProtectedRoute>
                    <CreateNewSales />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create-expense"
                element={
                  <ProtectedRoute>
                    <CreateExpense />
                  </ProtectedRoute>
                }
              />

              {/* Detail routes */}
              <Route
                path="/invoice/:id"
                element={
                  <ProtectedRoute>
                    <InvoiceDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/sales-invoice/:id"
                element={
                  <ProtectedRoute>
                    <SalesInvoiceDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/order-delivery/:id"
                element={
                  <ProtectedRoute>
                    <OrderDeliveryDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/quotation/:id"
                element={
                  <ProtectedRoute>
                    <QuotationDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/purchase-quotation/:id"
                element={
                  <ProtectedRoute>
                    <PurchaseQuotationDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/purchase-offers/:id"
                element={
                  <ProtectedRoute>
                    <PurchaseOffersDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/purchase-request/:id"
                element={
                  <ProtectedRoute>
                    <PurchaseRequestDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/purchase-order/:id"
                element={
                  <ProtectedRoute>
                    <PurchaseOrderDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/purchase-shipment/:id"
                element={
                  <ProtectedRoute>
                    <PurchaseShipmentDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/purchase-invoice/:id"
                element={
                  <ProtectedRoute>
                    <PurchaseInvoiceDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit-quotation/:id"
                element={
                  <ProtectedRoute>
                    <EditQuotationPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit-request/:id"
                element={
                  <ProtectedRoute>
                    <EditRequestPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit-shipment/:id"
                element={
                  <ProtectedRoute>
                    <EditShipmentPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit-invoice/:id"
                element={
                  <ProtectedRoute>
                    <EditInvoicePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/offer/:id"
                element={
                  <ProtectedRoute>
                    <OfferDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/shipment/:id"
                element={
                  <ProtectedRoute>
                    <ShipmentDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/expense/:id"
                element={
                  <ProtectedRoute>
                    <ExpenseDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/request/:id"
                element={
                  <ProtectedRoute>
                    <RequestDetail />
                  </ProtectedRoute>
                }
              />

              {/* Unified Approval route */}
              <Route
                path="/approval"
                element={
                  <ProtectedRoute>
                    <Approval />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/billing-order/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditBillingOrder />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/billing-order/view/:id"
                element={
                  <ProtectedRoute>
                    <ViewBillingOrder />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/billing-invoice/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditBillingInvoice />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/billing-invoice/view/:id"
                element={
                  <ProtectedRoute>
                    <ViewBillingInvoice />
                  </ProtectedRoute>
                }
              />

              {/* Fallback routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
