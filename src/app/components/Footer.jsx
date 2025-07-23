import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold">
              <span className="text-white">MJ</span>
              <span className="text-gray-300">SPORT</span>
              <span className="text-white">PHOTOGRAPHY</span>
            </h2>
            <p className="text-gray-400 mt-2">Capturando tus momentos deportivos</p>
          </div>
          
          <div className="flex space-x-6">
            <Link href="#" className="text-gray-400 hover:text-white transition">Instagram</Link>
            <Link href="#" className="text-gray-400 hover:text-white transition">Contacto</Link>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} MJ SPORT PHOTOGRAPHY. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}