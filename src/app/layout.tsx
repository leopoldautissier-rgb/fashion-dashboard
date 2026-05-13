import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fashion Resale',
  description: 'Track purchases, sales, and profitability for your luxury fashion resale business',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <nav className="sticky top-0 z-50 glass-card border-b border-gray-200/40">
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
        <main className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 transition-all"
    >
      {label}
    </a>
  );
}