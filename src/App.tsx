import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TripProvider } from "@/contexts/TripContext";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Planner from "./pages/Planner";
import ActiveTrip from "./pages/ActiveTrip";
import Debrief from "./pages/Debrief";
import Privacy from "./pages/Privacy";
import SettingsPage from "./pages/SettingsPage";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TripProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="mx-auto max-w-md min-h-screen relative">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/home" element={<Home />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/active" element={<ActiveTrip />} />
              <Route path="/debrief" element={<Debrief />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/community" element={<Community />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </TripProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
