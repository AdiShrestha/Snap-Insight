"use client";

import Sidebar from "../../components/LeftSIdeBar";
import { useState } from "react";
import { theme } from "antd";
import Image from "next/image";
import HistoryGraph from "../../components/HistoryGraph";
import HistoryItem from "../../components/HistoryItem";
import AppLayout from "../../components/Layout/AppLayout";

const dummyHistory = [
  {
    id: 1,
    image: "/screenshot1.png",
    timestamp: "2025-06-01 10:24AM",
    snippet: "Identified Eiffel Tower in the image and provided details...",
  },
  {
    id: 2,
    image: null,
    timestamp: "2025-06-03 03:45PM",
    snippet: "Text detected: 'Invoice #00123', matched details online...",
  },

];

const data = [
  { name: "week 1", searches: 5 },
  { name: "week 2", searches: 9 },
  { name: "week 3", searches: 3 },
  { name: "week 4", searches: 7 },
];

const user = { a: 'username' };
  const breadcrumbItems = [
    { title: 'History' },
    { title: 'This month' },
  ];

export default function ThisMonth(){
 const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();


    return (
       <AppLayout breadcrumbItems={breadcrumbItems} user={user}>
        <div className="flex h-screen w-full gap-6  text-[var(--color-text)]">
      <div className="p-6 w-full overflow-y-scroll">
        {/* <h1 className="text-3xl font-bold mb-6 text-[var(--color-primary)]">This Month's History</h1> */}
        <HistoryGraph data={data} />
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-[var(--color-subtext)] mb-4">Search Logs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyHistory.map((item) => (
             <HistoryItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
    </AppLayout>
    );
}