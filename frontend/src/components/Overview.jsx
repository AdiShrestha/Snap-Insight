function Overview({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
export default Overview;