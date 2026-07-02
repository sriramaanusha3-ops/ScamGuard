import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Briefcase,
  Code2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Card, Button, Input, Textarea, Badge } from '../components/ui';
import { useAppStore } from '../store';
import { cn } from '../lib/supabase';

interface ResumeResult {
  atsScore: number;
  overallScore: number;
  sections: {
    formatting: number;
    keywords: number;
    experience: number;
    skills: number;
    education: number;
    impact: number;
  };
  extractedSkills: string[];
  missingKeywords: string[];
  strongPoints: string[];
  improvements: string[];
  experienceYears: number;
  jobMatchScore: number;
  suggestions: { category: string; text: string; priority: 'high' | 'medium' | 'low' }[];
}

const techSkillsDB = [
  'JavaScript','TypeScript','Python','Java','React','Node.js','Angular','Vue.js',
  'SQL','MongoDB','PostgreSQL','AWS','Azure','Docker','Kubernetes','Git',
  'REST API','GraphQL','CI/CD','Agile','Scrum','Machine Learning','AI','Data Science',
  'HTML','CSS','Tailwind','Redux','Next.js','FastAPI','Django','Spring Boot',
];

const jobDescKeywords = [
  'leadership','communication','problem-solving','teamwork','analytical',
  'project management','collaboration','innovation','agile','cross-functional',
];

function extractSkillsFromText(text: string): string[] {
  const found: string[] = [];
  const lower = text.toLowerCase();
  [...techSkillsDB, ...jobDescKeywords].forEach((skill) => {
    if (lower.includes(skill.toLowerCase())) found.push(skill);
  });
  return [...new Set(found)];
}

function getMissingKeywords(found: string[]): string[] {
  const important = ['JavaScript','Python','React','SQL','Git','Agile','REST API','Docker'];
  return important.filter((k) => !found.map((s) => s.toLowerCase()).includes(k.toLowerCase())).slice(0, 5);
}

function calculateATSScore(text: string, skills: string[]): number {
  let score = 40;
  if (skills.length > 5) score += 15;
  if (skills.length > 10) score += 10;
  if (/\d+\+?\s*years?/i.test(text)) score += 10;
  if (/bachelor|master|phd|b\.tech|m\.tech/i.test(text)) score += 10;
  if (/github|linkedin|portfolio/i.test(text)) score += 5;
  if (text.length > 500) score += 5;
  if (/\d{4}/g.test(text)) score += 5;
  return Math.min(score, 98);
}

export function ResumeAnalysisPage() {
  const [text, setText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeResult | null>(null);
  const { addNotification } = useAppStore();

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setText((e.target?.result as string) || '');
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const analyze = async () => {
    if (!text.trim()) {
      addNotification({ type: 'error', title: 'No Content', message: 'Please upload or paste your resume first' });
      return;
    }
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2200));

    const skills = extractSkillsFromText(text);
    const missing = getMissingKeywords(skills);
    const ats = calculateATSScore(text, skills);
    const expMatch = text.match(/(\d+)\+?\s*years?/i);
    const expYears = expMatch ? parseInt(expMatch[1]) : 1;

    const jobMatchScore = jobDesc.trim()
      ? Math.min(
          40 + skills.filter((s) => jobDesc.toLowerCase().includes(s.toLowerCase())).length * 8,
          98
        )
      : 0;

    const sections = {
      formatting: Math.min(50 + (text.includes('\n') ? 20 : 0) + (text.length > 500 ? 20 : 0) + (skills.length > 3 ? 10 : 0), 100),
      keywords: Math.min(30 + skills.length * 5, 100),
      experience: Math.min(30 + expYears * 10, 100),
      skills: Math.min(20 + skills.length * 6, 100),
      education: /bachelor|master|phd|b\.tech|m\.tech|degree/i.test(text) ? 90 : 55,
      impact: /increased|improved|reduced|achieved|led|built|delivered|launched/i.test(text) ? 85 : 40,
    };

    const strongPoints: string[] = [];
    const improvements: string[] = [];

    if (skills.length > 8) strongPoints.push(`Strong technical skillset with ${skills.length} detected technologies`);
    if (expYears > 2) strongPoints.push(`${expYears}+ years of experience clearly stated`);
    if (/github|linkedin/i.test(text)) strongPoints.push('Professional profiles linked (GitHub/LinkedIn)');
    if (/achieved|delivered|launched|built/i.test(text)) strongPoints.push('Contains action verbs and impact statements');

    if (text.length < 400) improvements.push('Resume seems too short — aim for 400-600 words');
    if (missing.length > 2) improvements.push(`Add missing keywords: ${missing.slice(0, 3).join(', ')}`);
    if (!/\d{4}/g.test(text)) improvements.push('Add dates to your experience/education sections');
    if (!/summary|objective|profile/i.test(text)) improvements.push('Add a professional summary at the top');

    const suggestions = [
      { category: 'Keywords', text: 'Add industry-specific keywords matching the job description', priority: 'high' as const },
      { category: 'Quantify', text: 'Use numbers to quantify achievements (e.g., "Increased performance by 40%")', priority: 'high' as const },
      { category: 'Format', text: 'Use clean single-column format for ATS compatibility', priority: 'medium' as const },
      { category: 'Links', text: 'Include your GitHub, LinkedIn, and portfolio links', priority: 'medium' as const },
      { category: 'Action Verbs', text: 'Start bullet points with strong action verbs (Led, Built, Improved)', priority: 'low' as const },
      { category: 'Length', text: 'Keep resume to 1-2 pages maximum for best ATS performance', priority: 'low' as const },
    ];

    setResult({ atsScore: ats, overallScore: Math.round(Object.values(sections).reduce((a, b) => a + b, 0) / 6), sections, extractedSkills: skills, missingKeywords: missing, strongPoints, improvements, experienceYears: expYears, jobMatchScore, suggestions });
    setIsAnalyzing(false);
    addNotification({ type: 'success', title: 'Resume Analyzed', message: `ATS Score: ${ats}/100` });
  };

  const radarData = result
    ? Object.entries(result.sections).map(([key, val]) => ({
        subject: key.charAt(0).toUpperCase() + key.slice(1),
        value: val,
        fullMark: 100,
      }))
    : [];

  const skillBarData = result?.extractedSkills.slice(0, 8).map((skill, i) => ({
    name: skill,
    level: 60 + Math.floor(Math.random() * 40),
    color: ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'][i % 8],
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-50">Resume Intelligence</h1>
          <p className="text-dark-400 mt-1">ATS scoring, skill extraction, and improvement recommendations</p>
        </div>
        {result && (
          <div className="flex items-center gap-3">
            <div className={cn('px-4 py-2 rounded-xl text-lg font-bold border', result.atsScore >= 70 ? 'bg-success-500/20 text-success-400 border-success-500/30' : result.atsScore >= 50 ? 'bg-warning-500/20 text-warning-400 border-warning-500/30' : 'bg-danger-500/20 text-danger-400 border-danger-500/30')}>
              ATS: {result.atsScore}/100
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card variant="gradient">
            <h3 className="text-base font-semibold text-dark-100 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-primary-400" /> Upload Resume
            </h3>
            <div
              {...getRootProps()}
              className={cn('border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all', isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-dark-600 hover:border-dark-500 hover:bg-dark-800/50')}
            >
              <input {...getInputProps()} />
              <Upload size={28} className="mx-auto text-dark-400 mb-2" />
              <p className="text-sm text-dark-300">{isDragActive ? 'Drop here' : 'Drag & drop resume (PDF, TXT)'}</p>
              <p className="text-xs text-dark-500 mt-1">or click to browse</p>
            </div>
            {fileName && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700/50">
                <FileText size={16} className="text-primary-400" />
                <span className="text-sm text-dark-200 flex-1 truncate">{fileName}</span>
                <button onClick={() => { setFileName(''); setText(''); }}><X size={14} className="text-dark-400" /></button>
              </div>
            )}
          </Card>

          <Card variant="gradient">
            <h3 className="text-base font-semibold text-dark-100 mb-3 flex items-center gap-2">
              <Code2 size={18} className="text-accent-400" /> Paste Resume Text
            </h3>
            <Textarea
              placeholder="Paste your resume content here for analysis..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </Card>

          <Card variant="gradient">
            <h3 className="text-base font-semibold text-dark-100 mb-3 flex items-center gap-2">
              <Briefcase size={18} className="text-warning-400" /> Job Description (Optional)
            </h3>
            <Textarea
              placeholder="Paste the job description to calculate match percentage..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-dark-500 mt-2">Adding a JD enables job match scoring</p>
          </Card>

          <Button onClick={analyze} isLoading={isAnalyzing} className="w-full" leftIcon={<Sparkles size={18} />}>
            {isAnalyzing ? 'Analyzing Resume...' : 'Analyze Resume'}
          </Button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="text-center p-4">
                    <div className={cn('text-4xl font-bold', result.atsScore >= 70 ? 'text-success-400' : result.atsScore >= 50 ? 'text-warning-400' : 'text-danger-400')}>
                      {result.atsScore}
                    </div>
                    <p className="text-sm text-dark-400 mt-1">ATS Score</p>
                    <p className="text-xs text-dark-500 mt-1">{result.atsScore >= 70 ? 'Excellent' : result.atsScore >= 50 ? 'Good' : 'Needs Work'}</p>
                  </Card>
                  <Card className="text-center p-4">
                    <div className={cn('text-4xl font-bold', result.jobMatchScore >= 70 ? 'text-success-400' : result.jobMatchScore >= 40 ? 'text-warning-400' : 'text-dark-400')}>
                      {result.jobMatchScore > 0 ? `${result.jobMatchScore}%` : 'N/A'}
                    </div>
                    <p className="text-sm text-dark-400 mt-1">Job Match</p>
                    <p className="text-xs text-dark-500 mt-1">{result.jobMatchScore > 0 ? 'Based on JD' : 'Add JD above'}</p>
                  </Card>
                </div>

                <Card variant="gradient">
                  <h3 className="text-base font-semibold text-dark-100 mb-4 flex items-center gap-2">
                    <Target size={16} className="text-primary-400" /> Score Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>

                {result.extractedSkills.length > 0 && (
                  <Card variant="gradient">
                    <h3 className="text-base font-semibold text-dark-100 mb-3 flex items-center gap-2">
                      <Award size={16} className="text-accent-400" /> Detected Skills ({result.extractedSkills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.extractedSkills.map((skill) => (
                        <Badge key={skill} variant="info" size="sm">{skill}</Badge>
                      ))}
                    </div>
                    {result.missingKeywords.length > 0 && (
                      <>
                        <p className="text-xs font-medium text-dark-400 mb-2">Missing Keywords to Add:</p>
                        <div className="flex flex-wrap gap-2">
                          {result.missingKeywords.map((skill) => (
                            <Badge key={skill} variant="warning" size="sm">+ {skill}</Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </Card>
                )}

                <Card variant="gradient">
                  <h3 className="text-base font-semibold text-dark-100 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-success-400" /> Skill Strength
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={skillBarData} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" domain={[0, 100]} stroke="#475569" fontSize={10} />
                      <YAxis type="category" dataKey="name" stroke="#475569" fontSize={10} width={70} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: 12 }} />
                      <Bar dataKey="level" radius={[0, 4, 4, 0]}>
                        {skillBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {result.strongPoints.length > 0 && (
                  <Card className="border-success-500/20 bg-success-500/5">
                    <h3 className="text-sm font-semibold text-success-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 size={16} /> Strong Points
                    </h3>
                    <ul className="space-y-2">
                      {result.strongPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-dark-200">
                          <CheckCircle2 size={14} className="text-success-400 mt-0.5 flex-shrink-0" /> {pt}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {result.improvements.length > 0 && (
                  <Card className="border-warning-500/20 bg-warning-500/5">
                    <h3 className="text-sm font-semibold text-warning-400 mb-3 flex items-center gap-2">
                      <AlertTriangle size={16} /> Areas to Improve
                    </h3>
                    <ul className="space-y-2">
                      {result.improvements.map((imp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-dark-200">
                          <ChevronRight size={14} className="text-warning-400 mt-0.5 flex-shrink-0" /> {imp}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                <Card variant="gradient">
                  <h3 className="text-base font-semibold text-dark-100 mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-primary-400" /> AI Suggestions
                  </h3>
                  <div className="space-y-3">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className={cn('flex items-start gap-3 p-3 rounded-lg border', s.priority === 'high' ? 'bg-danger-500/5 border-danger-500/20' : s.priority === 'medium' ? 'bg-warning-500/5 border-warning-500/20' : 'bg-dark-700/30 border-dark-600')}>
                        <Badge variant={s.priority === 'high' ? 'danger' : s.priority === 'medium' ? 'warning' : 'outline'} size="sm" className="flex-shrink-0 mt-0.5">{s.priority}</Badge>
                        <div>
                          <p className="text-xs font-medium text-dark-300">{s.category}</p>
                          <p className="text-sm text-dark-200 mt-0.5">{s.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !isAnalyzing && (
            <Card className="flex flex-col items-center justify-center py-20 text-center">
              <Sparkles size={48} className="text-dark-600 mb-4" />
              <h3 className="text-lg font-medium text-dark-300">Upload your resume to get started</h3>
              <p className="text-sm text-dark-500 mt-2 max-w-xs">Get ATS score, skill analysis, job match percentage, and improvement suggestions</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
