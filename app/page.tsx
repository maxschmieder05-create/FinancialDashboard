"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { OverviewSection } from "@/components/dashboard/sections/overview";
import { PipelineSection } from "@/components/dashboard/sections/pipeline";
import { DealsSection } from "@/components/dashboard/sections/deals";
import { CustomersSection } from "@/components/dashboard/sections/customers";
import { ForecastingSection } from "@/components/dashboard/sections/forecasting";
import { NewsSection } from "@/components/dashboard/sections/news";
import { topIndustrialCompanies } from "@/lib/industrials-data";
import { getSupabaseClient } from "@/lib/supabase-client";

export type Section = "overview" | "pipeline" | "deals" | "customers" | "forecasting" | "news";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [selectedTicker, setSelectedTicker] = useState(topIndustrialCompanies[0].ticker);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase?.auth.signOut();
  };

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <OverviewSection
            selectedTicker={selectedTicker}
            onTickerChange={setSelectedTicker}
            onSectionChange={setActiveSection}
          />
        );
      case "pipeline":
        return <PipelineSection selectedTicker={selectedTicker} onTickerChange={setSelectedTicker} />;
      case "deals":
        return <DealsSection selectedTicker={selectedTicker} onTickerChange={setSelectedTicker} />;
      case "customers":
        return <CustomersSection selectedTicker={selectedTicker} onTickerChange={setSelectedTicker} />;
      case "forecasting":
        return <ForecastingSection selectedTicker={selectedTicker} onTickerChange={setSelectedTicker} />;
      case "news":
        return <NewsSection />;
      default:
        return (
          <OverviewSection
            selectedTicker={selectedTicker}
            onTickerChange={setSelectedTicker}
            onSectionChange={setActiveSection}
          />
        );
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
      />
      <div
        className="flex-1 flex flex-col transition-[margin-left] duration-300 ease-out"
        style={{ marginLeft: sidebarCollapsed ? 72 : sidebarWidth }}
      >
        <Header
          activeSection={activeSection}
          selectedTicker={selectedTicker}
          onTickerChange={setSelectedTicker}
          onSectionChange={setActiveSection}
          userEmail={session.user.email ?? ""}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 p-6 overflow-auto">
          <div
            key={activeSection}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
