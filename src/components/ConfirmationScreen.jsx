import React, { useState } from 'react';
import { ChevronLeft, Check, Loader, AlertCircle } from 'lucide-react';

const ConfirmationScreen = ({ uploadData, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Insertar/Verificar Player
      await insertPlayer(uploadData.selected_data.player);

      // 2. Insertar/Verificar Shooter Team
      await insertTeam(uploadData.selected_data.shooter_team);

      // 3. Insertar/Verificar Defender Team
      await insertTeam(uploadData.selected_data.defender_team);

      // 4. Insertar/Verificar League
      await insertLeague(uploadData.selected_data.league, uploadData.season);

      // 5. Insertar Penalty
      await insertPenalty(uploadData);

      // 6. Insertar Postures desde CSV
      await insertPostures(uploadData);

      // 7. Subir video a S3
      await uploadVideoToS3(uploadData);

      setSuccess(true);
    } catch (err) {
      console.error('Error during submission:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const insertPlayer = async (player) => {
    if (!player) return;

    const response = await fetch(`${API_URL}/insert/player`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_id: player.player_id,
        short_name: player.short_name,
        name: player.name,
        lastname: player.lastname,
        foot: null // No tenemos este dato de API-Football
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al insertar jugador');
    }
  };

  const insertTeam = async (team) => {
    if (!team) return;

    const response = await fetch(`${API_URL}/insert/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_id: team.team_id,
        name: team.name
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al insertar equipo');
    }
  };

  const insertLeague = async (league, season) => {
    if (!league) return;

    const response = await fetch(`${API_URL}/insert/league`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        league_id: league.league_id,
        season: season,
        name: league.name
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al insertar liga');
    }
  };

  const insertPenalty = async (data) => {
    const response = await fetch(`${API_URL}/insert/penalty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        penalty_id: data.penalty_id,
        fixture_id: data.fixture_id,
        league_id: data.league_id,
        season: data.season,
        event: data.video_metadata.event,
        minute: parseInt(data.minute),
        extra_minute: data.extra_minute ? parseInt(data.extra_minute) : null,
        shooter_team_id: data.shooter_team_id,
        defender_team_id: data.defender_team_id,
        player_id: data.player_id,
        condition: data.condition,
        penalty_shootout: data.penalty_shootout,
        height: data.video_metadata.height,
        side: data.video_metadata.side
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al insertar penal');
    }
  };

  const insertPostures = async (data) => {
    const response = await fetch(`${API_URL}/insert/postures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        penalty_id: data.penalty_id,
        csv_path: data.csv_path
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al insertar posturas');
    }
  };

  const uploadVideoToS3 = async (data) => {
    const response = await fetch(`${API_URL}/upload/video-to-s3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        penalty_id: data.penalty_id,
        original_video_path: data.original_video_path
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al subir video a S3');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <header className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-white">¡Video Cargado Exitosamente!</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">¡Proceso Completado!</h2>
            <p className="text-slate-300 text-lg mb-8">
              El penal ID {uploadData.penalty_id} se ha guardado correctamente en la base de datos
              y el video ha sido subido a S3.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => onNavigate('home')}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg
                         transition-colors font-medium"
              >
                Volver al Inicio
              </button>
              <button
                onClick={() => onNavigate('videos')}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg
                         transition-colors font-medium"
              >
                Ver Videos
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('upload-video')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              disabled={loading}
            >
              <ChevronLeft className="w-6 h-6 text-sky-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Confirmación de Datos</h1>
              <p className="text-sm text-slate-400">Paso 3: Revisar y Guardar</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <h2 className="text-xl font-bold text-white mb-6">Resumen de Datos a Guardar</h2>

          <div className="space-y-6">
            {/* Penalty Info */}
            <div className="bg-slate-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-sky-400 mb-4">Información del Penal</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Penalty ID</p>
                  <p className="text-white font-medium">{uploadData.penalty_id}</p>
                </div>
                <div>
                  <p className="text-slate-400">Fixture ID</p>
                  <p className="text-white font-medium">{uploadData.fixture_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Minuto</p>
                  <p className="text-white font-medium">
                    {uploadData.minute}'{uploadData.extra_minute ? ` +${uploadData.extra_minute}'` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Condición</p>
                  <p className="text-white font-medium">{uploadData.condition}</p>
                </div>
                <div>
                  <p className="text-slate-400">Tanda de Penales</p>
                  <p className="text-white font-medium">{uploadData.penalty_shootout ? 'Sí' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Player Info */}
            {uploadData.selected_data?.player && (
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-sky-400 mb-4">Jugador</h3>
                <div className="flex items-center gap-4">
                  <img 
                    src={uploadData.selected_data.player.photo || '/logo-penal-generic.png'} 
                    alt="" 
                    className="w-16 h-16 rounded-full"
                    onError={(e) => { e.target.src = '/logo-penal-generic.png'; }}
                  />
                  <div>
                    <p className="text-white font-medium text-lg">
                      {uploadData.selected_data.player.name} {uploadData.selected_data.player.lastname}
                    </p>
                    <p className="text-slate-400 text-sm">
                      ID: {uploadData.selected_data.player.player_id} • {uploadData.selected_data.player.nationality}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Teams Info */}
            <div className="bg-slate-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-sky-400 mb-4">Equipos</h3>
              <div className="grid grid-cols-2 gap-6">
                {uploadData.selected_data?.shooter_team && (
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Pateador</p>
                    <div className="flex items-center gap-3">
                      <img src={uploadData.selected_data.shooter_team.logo} alt="" className="w-10 h-10" />
                      <div>
                        <p className="text-white font-medium">{uploadData.selected_data.shooter_team.name}</p>
                        <p className="text-slate-400 text-xs">ID: {uploadData.selected_data.shooter_team.team_id}</p>
                      </div>
                    </div>
                  </div>
                )}
                {uploadData.selected_data?.defender_team && (
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Defensor</p>
                    <div className="flex items-center gap-3">
                      <img src={uploadData.selected_data.defender_team.logo} alt="" className="w-10 h-10" />
                      <div>
                        <p className="text-white font-medium">{uploadData.selected_data.defender_team.name}</p>
                        <p className="text-slate-400 text-xs">ID: {uploadData.selected_data.defender_team.team_id}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* League Info */}
            {uploadData.selected_data?.league && (
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-sky-400 mb-4">Liga y Temporada</h3>
                <div className="flex items-center gap-4">
                  <img src={uploadData.selected_data.league.logo} alt="" className="w-12 h-12" />
                  <div>
                    <p className="text-white font-medium text-lg">{uploadData.selected_data.league.name}</p>
                    <p className="text-slate-400 text-sm">
                      Temporada {uploadData.season} • {uploadData.selected_data.league.country}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Video Metadata */}
            <div className="bg-slate-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-sky-400 mb-4">Detalles del Tiro</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Resultado</p>
                  <p className="text-white font-medium">
                    {uploadData.video_metadata.event === 'Penalty' ? '⚽ Gol' : '❌ Errado/Atajado'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Altura</p>
                  <p className="text-white font-medium">{uploadData.video_metadata.height}</p>
                </div>
                <div>
                  <p className="text-slate-400">Dirección</p>
                  <p className="text-white font-medium">{uploadData.video_metadata.side}</p>
                </div>
                <div>
                  <p className="text-slate-400">Pie</p>
                  <p className="text-white font-medium">
                    {uploadData.video_metadata.foot === 'L' ? 'Izquierdo' : 'Derecho'}
                  </p>
                </div>
              </div>
            </div>

            {/* Processing Stats */}
            {uploadData.stats && (
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-sky-400 mb-4">Estadísticas de Procesamiento</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Frames Totales</p>
                    <p className="text-white font-medium">{uploadData.total_frames}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Jugadores Detectados</p>
                    <p className="text-white font-medium">{uploadData.detected_player_ids.length}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Jugadores Analizados</p>
                    <p className="text-white font-medium">{uploadData.selected_player_ids.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Error al guardar los datos</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-end">
            <button
              onClick={() => onNavigate('upload-video')}
              disabled={loading}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Volver
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Cargar Video
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConfirmationScreen;