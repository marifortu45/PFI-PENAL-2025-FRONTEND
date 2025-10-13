import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Play, Pause, SkipForward, SkipBack, FastForward, Rewind, Volume2, VolumeX } from 'lucide-react';

const VideoPlayer = ({ penaltyId, onNavigate }) => {
  const [penaltyInfo, setPenaltyInfo] = useState(null);
  const [postures, setPostures] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(true);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const API_URL = 'http://localhost:5000/api';

  // Colores para los keypoints (igual que en visualizador.py)
  const keypointColors = {
    nose: '#FFFF00', left_eye: '#FFFF00', right_eye: '#FFFF00',
    left_ear: '#FFFF00', right_ear: '#FFFF00',
    left_shoulder: '#00FF00', right_shoulder: '#00FF00',
    left_hip: '#00FF00', right_hip: '#00FF00',
    left_elbow: '#FF0000', right_elbow: '#FF0000',
    left_wrist: '#FF0000', right_wrist: '#FF0000',
    left_knee: '#FF00FF', right_knee: '#FF00FF',
    left_ankle: '#FF00FF', right_ankle: '#FF00FF'
  };

  // Conexiones del esqueleto
  const skeletonConnections = [
    ['left_eye', 'right_eye'], ['left_eye', 'nose'], ['right_eye', 'nose'],
    ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
    ['left_shoulder', 'right_shoulder'], ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'], ['left_hip', 'right_hip'],
    ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
    ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'],
    ['left_hip', 'left_knee'], ['left_knee', 'left_ankle'],
    ['right_hip', 'right_knee'], ['right_knee', 'right_ankle']
  ];

  useEffect(() => {
    fetchPenaltyData();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [penaltyId]);

  useEffect(() => {
    if (isPlaying) {
      drawPostures();
    }
  }, [currentTime, postures]);

  useEffect(() => {
    // Cuando cambia la URL del video, asegurarse de que el elemento video se actualice
    if (videoUrl && videoRef.current) {
      console.log('Setting video source:', videoUrl);
      videoRef.current.load();
    }
  }, [videoUrl]);

  const fetchPenaltyData = async () => {
    try {
      setLoading(true);
      
      // Obtener información del penal
      const infoResponse = await fetch(`${API_URL}/penalties/${penaltyId}`);
      if (!infoResponse.ok) throw new Error('Error al cargar información del penal');
      const info = await infoResponse.json();
      setPenaltyInfo(info);
      console.log('✅ Penalty info loaded:', info);

      // Obtener posturas
      const posturesResponse = await fetch(`${API_URL}/penalties/${penaltyId}/postures`);
      if (!posturesResponse.ok) throw new Error('Error al cargar posturas');
      const posturesData = await posturesResponse.json();
      setPostures(posturesData);
      console.log('✅ Postures loaded:', posturesData.length, 'frames');

      // Obtener URL del video
      console.log('🔍 Fetching video URL...');
      const videoResponse = await fetch(`${API_URL}/penalties/${penaltyId}/video`);
      if (!videoResponse.ok) {
        const errorData = await videoResponse.json();
        throw new Error(errorData.error || 'Error al obtener URL del video');
      }
      const videoData = await videoResponse.json();
      console.log('✅ Video URL received:', videoData.video_url);
      setVideoUrl(videoData.video_url);

      setError(null);
    } catch (err) {
      console.error('❌ Error fetching penalty data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  };

  const drawPostures = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !postures.length) return;

    const ctx = canvas.getContext('2d');
    const fps = 30; // Asumiendo 30 FPS, ajustar según sea necesario
    const currentFrame = Math.floor(video.currentTime * fps);

    // Encontrar la postura correspondiente al frame actual
    const currentPosture = postures.find(p => p.frame === currentFrame);
    
    if (!currentPosture) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Obtener keypoints válidos
    const keypoints = getValidKeypoints(currentPosture);

    // Dibujar conexiones del esqueleto
    ctx.lineWidth = 2;
    skeletonConnections.forEach(([kp1, kp2]) => {
      if (keypoints[kp1] && keypoints[kp2]) {
        const color = hexToRgb(keypointColors[kp1]);
        ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.beginPath();
        ctx.moveTo(keypoints[kp1].x, keypoints[kp1].y);
        ctx.lineTo(keypoints[kp2].x, keypoints[kp2].y);
        ctx.stroke();
      }
    });

    // Dibujar keypoints
    Object.entries(keypoints).forEach(([name, point]) => {
      const color = hexToRgb(keypointColors[name]);
      const radius = ['nose', 'left_shoulder', 'right_shoulder'].includes(name) ? 6 : 4;

      // Círculo coloreado
      ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Borde blanco
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius + 1, 0, 2 * Math.PI);
      ctx.stroke();
    });

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(drawPostures);
    }
  };

  const getValidKeypoints = (posture) => {
    const keypoints = {};
    const keypointNames = [
      'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
      'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
      'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
    ];

    keypointNames.forEach(name => {
      const x = posture[`${name}_x`];
      const y = posture[`${name}_y`];
      const conf = posture[`${name}_confidence`];

      if (x != null && y != null && conf != null && conf > 0.3) {
        keypoints[name] = { x, y, confidence: conf };
      }
    });

    return keypoints;
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      setDuration(video.duration);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      console.log('✅ Video metadata loaded:', {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      });
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const handleSkipForward = () => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.min(video.currentTime + 1, duration);
  };

  const handleSkipBack = () => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.max(video.currentTime - 1, 0);
  };

  const handleSpeedChange = (delta) => {
    const newRate = Math.max(0.25, Math.min(2.0, playbackRate + delta));
    setPlaybackRate(newRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getResultBadge = (condition) => {
    if (condition === 'Goal') {
      return <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">⚽ GOL</span>;
    // } else if (condition === 'Saved') {
    //   return <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">🧤 ATAJADO</span>;
    } else if (condition === 'Missed Penalty') {
      return <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-medium">❌ ERRADO</span>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando video y posturas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 max-w-md">
          <p className="text-red-400 text-lg mb-4">⚠️ Error</p>
          <p className="text-red-300">{error}</p>
          <button
            onClick={onNavigate}
            className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onNavigate}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-sky-400" />
          </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Análisis de Penal</h1>
              <p className="text-sm text-slate-400">ID: {penaltyId}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-8">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Video Player - Ahora ocupa 3 columnas */}
        <div className="xl:col-span-3">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
              {/* Video Container */}
              <div className="relative bg-black aspect-video">
                {videoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      key={videoUrl}
                      muted
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onError={(e) => {
                        console.error('Video error event:', e);
                        const video = videoRef.current;
                        if (video && video.error) {
                          console.error('Video error details:', {
                            code: video.error.code,
                            message: video.error.message
                          });
                        }
                        setError('Error al cargar el video desde S3.');
                      }}
                      onLoadStart={() => console.log('Video load started')}
                      onCanPlay={() => console.log('Video can play')}
                      crossOrigin="anonymous"
                      preload="auto"
                      controls={false}
                      className="w-full h-full"
                    >
                      <source src={videoUrl} type="video/mp4" />
                      Tu navegador no soporta el elemento video.
                    </video>
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4"></div>
                      <p className="text-white">Cargando video...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-4 space-y-4">
                {/* Progress Bar */}
                <div 
                  className="relative h-2 bg-slate-700 rounded-full cursor-pointer"
                  onClick={handleSeek}
                >
                  <div 
                    className="absolute h-full bg-sky-500 rounded-full"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>

                {/* Time Display */}
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => handleSpeedChange(-0.25)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Velocidad -"
                  >
                    <Rewind className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={handleSkipBack}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Retroceder 1s"
                  >
                    <SkipBack className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={handlePlayPause}
                    className="p-4 bg-sky-500 hover:bg-sky-600 rounded-full transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white" />
                    )}
                  </button>

                  <button
                    onClick={handleSkipForward}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Adelantar 1s"
                  >
                    <SkipForward className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => handleSpeedChange(0.25)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Velocidad +"
                  >
                    <FastForward className="w-5 h-5 text-white" />
                  </button>

                  <div className="w-px h-8 bg-slate-600"></div>

                  <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title={isMuted ? "Activar sonido" : "Silenciar"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>

                <div className="text-center text-sm text-slate-400">
                  Velocidad: {playbackRate.toFixed(2)}x
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
              <h3 className="text-white font-semibold mb-3">Leyenda de Posturas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                  <span className="text-slate-300">Cara</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-slate-300">Torso</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-slate-300">Brazos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-fuchsia-500"></div>
                  <span className="text-slate-300">Piernas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="xl:col-span-1 space-y-4">
            {penaltyInfo && (
              <>
                {/* Result */}
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Resultado</h3>
                  <div className="flex justify-center">
                    {getResultBadge(penaltyInfo.event)}
                  </div>
                </div>

                {/* Match Info */}
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Información del Partido</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-slate-400 mb-1">Liga</p>
                      <p className="text-white font-medium">{penaltyInfo.league_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Temporada</p>
                      <p className="text-white font-medium">{penaltyInfo.season}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Minuto</p>
                      <p className="text-white font-medium">
                        {penaltyInfo.minute}'{penaltyInfo.extra_minute ? ` +${penaltyInfo.extra_minute}'` : ''}
                      </p>
                    </div>
                    {penaltyInfo.penalty_shootout && (
                      <div className="px-3 py-2 bg-purple-500/20 rounded-lg">
                        <p className="text-purple-300 text-center font-medium">Tanda de Penales</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Teams */}
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Equipos</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-slate-400 mb-1">Pateador</p>
                      <p className="text-white font-medium">{penaltyInfo.shooter_team_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Defensor</p>
                      <p className="text-white font-medium">{penaltyInfo.defender_team_name}</p>
                    </div>
                  </div>
                </div>

                {/* Player */}
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Jugador</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-white font-medium text-lg">
                      {penaltyInfo.player_short_name || `${penaltyInfo.player_name} ${penaltyInfo.player_lastname}`}
                    </p>
                    {penaltyInfo.player_foot && (
                      <p className="text-slate-400">
                        Pie: {penaltyInfo.player_foot === 'L' ? 'Izquierdo' : 'Derecho'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Shot Details */}
                {(penaltyInfo.side || penaltyInfo.height) && (
                  <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Detalles del Tiro</h3>
                    <div className="space-y-2 text-sm">
                      {penaltyInfo.side && (
                        <div>
                          <p className="text-slate-400">Dirección</p>
                          <p className="text-white font-medium">{penaltyInfo.side}</p>
                        </div>
                      )}
                      {penaltyInfo.height && (
                        <div>
                          <p className="text-slate-400">Altura</p>
                          <p className="text-white font-medium">{penaltyInfo.height}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Estadísticas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Frames totales</span>
                      <span className="text-white font-medium">{postures.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duración</span>
                      <span className="text-white font-medium">{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoPlayer;