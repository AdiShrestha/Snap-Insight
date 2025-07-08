"use client";
import Image from "next/image";

export default function HistoryItem({ item }) {
  return (
    <div className="card mb-4 flex gap-4 items-start">
      {item.image && (
        <Image src={item.image} alt="Screenshot" width={100} height={100} className="rounded-lg object-cover" />
      )}
      <div>
        <h3 className="font-semibold text-[var(--color-accent)]">{item.timestamp}</h3>
        <p className="text-sm mt-1">{item.snippet}</p>
      </div>
    </div>
  );
}
