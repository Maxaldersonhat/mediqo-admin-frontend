import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import Sidebar from './Sidebar';
import ClientLayout from './ClientLayout';
import { Menu } from 'lucide-react';

const PUBLIC_ROUTES = ['/login', '/forgot-password'];

function MainLayout({ children }: { children: React.ReactNode }) {
    const { toggle } = useSidebar();

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
            {/* Sidebar reads context state directly and expects no props */}
            <Sidebar />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Mobile Header (Hidden on Desktop) */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white dark:bg-gray-700">
                            M
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Mediqo Blog</span>
                    </div>
                    
                    {/* Hamburger Menu Toggle using Context */}
                    <button
                        onClick={toggle}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
                        aria-label="Open sidebar"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-y-auto relative">
                    <ClientLayout>{children}</ClientLayout>
                </main>
            </div>
        </div>
    );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    const isStandaloneRoute = 
        pathname === '/products/new' || 
        (pathname.startsWith('/products/') && pathname.endsWith('/edit'));

    const [checked, setChecked] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setAuthenticated(!!token);
        setChecked(true);

        if (!token && !isPublicRoute) {
            navigate('/login', { replace: true });
        }
    }, [pathname, isPublicRoute, navigate]);

    if (isPublicRoute) {
        return <>{children}</>;
    }

    if (!checked || !authenticated) {
        return null;
    }

    if (isStandaloneRoute) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-950">{children}</div>;
    }

    return (
        <SidebarProvider>
            <MainLayout>{children}</MainLayout>
        </SidebarProvider>
    );
}