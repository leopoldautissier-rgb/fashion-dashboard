import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fashion Resale',
  description: 'Track purchases, sales, and profitability for your luxury fashion resale business',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fashion Resale',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f5f5f7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen pb-20 lg:pb-0">
        {/* Desktop nav */}
        <nav className="hidden lg:block sticky top-0 z-50 glass-card border-b border-gray-200/40">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <a href="/" className="text-lg font-semibold text-gray-900 tracking-tight">
              Fashion Resale
            </a>
            <div className="flex items-center gap-0.5">
              <NavLink href="/" label="Dashboard" />
              <NavLink href="/purchases" label="Purchases" />
              <NavLink href="/sales" label="Sales" />
              <NavLink href="/inventory" label="Inventory" />
              <NavLink href="/analytics" label="Analytics" />
              <NavLink href="/trends" label="Best Sellers" />
              <NavLink href="/compare" label="Compare" />
              <NavLink href="/import" label="Import" />
            </div>
          </div>
        </nav>

        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-50 glass-card border-b border-gray-200/40 px-4 py-3">
          <div className="flex items-center justify-between">
            <a href="/" className="text-lg font-semibold text-gray-900 tracking-tight">Fashion Resale</a>
            <a href="/purchases/new" className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">+</a>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
          {children}
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-gray-200/40 px-2 py-2 safe-bottom">
          <div className="flex items-center justify-around">
            <TabLink href="/" icon="📊" label="Home" />
            <TabLink href="/purchases" icon="🛍️" label="Buy" />
            <TabLink href="/sales" icon="💰" label="Sell" />
            <TabLink href="/inventory" icon="📦" label="Stock" />
            <TabLink href="/analytics" icon="📈" label="Stats" />
          </div>
        </nav>
      </body>
    </html>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 transition-all">
      {label}
    </a>
  );
}

function TabLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a href={href} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl">
      <span className="text-[18px]">{icon}</span>
      <span className="text-[10px] font-medium text-gray-500">{label}</span>
    </a>
  );
}