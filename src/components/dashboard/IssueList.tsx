import { motion } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/supabase';
import type { DetectedIssue } from '../../types';

interface IssueListProps {
  issues: DetectedIssue[];
  maxVisible?: number;
}

export function IssueList({ issues, maxVisible = 5 }: IssueListProps) {
  const [expanded, setExpanded] = useState(false);

  const severityConfig = {
    critical: {
      icon: <XCircle size={16} />,
      color: 'text-danger-400',
      bg: 'bg-danger-500/10',
      border: 'border-danger-500/30',
    },
    high: {
      icon: <AlertTriangle size={16} />,
      color: 'text-warning-400',
      bg: 'bg-warning-500/10',
      border: 'border-warning-500/30',
    },
    medium: {
      icon: <AlertCircle size={16} />,
      color: 'text-primary-400',
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/30',
    },
    low: {
      icon: <Info size={16} />,
      color: 'text-dark-400',
      bg: 'bg-dark-700/50',
      border: 'border-dark-600',
    },
  };

  const visibleIssues = expanded ? issues : issues.slice(0, maxVisible);
  const hasMore = issues.length > maxVisible;

  const sortedIssues = [...visibleIssues].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="space-y-3">
      {sortedIssues.map((issue, index) => {
        const config = severityConfig[issue.severity];

        return (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'rounded-xl border p-4 transition-all hover:shadow-lg',
              config.bg,
              config.border
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn('mt-0.5', config.color)}>{config.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-wider font-medium px-2 py-0.5 rounded bg-dark-800/50 text-dark-300">
                    {issue.category}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium capitalize',
                      config.color
                    )}
                  >
                    {issue.severity}
                  </span>
                  {issue.confidence > 0 && (
                    <span className="text-xs text-dark-500">
                      {issue.confidence}% confidence
                    </span>
                  )}
                </div>
                <p className="text-sm text-dark-100">{issue.description}</p>
                {issue.evidence && (
                  <div className="mt-2 p-2 rounded-lg bg-dark-900/50 border border-dark-700">
                    <p className="text-xs text-dark-400">
                      <span className="font-medium text-dark-300">Evidence: </span>
                      {issue.evidence}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {hasMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 flex items-center justify-center gap-2 text-sm text-dark-400 hover:text-dark-200 transition-colors"
        >
          {expanded ? (
            <>
              Show less <ChevronUp size={16} />
            </>
          ) : (
            <>
              Show {issues.length - maxVisible} more issues <ChevronDown size={16} />
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}

interface RecommendationListProps {
  recommendations: string[];
  variant?: 'default' | 'compact';
}

export function RecommendationList({
  recommendations,
  variant = 'default',
}: RecommendationListProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className={cn(variant === 'compact' ? 'space-y-2' : 'space-y-3')}>
      {recommendations.map((rec, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            'flex items-start gap-3',
            variant === 'compact' ? 'text-sm' : ''
          )}
        >
          <div className="w-6 h-6 rounded-full bg-success-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-medium text-success-400">
              {index + 1}
            </span>
          </div>
          <p className="text-dark-200">{rec}</p>
        </motion.div>
      ))}
    </div>
  );
}
