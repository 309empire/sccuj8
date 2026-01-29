import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { TeamSection } from "@/components/TeamSection";
import { UpdateProgress } from "@/components/UpdateProgress";
import { SupportSection } from "@/components/SupportSection";
import { StaffPanel } from "@/components/StaffPanel";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { Home } from "@/pages/Home";
import { isStaffAuthenticated } from "@/lib/api";

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [staffAuth, setStaffAuth] = useState(false);

  useEffect(() => {
    setStaffAuth(isStaffAuthenticated());
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = () => {
    setStaffAuth(true);
    setActiveTab("staff");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Home onNavigate={handleTabChange} />;
      case "team":
        return <TeamSection />;
      case "progress":
        return <UpdateProgress />;
      case "discord":
        return <SupportSection mode="discord" onModeChange={() => setActiveTab("ticket")} />;
      case "ticket":
        return <SupportSection mode="ticket" onModeChange={() => setActiveTab("discord")} />;
      case "staff":
        return staffAuth ? <StaffPanel /> : <Home onNavigate={handleTabChange} />;
      default:
        return <Home onNavigate={handleTabChange} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isStaffAuthenticated={staffAuth}
            onAdminLogin={() => setIsLoginModalOpen(true)}
          />
          <main>{renderContent()}</main>
          <AdminLoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onSuccess={handleLoginSuccess}
          />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
