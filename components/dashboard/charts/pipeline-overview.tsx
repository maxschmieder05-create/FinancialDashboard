"use client";

import { useState, useEffect } from "react";

const stages = [
  { name: "Core clients", value: 38, count: 5, color: "bg-chart-1" },
  { name: "Expansion", value: 27, count: 4, color: "bg-chart-2" },
  { name: "Future pools", value: 22, count: 3, color: "bg-chart-3" },
  { name: "M&A watch", value: 13, count: 5, color: "bg-accent" },
];

export function PipelineOverview() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-[380px] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-foreground">Sales Stages</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Distribution by account thesis</p>
      </div>

      <div className="space-y-5">
        {stages.map((stage, index) => (
          <div key={stage.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{stage.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{stage.count}</span>
                <span className="text-sm font-semibold text-foreground">{stage.value}%</span>
              </div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${stage.color} rounded-full transition-all duration-1000 ease-out`}
                style={{
                  width: isLoaded ? `${stage.value}%` : "0%",
                  transitionDelay: `${index * 150}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-5 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Modeled Sales Value</span>
          <span className="text-xl font-bold text-foreground">$48.0B</span>
        </div>
      </div>
    </div>
  );
}
