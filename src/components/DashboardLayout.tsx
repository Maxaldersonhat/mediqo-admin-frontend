import { Outlet } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout() {
  const { toggle } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* 1. Pass no props to Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white dark:bg-gray-700">
              M
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Mediqo Blog</span>
          </div>
          
          {/* 2. Use toggle from Context instead of setSidebarOpen */}
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}