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
        <nav className="bg-white border-b border-brand-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-semibold text-brand-900">
              Fashion Resale
            </a>
            <div className="flex gap-5 text-sm">
              <a href="/" className="text-brand-700 hover:text-brand-900">Dashboard</a>
              <a href="/purchases" className="text-brand-700 hover:text-brand-900">Purchases</a>
              <a href="/sales" className="text-brand-700 hover:text-brand-900">Sales</a>
              <a href="/inventory" className="text-brand-700 hover:text-brand-900">Inventory</a>
              <a href="/analytics" className="text-brand-700 hover:text-brand-900">Analytics</a>
              <a href="/trends" className="text-brand-700 hover:text-brand-900">Best Sellers</a>
              <a href="/compare" className="text-brand-700 hover:text-brand-900">Compare</a>
              <a href="/import" className="text-brand-700 hover:text-brand-900">Import</a>
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