import React, { useState } from 'react';
import HomePage from './components/HomePage';
import PlayersView from './components/PlayersView';
import PenaltySelector from './components/PenaltySelector';
import VideoPlayer from './components/VideoPlayer';
import UploadForm from './components/UploadForm';
import UploadVideo from './components/UploadVideo';
import ConfirmationScreen from './components/ConfirmationScreen';
import ComingSoon from './components/ComingSoon';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedPenaltyId, setSelectedPenaltyId] = useState(null);
  const [uploadFormData, setUploadFormData] = useState(null);
  const [uploadVideoData, setUploadVideoData] = useState(null);

  const navigateTo = (view) => {
    setCurrentView(view);
  };

  const handleSelectPenalty = (penaltyId) => {
    setSelectedPenaltyId(penaltyId);
    setCurrentView('video-player');
  };

  const handleUploadFormContinue = (formData) => {
    setUploadFormData(formData);
    setCurrentView('upload-video');
  };

  const handleUploadVideoContinue = (videoData) => {
    setUploadVideoData(videoData);
    setCurrentView('upload-confirm');
  };

  return (
    <>
      {currentView === 'home' && <HomePage onNavigate={navigateTo} />}
      {currentView === 'players' && <PlayersView onNavigate={navigateTo} />}
      {currentView === 'videos' && (
        <PenaltySelector onNavigate={navigateTo} onSelectPenalty={handleSelectPenalty} />
      )}
      {currentView === 'video-player' && selectedPenaltyId && (
        <VideoPlayer penaltyId={selectedPenaltyId} onNavigate={navigateTo} />
      )}
      {currentView === 'upload' && (
        <UploadForm onNavigate={navigateTo} onContinue={handleUploadFormContinue} />
      )}
      {currentView === 'upload-video' && uploadFormData && (
        <UploadVideo 
          formData={uploadFormData} 
          onNavigate={navigateTo} 
          onContinue={handleUploadVideoContinue}
        />
      )}
      {currentView === 'upload-confirm' && uploadVideoData && (
        <ConfirmationScreen uploadData={uploadVideoData} onNavigate={navigateTo} />
      )}
      {currentView === 'prediction' && (
        <ComingSoon title="Predicción de Penal" onNavigate={navigateTo} />
      )}
    </>
  );
};

export default App;