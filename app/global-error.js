'use client';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({ error }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <p className="mb-6 text-gray-600">{error?.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-black rounded hover:bg-blue-700 transition-colors"
          >
            Reload page
          </button>
        </div>
      </body>
    </html>
  );
} 