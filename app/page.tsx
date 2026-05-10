"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { OverviewSection } from "@/components/dashboard/sections/overview";
import { PipelineSection } from "@/components/dashboard/sections/pipeline";
import { DealsSection } from "@/components/dashboard/sections/deals";
import { CustomersSection } from "@/components/dashboard/sections/customers";
import { ForecastingSection } from "@/components/dashboard/sections/forecasting";
import { topIndustrialCompanies } from "@/lib/industrials-data";

export type Section = "overview" | "pipeline" | "deals" | "customers" | "forecasting";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [selectedTicker, setSelectedTicker] = useState(topIndustrialCompanies[0].ticker);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);

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
