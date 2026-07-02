import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileSearch,
  Building2,
  UserCheck,
  ShieldCheck,
  History,
  Settings,
  LogOut,
  Sparkles,
  FileText,
  MessageSquare,
  BookOpen,
  Briefcase,
  Award,
  Scale,
} from 'lucide-react';
import { NavLink, Link, useRouter } from '../../lib/router';
import { useAppStore } from '../../store';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/supabase';

type Route = '/' | '/analyze' | '/upload' | '/company' | '/recruiter' | '/chat' | '/history' | '/settings' | '/patterns' | '/resume' | '/salary' | '/job-analyzer' | '/certificates' | '/compare' | '/auth';

interface SidebarItem {
  name: string;
  path: Route;
  icon: React.ReactNode;
  badge?: string | number;
}

const mainItems: SidebarItem[] = [
  { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  { name: 'Document Analysis', path: '/analyze', icon: <FileSearch size={20} /> },
  { name: 'PDF Upload', path: '/upload', icon: <FileText size={20} /> },
  { name: 'Company Verify', path: '/company', icon: <Building2 size={20} /> },
  { name: 'Recruiter Check', path: '/recruiter', icon: <UserCheck size={20} /> },
  { name: 'AI Assistant', path: '/chat', icon: <MessageSquare size={20} /> },
];

const toolsItems: SidebarItem[] = [
  { name: 'Scam Patterns', path: '/patterns', icon: <ShieldCheck size={20} /> },
  { name: 'Resume Analysis', path: '/resume', icon: <Sparkles size={20} /> },
  { name: 'Salary Analyzer', path: '/salary', icon: <BookOpen size={20} /> },
  { name: 'Job Analyzer', path: '/job-analyzer', icon: <Briefcase size={20} /> },
  { name: 'Certificates', path: '/certificates', icon: <Award size={20} /> },
  { name: 'Compare Offers', path: '/compare', icon: <Scale size={20} /> },
];

const bottomItems: SidebarItem[] = [
  { name: 'History', path: '/history', icon: <History size={20} /> },
  { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];

export function Sidebar() {
  const { user, setUser } = useAppStore();
  const { currentRoute } = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 bottom-0 w-64 bg-dark-900 border-r border-dark-800 flex flex-col z-40"
    >
      <div className="p-4 border-b border-dark-800">
        <Link to="/" className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-dark-50">ScamGuard</h1>
            <p className="text-xs text-dark-500">AI Job Analyzer</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-custom">
        <div className="mb-6">
          <p className="px-3 text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">
            Main
          </p>
          <nav className="space-y-1">
            {mainItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'
                  )
                }
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mb-6">
          <p className="px-3 text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">
            Tools
          </p>
          <nav className="space-y-1">
            {toolsItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'
                  )
                }
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <p className="px-3 text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">
            Account
          </p>
          <nav className="space-y-1">
            {bottomItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'
                  )
                }
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-3 border-t border-dark-800">
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-medium flex-shrink-0">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-200 truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-dark-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-dark-400 hover:bg-dark-800 hover:text-dark-200 transition-colors text-sm"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        ) : (
          <NavLink
            to="/auth"
            className={() =>
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-400 hover:bg-dark-800 hover:text-dark-200 transition-colors'
            }
          >
            <LogOut size={20} />
            <span className="font-medium">Sign In</span>
          </NavLink>
        )}
      </div>
    </motion.aside>
  );
}
