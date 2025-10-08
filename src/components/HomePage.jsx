import React from 'react';
import { Video, Upload, Target, Users } from 'lucide-react';

const HomePage = ({ onNavigate }) => {
  const features = [
    {
      id: 1,
      title: 'Ver Videos con Posturas',
      description: 'Explora videos de penales con análisis detallado de posturas del arquero',
      icon: Video,
      color: 'from-blue-500 to-blue-600',
      route: 'videos'
    },
    {
      id: 2,
      title: 'Cargar Video Nuevo',
      description: 'Sube nuevos videos de penales para analizar y entrenar el modelo',
      icon: Upload,
      color: 'from-sky-500 to-sky-600',
      route: 'upload'
    },
    {
      id: 3,
      title: 'Predicción de Penal',
      description: 'Obtén predicciones inteligentes sobre la dirección del tiro',
      icon: Target,
      color: 'from-blue-600 to-blue-700',
      route: 'prediction'
    },
    {
      id: 4,
      title: 'Ver Jugadores',
      description: 'Consulta estadísticas y análisis de jugadores registrados',
      icon: Users,
      color: 'from-sky-400 to-sky-500',
      route: 'players'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header con Logo */}
      <header className="pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center">
            {/* Logo SVG */}
            <div className="mb-6 relative">
              <svg width="200" height="140" viewBox="0 0 200 140" className="drop-shadow-2xl">
                {/* Arco de la portería */}
                <rect x="20" y="40" width="160" height="80" 
                      fill="none" stroke="#60A5FA" strokeWidth="8" 
                      rx="8" className="animate-pulse"/>
                {/* Texto PENAL */}
                <text x="100" y="95" 
                      fontSize="42" 
                      fontWeight="900" 
                      textAnchor="middle"
                      fill="url(#gradient1)"
                      className="font-sans">
                  PENAL
                </text>
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Subtítulo */}
            <p className="text-sky-200 text-lg font-light tracking-wide">
              Sistema Inteligente de Análisis de Penales
            </p>
          </div>
        </div>
      </header>

      {/* Grid de Tarjetas */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                onClick={() => onNavigate(feature.route)}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 
                         hover:bg-white/10 transition-all duration-300 cursor-pointer
                         border border-white/10 hover:border-sky-400/50
                         hover:shadow-2xl hover:shadow-sky-500/20 hover:-translate-y-1"
              >
                {/* Icono con gradiente */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} 
                              mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Título */}
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-sky-300 
                             transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Descripción */}
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>

                {/* Flecha indicadora */}
                <div className="absolute bottom-6 right-6 text-sky-400 opacity-0 
                              group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center">
        <p className="text-slate-400 text-sm">
          Powered by AWS | SageMaker • S3 • RDS PostgreSQL
        </p>
      </footer>
    </div>
  );
};

export default HomePage;