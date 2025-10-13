import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, Play, Loader } from 'lucide-react';

const PlayerPenalties = ({ playerId, onNavigate, onSelectPenalty }) => {
  const [player, setPlayer] = useState(null);
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchPlayerData();
    fetchPlayerPenalties();
  }, [playerId]);

  const fetchPlayerData = async () => {
    try {
      const response = await fetch(`${API_URL}/players/${playerId}`);
      if (!response.ok) throw new Error('Error al cargar jugador');
      
      const data = await response.json();
      setPlayer(data);
    } catch (err) {
      console.error('Error fetching player:', err);
      setError(err.message);
    }
  };

  const fetchPlayerPenalties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/players/${playerId}/penalties`);
      if (!response.ok) throw new Error('Error al cargar penales');
      
      const data = await response.json();
      setPenalties(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching penalties:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getResultBadge = (event) => {
    if (event === 'Goal') {
      return <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium">⚽ GOL</span>;
    } else if (event === 'Saved') {
      return <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">🧤 ATAJADO</span>;
    } else if (event === 'Missed') {
      return <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-medium">❌ ERRADO</span>;
    }
    return <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-xs font-medium">{event}</span>;
  };

  const getStatsCard = () => {
    if (penalties.length === 0) return null;

    const totalPenalties = penalties.length;
    const goals = penalties.filter(p => p.event === 'Penalty').length;
    const missed = penalties.filter(p => p.event === 'Missed Penalty').length;
    const saved = penalties.filter(p => p.event === 'Saved').length;
    const effectiveness = totalPenalties > 0 ? ((goals / totalPenalties) * 100).toFixed(1) : 0;

    return (
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">Estadísticas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4 text-center">
            <p className="text-slate-400 text-sm mb-1">Total</p>
            <p className="text-3xl font-bold text-white">{totalPenalties}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 text-center">
            <p className="text-slate-400 text-sm mb-1">Convertidos</p>
            <p className="text-3xl font-bold text-green-400">{goals}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 text-center">
            <p className="text-slate-400 text-sm mb-1">Errados</p>
            <p className="text-3xl font-bold text-red-400">{missed + saved}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 text-center">
            <p className="text-slate-400 text-sm mb-1">Efectividad</p>
            <p className="text-3xl font-bold text-sky-400">{effectiveness}%</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <header className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('players')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-sky-400" />
              </button>
              <h1 className="text-2xl font-bold text-white">Cargando...</h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex justify-center">
            <Loader className="w-12 h-12 text-sky-400 animate-spin" />
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
                onClick={() => onNavigate('players')}
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
            <p className="text-red-400 text-lg mb-4">⚠️ Error al cargar información</p>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={() => onNavigate('players')}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Volver a Jugadores
            </button>
          </div>
        </main>
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
              onClick={() => onNavigate('players')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-sky-400" />
            </button>
            <div className="flex items-center gap-4">
              <User className="w-8 h-8 text-sky-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {player ? `${player.name || ''} ${player.lastname || ''}`.trim() || player.short_name : 'Jugador'}
                </h1>
                <p className="text-sm text-slate-400">
                  {penalties.length} penal{penalties.length !== 1 ? 'es' : ''} ejecutado{penalties.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Estadísticas */}
        {getStatsCard()}

        {/* Lista de Penales */}
        {penalties.length === 0 ? (
          <div className="text-center py-20">
            <Play className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              Este jugador no tiene penales registrados
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Penales Ejecutados
            </h3>
            
            {penalties.map((penalty) => (
              <div
                key={penalty.penalty_id}
                onClick={() => onSelectPenalty(penalty.penalty_id)}
                className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 
                         p-6 hover:bg-slate-700/30 hover:border-sky-500/50 transition-all 
                         cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-mono text-slate-400">
                        ID: {penalty.penalty_id}
                      </span>
                      {getResultBadge(penalty.event)}
                      {penalty.penalty_shootout && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                          TANDA
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 mb-1">Liga</p>
                        <p className="text-white font-medium">{penalty.league_name}</p>
                        <p className="text-slate-400 text-xs">{penalty.season}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-400 mb-1">Equipo Pateador</p>
                        <p className="text-white font-medium">{penalty.shooter_team_name}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-400 mb-1">Equipo Defensor</p>
                        <p className="text-white font-medium">{penalty.defender_team_name}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-400 mb-1">Fixture</p>
                        <p className="text-white font-medium">
                          {penalty.fixture_id ? `ID: ${penalty.fixture_id}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      {penalty.minute && (
                        <span>⏱️ Minuto {penalty.minute}{penalty.extra_minute ? `+${penalty.extra_minute}` : ''}</span>
                      )}
                      {penalty.side && <span>📍 {penalty.side}</span>}
                      {penalty.height && <span>📏 {penalty.height}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Play className="w-6 h-6 text-sky-400 group-hover:text-sky-300 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PlayerPenalties;