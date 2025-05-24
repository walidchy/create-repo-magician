
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import MemberProfile from "./pages/member/profile";
import MainLayout from "./components/layout/MainLayout";

// Admin pages
import Members from "./pages/admin/Members";
import Trainers from "./pages/admin/Trainers";
import Activities from "./pages/admin/Activities";
import Memberships from "./pages/admin/Memberships";
import Equipment from "./pages/admin/Equipment";
import AdminProfile from "./pages/admin/Profile";
import Attendances from "./pages/admin/Attendances";
import AttendanceCheckIn from "./pages/admin/AttendanceCheckIn";
import { TrainerForm } from "./components/admin/TrainerForm";

// Member pages
import MemberActivities from "./pages/member/Activities";
import MemberBookings from "./pages/member/Bookings";
import MemberMembership from "./pages/member/Membership";
import MemberPayment from "./pages/member/Payment";

// Trainer pages
import TrainerProfile from "./pages/trainer/Profile";
import TrainerActivities from "./pages/trainer/Activities";
import TrainerSchedule from "./pages/trainer/Schedule";
import TrainerClients from "./pages/trainer/Clients";
import TrainerCreateActivity from "./pages/trainer/CreateActivity";

const App = () => {
  // Create a new QueryClient instance inside the component
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route element={<ProtectedRoute requireAuth={false} />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>
              
              {/* Protected routes - require authentication */}
              <Route element={<ProtectedRoute requireAuth={true} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Member routes */}
                <Route path="/activities" element={<MemberActivities />} />
                <Route path="/bookings" element={<MemberBookings />} />
                <Route path="/membership" element={<MemberMembership />} />
                <Route path="/payment" element={<MemberPayment />} />
                <Route path="/member/profile" element={<MemberProfile />} />
                
                {/* Admin routes */}
                <Route path="/admin/members" element={<Members />} />
                <Route path="/admin/trainers" element={<Trainers />} />
                <Route path="/admin/trainers/new" element={
                  <MainLayout>
                    <TrainerForm open={true} onOpenChange={() => {}} onSuccess={() => {}} />
                  </MainLayout>
                } />
                <Route path="/admin/activities" element={<Activities />} />
                <Route path="/admin/memberships" element={<Memberships />} />
                <Route path="/admin/equipment" element={<Equipment />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
                <Route path="/admin/attendances" element={<Attendances />} />
                <Route path="/admin/attendances/check-in" element={<AttendanceCheckIn />} />
                
                {/* Trainer routes */}
                <Route path="/trainer/profile" element={<TrainerProfile />} />
                <Route path="/trainer/activities" element={<TrainerActivities />} />
                <Route path="/trainer/schedule" element={<TrainerSchedule />} />
                <Route path="/trainer/clients" element={<TrainerClients />} />
                <Route path="/trainer/activities/new" element={<TrainerCreateActivity />} />
              </Route>
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Navigate to="/member/profile" replace />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
