import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fashion Resale Dashboard',
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
        <nav className="bg-brand-950 px-6 py-3.5 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="text-lg font-bold text-white tracking-tight">
              Fashion Resale
            </a>
            <div className="flex gap-1">
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
        <main className="max-w-7xl mx-auto px-6 py-8">
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
      className="px-3 py-1.5 rounded-md text-sm text-brand-200 hover:text-white hover:bg-brand-800 transition-colors"
    >
      {label}
    </a>
  );
}