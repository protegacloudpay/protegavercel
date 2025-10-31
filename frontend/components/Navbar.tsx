'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/merchant/dashboard') || pathname?.startsWith('/customer/dashboard');

  if (isDashboard) return null; // Dashboard has its own nav

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-[#3cb6ad]">Protega CloudPay™</div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/#about" 
              className="text-gray-700 hover:text-[#3cb6ad] transition-colors"
            >
              About
            </Link>
            <Link 
              href="/#pricing" 
              className="text-gray-700 hover:text-[#3cb6ad] transition-colors"
            >
              Pricing
            </Link>
            <Link 
              href="/developers" 
              className="text-gray-700 hover:text-[#3cb6ad] transition-colors"
            >
              Developers
            </Link>
            <div className="flex items-center space-x-2">
              <Link 
                href="/customer/register" 
                className="px-4 py-2 text-[#3cb6ad] hover:bg-[#3cb6ad] hover:text-white transition-colors border border-[#3cb6ad] rounded-lg font-medium"
              >
                Customer
              </Link>
              <Link 
                href="/merchant/login" 
                className="px-4 py-2 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-semibold"
              >
                Merchant
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Link 
              href="/customer/register" 
              className="text-sm px-3 py-2 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors"
            >
              Start
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

