import { App } from "antd";
import ChatAI from "../../components/ChatAI";
import Sidebar from "../../components/LeftSIdeBar";
import { useState } from "react";
import AppLayout from "../../components/Layout/AppLayout";
const user = { a: 'username' };
  const breadcrumbItems = [
    { title: 'Home' },
    { title: 'Chat' },
  ];

export default function ChatPage() {
     const [collapsed, setCollapsed] = useState(false);

  return(
   <AppLayout breadcrumbItems={breadcrumbItems} user={user}>
     <div className="flex h-screen w-full gap-6 bg-[var(--color-bg-end)] text-[var(--color-text)]">
      {/* <Sidebar collapsed={collapsed} onCollapse={setCollapsed} user={{ a: "username" }} /> */}
         <div className="p-6 w-full overflow-y-scroll">
        <ChatAI />
        </div>
    </div>
   </AppLayout>);
}
