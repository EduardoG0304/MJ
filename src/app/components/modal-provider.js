// app/components/modal-provider.js
'use client';
import { useEffect } from 'react';
import ReactModal from 'react-modal';

export default function ModalProvider() {
  useEffect(() => {
    ReactModal.setAppElement('#root'); // o '#__next' si prefieres
  }, []);

  return null; // Este componente no renderiza nada, solo configura el modal
}