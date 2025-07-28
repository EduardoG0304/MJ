import { Inter } from 'next/font/google';
import './globals.css';
import ModalProvider from './components/modal-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MJ SPORT PHOTOGRAPHY - Fotografías de Eventos Deportivos',
  description: 'Encuentra las mejores fotografías de tus eventos deportivos. Búsqueda por número o rostro.',
  icons: {
    icon: '/images/logo_mj.ico', // Ruta corregida
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