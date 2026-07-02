import { motion } from 'framer-motion';
import {
  FileText,
  Scan,
  Building2,
  Globe,
  AlertTriangle,
  UserCheck,
  DollarSign,
  Activity,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
} from 'lucide-react';
import { cn } from '../../lib/supabase';
import type { Agent } from '../../types';

const agentIcons: Record<string, React.ReactNode> = {
  pdf_extraction: <FileText size={16} />,
  ocr_agent: <Scan size={16} />,
  company_verification: <Building2 size={16} />,
  domain_reputation: <Globe size={16} />,
  scam_detection: <AlertTriangle size={16} />,
  recruiter_verification: <UserCheck size={16} />,
  salary_analysis: <DollarSign size={16} />,
  risk_calculation: <Activity size={16} />,
  recommendation: <Lightbulb size={16} />,
};

interface AgentCardProps {
  agent: Agent;
  index: number;
}

function AgentCard({ agent, index }: AgentCardProps) {
  const statusConfig = {
    pending: {
      icon: <Clock size={16} />,
      color: 'text-dark-500',
      bg: 'bg-dark-700',
      border: 'border-dark-600',
    },
    running: {
      icon: <Loader2 size={16} className="animate-spin" />,
      color: 'text-primary-400',
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/30',
    },
    completed: {
      icon: <CheckCircle2 size={16} />,
      color: 'text-success-400',
      bg: 'bg-success-500/10',
      border: 'border-success-500/30',
    },
    failed: {
      icon: <XCircle size={16} />,
      color: 'text-danger-400',
      bg: 'bg-danger-500/10',
      border: 'border-danger-500/30',
    },
  };

  const config = statusConfig[agent.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-all duration-300',
        config.bg,
        config.border
      )}
    >
      <div
        className={cn(
          'p-2 rounded-lg',
          agent.status === 'running' ? 'bg-primary-500/20' : 'bg-dark-800'
        )}
      >
        <span className={cn(agent.status === 'running' ? 'text-primary-400' : 'text-dark-400')}>
          {agentIcons[agent.id] || <Activity size={16} />}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', config.color)}>
          {agent.name.replace(' Agent', '')}
        </p>
        {agent.status === 'running' && (
          <p className="text-xs text-dark-500 mt-0.5">{agent.description}</p>
        )}
        {agent.output && agent.status === 'completed' && (
          <p className="text-xs text-dark-400 mt-0.5 truncate">{agent.output}</p>
        )}
        {agent.error && (
          <p className="text-xs text-danger-400 mt-0.5 truncate">{agent.error}</p>
        )}
      </div>

      <div className={cn('flex items-center gap-2', config.color)}>
        {config.icon}
        {agent.progress > 0 && agent.status === 'running' && (
          <span className="text-xs font-medium">{agent.progress}%</span>
        )}
      </div>
    </motion.div>
  );
}

interface AgentWorkflowProps {
  agents: Agent[];
  title?: string;
}

export function AgentWorkflow({ agents, title = 'AI Agent Pipeline' }: AgentWorkflowProps) {
  const completedCount = agents.filter((a) => a.status === 'completed').length;
  const totalCount = agents.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-100">{title}</h3>
        <span className="text-sm text-dark-400">
          {completedCount}/{totalCount} agents
        </span>
      </div>

      <div className="mb-4">
        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((agent, index) => (
          <AgentCard key={agent.id} agent={agent} index={index} />
        ))}
      </div>
    </div>
  );
}

export function AgentTimeline({ agents }: { agents: Agent[] }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-dark-700" />
      <div className="space-y-4">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative pl-10"
          >
            <div
              className={cn(
                'absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                agent.status === 'completed' && 'bg-success-500 border-success-500',
                agent.status === 'running' && 'bg-primary-500/20 border-primary-500',
                agent.status === 'failed' && 'bg-danger-500 border-danger-500',
                agent.status === 'pending' && 'bg-dark-800 border-dark-600'
              )}
            >
              {agent.status === 'completed' && (
                <CheckCircle2 size={12} className="text-white" />
              )}
              {agent.status === 'running' && (
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              )}
            </div>
            <div className="bg-dark-800/50 rounded-xl p-3 border border-dark-700">
              <p className="text-sm font-medium text-dark-200">{agent.name}</p>
              {agent.output && (
                <p className="text-xs text-dark-400 mt-1">{agent.output}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
