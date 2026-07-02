import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '../../lib/supabase';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
}: ModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full mx-4 bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl',
              sizes[size],
              className
            )}
          >
            {(title || onClose) && (
              <div className="flex items-start justify-between p-6 border-b border-dark-700">
                <div>
                  {title && (
                    <h2 className="text-xl font-semibold text-dark-50">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-dark-400 mt-1">{description}</p>
                  )}
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-dark-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}
            <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-custom">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'left' | 'right';
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  className,
}: DrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'absolute top-0 bottom-0 w-full max-w-md bg-dark-900 border-dark-700 shadow-2xl',
              side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-dark-700">
                <h2 className="text-lg font-semibold text-dark-50">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="p-4 h-[calc(100%-64px)] overflow-y-auto scrollbar-custom">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = 'top',
}: TooltipProps) {
  const positions = {
    top: '-translate-y-full left-1/2 -translate-x-1/2 bottom-full mb-2',
    bottom: 'translate-y-full left-1/2 -translate-x-1/2 top-full mt-2',
    left: '-translate-x-full top-1/2 -translate-y-1/2 right-full mr-2',
    right: 'translate-x-full top-1/2 -translate-y-1/2 left-full ml-2',
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div
        className={cn(
          'absolute z-50 px-3 py-2 text-sm bg-dark-700 text-dark-100 rounded-lg border border-dark-600 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200',
          positions[position]
        )}
      >
        {content}
      </div>
    </div>
  );
}
