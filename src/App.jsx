import React, { useState } from 'react';
import HomePage from './components/HomePage';
import PlayersView from './components/PlayersView';
import PlayerPenalties from './components/PlayerPenalties';
import PenaltySelector from './components/PenaltySelector';
import VideoPlayer from './components/VideoPlayer';
import UploadForm from './components/UploadForm';
import UploadVideo from './components/UploadVideo';
import ConfirmationScreen from './components/ConfirmationScreen';
import PredictionUpload from './components/PredictionUpload';
import PredictionResults from './components/PredictionResults';
import ComingSoon from './components/ComingSoon';

const App = () => {
  const [navigationStack, setNavigationStack] = useState([{ view: 'home' }]);
  const [selectedPenaltyId, setSelectedPenaltyId] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [uploadFormData, setUploadFormData] = useState(null);
  const [uploadVideoData, setUploadVideoData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);

  // Obtener la vista actual
  const currentState = navigationStack[navigationStack.length - 1];
  const currentView = currentState.view;

  // Navegar hacia adelante
  const navigateTo = (view, param = null) => {
    const newState = { view, param };
    setNavigationStack([...navigationStack, newState]);
    
    if (view === 'player-penalties' && param) {
      setSelectedPlayerId(param);
    }
  };

  // Navegar hacia atrás
  const navigateBack = () => {
    if (navigationStack.length > 1) {
      const newStack = navigationStack.slice(0, -1);
      setNavigationStack(newStack);
      
      // Restaurar estado según la vista anterior
      const previousState = newStack[newStack.length - 1];
      if (previousState.view === 'player-penalties' && previousState.param) {
        setSelectedPlayerId(previousState.param);
      }
    }
  };

  // Obtener la función de navegación para VideoPlayer
  const getVideoPlayerNavigation = () => {
    // Si hay más de 1 item en el stack, volver atrás
    if (navigationStack.length > 1) {
      return navigateBack;
    }
    // Si no, ir a videos por defecto
    return () => navigateTo('videos');
  };

  const handleSelectPenalty = (penaltyId) => {
    setSelectedPenaltyId(penaltyId);
    navigateTo('video-player');
  };

  const handleUploadFormContinue = (formData) => {
    setUploadFormData(formData);
    navigateTo('upload-video');
  };

  const handleUploadVideoContinue = (videoData) => {
    setUploadVideoData(videoData);
    navigateTo('upload-confirm');
  };

  const handlePredictionComplete = (data) => {
    setPredictionData(data);
    navigateTo('prediction-results');
  };

  return (
    <>
      {currentView === 'home' && <HomePage onNavigate={navigateTo} />}
      
      {currentView === 'players' && <PlayersView onNavigate={navigateTo} />}
      
      {currentView === 'player-penalties' && selectedPlayerId && (
        <PlayerPenalties 
          playerId={selectedPlayerId} 
          onNavigate={navigateBack}
          onSelectPenalty={handleSelectPenalty}
        />
      )}
      
      {currentView === 'videos' && (
        <PenaltySelector onNavigate={navigateTo} onSelectPenalty={handleSelectPenalty} />
      )}
      
      {currentView === 'video-player' && selectedPenaltyId && (
        <VideoPlayer 
          penaltyId={selectedPenaltyId} 
          onNavigate={getVideoPlayerNavigation()}
        />
      )}
      
      {currentView === 'upload' && (
        <UploadForm onNavigate={navigateTo} onContinue={handleUploadFormContinue} />
      )}
      
      {currentView === 'upload-video' && uploadFormData && (
        <UploadVideo 
          formData={uploadFormData} 
          onNavigate={navigateBack}
          onContinue={handleUploadVideoContinue}
        />
      )}
      
      {currentView === 'upload-confirm' && uploadVideoData && (
        <ConfirmationScreen uploadData={uploadVideoData} onNavigate={navigateTo} />
      )}
      
      {currentView === 'prediction' && (
        <PredictionUpload 
          onNavigate={navigateTo} 
          onPredictionComplete={handlePredictionComplete}
        />
      )}
      
      {currentView === 'prediction-results' && predictionData && (
        <PredictionResults 
          predictionData={predictionData} 
          onNavigate={navigateTo}
        />
      )}
    </>
  );
};

export default App;