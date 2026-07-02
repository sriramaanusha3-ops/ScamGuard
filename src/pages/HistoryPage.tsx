import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  History as HistoryIcon,
  FileText,
  Trash2,
  Download,
  Filter,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Card, Button, Badge, Select, Input } from '../components/ui';
import { useAppStore } from '../store';
import { cn, formatDate } from '../lib/supabase';
import type { AnalysisReport } from '../types';

export function HistoryPage() {
  const { analysisHistory, clearHistory } = useAppStore();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);

  const filteredHistory = analysisHistory.filter((report) => {
    if (filter !== 'all' && report.verdict !== filter) return false;
    if (searchQuery && !report.document_name.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });

  const stats = {
    total: analysisHistory.length,
    safe: analysisHistory.filter((r) => r.verdict === 'safe').length,
    suspicious: analysisHistory.filter((r) => r.verdict === 'suspicious').length,
    dangerous: analysisHistory.filter((r) => r.verdict === 'dangerous').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-50">Analysis History</h1>
          <p className="text-dark-400 mt-1">
            View and manage your previous document analyses
          </p>
        </div>
        {analysisHistory.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to clear all history?')) {
                clearHistory();
              }
            }}
            leftIcon={<Trash2 size={16} />}
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-dark-100">{stats.total}</p>
          <p className="text-sm text-dark-400">Total Analyses</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success-400">{stats.safe}</p>
          <p className="text-sm text-dark-400">Safe</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-warning-400">{stats.suspicious}</p>
          <p className="text-sm text-dark-400">Suspicious</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-danger-400">{stats.dangerous}</p>
          <p className="text-sm text-dark-400">Dangerous</p>
        </Card>
      </div>

      <Card variant="gradient">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<FileText size={18} />}
            />
          </div>
          <div className="w-48">
            <Select
              options={[
                { value: 'all', label: 'All Results' },
                { value: 'safe', label: 'Safe' },
                { value: 'suspicious', label: 'Suspicious' },
                { value: 'dangerous', label: 'Dangerous' },
              ]}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HistoryIcon size={48} className="text-dark-600 mb-4" />
            <h3 className="text-lg font-medium text-dark-300">
              {analysisHistory.length === 0
                ? 'No analysis history yet'
                : 'No matching results'}
            </h3>
            <p className="text-sm text-dark-500 mt-2">
              {analysisHistory.length === 0
                ? 'Start by analyzing a document'
                : 'Try different search terms or filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedReport(report)}
                className={cn(
                  'p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg',
                  report.verdict === 'safe'
                    ? 'bg-success-500/5 border-success-500/20 hover:border-success-500/40'
                    : report.verdict === 'suspicious'
                    ? 'bg-warning-500/5 border-warning-500/20 hover:border-warning-500/40'
                    : 'bg-danger-500/5 border-danger-500/20 hover:border-danger-500/40'
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'p-3 rounded-xl',
                      report.verdict === 'safe'
                        ? 'bg-success-500/20'
                        : report.verdict === 'suspicious'
                        ? 'bg-warning-500/20'
                        : 'bg-danger-500/20'
                    )}
                  >
                    <FileText
                      size={20}
                      className={
                        report.verdict === 'safe'
                          ? 'text-success-400'
                          : report.verdict === 'suspicious'
                          ? 'text-warning-400'
                          : 'text-danger-400'
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-100 truncate">
                      {report.document_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-dark-500">
                        {report.document_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-dark-600">•</span>
                      <span className="text-xs text-dark-500 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(report.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className={cn(
                          'text-lg font-bold',
                          report.risk_score <= 25
                            ? 'text-success-400'
                            : report.risk_score <= 50
                            ? 'text-warning-400'
                            : 'text-danger-400'
                        )}
                      >
                        {report.risk_score}%
                      </p>
                      <p className="text-xs text-dark-500">Risk Score</p>
                    </div>
                    <Badge
                      variant={
                        report.verdict === 'safe'
                          ? 'success'
                          : report.verdict === 'suspicious'
                          ? 'warning'
                          : 'danger'
                      }
                      dot
                    >
                      {report.verdict}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {selectedReport && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80"
          onClick={() => setSelectedReport(null)}
        >
          <Card
            variant="gradient"
            className="w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-dark-50">
                  {selectedReport.document_name}
                </h3>
                <p className="text-sm text-dark-400">
                  {selectedReport.document_type.replace('_', ' ')} •{' '}
                  {formatDate(selectedReport.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedReport.verdict === 'safe'
                      ? 'success'
                      : selectedReport.verdict === 'suspicious'
                      ? 'warning'
                      : 'danger'
                  }
                  size="lg"
                >
                  {selectedReport.verdict.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-dark-700/30 text-center">
                <p className="text-2xl font-bold text-danger-400">
                  {selectedReport.risk_score}%
                </p>
                <p className="text-xs text-dark-500">Risk Score</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-700/30 text-center">
                <p className="text-2xl font-bold text-success-400">
                  {selectedReport.trust_score}%
                </p>
                <p className="text-xs text-dark-500">Trust Score</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-700/30 text-center">
                <p className="text-2xl font-bold text-primary-400">
                  {selectedReport.detected_issues.length}
                </p>
                <p className="text-xs text-dark-500">Issues</p>
              </div>
            </div>

            {selectedReport.ai_summary && (
              <div className="p-4 rounded-xl bg-dark-700/30 mb-6">
                <h4 className="text-sm font-semibold text-dark-200 mb-2">AI Summary</h4>
                <p className="text-sm text-dark-300">{selectedReport.ai_summary}</p>
              </div>
            )}

            {selectedReport.detected_issues.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-dark-200 mb-3">
                  Detected Issues
                </h4>
                <div className="space-y-2">
                  {selectedReport.detected_issues.slice(0, 5).map((issue) => (
                    <div
                      key={issue.id}
                      className={cn(
                        'flex items-start gap-2 p-3 rounded-lg',
                        issue.severity === 'critical' || issue.severity === 'high'
                          ? 'bg-danger-500/10'
                          : issue.severity === 'medium'
                          ? 'bg-warning-500/10'
                          : 'bg-dark-700/30'
                      )}
                    >
                      <AlertTriangle
                        size={16}
                        className={
                          issue.severity === 'critical' || issue.severity === 'high'
                            ? 'text-danger-400'
                            : 'text-warning-400'
                        }
                      />
                      <div>
                        <p className="text-sm text-dark-200">{issue.description}</p>
                        {issue.evidence && (
                          <p className="text-xs text-dark-500 mt-1">
                            "{issue.evidence}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setSelectedReport(null)}
                className="flex-1"
              >
                Close
              </Button>
              <Button className="flex-1" leftIcon={<Download size={16} />}>
                Export Report
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
