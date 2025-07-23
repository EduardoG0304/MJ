import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MJ SPORT PHOTOGRAPHY - Fotografías de Eventos Deportivos',
  description: 'Encuentra las mejores fotografías de tus eventos deportivos. Búsqueda por número o rostro.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}