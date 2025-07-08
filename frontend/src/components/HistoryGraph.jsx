"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";



export default function HistoryGraph({data}) {
  return (
    <div className="card w-full h-72">
      <h2 className="text-xl font-semibold mb-4 text-[var(--color-subtext)]">Search Activity</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#8884d8" />
          <XAxis dataKey="name" stroke="var(--color-accent)" />
          <YAxis stroke="var(--color-accent)" />
          <Tooltip />
          <Line type="monotone" dataKey="searches" stroke="#8a2be2" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
