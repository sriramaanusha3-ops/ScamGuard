import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Search,
  Flag,
  Star,
  FileText,
  Lightbulb,
  Eye,
} from 'lucide-react';
import { Card, Button, Textarea, Badge } from '../components/ui';
import { cn } from '../lib/supabase';

interface Highlight {
  text: string;
  type: 'danger' | 'warning' | 'safe';
  reason: string;
}

interface JDAnalysis {
  overallScore: number;
  verdict: 'safe' | 'suspicious' | 'dangerous';
  highlights: Highlight[];
  redFlags: string[];
  greenFlags: string[];
  requirements: string[];
  benefits: string[];
  questions: string[];
  summary: string;
}

const redFlagPatterns: { regex: RegExp; reason: string; severity: 'danger' | 'warning' }[] = [
  { regex: /registration\s*fee|training\s*fee|security\s*deposit/gi, reason: 'Payment request — legitimate companies never charge candidates', severity: 'danger' },
  { regex: /₹\s*\d+\s*\/\s*(day|hour)|earn\s*₹\s*\d+\s*(daily|per\s*day)/gi, reason: 'Unrealistic per-day earnings claim', severity: 'danger' },
  { regex: /no\s*interview|direct\s*selection|100%\s*selection/gi, reason: 'No interview process — major red flag', severity: 'danger' },
  { regex: /gift\s*card|bitcoin|cryptocurrency|crypto\s*payment/gi, reason: 'Suspicious payment method requested', severity: 'danger' },
  { regex: /telegram\s*only|whatsapp\s*only|contact\s*on\s*(telegram|whatsapp)/gi, reason: 'Only informal contact channels — suspicious', severity: 'danger' },
  { regex: /urgent\s*hiring|immediate\s*(join|start)|limited\s*seats/gi, reason: 'Pressure tactics to make quick decision', severity: 'warning' },
  { regex: /guaranteed\s*(job|placement|income)|assured\s*employment/gi, reason: 'No legitimate employer guarantees placement', severity: 'warning' },
  { regex: /work\s*from\s*home.{0,30}(easy|simple|no\s*experience)/gi, reason: 'Oversimplified WFH claims', severity: 'warning' },
  { regex: /apply\s*now.{0,20}(expire|closing|today\s*only)/gi, reason: 'Urgency/scarcity pressure tactics', severity: 'warning' },
  { regex: /personal\s*(bank|account)|transfer\s*to\s*personal/gi, reason: 'Requests payment to personal account', severity: 'danger' },
  { regex: /mlm|multi.?level\s*market|pyramid|chain\s*market/gi, reason: 'MLM / pyramid scheme indicators', severity: 'danger' },
];

const greenFlagPatterns: { regex: RegExp; text: string }[] = [
  { regex: /health\s*(insurance|cover|benefits)/gi, text: 'Health insurance mentioned' },
  { regex: /stock\s*(option|grant|esop)|equity/gi, text: 'Stock options / equity offered' },
  { regex: /annual\s*(bonus|leave|increment)/gi, text: 'Standard annual benefits mentioned' },
  { regex: /code\s*(test|challenge|assessment)|technical\s*interview/gi, text: 'Proper technical screening process' },
  { regex: /registered\s*(company|business)|cin\s*:|gst\s*:/gi, text: 'Company registration details provided' },
  { regex: /glassdoor|linkedin\s*company|official\s*website/gi, text: 'Verifiable company presence mentioned' },
];

function analyzeJD(text: string): JDAnalysis {
  const highlights: Highlight[] = [];
  let dangerCount = 0;
  let warningCount = 0;

  redFlagPatterns.forEach(({ regex, reason, severity }) => {
    let match: RegExpExecArray | null;
    const freshRegex = new RegExp(regex.source, regex.flags);
    while ((match = freshRegex.exec(text)) !== null) {
      highlights.push({ text: match[0], type: severity, reason });
      if (severity === 'danger') dangerCount++;
      else warningCount++;
    }
  });

  greenFlagPatterns.forEach(({ regex, text: greenText }) => {
    if (regex.test(text)) {
      highlights.push({ text: greenText, type: 'safe', reason: 'Positive indicator' });
    }
  });

  const redFlags = [...new Set(highlights.filter((h) => h.type !== 'safe').map((h) => h.reason))];
  const greenFlags = [...new Set(highlights.filter((h) => h.type === 'safe').map((h) => h.text))];

  const reqMatch = text.match(/require[ds]?:?(.*?)(?=\n\n|\bresponsibilit|\bbenefits|\bwhat\s*we\s*offer|$)/is);
  const requirements = reqMatch
    ? reqMatch[1].split(/\n|•|●|➜|→|\*|-/).map((r) => r.trim()).filter((r) => r.length > 10).slice(0, 8)
    : ['Relevant experience in the domain', 'Strong communication skills', 'Problem-solving ability'];

  const benMatch = text.match(/benefits?:?(.*?)(?=\n\n|\brequire|\bresponsibilit|$)/is);
  const benefits = benMatch
    ? benMatch[1].split(/\n|•|●|➜|→|\*|-/).map((b) => b.trim()).filter((b) => b.length > 5).slice(0, 6)
    : [];

  const overallScore = Math.max(0, Math.min(100 - dangerCount * 20 - warningCount * 10 + greenFlags.length * 5, 100));
  const verdict: JDAnalysis['verdict'] = dangerCount >= 2 ? 'dangerous' : dangerCount >= 1 || warningCount >= 3 ? 'suspicious' : 'safe';

  const questions = [
    'What does the day-to-day work look like?',
    'Can you describe the team structure?',
    'What is the growth path for this role?',
    'How is performance measured?',
    'Can you share the company registration number for verification?',
    ...(redFlags.length > 0 ? ['Why does this role require [mention the red flag]?'] : []),
  ];

  const summary = dangerCount > 0
    ? `This job description contains ${dangerCount} critical red flag(s) and ${warningCount} warning(s). Exercise extreme caution before applying.`
    : warningCount > 0
    ? `This description has ${warningCount} warning(s) that warrant further investigation before proceeding.`
    : greenFlags.length > 0
    ? `This looks like a legitimate job posting with ${greenFlags.length} positive indicator(s) and no major red flags.`
    : 'This job description appears standard. Verify company details independently before applying.';

  return { overallScore, verdict, highlights, redFlags, greenFlags, requirements, benefits, questions, summary };
}

function HighlightedText({ text, highlights }: { text: string; highlights: Highlight[] }) {
  if (!highlights.length) return <p className="text-sm text-dark-300 leading-relaxed whitespace-pre-wrap">{text}</p>;

  let result = text;
  const spans: { start: number; end: number; type: string }[] = [];

  highlights.forEach(({ text: ht, type }) => {
    if (type === 'safe') return;
    const idx = result.toLowerCase().indexOf(ht.toLowerCase());
    if (idx !== -1) spans.push({ start: idx, end: idx + ht.length, type });
  });

  spans.sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  spans.forEach(({ start, end, type }, i) => {
    if (start > cursor) parts.push(<span key={`t${i}`}>{result.slice(cursor, start)}</span>);
    parts.push(
      <mark
        key={`h${i}`}
        className={cn('rounded px-0.5', type === 'danger' ? 'bg-danger-500/30 text-danger-200' : 'bg-warning-500/30 text-warning-200')}
      >
        {result.slice(start, end)}
      </mark>
    );
    cursor = end;
  });
  if (cursor < result.length) parts.push(<span key="last">{result.slice(cursor)}</span>);

  return <p className="text-sm text-dark-300 leading-relaxed whitespace-pre-wrap">{parts}</p>;
}

export function JobAnalyzerPage() {
  const [jdText, setJdText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<JDAnalysis | null>(null);
  const [view, setView] = useState<'edit' | 'highlight'>('edit');

  const analyze = async () => {
    if (!jdText.trim()) return;
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setResult(analyzeJD(jdText));
    setView('highlight');
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-50">Job Description Analyzer</h1>
        <p className="text-dark-400 mt-1">Paste any job posting to detect red flags, highlight suspicious phrases, and get safety insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card variant="gradient">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-dark-100 flex items-center gap-2">
                <FileText size={18} className="text-primary-400" />
                {view === 'highlight' && result ? 'Highlighted Analysis' : 'Job Description'}
              </h3>
              {result && (
                <div className="flex gap-2">
                  <button onClick={() => setView('edit')} className={cn('px-3 py-1 text-xs rounded-lg transition-all', view === 'edit' ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400 hover:text-dark-200')}>
                    Edit
                  </button>
                  <button onClick={() => setView('highlight')} className={cn('px-3 py-1 text-xs rounded-lg transition-all', view === 'highlight' ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400 hover:text-dark-200')}>
                    <Eye size={12} className="inline mr-1" />Highlighted
                  </button>
                </div>
              )}
            </div>

            {view === 'edit' || !result ? (
              <Textarea
                placeholder="Paste the complete job description here...&#10;&#10;Include role title, responsibilities, requirements, compensation, and company details for best results."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={16}
              />
            ) : (
              <div className="min-h-64 max-h-96 overflow-y-auto p-4 bg-dark-900/50 rounded-xl border border-dark-700 scrollbar-custom">
                <HighlightedText text={jdText} highlights={result.highlights} />
              </div>
            )}

            <div className="flex items-center gap-3 mt-3">
              <Button onClick={analyze} isLoading={isAnalyzing} className="flex-1" leftIcon={<Search size={18} />}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Job Description'}
              </Button>
              {jdText && (
                <Button variant="ghost" size="sm" onClick={() => { setJdText(''); setResult(null); setView('edit'); }}>
                  Clear
                </Button>
              )}
            </div>

            {result && (
              <div className="mt-3 flex items-center gap-3 text-xs text-dark-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-danger-500/40 border border-danger-500/60 inline-block"></span>
                  Critical red flag
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-warning-500/40 border border-warning-500/60 inline-block"></span>
                  Warning
                </span>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <Card className={cn('border', result.verdict === 'safe' ? 'border-success-500/30 bg-success-500/5' : result.verdict === 'suspicious' ? 'border-warning-500/30 bg-warning-500/5' : 'border-danger-500/30 bg-danger-500/5')}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-dark-400">Safety Score</p>
                      <p className={cn('text-4xl font-bold mt-1', result.verdict === 'safe' ? 'text-success-400' : result.verdict === 'suspicious' ? 'text-warning-400' : 'text-danger-400')}>
                        {result.overallScore}%
                      </p>
                    </div>
                    <Badge variant={result.verdict === 'safe' ? 'success' : result.verdict === 'suspicious' ? 'warning' : 'danger'} size="lg" dot>
                      {result.verdict.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-dark-300 mt-3">{result.summary}</p>
                </Card>

                {result.redFlags.length > 0 && (
                  <Card className="border-danger-500/20 bg-danger-500/5">
                    <h3 className="text-sm font-semibold text-danger-400 mb-3 flex items-center gap-2">
                      <Flag size={16} /> Red Flags ({result.redFlags.length})
                    </h3>
                    <ul className="space-y-2">
                      {result.redFlags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-dark-200">
                          <AlertTriangle size={14} className="text-danger-400 mt-0.5 flex-shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {result.greenFlags.length > 0 && (
                  <Card className="border-success-500/20 bg-success-500/5">
                    <h3 className="text-sm font-semibold text-success-400 mb-3 flex items-center gap-2">
                      <Star size={16} /> Positive Indicators
                    </h3>
                    <ul className="space-y-2">
                      {result.greenFlags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-dark-200">
                          <CheckCircle2 size={14} className="text-success-400 mt-0.5 flex-shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {result.requirements.length > 0 && (
                  <Card variant="gradient">
                    <h3 className="text-sm font-semibold text-dark-100 mb-3 flex items-center gap-2">
                      <Briefcase size={14} className="text-primary-400" /> Extracted Requirements
                    </h3>
                    <ul className="space-y-1.5">
                      {result.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-dark-300">
                          <span className="text-dark-500">•</span> {req}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                <Card variant="gradient">
                  <h3 className="text-sm font-semibold text-dark-100 mb-3 flex items-center gap-2">
                    <Lightbulb size={14} className="text-warning-400" /> Questions to Ask the Recruiter
                  </h3>
                  <ul className="space-y-2">
                    {result.questions.slice(0, 5).map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-dark-200">
                        <span className="w-5 h-5 rounded-full bg-warning-500/20 text-warning-400 text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && (
            <Card className="flex flex-col items-center justify-center py-20 text-center">
              <Briefcase size={48} className="text-dark-600 mb-4" />
              <h3 className="text-lg font-medium text-dark-300">Paste a job description to analyze</h3>
              <p className="text-sm text-dark-500 mt-2 max-w-xs">We'll highlight suspicious phrases and identify red flags instantly</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
