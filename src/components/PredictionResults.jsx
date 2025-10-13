import React, { useState, useEffect } from 'react';
import { ChevronLeft, Target, Loader, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';

const PredictionResults = ({ predictionData, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    runPrediction();
  }, []);

  const runPrediction = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/prediction/extract-and-predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filepath: predictionData.filepath,
          temp_id: predictionData.temp_id,
          player_ids: predictionData.player_ids,
          player_foot: predictionData.player_foot
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al realizar predicción');
      }

      const data = await response.json();
      setResults(data);
      
      // Calcular mapa de calor
      calculateHeatmap(data);

    } catch (err) {
      console.error('Error in prediction:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateHeatmap = (data) => {
    // Crear matriz 3x3 combinando probabilidades
    const heightProbs = data.height_probabilities;
    const sideProbs = data.side_probabilities;

    // Orden: Top, Medium, Low (HEIGHT) x Left, Center, Right (SIDE)
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
      return 'from-red-600 to-red-500'; // Muy alta
    } else if (percentage >= 15) {
      return 'from-orange-600 to-orange-500'; // Alta
    } else if (percentage >= 10) {
      return 'from-yellow-600 to-yellow-500'; // Media-Alta
    } else if (percentage >= 5) {
      return 'from-green-600 to-green-500'; // Media
    } else if (percentage >= 2) {
      return 'from-blue-600 to-blue-500'; // Baja
    } else {
      return 'from-slate-700 to-slate-600'; // Muy baja
    }
  };

  const getConsistencyBadge = (consistency) => {
    if (consistency >= 0.7) {
      return <span className="text-green-400 font-medium">Alta ✓ ({(consistency * 100).toFixed(0)}%)</span>;
    } else if (consistency >= 0.5) {
      return <span className="text-yellow-400 font-medium">Media ⚠ ({(consistency * 100).toFixed(0)}%)</span>;
    } else {
      return <span className="text-red-400 font-medium">Baja ✗ ({(consistency * 100).toFixed(0)}%)</span>;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <header className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-sky-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Predicción de Penal</h1>
                  <p className="text-sm text-slate-400">Paso 2: Procesando...</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-12">
            <div className="text-center">
              <Loader className="w-20 h-20 text-sky-400 mx-auto mb-6 animate-spin" />
              <h2 className="text-2xl font-bold text-white mb-3">Procesando Video</h2>
              <p className="text-slate-300 text-lg mb-2">
                Extrayendo posturas corporales y ejecutando modelo ML...
              </p>
              <p className="text-slate-400 text-sm">
                Este proceso puede tardar varios minutos dependiendo del tamaño del video
              </p>
            </div>
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
                onClick={() => onNavigate('prediction')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-sky-400" />
              </button>
              <h1 className="text-2xl font-bold text-white">Error en Predicción</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 text-center">
            <p className="text-red-400 text-lg mb-4">⚠️ Error al procesar la predicción</p>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={() => onNavigate('prediction')}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Volver a Intentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('prediction')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-sky-400" />
              </button>
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-sky-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Resultados de Predicción</h1>
                  <p className="text-sm text-slate-400">
                    {results.total_frames} frames analizados • Pie: {results.player_foot === 'L' ? 'Izquierdo' : 'Derecho'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* MAPA DE CALOR DEL ARCO */}
        {heatmapData && (
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500 rounded-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Mapa de calor del arco</h2>
                <p className="text-slate-300">Probabilidades combinadas por sector (HEIGHT × SIDE)</p>
              </div>
            </div>

            {/* Arco 3x3 */}
            <div className="max-w-4xl mx-auto">
              {/* Estructura del arco */}
              <div className="relative bg-green-900/20 rounded-t-[120px] border-4 border-white/30 p-8 pt-12">
                {/* Líneas del arco */}
                <div className="absolute inset-0 border-t-4 border-white/10 rounded-t-[120px]"></div>
                
                {/* Grid 3x3 */}
                <div className="grid grid-rows-3 gap-2 h-[450px]">
                  {heatmapData.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-3 gap-2">
                      {row.map((cell, colIndex) => {
                        const isWinningCell = 
                          cell.height === results.final_prediction.height && 
                          cell.side === results.final_prediction.side;
                        
                        return (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`relative rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:z-10
                              ${isWinningCell ? 'border-yellow-400 ring-4 ring-yellow-400/50' : 'border-white/20'}
                              bg-gradient-to-br ${getHeatmapColor(cell.probability)}`}
                          >
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                              {/* Etiqueta de sector */}
                              <div className="text-white font-bold text-sm mb-2 text-center drop-shadow-lg">
                                {cell.side}
                              </div>
                              
                              {/* Porcentaje grande */}
                              <div className="text-white font-black text-3xl drop-shadow-lg">
                                {cell.percentage}%
                              </div>
                              
                              {/* Indicador de predicción ganadora */}
                              {isWinningCell && (
                                <div className="mt-2 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                                  🎯 PREDICCIÓN
                                </div>
                              )}
                            </div>
                            
                            {/* Efecto de brillo para alta probabilidad */}
                            {cell.probability > 0.15 && (
                              <div className="absolute inset-0 bg-white/10 rounded-lg animate-pulse"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Etiquetas de altura en el lateral */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around -ml-20 py-12">
                  <div className="text-white font-semibold text-sm">Top</div>
                  <div className="text-white font-semibold text-sm">Medium</div>
                  <div className="text-white font-semibold text-sm">Low</div>
                </div>
              </div>

              {/* Leyenda del mapa de calor */}
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

              {/* Info adicional */}
              <div className="mt-4 text-center text-slate-400 text-sm">
                <p>Cada sector muestra la probabilidad combinada de HEIGHT × SIDE</p>
                <p className="text-yellow-400 mt-1">Sector con mayor probabilidad (predicción final)</p>
              </div>
            </div>
          </div>
        )}

        {/* PREDICCIÓN FINAL - Destacado */}
        <div className="bg-gradient-to-br from-sky-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl border-2 border-sky-500/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-sky-500 rounded-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Predicción Final</h2>
              <p className="text-sky-200">Basada en votación mayoritaria de {results.total_frames} frames</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* HEIGHT */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-300">Altura</h3>
                <TrendingUp className="w-5 h-5 text-sky-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-4xl font-bold text-white mb-2">
                    {results.final_prediction.height}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-sky-500 to-blue-600 h-full transition-all duration-500"
                        style={{ width: `${results.final_prediction.height_percentage}%` }}
                      />
                    </div>
                    <span className="text-slate-300 font-medium min-w-[60px] text-right">
                      {results.final_prediction.height_percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-400 mb-1">Votos</p>
                    <p className="text-white font-semibold">
                      {results.final_prediction.height_votes}/{results.total_frames}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-400 mb-1">Confianza</p>
                    <p className={`font-semibold ${getConfidenceColor(results.final_prediction.height_confidence)}`}>
                      {(results.final_prediction.height_confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SIDE */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-300">Dirección</h3>
                <TrendingUp className="w-5 h-5 text-sky-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-4xl font-bold text-white mb-2">
                    {results.final_prediction.side}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-sky-500 to-blue-600 h-full transition-all duration-500"
                        style={{ width: `${results.final_prediction.side_percentage}%` }}
                      />
                    </div>
                    <span className="text-slate-300 font-medium min-w-[60px] text-right">
                      {results.final_prediction.side_percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-400 mb-1">Votos</p>
                    <p className="text-white font-semibold">
                      {results.final_prediction.side_votes}/{results.total_frames}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-400 mb-1">Confianza</p>
                    <p className={`font-semibold ${getConfidenceColor(results.final_prediction.side_confidence)}`}>
                      {(results.final_prediction.side_confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Predicción Combinada y Confianza Global */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Predicción Combinada</p>
              <p className="text-2xl font-bold text-white">
                {results.final_prediction.height} + {results.final_prediction.side}
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Confianza Global</p>
              <p className={`text-2xl font-bold ${getConfidenceColor(results.final_prediction.global_confidence)}`}>
                {(results.final_prediction.global_confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* ANÁLISIS DE CONSISTENCIA */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-sky-400" />
            <h2 className="text-2xl font-bold text-white">Análisis de Consistencia</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Consistencia HEIGHT:</span>
                {getConsistencyBadge(results.consistency.height)}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {(results.consistency.height * 100).toFixed(0)}% de los frames coinciden con la predicción final
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Consistencia SIDE:</span>
                {getConsistencyBadge(results.consistency.side)}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {(results.consistency.side * 100).toFixed(0)}% de los frames coinciden con la predicción final
              </p>
            </div>
          </div>
        </div>

        {/* PROBABILIDADES PROMEDIO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HEIGHT Probabilities */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-sky-400" />
              <h2 className="text-xl font-bold text-white">Probabilidades HEIGHT</h2>
            </div>
            
            <div className="space-y-3">
              {Object.entries(results.height_probabilities).map(([cls, prob]) => (
                <div key={cls}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 font-medium">{cls}</span>
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

          {/* SIDE Probabilities */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-sky-400" />
              <h2 className="text-xl font-bold text-white">Probabilidades SIDE</h2>
            </div>
            
            <div className="space-y-3">
              {Object.entries(results.side_probabilities).map(([cls, prob]) => (
                <div key={cls}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 font-medium">{cls}</span>
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

        {/* DISTRIBUCIÓN DE PREDICCIONES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HEIGHT Distribution */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Distribución HEIGHT por Frame</h2>
            
            <div className="space-y-4">
              {Object.entries(results.height_distribution).map(([cls, data]) => (
                <div key={cls}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">{cls}</span>
                    <span className="text-slate-400 text-sm">
                      {data.count} frames ({data.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-full transition-all duration-500"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                    <span className="text-green-400 font-mono text-sm min-w-[80px] text-right">
                      {'█'.repeat(Math.floor(data.percentage / 5))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIDE Distribution */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Distribución SIDE por Frame</h2>
            
            <div className="space-y-4">
              {Object.entries(results.side_distribution).map(([cls, data]) => (
                <div key={cls}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">{cls}</span>
                    <span className="text-slate-400 text-sm">
                      {data.count} frames ({data.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 h-full transition-all duration-500"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                    <span className="text-blue-400 font-mono text-sm min-w-[80px] text-right">
                      {'█'.repeat(Math.floor(data.percentage / 5))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PREDICCIONES POR FRAME (Muestra) */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            Predicciones por Frame (Primeros 10)
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sky-400 font-semibold">Frame</th>
                  <th className="px-4 py-3 text-left text-sky-400 font-semibold">HEIGHT</th>
                  <th className="px-4 py-3 text-left text-sky-400 font-semibold">Confianza HEIGHT</th>
                  <th className="px-4 py-3 text-left text-sky-400 font-semibold">SIDE</th>
                  <th className="px-4 py-3 text-left text-sky-400 font-semibold">Confianza SIDE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {results.frame_predictions.slice(0, 10).map((frame, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300 font-mono">{frame.FRAME}</td>
                    <td className="px-4 py-3 text-white font-medium">{frame.PREDICTED_HEIGHT}</td>
                    <td className="px-4 py-3">
                      <span className={getConfidenceColor(frame.HEIGHT_CONFIDENCE)}>
                        {(frame.HEIGHT_CONFIDENCE * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{frame.PREDICTED_SIDE}</td>
                    <td className="px-4 py-3">
                      <span className={getConfidenceColor(frame.SIDE_CONFIDENCE)}>
                        {(frame.SIDE_CONFIDENCE * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {results.frame_predictions.length > 10 && (
            <p className="text-slate-400 text-sm mt-4 text-center">
              Mostrando 10 de {results.total_frames} frames totales
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default PredictionResults;