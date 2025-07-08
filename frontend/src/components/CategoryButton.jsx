import React from "react";

/**
 * CategoryButtons - Example category filter buttons
 */
export default function CategoryButtons() {
  return (
    <div className="flex gap-2 md:gap-4 mb-4 flex-wrap">
      <button className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition">
        Cooking
      </button>
      <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded shadow hover:bg-gray-400 transition">
        Shopping
      </button>
      {/* Add more categories as needed */}
    </div>
  );
}