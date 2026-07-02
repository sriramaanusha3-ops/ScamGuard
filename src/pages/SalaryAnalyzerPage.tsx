import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MapPin,
  Briefcase,
  Building2,
  Info,
  CheckCircle2,
  BarChart2,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Card, Button, Input, Select, Badge } from '../components/ui';
import { cn } from '../lib/supabase';

interface SalaryResult {
  offered: number;
  marketMin: number;
  marketMedian: number;
  marketMax: number;
  percentile: number;
  assessment: 'too_low' | 'below_market' | 'fair' | 'above_market' | 'too_high';
  verdict: string;
  verdictColor: string;
  cityMultiplier: number;
  cityAdjustedMedian: number;
  yearlyGrowth: { year: string; median: number }[];
  companySizeComparison: { size: string; salary: number; color: string }[];
  benefits: string[];
  negotiationTips: string[];
}

const salaryDB: Record<string, Record<string, { min: number; median: number; max: number }>> = {
  'Software Engineer': {
    'Fresher (0-1 yr)': { min: 300000, median: 500000, max: 900000 },
    'Junior (1-3 yrs)': { min: 600000, median: 1000000, max: 1800000 },
    'Mid-Level (3-5 yrs)': { min: 1200000, median: 2000000, max: 3500000 },
    'Senior (5-8 yrs)': { min: 2000000, median: 3500000, max: 6000000 },
    'Lead/Principal (8+ yrs)': { min: 3500000, median: 6000000, max: 12000000 },
  },
  'Data Scientist': {
    'Fresher (0-1 yr)': { min: 400000, median: 700000, max: 1200000 },
    'Junior (1-3 yrs)': { min: 800000, median: 1400000, max: 2500000 },
    'Mid-Level (3-5 yrs)': { min: 1500000, median: 2800000, max: 5000000 },
    'Senior (5-8 yrs)': { min: 2800000, median: 5000000, max: 9000000 },
    'Lead/Principal (8+ yrs)': { min: 5000000, median: 9000000, max: 18000000 },
  },
  'Product Manager': {
    'Fresher (0-1 yr)': { min: 500000, median: 800000, max: 1400000 },
    'Junior (1-3 yrs)': { min: 900000, median: 1600000, max: 3000000 },
    'Mid-Level (3-5 yrs)': { min: 1800000, median: 3200000, max: 6000000 },
    'Senior (5-8 yrs)': { min: 3500000, median: 6000000, max: 12000000 },
    'Lead/Principal (8+ yrs)': { min: 6000000, median: 12000000, max: 25000000 },
  },
  'UI/UX Designer': {
    'Fresher (0-1 yr)': { min: 250000, median: 450000, max: 800000 },
    'Junior (1-3 yrs)': { min: 500000, median: 900000, max: 1600000 },
    'Mid-Level (3-5 yrs)': { min: 1000000, median: 1800000, max: 3200000 },
    'Senior (5-8 yrs)': { min: 1800000, median: 3200000, max: 6000000 },
    'Lead/Principal (8+ yrs)': { min: 3000000, median: 6000000, max: 12000000 },
  },
  'DevOps Engineer': {
    'Fresher (0-1 yr)': { min: 350000, median: 600000, max: 1000000 },
    'Junior (1-3 yrs)': { min: 700000, median: 1200000, max: 2200000 },
    'Mid-Level (3-5 yrs)': { min: 1400000, median: 2500000, max: 4500000 },
    'Senior (5-8 yrs)': { min: 2500000, median: 4500000, max: 8000000 },
    'Lead/Principal (8+ yrs)': { min: 4500000, median: 8000000, max: 15000000 },
  },
  'QA Engineer': {
    'Fresher (0-1 yr)': { min: 250000, median: 420000, max: 700000 },
    'Junior (1-3 yrs)': { min: 450000, median: 800000, max: 1400000 },
    'Mid-Level (3-5 yrs)': { min: 900000, median: 1600000, max: 2800000 },
    'Senior (5-8 yrs)': { min: 1600000, median: 2800000, max: 5000000 },
    'Lead/Principal (8+ yrs)': { min: 2800000, median: 5000000, max: 9000000 },
  },
};

const cityMultipliers: Record<string, number> = {
  Bangalore: 1.0, Mumbai: 0.95, Delhi: 0.9, Hyderabad: 0.92,
  Pune: 0.85, Chennai: 0.88, Noida: 0.85, Gurgaon: 0.92, Remote: 0.95, Other: 0.75,
};

const roles = Object.keys(salaryDB);
const experienceLevels = ['Fresher (0-1 yr)', 'Junior (1-3 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5-8 yrs)', 'Lead/Principal (8+ yrs)'];
const cities = Object.keys(cityMultipliers);

function formatLPA(amount: number): string {
  const lpa = amount / 100000;
  return lpa >= 100 ? `${(lpa / 100).toFixed(1)} Cr` : `${lpa.toFixed(1)} LPA`;
}

function getAssessment(offered: number, median: number): SalaryResult['assessment'] {
  const ratio = offered / median;
  if (ratio < 0.5) return 'too_low';
  if (ratio < 0.8) return 'below_market';
  if (ratio < 1.2) return 'fair';
  if (ratio < 1.6) return 'above_market';
  return 'too_high';
}

export function SalaryAnalyzerPage() {
  const [role, setRole] = useState('Software Engineer');
  const [experience, setExperience] = useState('Junior (1-3 yrs)');
  const [city, setCity] = useState('Bangalore');
  const [offeredStr, setOfferedStr] = useState('');
  const [result, setResult] = useState<SalaryResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = async () => {
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1000));

    const base = salaryDB[role]?.[experience] || salaryDB['Software Engineer']['Junior (1-3 yrs)'];
    const multiplier = cityMultipliers[city] || 0.8;
    const cityMin = Math.round(base.min * multiplier);
    const cityMedian = Math.round(base.median * multiplier);
    const cityMax = Math.round(base.max * multiplier);

    const offered = parseInt(offeredStr.replace(/[^0-9]/g, '')) || 0;
    const offeredAmt = offered < 10000 ? offered * 100000 : offered;

    const assessment = offeredAmt > 0 ? getAssessment(offeredAmt, cityMedian) : 'fair';
    const percentile = offeredAmt > 0 ? Math.min(Math.round(((offeredAmt - cityMin) / (cityMax - cityMin)) * 100), 99) : 50;

    const verdictMap = {
      too_low: { text: 'Critically Below Market — Likely a Scam or Exploitation', color: 'text-danger-400' },
      below_market: { text: 'Below Market Rate — Negotiate or Explore Other Options', color: 'text-warning-400' },
      fair: { text: 'Fair Market Rate — Reasonable Offer', color: 'text-success-400' },
      above_market: { text: 'Above Market — Excellent Offer', color: 'text-success-400' },
      too_high: { text: 'Suspiciously High — Verify Authenticity', color: 'text-warning-400' },
    };

    const yearBase = cityMedian / 1.2;
    const yearlyGrowth = ['2020', '2021', '2022', '2023', '2024', '2025'].map((yr, i) => ({
      year: yr,
      median: Math.round(yearBase * Math.pow(1.15, i)),
    }));

    const companySizeComparison = [
      { size: 'Startup', salary: Math.round(cityMedian * 0.75), color: '#f59e0b' },
      { size: 'SME', salary: Math.round(cityMedian * 0.9), color: '#6366f1' },
      { size: 'MNC', salary: Math.round(cityMedian * 1.1), color: '#10b981' },
      { size: 'FAANG', salary: Math.round(cityMedian * 1.6), color: '#ef4444' },
    ];

    const benefits = [
      'Health Insurance (self + family)',
      'Annual Performance Bonus (10-20%)',
      'Stock Options / ESOPs',
      'Paid Time Off (15-25 days)',
      'Learning & Development Budget',
      'Remote / Hybrid Work Policy',
    ];

    const negotiationTips =
      assessment === 'below_market' || assessment === 'too_low'
        ? [
            `Market median for ${role} in ${city} is ${formatLPA(cityMedian)} — use this as leverage`,
            'Request a salary review after 6 months probation',
            'Negotiate for signing bonus, stock options, or additional benefits',
            'Get competing offers to strengthen your position',
            'Consider the total compensation package, not just base salary',
          ]
        : [
            'This is a competitive offer — ensure benefits package is solid',
            'Confirm the CTC vs in-hand salary breakdown',
            'Clarify vesting schedule if stock options are included',
            'Ask about performance bonus structure and KPIs',
          ];

    setResult({ offered: offeredAmt, marketMin: cityMin, marketMedian: cityMedian, marketMax: cityMax, percentile, assessment, verdict: verdictMap[assessment].text, verdictColor: verdictMap[assessment].color, cityMultiplier: multiplier, cityAdjustedMedian: cityMedian, yearlyGrowth, companySizeComparison, benefits, negotiationTips });
    setIsAnalyzing(false);
  };

  const barData = result
    ? [
        { name: 'Market Min', value: result.marketMin, color: '#94a3b8' },
        { name: 'Market Median', value: result.marketMedian, color: '#6366f1' },
        { name: 'Market Max', value: result.marketMax, color: '#10b981' },
        ...(result.offered > 0 ? [{ name: 'Your Offer', value: result.offered, color: result.assessment === 'too_low' ? '#ef4444' : result.assessment === 'below_market' ? '#f59e0b' : result.assessment === 'fair' ? '#10b981' : '#f59e0b' }] : []),
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-50">Salary Analyzer</h1>
        <p className="text-dark-400 mt-1">Compare your offer with real market data and identify red flags</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="gradient" className="lg:col-span-1">
          <h3 className="text-base font-semibold text-dark-100 mb-4 flex items-center gap-2">
            <Search size={18} className="text-primary-400" /> Analysis Parameters
          </h3>
          <div className="space-y-4">
            <Select
              label="Role / Position"
              options={roles.map((r) => ({ value: r, label: r }))}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <Select
              label="Experience Level"
              options={experienceLevels.map((e) => ({ value: e, label: e }))}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
            <Select
              label="City / Location"
              options={cities.map((c) => ({ value: c, label: c }))}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              label="Offered Salary (optional)"
              placeholder="e.g., 12,00,000 or 12 LPA"
              value={offeredStr}
              onChange={(e) => setOfferedStr(e.target.value)}
              leftIcon={<DollarSign size={18} />}
              hint="Enter CTC — in rupees or LPA format"
            />
            <Button onClick={analyze} isLoading={isAnalyzing} className="w-full" leftIcon={<BarChart2 size={18} />}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Salary'}
            </Button>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-3">
              <div className="p-4 rounded-xl bg-dark-700/30 text-center">
                <p className="text-3xl font-bold text-primary-400">{formatLPA(result.marketMedian)}</p>
                <p className="text-sm text-dark-400 mt-1">Market Median ({city})</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-dark-700/30 text-center">
                  <p className="text-lg font-bold text-dark-300">{formatLPA(result.marketMin)}</p>
                  <p className="text-xs text-dark-500">Market Min</p>
                </div>
                <div className="p-3 rounded-xl bg-dark-700/30 text-center">
                  <p className="text-lg font-bold text-dark-300">{formatLPA(result.marketMax)}</p>
                  <p className="text-xs text-dark-500">Market Max</p>
                </div>
              </div>
              {result.offered > 0 && (
                <div className={cn('p-4 rounded-xl border', result.assessment === 'fair' || result.assessment === 'above_market' ? 'bg-success-500/10 border-success-500/30' : result.assessment === 'too_high' ? 'bg-warning-500/10 border-warning-500/30' : 'bg-danger-500/10 border-danger-500/30')}>
                  <p className="text-xs text-dark-400 mb-1">Your Offer Percentile</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(result.percentile, 2)}%` }} className={cn('h-full rounded-full', result.percentile < 30 ? 'bg-danger-500' : result.percentile < 60 ? 'bg-warning-500' : 'bg-success-500')} />
                    </div>
                    <span className="text-sm font-bold text-dark-200">{result.percentile}th</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {result.offered > 0 && (
                  <Card className={cn('border', result.assessment === 'fair' || result.assessment === 'above_market' ? 'border-success-500/30 bg-success-500/5' : result.assessment === 'too_high' ? 'border-warning-500/30 bg-warning-500/5' : 'border-danger-500/30 bg-danger-500/5')}>
                    <div className="flex items-start gap-4">
                      {result.assessment === 'too_low' || result.assessment === 'below_market'
                        ? <TrendingDown size={24} className="text-danger-400 flex-shrink-0" />
                        : result.assessment === 'too_high'
                        ? <AlertTriangle size={24} className="text-warning-400 flex-shrink-0" />
                        : <TrendingUp size={24} className="text-success-400 flex-shrink-0" />}
                      <div>
                        <p className={cn('font-semibold text-lg', result.verdictColor)}>{result.verdict}</p>
                        <p className="text-sm text-dark-300 mt-1">
                          Your offer of <strong>{formatLPA(result.offered)}</strong> vs market median of <strong>{formatLPA(result.marketMedian)}</strong>
                          {' '}({result.offered > result.marketMedian ? '+' : ''}{Math.round((result.offered / result.marketMedian - 1) * 100)}% {result.offered > result.marketMedian ? 'above' : 'below'} median)
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                <Card variant="gradient">
                  <h3 className="text-base font-semibold text-dark-100 mb-4 flex items-center gap-2">
                    <BarChart2 size={16} className="text-primary-400" /> Salary Comparison
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData}>
                      <XAxis dataKey="name" stroke="#475569" fontSize={11} />
                      <YAxis tickFormatter={(v) => formatLPA(v)} stroke="#475569" fontSize={10} />
                      <Tooltip formatter={(v: number) => formatLPA(v)} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card variant="gradient">
                    <h3 className="text-sm font-semibold text-dark-100 mb-3 flex items-center gap-2">
                      <TrendingUp size={14} className="text-accent-400" /> Salary Growth Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={result.yearlyGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="year" stroke="#475569" fontSize={10} />
                        <YAxis tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} stroke="#475569" fontSize={10} />
                        <Tooltip formatter={(v: number) => formatLPA(v)} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: 11 }} />
                        <Line type="monotone" dataKey="median" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card variant="gradient">
                    <h3 className="text-sm font-semibold text-dark-100 mb-3 flex items-center gap-2">
                      <Building2 size={14} className="text-warning-400" /> By Company Size
                    </h3>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={result.companySizeComparison}>
                        <XAxis dataKey="size" stroke="#475569" fontSize={10} />
                        <YAxis tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} stroke="#475569" fontSize={10} />
                        <Tooltip formatter={(v: number) => formatLPA(v)} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: 11 }} />
                        <Bar dataKey="salary" radius={[4, 4, 0, 0]}>
                          {result.companySizeComparison.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                <Card variant="gradient">
                  <h3 className="text-sm font-semibold text-dark-100 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-success-400" /> Negotiation Strategy
                  </h3>
                  <div className="space-y-2">
                    {result.negotiationTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-dark-200">
                        <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        {tip}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card variant="gradient">
                  <h3 className="text-sm font-semibold text-dark-100 mb-3 flex items-center gap-2">
                    <Info size={14} className="text-primary-400" /> Standard Benefits to Expect
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {result.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-dark-300">
                        <CheckCircle2 size={14} className="text-success-400 flex-shrink-0" /> {b}
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && (
            <Card className="flex flex-col items-center justify-center py-20 text-center">
              <DollarSign size={48} className="text-dark-600 mb-4" />
              <h3 className="text-lg font-medium text-dark-300">Select role, experience, and city</h3>
              <p className="text-sm text-dark-500 mt-2">Get instant salary benchmarks and negotiation tips</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
