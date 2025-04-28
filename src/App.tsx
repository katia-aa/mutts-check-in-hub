
import { CustomToaster } from "@/components/ui/custom-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import SignWaiver from "./pages/SignWaiver";
import UploadVaccine from "./pages/UploadVaccine";
import GuestCheckIn from "./pages/GuestCheckIn";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CustomToaster />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin-dashboard" element={<Admin />} />
          <Route path="/sign-waiver" element={<SignWaiver />} />
          <Route path="/upload-vaccine" element={<UploadVaccine />} />
          <Route path="/guest-check-in" element={<GuestCheckIn />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
