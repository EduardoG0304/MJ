'use client'

import { motion } from 'framer-motion';
import { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    eventDate: ''
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
        eventDate: ''
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
  const subtitle = "HABLEMOS DE TU PROYECTO".split("");

  return (
    <div className="min-h-screen bg-white text-black relative overflow-hidden">
      {/* Elementos de fondo consistentes con el diseño anterior */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-20 left-10 w-64 h-64 border border-gray-300 rounded-full"></div>
        <div className="absolute bottom-10 right-20 w-80 h-80 border border-gray-300 rotate-45"></div>
      </motion.div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto py-28 px-4 sm:px-8 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start relative z-10">
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
            <div className="w-16 h-1 bg-black"></div>
            <div className="text-sm uppercase tracking-widest text-gray-500">MJ FOTOGRAFÍA DEPORTIVA</div>
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={textVariants}
          >
            <p className="text-lg leading-relaxed text-gray-700">
              ¿Tienes un evento deportivo que necesite cobertura? ¿Buscas imágenes profesionales de tu próxima competencia? Completa el formulario y me pondré en contacto contigo.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 border border-black rounded-full flex items-center justify-center">
                  ✉️
                </div>
                <span className="text-lg">mjfotografiasport@gmail.com</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 border border-black rounded-full flex items-center justify-center">
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
            {['Instagram'].map((social, idx) => (
              <a 
                key={idx} 
                href="https://www.instagram.com/mjfotografia__" 
                className="px-4 py-2 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-all duration-300 text-sm"
              >
                {social}
              </a>
            ))}
          </motion.div>
        </motion.div>

        {/* Formulario de contacto */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full bg-gray-50 p-8 md:p-10 border border-gray-200 shadow-sm"
        >
          {submitStatus === 'success' ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-2xl font-bold mb-2">¡Mensaje enviado!</h3>
              <p className="text-gray-700">Gracias por contactarme. Te responderé en menos de 24 horas.</p>
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
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha del evento (opcional)</label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300 flex items-center justify-center ${isSubmitting ? 'opacity-70' : ''}`}
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
                      'ENVIAR MENSAJE'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>

      {/* Firma consistente con el diseño anterior */}
      <motion.div
        className="fixed bottom-8 right-8 flex items-center space-x-6 bg-white bg-opacity-80 px-4 py-2 rounded-full shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="text-xl font-bold italic tracking-widest">
          @mjfotografia__
        </div>
      </motion.div>
    </div>
  );
};

export default ContactPage;