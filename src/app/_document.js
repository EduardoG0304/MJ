// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head />
      <body>
        <div id="root"> {/* Contenedor raíz */}
          <Main /> {/* Aquí se renderiza la aplicación */}
        </div>
        <NextScript />
      </body>
    </Html>
  );
}