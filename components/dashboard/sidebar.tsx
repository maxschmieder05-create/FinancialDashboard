"use client";

import React from "react";

import { cn } from "@/lib/utils";
import type { Section } from "@/app/page";
import {
  LayoutDashboard,
  Handshake,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Building2,
  TrendingUp,
  BadgeDollarSign,
} from "lucide-react";

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  width: number;
  onWidthChange: (width: number) => void;
}

const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "pipeline", label: "Sales", icon: BadgeDollarSign },
  { id: "deals", label: "Deals", icon: Handshake },
  { id: "customers", label: "Customers", icon: Building2 },
  { id: "forecasting", label: "Forecasting", icon: TrendingUp },
];

export function Sidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onCollapsedChange,
  width,
  onWidthChange,
}: SidebarProps) {
  const visibleWidth = collapsed ? 72 : width;
  const compact = collapsed || visibleWidth < 180;

  const beginResize = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = visibleWidth;

    const handleMove = (moveEvent: MouseEvent) => {
      const nextWidth = Math.min(340, Math.max(72, startWidth + moveEvent.clientX - startX));
      onWidthChange(nextWidth);
      onCollapsedChange(nextWidth <= 96);
    };

    const handleUp = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  const toggleCollapsed = () => {
    if (collapsed) {
      onWidthChange(Math.max(width, 260));
      onCollapsedChange(false);
      return;
    }

    onCollapsedChange(true);
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-[width] duration-300 ease-out flex flex-col"
      style={{ width: visibleWidth }}
    >
      <div
        role="separator"
        aria-label="Resize sidebar"
        onMouseDown={beginResize}
        title="Drag to resize sidebar"
        className="absolute -right-2 top-20 z-40 h-[calc(100vh-160px)] w-4 cursor-col-resize rounded-full after:absolute after:left-1/2 after:top-0 after:h-full after:w-px after:-translate-x-1/2 after:bg-transparent hover:after:bg-accent/60"
      />
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-1/2 z-50 flex h-12 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-muted-foreground shadow-lg hover:border-accent/60 hover:text-foreground"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-white">
            <CircleDollarSign className="w-5 h-5 text-accent-foreground" />
          </div>
          <span
            className={cn(
              "font-semibold text-lg text-sidebar-foreground whitespace-nowrap transition-all duration-300",
              compact ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
            )}
          >
            Industrials
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              title={compact ? item.label : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                compact && "justify-center px-0",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {/* Active indicator */}
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-accent transition-all duration-300",
                  isActive && !compact ? "opacity-100" : "opacity-0"
                )}
              />
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-transform duration-200",
                  isActive ? "text-accent" : "group-hover:scale-110"
                )}
              />
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300",
                  compact ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar from footer" : "Collapse sidebar from footer"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              {!compact && <span>Collapse</span>}
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
