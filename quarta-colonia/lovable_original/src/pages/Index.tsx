import { useState } from "react";
import Header from "@/components/portal/Header";
import LeftSidebar from "@/components/portal/LeftSidebar";
import HeroSection from "@/components/portal/HeroSection";
import AdBanner from "@/components/portal/AdBanner";
import NewsGrid from "@/components/portal/NewsGrid";
import MoreNews from "@/components/portal/MoreNews";
import RightSidebar from "@/components/portal/RightSidebar";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        {/* Left sidebar - hidden on mobile, visible on lg+ */}
        <div className="hidden lg:block">
          <LeftSidebar open={true} onClose={() => {}} />
        </div>
        {/* Mobile sidebar */}
        <div className="lg:hidden">
          <LeftSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 md:p-6 space-y-6">
          <HeroSection />
          <AdBanner />
          <NewsGrid />
          <MoreNews />
        </main>

        {/* Right sidebar - hidden on mobile */}
        <div className="hidden xl:block p-4 md:p-6 pl-0">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default Index;
