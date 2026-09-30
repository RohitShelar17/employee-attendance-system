import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {/* Scrim closes the drawer on small screens. */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-inverse-surface/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <main className="flex-1 px-margin-mobile py-lg md:px-margin-desktop">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
