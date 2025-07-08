function ScreenshotCard({
  title,
  summary,
  date,
  viewMode,
}) {
  return (
    <div
      className={`p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer ${
        viewMode === "list" ? "mb-4 flex items-center gap-4" : ""
      }`}
    >
      <div className="bg-gray-200 rounded-md w-full h-40 md:h-48 flex-shrink-0" />
      <div className={viewMode === "list" ? "flex-1" : "mt-3"}>
        <p className="text-gray-800 font-semibold mb-1">{title}</p>
        <p className="text-gray-500 text-sm">{summary}</p>
        {viewMode === "list" && <div className="mt-2 text-xs text-gray-400">Date: {date}</div>}
      </div>
    </div>
  );
}

export default ScreenshotCard;