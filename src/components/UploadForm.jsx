import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Check, Loader } from 'lucide-react';

const UploadForm = ({ onNavigate, onContinue }) => {
  const [formData, setFormData] = useState({
    penalty_id: null,
    player_id: null,
    shooter_team_id: null,
    defender_team_id: null,
    condition: '',
    minute: '',
    extra_minute: '',
    penalty_shootout: false,
    league_id: null,
    season: new Date().getFullYear(),
    fixture_id: null
  });

  const [searchResults, setSearchResults] = useState({
    players: [],
    shooter_teams: [],
    defender_teams: [],
    leagues: [],
    fixtures: []
  });

  const [searchLoading, setSearchLoading] = useState({
    players: false,
    shooter_teams: false,
    defender_teams: false,
    leagues: false,
    fixture: false
  });

  const [searchQueries, setSearchQueries] = useState({
    player: '',
    shooter_team: '',
    defender_team: '',
    league: ''
  });

  const [selectedData, setSelectedData] = useState({
    player: null,
    shooter_team: null,
    defender_team: null,
    league: null
  });

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchNextPenaltyId();
  }, []);

  useEffect(() => {
    if (formData.penalty_shootout) {
      setFormData(prev => ({ ...prev, minute: 120 }));
    }
  }, [formData.penalty_shootout]);

  const fetchNextPenaltyId = async () => {
    try {
      const response = await fetch(`${API_URL}/penalties/next-id`);
      const data = await response.json();
      setFormData(prev => ({ ...prev, penalty_id: data.next_penalty_id }));
    } catch (error) {
      console.error('Error fetching next penalty ID:', error);
    }
  };

  const searchPlayers = async () => {
    if (searchQueries.player.length < 3) return;
    
    setSearchLoading(prev => ({ ...prev, players: true }));
    try {
      const response = await fetch(
        `${API_URL}/api-football/players/search?search=${encodeURIComponent(searchQueries.player)}`
      );
      const data = await response.json();
      setSearchResults(prev => ({ ...prev, players: data }));
    } catch (error) {
      console.error('Error searching players:', error);
    } finally {
      setSearchLoading(prev => ({ ...prev, players: false }));
    }
  };

  const searchTeams = async (type) => {
    const query = type === 'shooter' ? searchQueries.shooter_team : searchQueries.defender_team;
    if (query.length < 3) return;
    
    const loadingKey = type === 'shooter' ? 'shooter_teams' : 'defender_teams';
    const resultsKey = type === 'shooter' ? 'shooter_teams' : 'defender_teams';
    
    setSearchLoading(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const response = await fetch(
        `${API_URL}/api-football/teams/search?search=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(prev => ({ ...prev, [resultsKey]: data }));
    } catch (error) {
      console.error(`Error searching ${type} teams:`, error);
    } finally {
      setSearchLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const searchLeagues = async () => {
    if (searchQueries.league.length < 3) return;
    
    setSearchLoading(prev => ({ ...prev, leagues: true }));
    try {
      const response = await fetch(
        `${API_URL}/api-football/leagues/search?search=${encodeURIComponent(searchQueries.league)}`
      );
      const data = await response.json();
      setSearchResults(prev => ({ ...prev, leagues: data }));
    } catch (error) {
      console.error('Error searching leagues:', error);
    } finally {
      setSearchLoading(prev => ({ ...prev, leagues: false }));
    }
  };

  const searchFixture = async () => {
    if (!formData.league_id || !formData.season || !formData.shooter_team_id || !formData.defender_team_id) {
      alert('Debes seleccionar Liga, Temporada, Equipo Pateador y Equipo Defensor');
      return;
    }

    setSearchLoading(prev => ({ ...prev, fixture: true }));
    try {
      // Buscar con ambos equipos
      const response = await fetch(
        `${API_URL}/api-football/fixtures/search?league=${formData.league_id}&season=${formData.season}&shooter_team=${formData.shooter_team_id}&defender_team=${formData.defender_team_id}`
      );
      const data = await response.json();

      if (data.fixtures && data.fixtures.length > 0) {
        setSearchResults(prev => ({ ...prev, fixtures: data.fixtures }));
      } else {
        alert('No se encontraron fixtures con los datos proporcionados');
        setSearchResults(prev => ({ ...prev, fixtures: [] }));
      }
    } catch (error) {
      console.error('Error searching fixture:', error);
      alert('Error al buscar fixtures');
    } finally {
      setSearchLoading(prev => ({ ...prev, fixture: false }));
    }
  };

  const selectFixture = (fixture) => {
    setFormData(prev => ({ ...prev, fixture_id: fixture.fixture_id }));
    setSearchResults(prev => ({ ...prev, fixtures: [] }));
  };

  const selectPlayer = (player) => {
    setFormData(prev => ({ ...prev, player_id: player.player_id }));
    setSelectedData(prev => ({ ...prev, player }));
    setSearchResults(prev => ({ ...prev, players: [] }));
    setSearchQueries(prev => ({ ...prev, player: '' }));
  };

  const selectTeam = (team, type) => {
    const idField = type === 'shooter' ? 'shooter_team_id' : 'defender_team_id';
    const dataField = type === 'shooter' ? 'shooter_team' : 'defender_team';
    const queryField = type === 'shooter' ? 'shooter_team' : 'defender_team';
    const resultsField = type === 'shooter' ? 'shooter_teams' : 'defender_teams';
    
    setFormData(prev => ({ ...prev, [idField]: team.team_id }));
    setSelectedData(prev => ({ ...prev, [dataField]: team }));
    setSearchResults(prev => ({ ...prev, [resultsField]: [] }));
    setSearchQueries(prev => ({ ...prev, [queryField]: '' }));
  };

  const selectLeague = (league) => {
    setFormData(prev => ({ ...prev, league_id: league.league_id }));
    setSelectedData(prev => ({ ...prev, league }));
    setSearchResults(prev => ({ ...prev, leagues: [] }));
    setSearchQueries(prev => ({ ...prev, league: '' }));
  };

  const isFormValid = () => {
    return (
      formData.penalty_id &&
      formData.player_id &&
      formData.shooter_team_id &&
      formData.defender_team_id &&
      formData.condition &&
      formData.minute &&
      formData.league_id &&
      formData.season
    );
  };

  const handleContinue = () => {
    if (isFormValid()) {
      onContinue({
        ...formData,
        selected_data: selectedData
      });
    }
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
            <div>
              <h1 className="text-2xl font-bold text-white">Cargar Video Nuevo</h1>
              <p className="text-sm text-slate-400">Paso 1: Información del Penal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <div className="space-y-6">
            {/* Penalty ID */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Penalty ID (Automático)
              </label>
              <input
                type="text"
                value={formData.penalty_id || 'Cargando...'}
                disabled
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg
                         text-slate-400 cursor-not-allowed"
              />
            </div>

            {/* Player Search */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Jugador <span className="text-red-400">*</span>
              </label>
              {selectedData.player ? (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                  <img 
                    src={selectedData.player.photo || '/logo-penal-generic.png'} 
                    alt="" 
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/logo-penal-generic.png';
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {selectedData.player.name} {selectedData.player.lastname}
                    </p>
                    <p className="text-sm text-slate-400">{selectedData.player.nationality}</p>
                  </div>
                  <Check className="w-5 h-5 text-green-400" />
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, player_id: null }));
                      setSelectedData(prev => ({ ...prev, player: null }));
                    }}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQueries.player}
                      onChange={(e) => setSearchQueries(prev => ({ ...prev, player: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && searchPlayers()}
                      placeholder="Buscar jugador por nombre..."
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg
                               text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      onClick={searchPlayers}
                      disabled={searchLoading.players}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg
                               transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {searchLoading.players ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {searchResults.players.length > 0 && (
                    <div className="mt-2 bg-slate-700 rounded-lg border border-slate-600 max-h-64 overflow-y-auto">
                      {searchResults.players.map((player) => (
                        <div
                          key={player.player_id}
                          onClick={() => selectPlayer(player)}
                          className="flex items-center gap-3 p-3 hover:bg-slate-600 cursor-pointer border-b border-slate-600 last:border-0"
                        >
                          <img 
                            src={player.photo || '/logo-penal-generic.png'} 
                            alt="" 
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = '/logo-penal-generic.png';
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              {player.name} {player.lastname}
                            </p>
                            <p className="text-xs text-slate-400">
                              {player.nationality} {player.birth_date && `• ${player.birth_date}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shooter Team Search */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Equipo Pateador <span className="text-red-400">*</span>
              </label>
              {selectedData.shooter_team ? (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                  <img src={selectedData.shooter_team.logo} alt="" className="w-10 h-10" />
                  <div className="flex-1">
                    <p className="text-white font-medium">{selectedData.shooter_team.name}</p>
                    <p className="text-sm text-slate-400">{selectedData.shooter_team.country}</p>
                  </div>
                  <Check className="w-5 h-5 text-green-400" />
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, shooter_team_id: null }));
                      setSelectedData(prev => ({ ...prev, shooter_team: null }));
                    }}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQueries.shooter_team}
                      onChange={(e) => setSearchQueries(prev => ({ ...prev, shooter_team: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && searchTeams('shooter')}
                      placeholder="Buscar equipo..."
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg
                               text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      onClick={() => searchTeams('shooter')}
                      disabled={searchLoading.shooter_teams}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg
                               transition-colors disabled:opacity-50"
                    >
                      {searchLoading.shooter_teams ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {searchResults.shooter_teams.length > 0 && (
                    <div className="mt-2 bg-slate-700 rounded-lg border border-slate-600 max-h-64 overflow-y-auto">
                      {searchResults.shooter_teams.map((team) => (
                        <div
                          key={team.team_id}
                          onClick={() => selectTeam(team, 'shooter')}
                          className="flex items-center gap-3 p-3 hover:bg-slate-600 cursor-pointer border-b border-slate-600 last:border-0"
                        >
                          <img src={team.logo} alt="" className="w-8 h-8" />
                          <div className="flex-1">
                            <p className="text-white font-medium">{team.name}</p>
                            <p className="text-xs text-slate-400">{team.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Defender Team Search */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Equipo Defensor <span className="text-red-400">*</span>
              </label>
              {selectedData.defender_team ? (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                  <img src={selectedData.defender_team.logo} alt="" className="w-10 h-10" />
                  <div className="flex-1">
                    <p className="text-white font-medium">{selectedData.defender_team.name}</p>
                    <p className="text-sm text-slate-400">{selectedData.defender_team.country}</p>
                  </div>
                  <Check className="w-5 h-5 text-green-400" />
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, defender_team_id: null }));
                      setSelectedData(prev => ({ ...prev, defender_team: null }));
                    }}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQueries.defender_team}
                      onChange={(e) => setSearchQueries(prev => ({ ...prev, defender_team: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && searchTeams('defender')}
                      placeholder="Buscar equipo..."
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg
                               text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      onClick={() => searchTeams('defender')}
                      disabled={searchLoading.defender_teams}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg
                               transition-colors disabled:opacity-50"
                    >
                      {searchLoading.defender_teams ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {searchResults.defender_teams.length > 0 && (
                    <div className="mt-2 bg-slate-700 rounded-lg border border-slate-600 max-h-64 overflow-y-auto">
                      {searchResults.defender_teams.map((team) => (
                        <div
                          key={team.team_id}
                          onClick={() => selectTeam(team, 'defender')}
                          className="flex items-center gap-3 p-3 hover:bg-slate-600 cursor-pointer border-b border-slate-600 last:border-0"
                        >
                          <img src={team.logo} alt="" className="w-8 h-8" />
                          <div className="flex-1">
                            <p className="text-white font-medium">{team.name}</p>
                            <p className="text-xs text-slate-400">{team.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Condición <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg
                         text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Seleccionar...</option>
                <option value="Home">Home (Local)</option>
                <option value="Visitor">Visitor (Visitante)</option>
                <option value="Neutral">Neutral</option>
              </select>
            </div>

            {/* Minute and Extra Minute */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Minuto <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.minute}
                  onChange={(e) => setFormData(prev => ({ ...prev, minute: e.target.value }))}
                  disabled={formData.penalty_shootout}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg
                           text-white focus:outline-none focus:ring-2 focus:ring-sky-500
                           disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Minuto Extra
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.extra_minute}
                  onChange={(e) => setFormData(prev => ({ ...prev, extra_minute: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg
                           text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Penalty Shootout */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.penalty_shootout}
                  onChange={(e) => setFormData(prev => ({ ...prev, penalty_shootout: e.target.checked }))}
                  className="w-5 h-5 rounded border-slate-600 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-slate-300">Tanda de penales (fija minuto en 120)</span>
              </label>
            </div>

            {/* League Search */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Liga <span className="text-red-400">*</span>
              </label>
              {selectedData.league ? (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                  <img src={selectedData.league.logo} alt="" className="w-10 h-10" />
                  <div className="flex-1">
                    <p className="text-white font-medium">{selectedData.league.name}</p>
                    <p className="text-sm text-slate-400">{selectedData.league.country}</p>
                  </div>
                  <Check className="w-5 h-5 text-green-400" />
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, league_id: null }));
                      setSelectedData(prev => ({ ...prev, league: null }));
                    }}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQueries.league}
                      onChange={(e) => setSearchQueries(prev => ({ ...prev, league: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && searchLeagues()}
                      placeholder="Buscar liga..."
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg
                               text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      onClick={searchLeagues}
                      disabled={searchLoading.leagues}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg
                               transition-colors disabled:opacity-50"
                    >
                      {searchLoading.leagues ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {searchResults.leagues.length > 0 && (
                    <div className="mt-2 bg-slate-700 rounded-lg border border-slate-600 max-h-64 overflow-y-auto">
                      {searchResults.leagues.map((league) => (
                        <div
                          key={league.league_id}
                          onClick={() => selectLeague(league)}
                          className="flex items-center gap-3 p-3 hover:bg-slate-600 cursor-pointer border-b border-slate-600 last:border-0"
                        >
                          <img src={league.logo} alt="" className="w-8 h-8" />
                          <div className="flex-1">
                            <p className="text-white font-medium">{league.name}</p>
                            <p className="text-xs text-slate-400">{league.country} • {league.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Season */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Temporada <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={formData.season}
                onChange={(e) => setFormData(prev => ({ ...prev, season: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg
                         text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Fixture ID */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Fixture ID (Opcional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.fixture_id || ''}
                  disabled
                  placeholder={searchResults.fixtures.length > 0 ? "Selecciona un fixture abajo" : "Se buscará automáticamente..."}
                  className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg
                           text-slate-400 cursor-not-allowed"
                />
                <button
                  onClick={searchFixture}
                  disabled={searchLoading.fixture || !formData.league_id || !formData.season || !formData.shooter_team_id || !formData.defender_team_id}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searchLoading.fixture ? <Loader className="w-5 h-5 animate-spin" /> : 'Buscar'}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Requiere: Liga, Temporada, Equipo Pateador y Equipo Defensor
              </p>
              
              {/* Lista de Fixtures */}
              {searchResults.fixtures.length > 0 && (
                <div className="mt-2 bg-slate-700 rounded-lg border border-slate-600 max-h-64 overflow-y-auto">
                  {searchResults.fixtures.map((fixture) => (
                    <div
                      key={fixture.fixture_id}
                      onClick={() => selectFixture(fixture)}
                      className="p-3 hover:bg-slate-600 cursor-pointer border-b border-slate-600 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {fixture.home_team} vs {fixture.away_team}
                          </p>
                          <p className="text-xs text-slate-400">
                            ID: {fixture.fixture_id} • {new Date(fixture.date).toLocaleDateString()} • {fixture.status}
                          </p>
                        </div>
                        {formData.fixture_id === fixture.fixture_id && (
                          <Check className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!isFormValid()}
              className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar al Upload del Video
            </button>
          </div>

          {!isFormValid() && (
            <p className="text-sm text-red-400 mt-2 text-right">
              Completa todos los campos obligatorios (*)
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default UploadForm;