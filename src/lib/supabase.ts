import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRiskColor = (score: number): string => {
  if (score <= 25) return 'text-success-500';
  if (score <= 50) return 'text-warning-500';
  if (score <= 75) return 'text-danger-500';
  return 'text-danger-600';
};

export const getRiskBgColor = (score: number): string => {
  if (score <= 25) return 'bg-success-500';
  if (score <= 50) return 'bg-warning-500';
  if (score <= 75) return 'bg-danger-500';
  return 'bg-danger-600';
};

export const getVerdictLabel = (verdict: string): string => {
  switch (verdict) {
    case 'safe':
      return 'Safe to Proceed';
    case 'suspicious':
      return 'Exercise Caution';
    case 'dangerous':
      return 'High Risk - Likely Scam';
    default:
      return 'Unable to Determine';
  }
};

export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
