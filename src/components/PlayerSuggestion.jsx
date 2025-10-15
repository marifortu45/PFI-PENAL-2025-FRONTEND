import React, { useState, useEffect } from 'react';
import { ChevronLeft, Lightbulb, Target, Activity, TrendingUp, User, AlertTriangle, CheckCircle, Zap, Eye } from 'lucide-react';

const PlayerSuggestion = ({ playerId, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchAnalysis();
  }, [playerId]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/players/${playerId}/analysis`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar análisis');
      }

      const data = await response.json();
      setAnalysis(data);
      
      // Calcular mapa de calor
      calculateHeatmap(data.predictions);

    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateHeatmap = (predictions) => {
    const heightProbs = predictions.height_probabilities;
    const sideProbs = predictions.side_probabilities;

    const heightOrder = ['Top', 'Middle', 'Low'];
    const sideOrder = ['Left', 'Center', 'Right'];

    const heatmap = [];
    
    for (let h of heightOrder) {
      const row = [];
      for (let s of sideOrder) {
        const heightProb = heightProbs[h] || 0;
        const sideProb = sideProbs[s] || 0;
        const combined = heightProb * sideProb;
        
        row.push({
          height: h,
          side: s,
          probability: combined,
          percentage: (combined * 100).toFixed(1)
        });
      }
      heatmap.push(row);
    }

    setHeatmapData(heatmap);
  };

  const getHeatmapColor = (probability) => {
    const percentage = probability * 100;
    
    if (percentage >= 20) {
      return 'from-red-600 to-red-500';
    } else if (percentage >= 15) {
      return 'from-orange-600 to-orange-500';
    } else if (percentage >= 10) {
      return 'from-yellow-600 to-yellow-500';
    } else if (percentage >= 5) {
      return 'from-green-600 to-green-500';
    } else if (percentage >= 2) {
      return 'from-blue-600 to-blue-500';
    } else {
      return 'from-slate-700 to-slate-600';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'medium':
        return <Eye className="w-5 h-5 text-yellow-400" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <Lightbulb className="w-5 h-5 text-sky-400" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'high': <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-medium">ALTA PRIORIDAD</span>,
      'medium': <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs font-medium">MEDIA PRIORIDAD</span>,
      'low': <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium">BAJA PRIORIDAD</span>
    };
    return badges[priority] || null;
  };

  const translateSide = (side) => {
    const translations = {
      'Left': 'Izquierda',
      'Right': 'Derecha',
      'Center': 'Centro'
    };
    return translations[side] || side;
  };

  const translateHeight = (height) => {
    const translations = {
      'Top': 'Alto',
      'Medium': 'Medio',
      'Low': 'Bajo'
    };
    return translations[height] || height;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <header className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={onNavigate}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-sky-400" />
              </button>
              <h1 className="text-2xl font-bold text-white">Cargando Análisis...</h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-400"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <header className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={onNavigate}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-sky-400" />
              </button>
              <h1 className="text-2xl font-bold text-white">Error</h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 text-center">
            <p className="text-red-400 text-lg mb-4">⚠️ Error al cargar análisis</p>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={onNavigate}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Volver
            </button>
          </div>
        </main>
      </div>
    );
  }

  const patterns = analysis.patterns;
  const predictions = analysis.predictions;
  const suggestions = analysis.suggestions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onNavigate}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-sky-400" />
            </button>
            <div className="flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Análisis ML - {analysis.player_name}</h1>
                <p className="text-sm text-slate-400">
                  {analysis.total_penalties} penales analizados • Tasa de conversión: {patterns.success_rate.success_rate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* MAPA DE CALOR DEL ARCO */}
        {heatmapData && (
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Mapa de Probabilidad</h2>
                <p className="text-slate-300">Distribución combinada HEIGHT × SIDE basada en análisis ML</p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative bg-green-900/20 rounded-t-[120px] border-4 border-white/30 p-8 pt-12">
                <div className="absolute inset-0 border-t-4 border-white/10 rounded-t-[120px]"></div>
                
                <div className="grid grid-rows-3 gap-2 h-[450px]">
                  {heatmapData.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-3 gap-2">
                      {row.map((cell, colIndex) => {
                        const isWinningCell = 
                          cell.height === predictions.height_prediction && 
                          cell.side === predictions.side_prediction;
                        
                        return (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`relative rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:z-10
                              ${isWinningCell ? 'border-yellow-400 ring-4 ring-yellow-400/50' : 'border-white/20'}
                              bg-gradient-to-br ${getHeatmapColor(cell.probability)}`}
                          >
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                              <div className="text-white font-bold text-sm mb-2 text-center drop-shadow-lg">
                                {translateSide(cell.side)}
                              </div>
                              
                              <div className="text-white font-black text-3xl drop-shadow-lg">
                                {cell.percentage}%
                              </div>
                              
                              {isWinningCell && (
                                <div className="mt-2 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                                  PREDICCIÓN
                                </div>
                              )}
                            </div>
                            
                            {cell.probability > 0.15 && (
                              <div className="absolute inset-0 bg-white/10 rounded-lg animate-pulse"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around -ml-20 py-12">
                  <div className="text-white font-semibold text-sm">Alto</div>
                  <div className="text-white font-semibold text-sm">Medio</div>
                  <div className="text-white font-semibold text-sm">Bajo</div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-slate-700 to-slate-600"></div>
                  <span className="text-slate-300">{'<'}2%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-600 to-blue-500"></div>
                  <span className="text-slate-300">2-5%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-green-600 to-green-500"></div>
                  <span className="text-slate-300">5-10%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-600 to-yellow-500"></div>
                  <span className="text-slate-300">10-15%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-orange-600 to-orange-500"></div>
                  <span className="text-slate-300">15-20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-red-600 to-red-500"></div>
                  <span className="text-slate-300">≥20%</span>
                </div>
              </div>

              <div className="mt-4 text-center text-slate-400 text-sm">
                <p>🎯 = Sector con mayor probabilidad según el modelo ML</p>
              </div>
            </div>
          </div>
        )}

        {/* PREDICCIÓN DEL MODELO */}
        <div className="bg-gradient-to-br from-sky-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl border-2 border-sky-500/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-sky-500 rounded-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Predicción del Modelo ML</h2>
              <p className="text-sky-200">Basada en {analysis.total_penalties} penales históricos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-slate-300 mb-4">Dirección Predicha</h3>
              <p className="text-4xl font-bold text-white mb-4">
                {translateSide(predictions.side_prediction)}
              </p>
              <div className="space-y-2">
                {Object.entries(predictions.side_probabilities).map(([side, prob]) => (
                  <div key={side}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-sm">{translateSide(side)}</span>
                      <span className="text-slate-400 text-sm">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-sky-500 h-full transition-all duration-500"
                        style={{ width: `${prob * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-slate-300 mb-4">Altura Predicha</h3>
              <p className="text-4xl font-bold text-white mb-4">
                {translateHeight(predictions.height_prediction)}
              </p>
              <div className="space-y-2">
                {Object.entries(predictions.height_probabilities).map(([height, prob]) => (
                  <div key={height}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-sm">{translateHeight(height)}</span>
                      <span className="text-slate-400 text-sm">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-sky-500 h-full transition-all duration-500"
                        style={{ width: `${prob * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SUGERENCIAS PARA EL ARQUERO */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Sugerencias para el Arquero</h2>
              <p className="text-slate-300">Recomendaciones basadas en análisis de patrones</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-slate-900/50 rounded-lg p-6 border border-slate-700 hover:border-sky-500/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getPriorityIcon(suggestion.priority)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getPriorityBadge(suggestion.priority)}
                      <span className="text-xs text-slate-500 uppercase tracking-wider">
                        {suggestion.type}
                      </span>
                    </div>
                    <p className="text-white text-lg">
                      {suggestion.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PATRONES DE DIRECCIÓN */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-sky-400" />
            <h2 className="text-2xl font-bold text-white">Tendencias de Dirección</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Lado Preferido</p>
              <p className="text-3xl font-bold text-white mb-4">
                {translateSide(patterns.direction_patterns.preferred_side)}
              </p>
              <div className="space-y-2">
                {Object.entries(patterns.direction_patterns.side_distribution).map(([side, count]) => (
                  <div key={side} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{translateSide(side)}</span>
                    <span className="text-slate-400">
                      {count} ({patterns.direction_patterns.side_percentages[side].toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Consistencia</p>
              <p className="text-2xl font-bold text-white mb-4">
                {patterns.direction_patterns.consistency}
              </p>
              <p className="text-slate-300 text-sm">
                {patterns.direction_patterns.consistency === 'Muy predecible' && 
                  'Este jugador tiende fuertemente hacia un lado específico.'}
                {patterns.direction_patterns.consistency === 'Moderadamente predecible' && 
                  'El jugador tiene preferencia pero puede variar.'}
                {patterns.direction_patterns.consistency === 'Impredecible/variado' && 
                  'Este jugador varía mucho su dirección.'}
              </p>
            </div>
          </div>
        </div>

        {/* TENDENCIAS DE ALTURA */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-sky-400" />
            <h2 className="text-2xl font-bold text-white">Tendencias de Altura</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Altura Preferida</p>
              <p className="text-3xl font-bold text-white mb-4">
                {translateHeight(patterns.height_patterns.preferred_height)}
              </p>
              <div className="space-y-2">
                {Object.entries(patterns.height_patterns.height_distribution).map(([height, count]) => (
                  <div key={height} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{translateHeight(height)}</span>
                    <span className="text-slate-400">
                      {count} ({patterns.height_patterns.height_percentages[height].toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Distribución Visual</p>
              <div className="space-y-3 mt-6">
                {Object.entries(patterns.height_patterns.height_percentages)
                  .sort((a, b) => b[1] - a[1])
                  .map(([height, percentage]) => (
                    <div key={height}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 text-sm font-medium">{translateHeight(height)}</span>
                        <span className="text-slate-400 text-sm">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            height === patterns.height_patterns.preferred_height
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                              : 'bg-gradient-to-r from-slate-500 to-slate-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
              <p className="text-slate-400 text-xs mt-4">
                {patterns.height_patterns.preferred_height === 'Top' && 
                  '⚠️ Tiende a tirar alto - mantente preparado para saltos'}
                {patterns.height_patterns.preferred_height === 'Medium' && 
                  'ℹ️ Tiros a altura media - posición central óptima'}
                {patterns.height_patterns.preferred_height === 'Low' && 
                  '⚠️ Prefiere tiros bajos - atento a ras de suelo'}
              </p>
            </div>
          </div>
        </div>

        {/* CARACTERÍSTICAS DE CARRERA */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-sky-400" />
            <h2 className="text-2xl font-bold text-white">Características de la Carrera</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {patterns.run_characteristics.run_length && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-xs mb-2">Longitud</p>
                <p className="text-white font-semibold">{patterns.run_characteristics.run_length}</p>
              </div>
            )}
            
            {patterns.run_characteristics.approach_speed && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-xs mb-2">Velocidad</p>
                <p className="text-white font-semibold">{patterns.run_characteristics.approach_speed}</p>
              </div>
            )}
            
            {patterns.run_characteristics.pause_frequency && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-xs mb-2">Frecuencia de Pausa</p>
                <p className="text-white font-semibold">{patterns.run_characteristics.pause_frequency}</p>
              </div>
            )}
            
            {patterns.run_characteristics.rhythm_changes && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-xs mb-2">Cambios de Ritmo</p>
                <p className="text-white font-semibold text-xs">{patterns.run_characteristics.rhythm_changes}</p>
              </div>
            )}
          </div>
        </div>

        {/* POSTURA CORPORAL */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-sky-400" />
            <h2 className="text-2xl font-bold text-white">Postura y Lenguaje Corporal</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {patterns.posture_patterns.torso_lean && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-xs mb-2">Inclinación del Torso</p>
                <p className="text-white font-semibold text-sm">{patterns.posture_patterns.torso_lean}</p>
              </div>
            )}
            
            {patterns.posture_patterns.knee_bend && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-xs mb-2">Flexión de Rodillas</p>
                <p className="text-white font-semibold text-sm">{patterns.posture_patterns.knee_bend}</p>
              </div>
            )}
            
            {patterns.posture_patterns.body_movement && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-xs mb-2">Movimiento del Cuerpo</p>
                <p className="text-white font-semibold text-sm">{patterns.posture_patterns.body_movement}</p>
              </div>
            )}
          </div>
        </div>

        {/* ESTADÍSTICAS GENERALES */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-sky-400" />
            <h2 className="text-2xl font-bold text-white">Estadísticas Generales</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4 text-center border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Total Penales</p>
              <p className="text-3xl font-bold text-white">{patterns.success_rate.total}</p>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4 text-center border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Convertidos</p>
              <p className="text-3xl font-bold text-green-400">{patterns.success_rate.successful}</p>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4 text-center border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Errados</p>
              <p className="text-3xl font-bold text-red-400">{patterns.success_rate.missed}</p>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4 text-center border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Efectividad</p>
              <p className="text-3xl font-bold text-sky-400">{patterns.success_rate.success_rate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlayerSuggestion;