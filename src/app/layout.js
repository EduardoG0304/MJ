import { Inter } from 'next/font/google';
import './globals.css';
import ModalProvider from './components/modal-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MJ SPORT PHOTOGRAPHY',
  description: '...',
  icons: {
    icon: [
      { url: '/images/mj_logo.ico' }, // Tradicional (ICO)
      { url: '/images/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/icon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }, // Para iOS
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <div id="root" className="min-h-screen flex flex-col">
          <ModalProvider />
          {children}
        </div>
      </body>
    </html>
  );
}