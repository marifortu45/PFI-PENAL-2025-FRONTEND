import React from 'react';
import { ChevronLeft } from 'lucide-react';

const ComingSoon = ({ title, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('home')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-sky-400" />
            </button>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
          </div>
        </div>
      </header>
      
      {/* Contenido principal */}
      <main className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-center max-w-md px-6">
          {/* Icono */}
          <div className="text-6xl mb-6 animate-bounce">🚧</div>
          
          {/* Título */}
          <h2 className="text-4xl font-bold text-white mb-4">
            Próximamente
          </h2>
          
          {/* Descripción */}
          <p className="text-slate-400 text-lg mb-8">
            Esta funcionalidad estará disponible muy pronto. Estamos trabajando para traerte la mejor experiencia.
          </p>
          
          {/* Botón de regreso */}
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 
                     text-white font-semibold rounded-lg transition-colors duration-200
                     shadow-lg shadow-sky-500/30"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver al Inicio
          </button>
        </div>
      </main>
    </div>
  );
};

export default ComingSoon;