import React, { useState, useRef } from 'react';
import { ChevronLeft, Upload, Loader, PlayCircle, CheckCircle, RefreshCw } from 'lucide-react';

const UploadVideo = ({ formData, onNavigate, onContinue }) => {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, detecting, detected, processing
  const [videoFile, setVideoFile] = useState(null);
  const [originalVideoPath, setOriginalVideoPath] = useState(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [detectedPlayerIds, setDetectedPlayerIds] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  
  const [videoMetadata, setVideoMetadata] = useState({
    event: '',        
    height: '',
    side: '',
    foot: '',
    player_ids: ''
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
      
      // Iniciar upload automáticamente
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    setUploadState('uploading');
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('video', file);
      formDataToSend.append('penalty_id', formData.penalty_id);

      const response = await fetch(`${API_URL}/upload/video`, {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir video');
      }

      const data = await response.json();
      setVideoInfo(data);
      setOriginalVideoPath(data.filepath);

      // Iniciar detección automáticamente
      handleDetectPlayers(data.filepath);

    } catch (err) {
      console.error('Error uploading video:', err);
      setError(err.message);
      setUploadState('idle');
    }
  };

  const handleDetectPlayers = async (filepath) => {
    setUploadState('detecting');
    setError(null);

    try {
      const response = await fetch(`${API_URL}/process/detect-players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filepath,
          penalty_id: formData.penalty_id 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al detectar jugadores');
      }

      const data = await response.json();
      setDetectedPlayerIds(data.detected_player_ids);
      setStats(data.stats);
      
      // Cargar el video procesado con las detecciones
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
    if (originalVideoPath) {
      handleDetectPlayers(originalVideoPath);
    }
  };

  const isMetadataComplete = () => {
    return (
      videoMetadata.event &&      // AGREGAR
      videoMetadata.height &&
      videoMetadata.side &&
      videoMetadata.foot &&
      videoMetadata.player_ids.trim()
    );
  };

  const handleFinalize = async () => {
    if (!isMetadataComplete()) {
      setError('Completa todos los campos obligatorios');
      return;
    }
  
    // Parsear IDs de jugadores
    const playerIdsArray = videoMetadata.player_ids
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));
  
    if (playerIdsArray.length === 0) {
      setError('Ingresa al menos un ID de jugador válido');
      return;
    }
  
    // Verificar que los IDs ingresados están en los detectados
    const invalidIds = playerIdsArray.filter(id => !detectedPlayerIds.includes(id));
    if (invalidIds.length > 0) {
      setError(`Los siguientes IDs no fueron detectados en el video: ${invalidIds.join(', ')}`);
      return;
    }
  
    // Ejecutar segunda pasada para extraer posturas
    setUploadState('processing');
    setError(null);
  
    try {
      const response = await fetch(`${API_URL}/process/extract-postures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filepath: originalVideoPath,
          player_ids: playerIdsArray,
          penalty_id: formData.penalty_id
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al extraer posturas');
      }
  
      const data = await response.json();
  
      // Pasar a confirmación con todos los datos necesarios
      onContinue({
        // Datos del formulario original
        penalty_id: formData.penalty_id,
        player_id: formData.player_id,
        shooter_team_id: formData.shooter_team_id,
        defender_team_id: formData.defender_team_id,
        condition: formData.condition,
        minute: formData.minute,
        extra_minute: formData.extra_minute,
        penalty_shootout: formData.penalty_shootout,
        league_id: formData.league_id,
        season: formData.season,
        fixture_id: formData.fixture_id,
        
        // Datos seleccionados (para mostrar en confirmación)
        selected_data: formData.selected_data,
        
        // Metadata del video
        video_metadata: videoMetadata,
        
        // Información del procesamiento
        video_info: videoInfo,
        detected_player_ids: detectedPlayerIds,
        selected_player_ids: playerIdsArray,
        stats: stats,
        
        // Paths y resultados
        original_video_path: originalVideoPath,
        csv_path: data.csv_path,
        player_usage_stats: data.player_usage_stats,
        total_frames: data.total_frames
      });
  
    } catch (err) {
      console.error('Error extracting postures:', err);
      setError(err.message);
      setUploadState('detected');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('upload')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-sky-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Cargar Video Nuevo</h1>
              <p className="text-sm text-slate-400">Paso 2: Upload y Análisis de Jugadores</p>
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
            {(uploadState === 'uploading' || uploadState === 'detecting' || uploadState === 'processing') && (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
                <div className="text-center">
                  <Loader className="w-16 h-16 text-sky-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {uploadState === 'uploading' && 'Subiendo video...'}
                    {uploadState === 'detecting' && 'Detectando jugadores...'}
                    {uploadState === 'processing' && 'Extrayendo posturas...'}
                  </h3>
                  <p className="text-slate-400">
                    {uploadState === 'detecting' && 'Procesando video con YOLOv11'}
                    {uploadState === 'processing' && 'Analizando movimientos corporales'}
                  </p>
                  {uploadState !== 'uploading' && (
                    <p className="text-xs text-slate-500 mt-2">Esto puede tardar varios minutos</p>
                  )}
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
                      <CheckCircle className="w-5 h-5" />
                      <div>
                        <span className="font-medium block">Jugadores detectados y marcados</span>
                        <span className="text-xs text-slate-400">
                          Puedes ver los IDs de jugadores con cajas de colores en el video
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

          {/* Columna derecha - Metadata */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-white mb-4">Información del Tiro</h3>

              {uploadState === 'idle' || uploadState === 'uploading' || uploadState === 'detecting' ? (
                <div className="text-center py-12">
                  <PlayCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-sm">
                    {uploadState === 'idle' && 'Sube un video para comenzar'}
                    {(uploadState === 'uploading' || uploadState === 'detecting') && 'Procesando video...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* EVENT */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Resultado del Penal <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={videoMetadata.event}
                      onChange={(e) => setVideoMetadata(prev => ({ ...prev, event: e.target.value }))}
                      disabled={uploadState === 'processing'}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                              text-white focus:outline-none focus:ring-2 focus:ring-sky-500
                              disabled:opacity-50"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Penalty">Gol</option>
                      <option value="Missed Penalty">Errado/Atajado</option>
                    </select>
                  </div>

                  {/* HEIGHT */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Altura del Tiro <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={videoMetadata.height}
                      onChange={(e) => setVideoMetadata(prev => ({ ...prev, height: e.target.value }))}
                      disabled={uploadState === 'processing'}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                               text-white focus:outline-none focus:ring-2 focus:ring-sky-500
                               disabled:opacity-50"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Top">Top (Alto)</option>
                      <option value="Medium">Medium (Medio)</option>
                      <option value="Low">Low (Bajo)</option>
                    </select>
                  </div>

                  {/* SIDE */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Dirección del Tiro <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={videoMetadata.side}
                      onChange={(e) => setVideoMetadata(prev => ({ ...prev, side: e.target.value }))}
                      disabled={uploadState === 'processing'}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                               text-white focus:outline-none focus:ring-2 focus:ring-sky-500
                               disabled:opacity-50"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Left">Left (Izquierda)</option>
                      <option value="Center">Center (Centro)</option>
                      <option value="Right">Right (Derecha)</option>
                    </select>
                  </div>

                  {/* FOOT */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Pie de Ejecución <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={videoMetadata.foot}
                      onChange={(e) => setVideoMetadata(prev => ({ ...prev, foot: e.target.value }))}
                      disabled={uploadState === 'processing'}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                               text-white focus:outline-none focus:ring-2 focus:ring-sky-500
                               disabled:opacity-50"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="L">L (Izquierdo)</option>
                      <option value="R">R (Derecho)</option>
                    </select>
                  </div>

                  {/* PLAYER IDs */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      IDs de Jugadores a Analizar <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={videoMetadata.player_ids}
                      onChange={(e) => setVideoMetadata(prev => ({ ...prev, player_ids: e.target.value }))}
                      placeholder="Ej: 1,3,5"
                      disabled={uploadState === 'processing'}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                               text-white focus:outline-none focus:ring-2 focus:ring-sky-500
                               disabled:opacity-50"
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

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleFinalize}
                    disabled={!isMetadataComplete() || uploadState === 'processing'}
                    className="w-full px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white
                             font-semibold rounded-lg transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadState === 'processing' ? 'Procesando...' : 'Continuar a Confirmación'}
                  </button>

                  {!isMetadataComplete() && uploadState !== 'processing' && (
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

export default UploadVideo;