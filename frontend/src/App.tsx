import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Login } from "@/pages/Login";
import { Logs } from "@/components/Logs";
import { PurchaseOrderDetails } from "@/pages/PurchaseOrderDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle login redirect for authenticated users
const LoginRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect authenticated users away from login
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <Login />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Protected home route - shows Logs component */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Logs />
                </ProtectedRoute>
              }
            />
            
            {/* Purchase Order Details route */}
            <Route
              path="/purchase-order/:purchaseSupabaseId/:processingLogId?"
              element={
                <ProtectedRoute>
                  <PurchaseOrderDetails />
                </ProtectedRoute>
              }
            />
            
            {/* Login route - redirects authenticated users */}
            <Route path="/login" element={<LoginRedirect />} />

            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
