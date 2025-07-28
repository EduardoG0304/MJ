import { Inter } from 'next/font/google';
import './globals.css';
import ModalProvider from './components/modal-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MJ SPORT PHOTOGRAPHY - Fotografías de Eventos Deportivos',
  description: 'Encuentra las mejores fotografías de tus eventos deportivos. Búsqueda por número o rostro.',
  icons: {
    icon: '/images/logo_mj.ico', // Asegúrate de que el archivo esté en la carpeta public
    // También puedes agregar otros tamaños si los tienes:
    // shortcut: '/shortcut-icon.png',
    // apple: '/apple-icon.png',
    // other: {
    //   rel: 'apple-touch-icon-precomposed',
    //   url: '/apple-touch-icon-precomposed.png',
    // },
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