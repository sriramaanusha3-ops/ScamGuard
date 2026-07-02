import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 mesh-bg min-h-[calc(100vh-73px)]"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
