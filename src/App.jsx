import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ToastContainer from './components/common/ToastContainer';

// Home Page Sections
import HeroSection from './components/home/HeroSection';
import CategoryBrowser from './components/home/CategoryBrowser';
import RecentlyAddedEquipment from './components/home/RecentlyAddedEquipment';
import EquipmentNearYou from './components/home/EquipmentNearYou';
import HowItWorks from './components/home/HowItWorks';
import BenefitsSection from './components/home/BenefitsSection';
import ImpactStatsBanner from './components/home/ImpactStatsBanner';

// Catalog & Dashboards
import EquipmentCatalog from './components/equipment/EquipmentCatalog';
import OwnerDashboard from './components/dashboard/OwnerDashboard';
import BorrowerDashboard from './components/dashboard/BorrowerDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import CommunityHub from './components/community/CommunityHub';
import ImpactDashboard from './components/dashboard/ImpactDashboard';
import BlockchainExplorer from './components/blockchain/BlockchainExplorer';
import DemandPredictionDashboard from './components/ai/DemandPredictionDashboard';

// Modals
import EquipmentDetailModal from './components/equipment/EquipmentDetailModal';
import AddEditEquipmentModal from './components/equipment/AddEditEquipmentModal';
import QRCodeModal from './components/booking/QRCodeModal';
import MessengerModal from './components/community/MessengerModal';
import ReportIssueModal from './components/community/ReportIssueModal';
import AuthModal from './components/auth/AuthModal';
import ProfileModal from './components/auth/ProfileModal';
import FirebaseConfigModal from './components/common/FirebaseConfigModal';

export default function App() {
  const { activeTab } = useApp();

  // Scroll to top on tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-brand-500 selection:text-white">
      {/* Global Navbar */}
      <Navbar />

      {/* Main Dynamic View */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <HeroSection />
            <CategoryBrowser />
            <RecentlyAddedEquipment />
            <EquipmentNearYou />
            <HowItWorks />
            <BenefitsSection />
            <ImpactStatsBanner />
          </>
        )}

        {activeTab === 'browse' && <EquipmentCatalog />}
        {activeTab === 'ai-prediction' && <DemandPredictionDashboard />}
        {activeTab === 'blockchain' && <BlockchainExplorer />}
        {activeTab === 'owner-dashboard' && <OwnerDashboard />}
        {activeTab === 'borrower-dashboard' && <BorrowerDashboard />}
        {activeTab === 'community' && <CommunityHub />}
        {activeTab === 'impact' && <ImpactDashboard />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Global Modals */}
      <EquipmentDetailModal />
      <AddEditEquipmentModal />
      <QRCodeModal />
      <MessengerModal />
      <ReportIssueModal />
      <AuthModal />
      <ProfileModal />
      <FirebaseConfigModal />

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
}
