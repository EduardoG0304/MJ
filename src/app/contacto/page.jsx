'use client'

import { motion } from 'framer-motion';
import { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    eventDate: '',
    eventType: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulación de envío
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        message: '',
        eventDate: '',
        eventType: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const title = "CONTACTO".split("");
  const subtitle = "HABLEMOS DE TU EVENTO DEPORTIVO".split("");

  // Tipos de eventos deportivos comunes
  const sportEvents = [
    'Fútbol',
    'Baloncesto',
    'Atletismo',
    'Natación',
    'Ciclismo',
    'Tenis',
    'Gimnasia',
    'Otro'
  ];

  return (
    <div className="min-h-screen bg-white text-black relative overflow-hidden">
      {/* Elementos de fondo con temática deportiva */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-20 left-10 w-64 h-64 border border-gray-300 rounded-full"></div>
        <div className="absolute bottom-10 right-20 w-80 h-80 border border-gray-300 rotate-45"></div>
        {/* Añadimos elementos gráficos deportivos */}
        <div className="absolute top-1/4 right-1/4 w-16 h-16 opacity-10">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <circle cx="50" cy="50" r="45" strokeWidth="2"/>
          </svg>
        </div>
        <div className="absolute bottom-1/3 left-1/4 w-20 h-20 opacity-10">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <rect x="10" y="10" width="80" height="80" strokeWidth="2"/>
          </svg>
        </div>
      </motion.div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-8 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start relative z-10">
        {/* Sección de texto */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="space-y-10"
        >
          <div className="overflow-hidden">
            <motion.h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2">
              {title.map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  variants={letterVariants}
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </motion.h1>
            <motion.h2 className="text-3xl md:text-4xl font-light tracking-tight text-gray-600 mb-8">
              {subtitle.map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  variants={letterVariants}
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </motion.h2>
          </div>

          <motion.div 
            className="flex space-x-4 items-center"
            variants={textVariants}
          >
            <div className="w-16 h-1 bg-gradient-to-r from-black to-gray-400"></div>
            <div className="text-sm uppercase tracking-widest text-gray-500">MJ FOTOGRAFÍA DEPORTIVA</div>
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={textVariants}
          >
            <p className="text-lg leading-relaxed text-gray-700">
              ¿Tienes un evento deportivo que necesite cobertura profesional? Capturo la intensidad, emoción y momentos decisivos de tu competición. Completa el formulario y me pondré en contacto contigo para discutir cómo puedo documentar tu evento.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 border border-black rounded-full flex items-center justify-center bg-black text-white">
                  ✉️
                </div>
                <span className="text-lg">mjfotografiasport@gmail.com</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 border border-black rounded-full flex items-center justify-center bg-black text-white">
                  📱
                </div>
                <span className="text-lg">+34 600 000 000</span>
              </div>
            </div>
          </motion.div>

          {/* Redes sociales */}
          <motion.div
            className="flex space-x-4 pt-4"
            variants={textVariants}
          >
            <a 
              href="https://www.instagram.com/mjfotografia__" 
              className="px-4 py-2 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-all duration-300 text-sm flex items-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
              Instagram
            </a>
          </motion.div>
        </motion.div>

        {/* Formulario de contacto */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full bg-gray-50 p-8 md:p-10 border border-gray-200 shadow-sm rounded-lg"
        >
          {submitStatus === 'success' ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4 text-green-500">✓</div>
              <h3 className="text-2xl font-bold mb-2">¡Mensaje enviado!</h3>
              <p className="text-gray-700 mb-6">Gracias por contactarme. Te responderé en menos de 24 horas para discutir los detalles de tu evento deportivo.</p>
              <button 
                onClick={() => setSubmitStatus(null)}
                className="mt-6 px-6 py-2 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-all duration-300"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold mb-6">Formulario de contacto</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all rounded"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all rounded"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha del evento</label>
                    <input
                      type="date"
                      id="eventDate"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all rounded"
                    />
                  </div>

                  <div>
                    <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de evento</label>
                    <select
                      id="eventType"
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all rounded bg-white"
                    >
                      <option value="">Selecciona...</option>
                      {sportEvents.map((event, index) => (
                        <option key={index} value={event}>{event}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Detalles del evento*</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all rounded"
                    placeholder="Describe tu evento, ubicación, número de participantes y cualquier requisito especial..."
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-6 py-4 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300 flex items-center justify-center rounded ${isSubmitting ? 'opacity-70' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      'SOLICITAR COBERTURA'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>

      {/* Firma con estilo deportivo */}
      <motion.div
        className="fixed bottom-8 right-8 flex items-center space-x-6 bg-white bg-opacity-90 px-6 py-3 rounded-full shadow-md border border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="text-xl font-bold italic tracking-widest flex items-center">
          <span className="text-red-500 mr-2">⚽</span>
          @mjfotografia__
        </div>
      </motion.div>
    </div>
  );
};

export default ContactPage;