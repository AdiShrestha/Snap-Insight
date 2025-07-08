import React from "react";
import Overview from "./Overview";

/**
 * StatsOverview - Responsive stats grid for dashboard
 * Props:
 *   overviewStats: { label: string; value: number; icon: string }[]
 */
export default function StatsOverview({ overviewStats }) {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {overviewStats.map(({ label, value, icon }) => (
        <Overview key={label} icon={icon} label={label} value={value} />
      ))}
    </section>
  );
}