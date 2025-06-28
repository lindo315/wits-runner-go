import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import OrderCancellationNotifier from "@/components/OrderCancellationNotifier";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Earnings from "./pages/Earnings";
import OrderDetails from "./pages/OrderDetails";
import TestOrder from "./pages/TestOrder";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrderCancellationNotifier>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/earnings" element={<Earnings />} />
                <Route path="/order/:id" element={<OrderDetails />} />
                <Route path="/test-order" element={<TestOrder />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
            <Sonner />
          </Router>
        </OrderCancellationNotifier>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
