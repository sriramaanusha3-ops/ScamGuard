import { motion } from 'framer-motion';
import {
  AlertTriangle,
  DollarSign,
  UserCheck,
  Clock,
  Mail,
  FileText,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { Card, Badge } from '../components/ui';
import { cn } from '../lib/supabase';
import { SCAM_PATTERNS } from '../types';
import { useAppStore } from '../store';

const scamCategories = [
  {
    name: 'Financial Scams',
    icon: <DollarSign size={24} />,
    color: 'text-danger-400',
    bgColor: 'bg-danger-500/20',
    patterns: [
      'Registration fee requests',
      'Security deposit demands',
      'Training fee charges',
      'Equipment purchase requirements',
      'Gift card payments',
      'Cryptocurrency payment requests',
      'Personal bank account transfers',
    ],
  },
  {
    name: 'Unrealistic Promises',
    icon: <TrendingUp size={24} />,
    color: 'text-warning-400',
    bgColor: 'bg-warning-500/20',
    patterns: [
      'Guaranteed job placement',
      '100% placement claims',
      'Unrealistic salary for experience',
      'Work from home earning claims',
      'No interview job offers',
      'Immediate start promises',
    ],
  },
  {
    name: 'Pressure Tactics',
    icon: <Clock size={24} />,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/20',
    patterns: [
      'Urgent hiring claims',
      'Limited seats available',
      'Immediate joining required',
      'Offer expires soon',
      'Pay now for discount',
    ],
  },
  {
    name: 'Communication Red Flags',
    icon: <Mail size={24} />,
    color: 'text-accent-400',
    bgColor: 'bg-accent-500/20',
    patterns: [
      'Telegram-only communication',
      'WhatsApp-only contact',
      'Personal email providers only',
      'No official company email',
      'Unprofessional language',
    ],
  },
];

const statistics = [
  { label: 'Financial Scams Detected', value: '15,420', change: '+12%' },
  { label: 'Job Seekers Protected', value: '89,350', change: '+8%' },
  { label: 'Money Saved', value: '₹2.4 Cr', change: '+15%' },
  { label: 'Patterns in Database', value: '248', change: '+5' },
];

export function ScamPatternsPage() {
  const { analysisHistory } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-50">Scam Pattern Library</h1>
        <p className="text-dark-400 mt-1">
          Known scam patterns and how to identify them
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statistics.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="text-center">
              <p className="text-2xl font-bold text-dark-100">{stat.value}</p>
              <p className="text-sm text-dark-400 mt-1">{stat.label}</p>
              <Badge
                variant={stat.change.includes('+') ? 'success' : 'danger'}
                size="sm"
                className="mt-2"
              >
                {stat.change}
              </Badge>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scamCategories.map((category, idx) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card variant="gradient" hover>
              <div className="flex items-center gap-4 mb-6">
                <div className={cn('p-3 rounded-xl', category.bgColor)}>
                  <span className={category.color}>{category.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-dark-50">
                  {category.name}
                </h3>
              </div>

              <ul className="space-y-3">
                {category.patterns.map((pattern, pIdx) => (
                  <li
                    key={pIdx}
                    className="flex items-center gap-3 text-sm text-dark-300"
                  >
                    <AlertTriangle size={14} className={cn(category.color)} />
                    {pattern}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card variant="gradient">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-danger-500/20">
            <ShieldAlert size={24} className="text-danger-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-dark-50">
              Critical Warning Signs
            </h3>
            <p className="text-sm text-dark-400">
              These patterns almost always indicate a scam
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Payment Requests',
              desc: 'Legitimate employers never ask for money',
              severity: 'critical',
            },
            {
              title: 'Gift Card Payments',
              desc: '100% scam - no real company uses gift cards',
              severity: 'critical',
            },
            {
              title: 'Crypto Payment',
              desc: 'Cryptocurrency requests are always fraudulent',
              severity: 'critical',
            },
            {
              title: 'No Interview Process',
              desc: 'Real jobs require screening and interviews',
              severity: 'high',
            },
            {
              title: 'Personal Bank Transfer',
              desc: 'Companies use official accounts, not personal',
              severity: 'high',
            },
            {
              title: 'Urgent Payment',
              desc: 'Pressure to pay immediately is a red flag',
              severity: 'high',
            },
          ].map((warning, idx) => (
            <motion.div
              key={warning.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                'p-4 rounded-xl border',
                warning.severity === 'critical'
                  ? 'bg-danger-500/10 border-danger-500/30'
                  : 'bg-warning-500/10 border-warning-500/30'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle
                  size={16}
                  className={
                    warning.severity === 'critical'
                      ? 'text-danger-400'
                      : 'text-warning-400'
                  }
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    warning.severity === 'critical'
                      ? 'text-danger-400'
                      : 'text-warning-400'
                  )}
                >
                  {warning.title}
                </span>
              </div>
              <p className="text-xs text-dark-400">{warning.desc}</p>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
