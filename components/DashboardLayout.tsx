'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  href?: string;
  label: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  children?: MenuItem[];
}

interface Pembayaran {
  status: string;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [openMenus, setOpenMenus] = useState<string[]>(['Manajemen Data']);
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    fetchPembayaran();

    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      setUser(parsedUser);
    }

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('system');
    }
  }, [router]);
  const fetchPembayaran = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get('/api/admin/pembayaran', config);
      const failedPembayaran = response.data.data.filter((p: { status: string; }) => p.status === 'failed');
      setPembayaranList(failedPembayaran || []);
    } catch (error) {
      console.error('Error fetching pembayaran:', error);
    }
  };

  const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;

    if (selectedTheme === 'dark') {
      root.classList.add('dark');
    } else if (selectedTheme === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleThemeChange = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
    applyTheme(selectedTheme);
    setThemeOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const toggleMenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const menuSections: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'fa-solid fa-tachometer-alt',
      // children: [
      //   { href: '/admin', label: 'Dashboard Utama', icon: 'fa-solid fa-chart-line' },
      // ]
      href: '/admin',
    },
    {
      label: 'Manajemen Data',
      icon: 'fa-solid fa-database',
      children: [
        { href: '/admin/peserta', label: 'Kelola Peserta', icon: 'fa-solid fa-users' },
        { href: '/admin/berkas', label: 'Kelola Berkas', icon: 'fa-solid fa-folder-open' },
        { href: '/admin/pembayaran', label: 'Pembayaran', icon: 'fa-solid fa-credit-card', badge: `${pembayaranList.length}`, badgeColor: 'bg-green-500' },
      ]
    },
    {
      label: 'Pengaturan SPMB',
      icon: 'fa-solid fa-cog',
      children: [
        { href: '/admin/jalur', label: 'Jalur SPMB', icon: 'fa-solid fa-route' },
        { href: '/admin/pengumuman', label: 'Pengumuman Kelulusan', icon: 'fa-solid fa-bullhorn' },
      ]
    },
    {
      label: 'Komunikasi',
      icon: 'fa-solid fa-comments',
      children: [
        { href: '/admin/chat', label: 'Chat WhatsApp', icon: 'fa-brands fa-whatsapp', badge: '5', badgeColor: 'bg-blue-500' },
      ]
    },
    {
      label: 'Laporan',
      icon: 'fa-solid fa-file-alt',
      children: [
        { href: '/admin/laporan', label: 'Laporan Data', icon: 'fa-solid fa-chart-bar' },
      ]
    },
    {
      label: 'Sistem',
      icon: 'fa-solid fa-terminal',
      children: [
        { href: '/admin/console', label: 'Console Log', icon: 'fa-solid fa-code' },
      ]
    },
  ];

  if (!user) {
    return null;
  }

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const isOpen = openMenus.includes(item.label);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => toggleMenu(item.label)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-sm text-gray-300 hover:bg-gray-800 transition ${isChild ? 'pl-8' : ''
              }`}
          >
            <div className="flex items-center">
              <i className={`${item.icon} w-5 text-center mr-2`}></i>
              <span>{item.label}</span>
            </div>
            <i className={`fa-solid fa-chevron-right text-xs transition-transform ${isOpen ? 'rotate-90' : ''
              }`}></i>
          </button>

          {isOpen && (
            <div className="mt-1">
              {item.children?.map(child => renderMenuItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href || '#'}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center justify-between px-3 py-2.5 mb-1 rounded text-sm no-underline transition ${isChild ? 'pl-11' : ''
          } ${pathname === item.href
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-800'
          }`}
      >
        <div className="flex items-center">
          <i className={`${item.icon} w-5 text-center mr-2 ${isChild ? 'text-xs' : ''}`}></i>
          <span>{item.label}</span>
        </div>
        {item.badge && (
          <span className={`${item.badgeColor} text-white text-xs px-2 py-0.5 rounded-full font-semibold`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="wrapper flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`w-64 min-h-screen fixed left-0 top-0 z-50 bg-gray-900 dark:bg-gray-950 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 shadow-lg`}>
        {/* Brand Section */}
        <div className="bg-gray-800 border-b border-gray-700">
          <Link href="/admin" className="flex items-center px-4 py-3.5 mb-1 text-white no-underline hover:bg-gray-750">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold mr-3">
              A
            </div>
            <span className="font-medium text-lg">SPMB Antartika</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-3 py-3 border-b border-gray-800">
          <div className="flex items-center px-2 py-2 rounded hover:bg-gray-800 cursor-pointer transition">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden mr-2">
              <i className="fa-solid fa-user text-gray-400 text-sm"></i>
            </div>
            <span className="text-gray-300 text-sm font-medium truncate">
              {user?.name || 'Admin User'}
            </span>
          </div>
        </div>

        {/* Search Box */}
        <div className="px-3 py-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-gray-800 text-gray-300 text-sm rounded px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300">
              <i className="fa-solid fa-search text-sm"></i>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-2 py-2 pb-6 overflow-y-auto scrollbar-none" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {menuSections.map(section => renderMenuItem(section))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="px-4 md:px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <i className="fa-solid fa-bars text-xl"></i>
                </button>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
                  {menuSections
                    .flatMap(s => s.children || [])
                    .find(item => item.href === pathname)?.label || 'Dashboard'}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setThemeOpen(!themeOpen)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                    title="Change Theme"
                  >
                    <i className={`fa-solid text-xl ${theme === 'dark' ? 'fa-moon' :
                      theme === 'light' ? 'fa-sun' :
                        'fa-circle-half-stroke'
                      }`}></i>
                  </button>

                  {themeOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setThemeOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
                        <div className="p-2">
                          <button
                            onClick={() => handleThemeChange('light')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${theme === 'light'
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                              }`}
                          >
                            <i className="fa-solid fa-sun text-lg"></i>
                            <span className="font-medium">Light</span>
                            {theme === 'light' && (
                              <i className="fa-solid fa-check ml-auto text-sm"></i>
                            )}
                          </button>

                          <button
                            onClick={() => handleThemeChange('dark')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${theme === 'dark'
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                              }`}
                          >
                            <i className="fa-solid fa-moon text-lg"></i>
                            <span className="font-medium">Dark</span>
                            {theme === 'dark' && (
                              <i className="fa-solid fa-check ml-auto text-sm"></i>
                            )}
                          </button>

                          <button
                            onClick={() => handleThemeChange('system')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${theme === 'system'
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                              }`}
                          >
                            <i className="fa-solid fa-circle-half-stroke text-lg"></i>
                            <span className="font-medium">System</span>
                            {theme === 'system' && (
                              <i className="fa-solid fa-check ml-auto text-sm"></i>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    <i className="fa-solid fa-bell text-xl"></i>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>

                  {notifOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setNotifOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="font-semibold text-gray-800 dark:text-white">Notifikasi</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-800 dark:text-gray-200">Berkas baru dari peserta menunggu verifikasi</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 jam yang lalu</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-800 dark:text-gray-200">Pembayaran baru telah dikonfirmasi</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">5 jam yang lalu</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-800 dark:text-gray-200">Peserta baru mendaftar</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 hari yang lalu</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                            Lihat Semua
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition dark:text-gray-300 dark:hover:text-red-400"
                  title="Logout"
                >
                  <i className="fa-solid fa-sign-out-alt text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-4 md:px-6 py-6 dark:bg-gray-900">{children}</main>
      </div>
    </div>
  );
}