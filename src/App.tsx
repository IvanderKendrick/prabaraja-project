
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

// Import create components
import CreateNewPurchase from "./components/create/CreateNewPurchase";
import CreateNewSales from "./components/create/CreateNewSales";
import CreateExpense from "./components/create/CreateExpense";

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
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/purchases" element={
                <ProtectedRoute>
                  <Purchases />
                </ProtectedRoute>
              } />
              <Route path="/purchases/:tab" element={
                <ProtectedRoute>
                  <Purchases />
                </ProtectedRoute>
              } />
              
              <Route path="/sales" element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              } />
              <Route path="/sales/:tab" element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              } />
              
              <Route path="/products" element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              } />
              
              <Route path="/add-product" element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              } />
              
              <Route path="/edit-product/:id" element={
                <ProtectedRoute>
                  <EditProduct />
                </ProtectedRoute>
              } />
              
              <Route path="/add-warehouse" element={
                <ProtectedRoute>
                  <AddWarehouse />
                </ProtectedRoute>
              } />
              
              <Route path="/adjust-stock" element={
                <ProtectedRoute>
                  <AdjustStock />
                </ProtectedRoute>
              } />
              
              <Route path="/contacts" element={
                <ProtectedRoute>
                  <Contacts />
                </ProtectedRoute>
              } />
              
              <Route path="/create-contact" element={
                <ProtectedRoute>
                  <CreateContact />
                </ProtectedRoute>
              } />
              
              <Route path="/contact-details/:id" element={
                <ProtectedRoute>
                  <ContactDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/contact-details/:id/edit" element={
                <ProtectedRoute>
                  <EditContact />
                </ProtectedRoute>
              } />
              
              <Route path="/cashnbank" element={
                <ProtectedRoute>
                  <CashnBank />
                </ProtectedRoute>
              } />
              
              {/* Add missing cash-bank route that redirects to cashnbank */}
              <Route path="/cash-bank" element={<Navigate to="/cashnbank" replace />} />
              
              <Route path="/cashflow-analysis" element={
                <ProtectedRoute>
                  <CashflowAnalysis />
                </ProtectedRoute>
              } />
              
              <Route path="/assets" element={
                <ProtectedRoute>
                  <Assets />
                </ProtectedRoute>
              } />
              <Route path="/assets/:tab" element={
                <ProtectedRoute>
                  <Assets />
                </ProtectedRoute>
              } />
              
              <Route path="/expenses" element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              } />
              
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              
              <Route path="/master-data" element={
                <ProtectedRoute>
                  <MasterData />
                </ProtectedRoute>
              } />
              
              <Route path="/note-journal" element={
                <ProtectedRoute>
                  <NoteJournal />
                </ProtectedRoute>
              } />
              
              {/* Add missing Neraca route */}
              <Route path="/neraca" element={
                <ProtectedRoute>
                  <Neraca />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              <Route path="/receive-payment/:invoiceId" element={
                <ProtectedRoute>
                  <ReceivePaymentPage />
                </ProtectedRoute>
              } />
              
              {/* Create routes - Make sure these are properly defined */}
              <Route path="/create-purchase" element={
                <ProtectedRoute>
                  <CreateNewPurchase />
                </ProtectedRoute>
              } />
              
              <Route path="/create-sales" element={
                <ProtectedRoute>
                  <CreateNewSales />
                </ProtectedRoute>
              } />
              
              <Route path="/create-expense" element={
                <ProtectedRoute>
                  <CreateExpense />
                </ProtectedRoute>
              } />
              
              {/* Detail routes */}
              <Route path="/invoice/:id" element={
                <ProtectedRoute>
                  <InvoiceDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/sales-invoice/:id" element={
                <ProtectedRoute>
                  <SalesInvoiceDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/order-delivery/:id" element={
                <ProtectedRoute>
                  <OrderDeliveryDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/quotation/:id" element={
                <ProtectedRoute>
                  <QuotationDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/purchase-quotation/:id" element={
                <ProtectedRoute>
                  <PurchaseQuotationDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/order/:id" element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/offer/:id" element={
                <ProtectedRoute>
                  <OfferDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/shipment/:id" element={
                <ProtectedRoute>
                  <ShipmentDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/expense/:id" element={
                <ProtectedRoute>
                  <ExpenseDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/request/:id" element={
                <ProtectedRoute>
                  <RequestDetail />
                </ProtectedRoute>
              } />
              
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
