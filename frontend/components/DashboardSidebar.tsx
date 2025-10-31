'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    router.push('/merchant/login');
  };

  const menuItems = [
    { name: 'Overview', href: '/merchant/dashboard', icon: '📊' },
    { name: 'POS Terminal', href: '/merchant/pos', icon: '🏪' },
    { name: 'Inventory', href: '/merchant/inventory', icon: '📦' },
    { name: 'Transactions', href: '/merchant/dashboard/transactions', icon: '💰' },
    { name: 'Customers', href: '/merchant/dashboard/customers', icon: '👥' },
    { name: 'Fingerprints', href: '/merchant/dashboard/fingerprints', icon: '👆' },
    { name: 'API Keys', href: '/merchant/dashboard/api-keys', icon: '🔑' },
    { name: 'Settings', href: '/merchant/dashboard/settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6">
        <Link href="/merchant/dashboard" className="flex items-center space-x-2">
          <div className="text-xl font-bold text-[#3cb6ad]">Protega CloudPay™</div>
        </Link>
      </div>
      
      <nav className="px-4 space-y-2 flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-[#3cb6ad] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

