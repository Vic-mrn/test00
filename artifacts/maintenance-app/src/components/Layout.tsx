import React from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden max-w-full">
        {/* Top header could go here if needed, but sidebar is enough for this layout */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
