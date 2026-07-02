import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout';
import {
  DashboardPage,
  AnalyzePage,
  CompanyVerifyPage,
  RecruiterVerifyPage,
  ChatPage,
  HistoryPage,
  AuthPage,
  SettingsPage,
  ScamPatternsPage,
  ResumeAnalysisPage,
  SalaryAnalyzerPage,
  JobAnalyzerPage,
  CertificateVerifyPage,
  OfferComparisonPage,
} from './pages';
import { useAppStore, initializeTheme } from './store';
import { supabase } from './lib/supabase';
import { RouterProvider, useRouter } from './lib/router';

initializeTheme();

function AppRoutes() {
  const { currentRoute } = useRouter();

  if (currentRoute === '/auth') {
    return <AuthPage />;
  }

  return (
    <Layout>
      {currentRoute === '/' && <DashboardPage />}
      {currentRoute === '/analyze' && <AnalyzePage />}
      {currentRoute === '/upload' && <AnalyzePage />}
      {currentRoute === '/company' && <CompanyVerifyPage />}
      {currentRoute === '/recruiter' && <RecruiterVerifyPage />}
      {currentRoute === '/chat' && <ChatPage />}
      {currentRoute === '/history' && <HistoryPage />}
      {currentRoute === '/settings' && <SettingsPage />}
      {currentRoute === '/patterns' && <ScamPatternsPage />}
      {currentRoute === '/resume' && <ResumeAnalysisPage />}
      {currentRoute === '/salary' && <SalaryAnalyzerPage />}
      {currentRoute === '/job-analyzer' && <JobAnalyzerPage />}
      {currentRoute === '/certificates' && <CertificateVerifyPage />}
      {currentRoute === '/compare' && <OfferComparisonPage />}
    </Layout>
  );
}

function AppWithAuth() {
  const { setUser } = useAppStore();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name || 'User',
            avatar_url: profile?.avatar_url,
            created_at: profile?.created_at || new Date().toISOString(),
          });
        } else {
          setUser(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return <AppRoutes />;
}

function App() {
  return (
    <RouterProvider>
      <AppWithAuth />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-dark-800 text-dark-100 border border-dark-700',
          duration: 4000,
        }}
      />
    </RouterProvider>
  );
}

export default App;
