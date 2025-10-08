import React, { useState, useEffect } from 'react';
import { ChevronLeft, Filter, Search, Play } from 'lucide-react';

const PenaltySelector = ({ onNavigate, onSelectPenalty }) => {
  const [filters, setFilters] = useState({
    league_id: '',
    season: '',
    shooter_team_id: '',
    defender_team_id: ''
  });
  
  const [filterOptions, setFilterOptions] = useState({
    leagues: [],
    seasons: [],
    teams: []
  });
  
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`${API_URL}/penalties/filters`);
      if (!response.ok) throw new Error('Error al cargar opciones de filtro');
      
      const data = await response.json();
      setFilterOptions(data);
    } catch (err) {
      console.error('Error fetching filter options:', err);
      setError('Error al cargar opciones de filtro');
    }
  };

  const fetchPenalties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir query params
      const params = new URLSearchParams();
      if (filters.league_id) params.append('league_id', filters.league_id);
      if (filters.season) params.append('season', filters.season);
      if (filters.shooter_team_id) params.append('shooter_team_id', filters.shooter_team_id);
      if (filters.defender_team_id) params.append('defender_team_id', filters.defender_team_id);
      
      const response = await fetch(`${API_URL}/penalties?${params}`);
      if (!response.ok) throw new Error('Error al cargar penales');
      
      const data = await response.json();
      setPenalties(data);
    } catch (err) {
      console.error('Error fetching penalties:', err);
      setError('Error al cargar penales');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchPenalties();
  };

  const handleClearFilters = () => {
    setFilters({
      league_id: '',
      season: '',
      shooter_team_id: '',
      defender_team_id: ''
    });
    setPenalties([]);
  };

  const getResultBadge = (condition) => {
    if (condition === 'Goal') {
      return <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium">⚽ GOL</span>;
    } else if (condition === 'Saved') {
      return <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">🧤 ATAJADO</span>;
    } else if (condition === 'Missed') {
      return <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-medium">❌ ERRADO</span>;
    }
    return <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-xs font-medium">{condition}</span>;
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
                <Play className="w-8 h-8 text-sky-400" />
                <h1 className="text-2xl font-bold text-white">Seleccionar Penal</h1>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 
                       text-sky-300 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Panel de Filtros */}
        {showFilters && (
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-sky-400" />
              Filtros de Búsqueda
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro Liga */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Liga
                </label>
                <select
                  value={filters.league_id}
                  onChange={(e) => handleFilterChange('league_id', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                           text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Todas las ligas</option>
                  {filterOptions.leagues.map(league => (
                    <option key={`${league.league_id}-${league.season}`} value={league.league_id}>
                      {league.name} ({league.season})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Temporada */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Temporada
                </label>
                <select
                  value={filters.season}
                  onChange={(e) => handleFilterChange('season', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                           text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Todas las temporadas</option>
                  {filterOptions.seasons.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Equipo Pateador */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Equipo Pateador
                </label>
                <select
                  value={filters.shooter_team_id}
                  onChange={(e) => handleFilterChange('shooter_team_id', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                           text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Todos los equipos</option>
                  {filterOptions.teams.map(team => (
                    <option key={team.team_id} value={team.team_id}>{team.name}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Equipo Defensor */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Equipo Defensor
                </label>
                <select
                  value={filters.defender_team_id}
                  onChange={(e) => handleFilterChange('defender_team_id', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                           text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Todos los equipos</option>
                  {filterOptions.teams.map(team => (
                    <option key={team.team_id} value={team.team_id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSearch}
                className="flex items-center gap-2 px-6 py-2 bg-sky-500 hover:bg-sky-600 
                         text-white rounded-lg transition-colors font-medium"
              >
                <Search className="w-4 h-4" />
                Buscar Penales
              </button>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 
                         text-slate-300 rounded-lg transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Estado de carga */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Lista de Penales */}
        {!loading && penalties.length === 0 && !error && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              Usa los filtros de arriba para buscar penales
            </p>
          </div>
        )}

        {!loading && penalties.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              {penalties.length} penal{penalties.length !== 1 ? 'es' : ''} encontrado{penalties.length !== 1 ? 's' : ''}
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
                      {getResultBadge(penalty.condition)}
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
                        <p className="text-slate-400 mb-1">Pateador</p>
                        <p className="text-white font-medium">{penalty.shooter_team_name}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-400 mb-1">Defensor</p>
                        <p className="text-white font-medium">{penalty.defender_team_name}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-400 mb-1">Jugador</p>
                        <p className="text-white font-medium">
                          {penalty.player_short_name || `${penalty.player_name} ${penalty.player_lastname}`}
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

export default PenaltySelector;