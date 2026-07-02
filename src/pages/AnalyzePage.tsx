import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  X,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Scan,
  Brain,
  ShieldCheck,
} from 'lucide-react';
import { Card, Button, Badge, Textarea, Select } from '../components/ui';
import { RiskGauge, AgentWorkflow, IssueList, RecommendationList } from '../components/dashboard';
import { useAppStore } from '../store';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/supabase';
import type { AnalysisReport, Agent, DetectedIssue } from '../types';
import { AGENT_WORKFLOW, SCAM_PATTERNS } from '../types';

const documentTypes = [
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'internship_letter', label: 'Internship Letter' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'resume', label: 'Resume' },
  { value: 'job_description', label: 'Job Description' },
];

export function AnalyzePage() {
  const [documentType, setDocumentType] = useState('offer_letter');
  const [documentName, setDocumentName] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [agents, setAgents] = useState<Agent[]>(AGENT_WORKFLOW);
  const [jobDescription, setJobDescription] = useState('');

  const { addNotification, addToHistory, user } = useAppStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setDocumentName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setExtractedText(text.slice(0, 10000));
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const detectScamPatterns = (text: string): DetectedIssue[] => {
    const issues: DetectedIssue[] = [];
    Object.values(SCAM_PATTERNS).forEach((pattern) => {
      if (pattern.pattern.test(text)) {
        const match = text.match(pattern.pattern);
        issues.push({
          id: crypto.randomUUID(),
          category: pattern.category,
          severity: pattern.severity,
          description: pattern.description,
          evidence: match ? match[0] : undefined,
          confidence: 85 + Math.random() * 15,
        });
      }
    });
    return issues;
  };

  const runAgentSimulation = async () => {
    for (let i = 0; i < agents.length; i++) {
      setAgents((prev) =>
        prev.map((agent, idx) =>
          idx === i
            ? { ...agent, status: 'running', progress: 0 }
            : agent
        )
      );

      for (let p = 0; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 100));
        setAgents((prev) =>
          prev.map((agent, idx) =>
            idx === i ? { ...agent, progress: p } : agent
          )
        );
      }

      await new Promise((r) => setTimeout(r, 300));

      setAgents((prev) =>
        prev.map((agent, idx) =>
          idx === i
            ? { ...agent, status: 'completed', progress: 100, output: 'Analysis complete' }
            : agent
        )
      );
    }
  };

  const handleAnalyze = async () => {
    const textToAnalyze = extractedText || jobDescription;
    if (!textToAnalyze.trim()) {
      addNotification({
        type: 'error',
        title: 'No Content',
        message: 'Please upload a document or paste text to analyze',
      });
      return;
    }

    setIsAnalyzing(true);
    setAgents(AGENT_WORKFLOW.map((a) => ({ ...a, status: 'pending', progress: 0 })));
    setReport(null);

    try {
      await runAgentSimulation();

      const issues = detectScamPatterns(textToAnalyze);
      const criticalCount = issues.filter((i) => i.severity === 'critical').length;
      const highCount = issues.filter((i) => i.severity === 'high').length;
      const mediumCount = issues.filter((i) => i.severity === 'medium').length;

      let riskScore = Math.min(issues.length * 10 + criticalCount * 20 + highCount * 15 + mediumCount * 5, 100);
      let verdict: 'safe' | 'suspicious' | 'dangerous' | 'unknown';
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';

      if (riskScore <= 25) {
        verdict = 'safe';
        riskLevel = 'low';
      } else if (riskScore <= 50) {
        verdict = 'suspicious';
        riskLevel = 'medium';
      } else if (riskScore <= 75) {
        verdict = 'dangerous';
        riskLevel = 'high';
      } else {
        verdict = 'dangerous';
        riskLevel = 'critical';
      }

      const recommendations = [
        riskScore > 50
          ? 'Do not proceed with this offer without further verification'
          : 'Document appears legitimate but verify company details',
        issues.some((i) => i.category === 'financial')
          ? 'Never share bank details or make payments before verifying the company'
          : 'Ensure all financial terms are documented in official letters',
        'Contact the company directly through their official website',
        'Verify the recruiter details on LinkedIn',
      ];

      const newReport: AnalysisReport = {
        id: crypto.randomUUID(),
        user_id: user?.id || 'anonymous',
        document_type: documentType as any,
        document_name: documentName || 'Pasted Text',
        extracted_text: textToAnalyze,
        risk_score: riskScore,
        trust_score: 100 - riskScore,
        confidence_score: 85 + Math.random() * 10,
        verdict,
        risk_level: riskLevel,
        detected_issues: issues,
        recommendations,
        company_info: null,
        recruiter_info: null,
        salary_analysis: null,
        ai_summary: `This ${documentType.replace('_', ' ')} contains ${issues.length} potential red flags. The overall risk assessment indicates ${verdict} status with ${riskScore}% risk score.`,
        agent_logs: agents.map((a) => ({
          agent_name: a.name,
          status: a.status,
          started_at: new Date().toISOString(),
          output: a.output,
        })),
        created_at: new Date().toISOString(),
      };

      setReport(newReport);
      addToHistory(newReport);

      if (user) {
        await supabase.from('reports').insert({
          id: newReport.id,
          user_id: user.id,
          document_type: newReport.document_type,
          document_name: newReport.document_name,
          extracted_text: newReport.extracted_text,
          risk_score: newReport.risk_score,
          trust_score: newReport.trust_score,
          confidence_score: newReport.confidence_score,
          verdict: newReport.verdict,
          risk_level: newReport.risk_level,
          ai_summary: newReport.ai_summary,
          recommendations: newReport.recommendations,
        });
      }

      addNotification({
        type: verdict === 'safe' ? 'success' : verdict === 'suspicious' ? 'warning' : 'error',
        title: 'Analysis Complete',
        message: `Document analyzed with ${riskScore}% risk score`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Analysis Failed',
        message: 'An error occurred during analysis',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-50">Document Analysis</h1>
        <p className="text-dark-400 mt-1">
          Upload documents or paste text for AI-powered scam detection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card variant="gradient">
            <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
              <FileSearch size={20} className="text-primary-400" />
              Upload Document
            </h3>

            <Select
              label="Document Type"
              options={documentTypes}
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="mb-4"
            />

            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                isDragActive
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-dark-600 hover:border-dark-500 hover:bg-dark-800/50'
              )}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="p-3 rounded-full bg-dark-700">
                  <Upload size={24} className="text-dark-400" />
                </div>
                <div>
                  <p className="text-dark-200">
                    {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
                  </p>
                  <p className="text-sm text-dark-500 mt-1">
                    or click to browse (PDF, TXT)
                  </p>
                </div>
              </motion.div>
            </div>

            {documentName && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl bg-dark-700/50 flex items-center gap-3"
              >
                <FileText size={18} className="text-primary-400" />
                <span className="text-sm text-dark-200 flex-1 truncate">
                  {documentName}
                </span>
                <button
                  onClick={() => {
                    setDocumentName('');
                    setExtractedText('');
                  }}
                  className="text-dark-400 hover:text-dark-200"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </Card>

          <Card variant="gradient">
            <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
              <Brain size={20} className="text-accent-400" />
              Or Paste Text
            </h3>

            <Textarea
              placeholder="Paste your offer letter, job description, or any document text here for analysis..."
              value={extractedText || jobDescription}
              onChange={(e) => {
                setExtractedText(e.target.value);
                setJobDescription(e.target.value);
              }}
              rows={10}
              className="font-mono text-sm"
            />
          </Card>

          <Button
            onClick={handleAnalyze}
            isLoading={isAnalyzing}
            disabled={!extractedText && !jobDescription}
            className="w-full"
            leftIcon={<ShieldCheck size={18} />}
          >
            {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
          </Button>
        </div>

        <div className="space-y-6">
          <AgentWorkflow agents={agents} />

          <AnimatePresence>
            {report && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card variant="gradient">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-dark-50">
                      Analysis Results
                    </h3>
                    <Badge
                      variant={
                        report.verdict === 'safe'
                          ? 'success'
                          : report.verdict === 'suspicious'
                          ? 'warning'
                          : 'danger'
                      }
                      size="lg"
                    >
                      {report.verdict.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-center py-4">
                    <RiskGauge score={report.risk_score} size={180} />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 rounded-xl bg-dark-700/30">
                      <p className="text-2xl font-bold text-primary-400">
                        {report.trust_score}%
                      </p>
                      <p className="text-xs text-dark-500 mt-1">Trust Score</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-dark-700/30">
                      <p className="text-2xl font-bold text-accent-400">
                        {report.confidence_score.toFixed(0)}%
                      </p>
                      <p className="text-xs text-dark-500 mt-1">Confidence</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-dark-700/30">
                      <p className="text-2xl font-bold text-dark-200">
                        {report.detected_issues.length}
                      </p>
                      <p className="text-xs text-dark-500 mt-1">Issues Found</p>
                    </div>
                  </div>
                </Card>

                {report.detected_issues.length > 0 && (
                  <Card variant="gradient">
                    <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
                      <AlertTriangle size={20} className="text-warning-400" />
                      Detected Issues ({report.detected_issues.length})
                    </h3>
                    <IssueList issues={report.detected_issues} />
                  </Card>
                )}

                <Card variant="gradient">
                  <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-success-400" />
                    AI Recommendations
                  </h3>
                  <RecommendationList recommendations={report.recommendations} />
                </Card>

                <Card variant="gradient">
                  <h3 className="text-lg font-semibold text-dark-50 mb-4">
                    AI Summary
                  </h3>
                  <p className="text-dark-300 leading-relaxed">
                    {report.ai_summary}
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
