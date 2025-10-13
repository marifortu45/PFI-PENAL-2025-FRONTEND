import React, { useState, useRef } from 'react';
import { ChevronLeft, Upload, Loader, PlayCircle, Target, RefreshCw } from 'lucide-react';

const PredictionUpload = ({ onNavigate, onPredictionComplete }) => {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, detecting, detected
  const [videoFile, setVideoFile] = useState(null);
  const [tempId, setTempId] = useState(null);
  const [originalVideoPath, setOriginalVideoPath] = useState(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [detectedPlayerIds, setDetectedPlayerIds] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  
  const [predictionParams, setPredictionParams] = useState({
    player_ids: '',
    player_foot: ''
  });
  
  const fileInputRef = useRef(null);
  const API_URL = 'http://localhost:5000/api';

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Por favor selecciona un archivo de video válido');
        return;
      }
      
      setVideoFile(file);
      setError(null);
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    setUploadState('uploading');
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('video', file);

      const response = await fetch(`${API_URL}/prediction/upload-video`, {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir video');
      }

      const data = await response.json();
      setVideoInfo(data.video_info);
      setTempId(data.temp_id);
      setOriginalVideoPath(data.filepath);

      // Iniciar detección automáticamente
      handleDetectPlayers(data.filepath, data.temp_id);

    } catch (err) {
      console.error('Error uploading video:', err);
      setError(err.message);
      setUploadState('idle');
    }
  };

  const handleDetectPlayers = async (filepath, tempIdParam) => {
    setUploadState('detecting');
    setError(null);

    try {
      const response = await fetch(`${API_URL}/prediction/detect-players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filepath,
          temp_id: tempIdParam
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al detectar jugadores');
      }

      const data = await response.json();
      setDetectedPlayerIds(data.detected_player_ids);
      setStats(data.stats);
      
      if (data.processed_video_filename) {
        const processedUrl = `${API_URL}/video/temp/${data.processed_video_filename}`;
        setProcessedVideoUrl(processedUrl);
      }
      
      setUploadState('detected');

    } catch (err) {
      console.error('Error detecting players:', err);
      setError(err.message);
      setUploadState('idle');
    }
  };

  const handleRedetect = () => {
    if (originalVideoPath && tempId) {
      handleDetectPlayers(originalVideoPath, tempId);
    }
  };

  const isParamsComplete = () => {
    return (
      predictionParams.player_ids.trim() &&
      predictionParams.player_foot
    );
  };

  const handlePredict = async () => {
    if (!isParamsComplete()) {
      setError('Completa todos los campos obligatorios');
      return;
    }

    // Parsear IDs de jugadores
    const playerIdsArray = predictionParams.player_ids
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));

    if (playerIdsArray.length === 0) {
      setError('Ingresa al menos un ID de jugador válido');
      return;
    }

    // Verificar que los IDs estén en los detectados
    const invalidIds = playerIdsArray.filter(id => !detectedPlayerIds.includes(id));
    if (invalidIds.length > 0) {
      setError(`Los siguientes IDs no fueron detectados: ${invalidIds.join(', ')}`);
      return;
    }

    // Llamar al callback para ir a la siguiente pantalla
    onPredictionComplete({
      filepath: originalVideoPath,
      temp_id: tempId,
      player_ids: playerIdsArray,
      player_foot: predictionParams.player_foot,
      video_info: videoInfo,
      detected_player_ids: detectedPlayerIds,
      stats: stats
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('home')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-sky-400" />
            </button>
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-sky-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Predicción de Penal</h1>
                <p className="text-sm text-slate-400">Paso 1: Upload y Detección de Jugadores</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Video */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            {uploadState === 'idle' && (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
                <h2 className="text-xl font-bold text-white mb-4">Seleccionar Video</h2>
                
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center
                           hover:border-sky-500 hover:bg-slate-800/50 transition-all cursor-pointer"
                >
                  <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Click para seleccionar video</p>
                  <p className="text-sm text-slate-400">Formatos: MP4, AVI, MOV, MKV</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* Uploading/Detecting */}
            {(uploadState === 'uploading' || uploadState === 'detecting') && (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
                <div className="text-center">
                  <Loader className="w-16 h-16 text-sky-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {uploadState === 'uploading' && 'Subiendo video...'}
                    {uploadState === 'detecting' && 'Detectando jugadores con YOLOv11...'}
                  </h3>
                  <p className="text-slate-400">
                    {uploadState === 'detecting' && 'Esto puede tardar varios minutos'}
                  </p>
                </div>
              </div>
            )}

            {/* Video Player with Detection */}
            {uploadState === 'detected' && (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-700">
                  <p className="text-sm text-sky-400 font-medium">
                    ▶️ Video con detecciones de jugadores (YOLOv11)
                  </p>
                </div>
                
                {processedVideoUrl ? (
                  <video
                    src={processedVideoUrl}
                    controls
                    autoPlay
                    muted
                    loop
                    className="w-full"
                    style={{ maxHeight: '500px', backgroundColor: '#000' }}
                    key="processed-video"
                  />
                ) : (
                  <div className="aspect-video bg-slate-900 flex items-center justify-center">
                    <p className="text-slate-500">Cargando video procesado...</p>
                  </div>
                )}
                
                <div className="p-4 bg-green-500/10 border-t border-green-500/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-400">
                      <PlayCircle className="w-5 h-5" />
                      <div>
                        <span className="font-medium block">Jugadores detectados y marcados</span>
                        <span className="text-xs text-slate-400">
                          Observa los IDs de jugadores con cajas de colores en el video
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleRedetect}
                      className="flex items-center gap-2 px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 
                               text-sky-300 rounded-lg transition-colors text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Redetectar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Detected Players Info */}
            {uploadState === 'detected' && (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Jugadores Detectados</h3>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  {detectedPlayerIds.map(id => (
                    <div key={id} className="px-4 py-2 bg-sky-500/20 border border-sky-500/50 rounded-lg">
                      <span className="text-sky-300 font-medium">ID-{id}</span>
                    </div>
                  ))}
                </div>

                {stats && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                    <div>
                      <p className="text-xs text-slate-400">Frames Totales</p>
                      <p className="text-lg font-bold text-white">{stats.total_frames}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Promedio Jugadores</p>
                      <p className="text-lg font-bold text-white">{stats.jugadores_promedio?.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">IDs Únicos</p>
                      <p className="text-lg font-bold text-white">{stats.tracks_unicos}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Columna derecha - Parámetros */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-white mb-4">Parámetros de Predicción</h3>

              {uploadState === 'idle' || uploadState === 'uploading' || uploadState === 'detecting' ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-sm">
                    {uploadState === 'idle' && 'Sube un video para comenzar'}
                    {(uploadState === 'uploading' || uploadState === 'detecting') && 'Procesando video...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* PLAYER IDs */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      IDs de Jugadores a Analizar <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={predictionParams.player_ids}
                      onChange={(e) => setPredictionParams(prev => ({ ...prev, player_ids: e.target.value }))}
                      placeholder="Ej: 1,3,5"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                               text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Ingresa los IDs separados por comas
                    </p>
                    {detectedPlayerIds.length > 0 && (
                      <p className="text-xs text-sky-400 mt-1">
                        Disponibles: {detectedPlayerIds.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* PLAYER FOOT */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Pie del Pateador <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={predictionParams.player_foot}
                      onChange={(e) => setPredictionParams(prev => ({ ...prev, player_foot: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                               text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="L">L (Izquierdo)</option>
                      <option value="R">R (Derecho)</option>
                    </select>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handlePredict}
                    disabled={!isParamsComplete()}
                    className="w-full px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white
                             font-semibold rounded-lg transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Target className="w-5 h-5" />
                    Realizar Predicción
                  </button>

                  {!isParamsComplete() && (
                    <p className="text-xs text-red-400 text-center">
                      Completa todos los campos (*)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PredictionUpload;