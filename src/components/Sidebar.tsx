import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSidebar } from '../context/SidebarContext';
import { fetchMe, type AuthUser } from '../services/authService';
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronLeft,
  StickyNotePlus,
  ImagePlus,
  ShoppingCart,
  ChevronRight,
  Package,
  ListSortDescending,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  children?: NavItem[];
  icon: LucideIcon;
  badge?: number;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Posts', href: '/posts/new', icon: StickyNotePlus },
  { name: 'Media', href: '/media', icon: ImagePlus },
  {
    name: 'store',
    href: '/store',
    icon: ShoppingCart,
    children: [
      { name: 'Products', href: '/products', icon: Package },
      { name: 'Categories', href: '/categories', icon: ListSortDescending },
      { name: 'Orders', href: '/store/orders', icon: BarChart3 },
    ],
  },
];

const bottomNavItems: NavItem[] = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { isOpen, toggle } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [hovered, setHovered] = useState<string | null>(null);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetchMe()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null));
  }, []);

  const isItemActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const toggleMenu = (href: string) => {
    setOpenMenus((current) =>
      current.includes(href)
        ? current.filter((item) => item !== href)
        : [...current, href]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const handleNavClick = () => {
    // Automatically close sidebar overlay on mobile after clicking a link
    if (window.innerWidth < 1024 && isOpen) {
      toggle();
    }
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isItemActive(item.href);
    const hasChildren = Boolean(item.children?.length);
    const isMenuOpen = openMenus.includes(item.href);

    const childActive = item.children?.some((child) =>
      isItemActive(child.href)
    );

    return (
      <li key={item.href} className="relative">
        <div className="relative">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => {
                if (isOpen) {
                  toggleMenu(item.href);
                }
              }}
              onMouseEnter={() => setHovered(item.href)}
              onMouseLeave={() => setHovered(null)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isOpen ? '' : 'justify-center'
              } ${
                active || childActive
                  ? 'bg-emerald-50 text-gray-900 dark:bg-emerald-500/10 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/70'
              }`}
            >
              <span className="relative shrink-0">
                <Icon
                  size={20}
                  strokeWidth={active || childActive ? 2.25 : 1.75}
                  className={
                    active || childActive
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }
                />
              </span>

              {isOpen && (
                <>
                  <span className="flex-1 truncate text-left">
                    {item.name}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                      isMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </>
              )}
            </button>
          ) : (
            <Link
              to={item.href}
              onClick={handleNavClick}
              onMouseEnter={() => setHovered(item.href)}
              onMouseLeave={() => setHovered(null)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isOpen ? '' : 'justify-center'
              } ${
                active
                  ? 'bg-emerald-50 text-gray-900 dark:bg-emerald-500/10 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/70'
              }`}
            >
              <span className="relative shrink-0">
                <Icon
                  size={20}
                  strokeWidth={active ? 2.25 : 1.75}
                  className={
                    active
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }
                />

                {item.badge ? (
                  <span
                    className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900 ${
                      isOpen ? 'hidden' : ''
                    }`}
                  />
                ) : null}
              </span>

              {isOpen && (
                <span className="flex-1 truncate">
                  {item.name}
                </span>
              )}

              {isOpen && item.badge ? (
                <span className="rounded-md bg-red-500 px-2 py-0.5 text-xs font-semibold leading-none text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          )}

          {!isOpen && hovered === item.href && (
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-gray-700">
              {item.name}
            </span>
          )}
        </div>

        {isOpen && hasChildren && isMenuOpen && (
          <ul className="mt-1 space-y-1 pl-9">
            {item.children?.map((child) => {
              const ChildIcon = child.icon;
              const childIsActive = isItemActive(child.href);

              return (
                <li key={child.href}>
                  <Link
                    to={child.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      childIsActive
                        ? 'bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                    }`}
                  >
                    <ChildIcon
                      size={16}
                      strokeWidth={childIsActive ? 2 : 1.75}
                    />

                    <span className="truncate">
                      {child.name}
                    </span>

                    {child.badge ? (
                      <span className="ml-auto rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {child.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  const avatarSrc = user?.avatarUrl ? `${import.meta.env.VITE_API_URL}${user.avatarUrl}` : null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggle}
        aria-hidden="true"
      />

      {/* Responsive Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col border-r border-gray-200 bg-white shadow-2xl transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:static lg:z-auto lg:shadow-none ${
          isOpen
            ? 'translate-x-0 w-72 lg:w-64'
            : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Desktop Expand/Collapse Toggle Button */}
        <button
          onClick={toggle}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={isOpen}
          className="absolute -right-3 top-9 z-50 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition-colors hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Sidebar Header */}
        <div
          className={`flex items-center justify-between border-b border-gray-100 px-4 py-5 dark:border-gray-800 ${
            isOpen ? '' : 'justify-center px-0'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white dark:bg-gray-700">
              M
            </div>
            {isOpen && (
              <button className="flex min-w-0 flex-1 items-center justify-between rounded-md py-1 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  Mediqo Blog
                </span>
                <ChevronDown size={16} className="ml-2 shrink-0 text-gray-400" />
              </button>
            )}
          </div>

          {/* Mobile Close Button */}
          {isOpen && (
            <button
              onClick={toggle}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 lg:hidden"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">{navItems.map(renderNavItem)}</ul>
        </nav>

        {/* Bottom Navigation */}
        <nav className="px-3 pb-2">
          <ul className="space-y-1">{bottomNavItems.map(renderNavItem)}</ul>
        </nav>

        {/* User Footer & Logout */}
        <div
          className={`border-t border-gray-100 px-4 py-4 dark:border-gray-800 ${
            isOpen ? '' : 'flex flex-col items-center gap-2 px-0'
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user?.username ?? ''}
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            {isOpen && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {user?.username ?? 'Loading…'}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {user?.email ?? ''}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800 ${
              isOpen ? 'w-full' : ''
            }`}
          >
            <LogOut size={18} strokeWidth={1.75} />
            {isOpen && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}