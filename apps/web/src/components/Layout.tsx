import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
            Open Career Profile
          </Link>
          <nav className="flex gap-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/create"
              className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
            >
              New Profile
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
