import React, { useState } from 'react';
import HomePage from './components/HomePage';
import PlayersView from './components/PlayersView';
import PlayerPenalties from './components/PlayerPenalties';
import PlayerSuggestion from './components/PlayerSuggestion';
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

  const currentState = navigationStack[navigationStack.length - 1];
  const currentView = currentState.view;

  const navigateTo = (view, param = null) => {
    const newState = { view, param };
    setNavigationStack([...navigationStack, newState]);
    
    if (view === 'player-penalties' && param) {
      setSelectedPlayerId(param);
    }
    if (view === 'player-suggestion' && param) {
      setSelectedPlayerId(param);
    }
  };

  const navigateBack = () => {
    if (navigationStack.length > 1) {
      const newStack = navigationStack.slice(0, -1);
      setNavigationStack(newStack);
      
      const previousState = newStack[newStack.length - 1];
      if (previousState.view === 'player-penalties' && previousState.param) {
        setSelectedPlayerId(previousState.param);
      }
      if (previousState.view === 'player-suggestion' && previousState.param) {
        setSelectedPlayerId(previousState.param);
      }
    }
  };

  const getVideoPlayerNavigation = () => {
    if (navigationStack.length > 1) {
      return navigateBack;
    }
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
      
      {currentView === 'player-suggestion' && selectedPlayerId && (
        <PlayerSuggestion 
          playerId={selectedPlayerId} 
          onNavigate={navigateBack}
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