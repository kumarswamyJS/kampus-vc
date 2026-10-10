import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, RoleGuard, DashboardRedirect } from './components/auth/RouteGuards';

const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const ExplorePage = lazy(() => import('./pages/ExplorePage').then(m => ({ default: m.ExplorePage })));
const CreatorsPage = lazy(() => import('./pages/CreatorsPage').then(m => ({ default: m.CreatorsPage })));
const BrandsPage = lazy(() => import('./pages/BrandsPage').then(m => ({ default: m.BrandsPage })));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));

const CreatorOnboardingPage = lazy(() => import('./pages/onboarding/CreatorOnboardingPage').then(m => ({ default: m.CreatorOnboardingPage })));
const BrandOnboardingPage = lazy(() => import('./pages/onboarding/BrandOnboardingPage').then(m => ({ default: m.BrandOnboardingPage })));

const CreatorDashboard = lazy(() => import('./pages/dashboards/CreatorDashboard').then(m => ({ default: m.CreatorDashboard })));
const BrandDashboard = lazy(() => import('./pages/dashboards/BrandDashboard').then(m => ({ default: m.BrandDashboard })));

const PublicCreatorProfilePage = lazy(() => import('./pages/public/PublicCreatorProfilePage').then(m => ({ default: m.PublicCreatorProfilePage })));
const PublicBrandProfilePage = lazy(() => import('./pages/public/PublicBrandProfilePage').then(m => ({ default: m.PublicBrandProfilePage })));

const ComingSoonPage = lazy(() => import('./pages/ComingSoonPage').then(m => ({ default: m.ComingSoonPage })));

const BriefsPage = lazy(() => import('./pages/briefs/BriefsPage').then(m => ({ default: m.BriefsPage })));
const BriefDetailPage = lazy(() => import('./pages/briefs/BriefDetailPage').then(m => ({ default: m.BriefDetailPage })));
const ProjectsPage = lazy(() => import('./pages/projects/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('./pages/projects/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const MessagesPage = lazy(() => import('./pages/messages/MessagesPage').then(m => ({ default: m.MessagesPage })));

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/creators" element={<CreatorsPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Public Creator and Brand Profiles */}
            <Route path="/creator/:id" element={<PublicCreatorProfilePage />} />
            <Route path="/brand/:id" element={<PublicBrandProfilePage />} />

            {/* Smart Dashboard Router */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Role-Protected Dashboards */}
            <Route
              path="/creator/dashboard"
              element={
                <RoleGuard allowedRole="creator">
                  <CreatorDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/brand/dashboard"
              element={
                <RoleGuard allowedRole="brand">
                  <BrandDashboard />
                </RoleGuard>
              }
            />

            {/* Protected Onboarding Workflows */}
            <Route
              path="/onboarding/creator"
              element={
                <RoleGuard allowedRole="creator">
                  <CreatorOnboardingPage />
                </RoleGuard>
              }
            />
            <Route
              path="/onboarding/brand"
              element={
                <RoleGuard allowedRole="brand">
                  <BrandOnboardingPage />
                </RoleGuard>
              }
            />

            {/* Campaign Brief Routes */}
            <Route path="/briefs" element={<ProtectedRoute><BriefsPage /></ProtectedRoute>} />
            <Route path="/briefs/:id" element={<ProtectedRoute><BriefDetailPage /></ProtectedRoute>} />

            {/* Active Phase 5 Project & Messaging Routes */}
            <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />

            {/* Placeholders */}
            <Route path="/calls" element={<ProtectedRoute><ComingSoonPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><ComingSoonPage /></ProtectedRoute>} />

            {/* Fallback Not Found Route */}
            <Route path="*" element={<ComingSoonPage />} />
          </Routes>
        </Suspense>
      </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
};
