import React, { useState } from 'react';
import ScreenshotCard from "./ScreenshotCard";

export default function Recents() {
  const [viewMode, setViewMode] = useState("grid");

  const screenshots = Array(6).fill({
    title: "Screenshot Title",
    summary: "AI-generated insight or OCR summary preview.",
    date: "2025-06-11",
  });

  return (
    <>
      <section className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Recent Screenshots</h2>
        <div className="space-x-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1 rounded ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            aria-label="Grid View"
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 rounded ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            aria-label="List View"
          >
            List
          </button>
        </div>
      </section>

      <section
        className={`mb-10 ${
          viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" : ""
        }`}
      >
        {screenshots.map(({ title, summary, date }, i) => (
          <ScreenshotCard
            key={i}
            title={`${title} #${i + 1}`}
            summary={summary}
            date={date}
            viewMode={viewMode}
          />
        ))}
      </section>
    </>
  );
}
