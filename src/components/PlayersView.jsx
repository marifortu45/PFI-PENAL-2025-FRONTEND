import React, { useState, useEffect } from 'react';
import { Search, Users, ChevronLeft, TrendingUp, TrendingDown } from 'lucide-react';

const PlayersView = ({ onNavigate }) => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api/players/stats';

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [searchTerm, players]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error('Error al cargar los jugadores');
      }
      
      const data = await response.json();
      setPlayers(data);
      setFilteredPlayers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterPlayers = () => {
    if (!searchTerm.trim()) {
      setFilteredPlayers(players);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = players.filter(player => 
      (player.name?.toLowerCase().includes(term) || '') ||
      (player.lastname?.toLowerCase().includes(term) || '') ||
      (player.short_name?.toLowerCase().includes(term) || '')
    );
    setFilteredPlayers(filtered);
  };

  const getFootLabel = (foot) => {
    if (!foot) return 'N/A';
    return foot.toUpperCase() === 'L' ? 'Izquierdo' : 
           foot.toUpperCase() === 'R' ? 'Derecho' : 'Ambos';
  };

  const getEffectivenessColor = (effectiveness) => {
    if (effectiveness >= 80) return 'text-green-400';
    if (effectiveness >= 60) return 'text-yellow-400';
    if (effectiveness >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getEffectivenessIcon = (effectiveness) => {
    if (effectiveness >= 60) return <TrendingUp className="w-4 h-4 inline ml-1" />;
    return <TrendingDown className="w-4 h-4 inline ml-1" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('home')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-sky-400" />
              </button>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-sky-400" />
                <h1 className="text-2xl font-bold text-white">Ver Jugadores</h1>
              </div>
            </div>
            <div className="text-sky-300 text-sm">
              {filteredPlayers.length} jugador{filteredPlayers.length !== 1 ? 'es' : ''}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Barra de búsqueda */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o apellido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 
                       rounded-xl text-white placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                       transition-all duration-200"
            />
          </div>
        </div>

        {/* Estados de carga y error */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400 text-lg mb-2">Error al cargar jugadores</p>
            <p className="text-red-300 text-sm">{error}</p>
            <button 
              onClick={fetchPlayers}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg
                       transition-colors duration-200"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de jugadores */}
        {!loading && !error && filteredPlayers.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              {searchTerm ? 'No se encontraron jugadores' : 'No hay jugadores registrados'}
            </p>
          </div>
        )}

        {!loading && !error && filteredPlayers.length > 0 && (
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            {/* Header de la tabla */}
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                <div className="grid grid-cols-9 gap-4 px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
                  <div className="text-sky-400 font-semibold text-sm uppercase tracking-wide">
                    ID
                  </div>
                  <div className="text-sky-400 font-semibold text-sm uppercase tracking-wide">
                    Nombre Corto
                  </div>
                  <div className="text-sky-400 font-semibold text-sm uppercase tracking-wide">
                    Nombre
                  </div>
                  <div className="text-sky-400 font-semibold text-sm uppercase tracking-wide">
                    Apellido
                  </div>
                  <div className="text-sky-400 font-semibold text-sm uppercase tracking-wide">
                    Pie Hábil
                  </div>
                  <div className="text-sky-400 font-semibold text-sm uppercase tracking-wide text-center">
                    Total
                  </div>
                  <div className="text-sky-400 font-semibold text-sm uppercase tracking-wide text-center">
                    Convertidos
                  </div>
                  <div className="text-sky-400 font-semibold text-sm uppercase tracking-wide text-center">
                    Errados
                  </div>
                  <div className="text-sky-400 font-semibold text-sm uppercase tracking-wide text-center">
                    Efectividad
                  </div>
                </div>

                {/* Filas de jugadores */}
                <div className="divide-y divide-slate-700/50">
                  {filteredPlayers.map((player, index) => (
                    <div 
                      key={player.player_id}
                      onClick={() => onNavigate('player-penalties', player.player_id)}
                      className="grid grid-cols-9 gap-4 px-6 py-4 hover:bg-slate-700/30 
                              transition-colors duration-150 cursor-pointer group"
                      style={{
                        animation: `fadeIn 0.3s ease-in ${index * 0.05}s both`
                      }}
                    >
                      <div className="text-slate-300 font-mono text-sm">
                        {player.player_id}
                      </div>
                      <div className="text-white font-medium">
                        {player.short_name || '-'}
                      </div>
                      <div className="text-slate-200">
                        {player.name || '-'}
                      </div>
                      <div className="text-slate-200">
                        {player.lastname || '-'}
                      </div>
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium
                          ${player.foot?.toUpperCase() === 'L' ? 'bg-blue-500/20 text-blue-300' : ''}
                          ${player.foot?.toUpperCase() === 'R' ? 'bg-green-500/20 text-green-300' : ''}
                          ${!player.foot || (player.foot?.toUpperCase() !== 'L' && player.foot?.toUpperCase() !== 'R') ? 'bg-slate-600/20 text-slate-400' : ''}
                        `}>
                          {getFootLabel(player.foot)}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-white font-semibold text-lg">
                          {player.total_penalties || 0}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-green-400 font-semibold">
                          {player.goals || 0}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-red-400 font-semibold">
                          {(player.missed || 0) + (player.saved || 0)}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className={`font-bold text-lg ${getEffectivenessColor(player.effectiveness || 0)}`}>
                          {player.effectiveness || 0}%
                          {player.total_penalties > 0 && getEffectivenessIcon(player.effectiveness || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PlayersView;