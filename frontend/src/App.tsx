import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyPlantsPage } from './pages/MyPlantsPage';
import { PlantDetailPage } from './pages/PlantDetailPage';
import { ScanPlantPage } from './pages/ScanPlantPage';
import { DiseaseDiagnosisPage } from './pages/DiseaseDiagnosisPage';
import { RemindersPage } from './pages/RemindersPage';
import { CalendarPage } from './pages/CalendarPage';
import { ChatPage } from './pages/ChatPage';
import { GrowthTrackingPage } from './pages/GrowthTrackingPage';
import { LearningCenterPage } from './pages/LearningCenterPage';
import { SettingsPage } from './pages/SettingsPage';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { AddPlantModal } from './components/plants/AddPlantModal';
import { Plant, IdentificationCandidate } from './types';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Selected Plant for Plant Detail page
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  // Global Add Plant Modal state
  const [isAddPlantOpen, setIsAddPlantOpen] = useState(false);
  const [prefillCandidate, setPrefillCandidate] = useState<IdentificationCandidate | null>(null);
  const [prefillImageUrl, setPrefillImageUrl] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-botanical-bg dark:bg-botanical-darkBg flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-forest-700 text-white flex items-center justify-center text-3xl shadow-card animate-pulse">
          🌿
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-forest-800 dark:text-leaf-300">
          Loading FloraAI Garden...
        </p>
      </div>
    );
  }

  // Unauthenticated user
  if (!user) {
    if (authMode === 'login') {
      return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />;
    }
    return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
  }

  // Handle saving identified plant into garden
  const handleSaveIdentifiedPlant = (candidate: IdentificationCandidate, imageUrl: string) => {
    setPrefillCandidate(candidate);
    setPrefillImageUrl(imageUrl);
    setIsAddPlantOpen(true);
  };

  const handleOpenAddPlant = () => {
    setPrefillCandidate(null);
    setPrefillImageUrl(null);
    setIsAddPlantOpen(true);
  };

  const handleSelectPlant = (plant: Plant) => {
    setSelectedPlantId(plant.id);
    setCurrentTab('plant-detail');
  };

  return (
    <div className="min-h-screen bg-botanical-bg dark:bg-botanical-darkBg flex text-botanical-text dark:text-botanical-darkText transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'plant-detail') setSelectedPlantId(null);
        }}
      />

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-forest-950/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-botanical-card dark:bg-botanical-darkCard h-full shadow-elevated flex flex-col z-10">
            <Sidebar
              currentTab={currentTab}
              onTabChange={(tab) => {
                setCurrentTab(tab);
                setMobileMenuOpen(false);
                if (tab !== 'plant-detail') setSelectedPlantId(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 lg:pb-0">
        <Navbar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            if (tab !== 'plant-detail') setSelectedPlantId(null);
          }}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigate={(tab, extra) => {
                setCurrentTab(tab);
                if (tab !== 'plant-detail') setSelectedPlantId(null);
              }}
              onOpenAddPlant={handleOpenAddPlant}
            />
          )}

          {currentTab === 'plants' && (
            <MyPlantsPage
              onSelectPlant={handleSelectPlant}
              onOpenAddModal={handleOpenAddPlant}
              onNavigateToScan={() => setCurrentTab('scan')}
            />
          )}

          {currentTab === 'plant-detail' && selectedPlantId && (
            <PlantDetailPage
              plantId={selectedPlantId}
              onBack={() => {
                setSelectedPlantId(null);
                setCurrentTab('plants');
              }}
              onPlantUpdated={() => {}}
              onPlantDeleted={() => {
                setSelectedPlantId(null);
                setCurrentTab('plants');
              }}
            />
          )}

          {currentTab === 'scan' && (
            <ScanPlantPage onSaveToGarden={handleSaveIdentifiedPlant} />
          )}

          {currentTab === 'diagnose' && <DiseaseDiagnosisPage />}

          {currentTab === 'reminders' && <RemindersPage />}

          {currentTab === 'calendar' && <CalendarPage />}

          {currentTab === 'chat' && <ChatPage />}

          {currentTab === 'growth' && <GrowthTrackingPage />}

          {currentTab === 'learning' && <LearningCenterPage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'plant-detail') setSelectedPlantId(null);
        }}
      />

      {/* Add Plant Modal */}
      <AddPlantModal
        isOpen={isAddPlantOpen}
        onClose={() => {
          setIsAddPlantOpen(false);
          setPrefillCandidate(null);
          setPrefillImageUrl(null);
        }}
        onPlantAdded={(newPlant) => {
          setSelectedPlantId(newPlant.id);
          setCurrentTab('plant-detail');
        }}
        prefillCandidate={prefillCandidate}
        prefillImageUrl={prefillImageUrl}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}
