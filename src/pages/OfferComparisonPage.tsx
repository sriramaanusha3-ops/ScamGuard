import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  Plus,
  Trash2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart2,
  Trophy,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, Button, Textarea, Badge } from '../components/ui';
import { cn } from '../lib/supabase';
import { SCAM_PATTERNS } from '../types';

interface Offer {
  id: string;
  label: string;
  text: string;
  riskScore: number;
  trust: number;
  issues: number;
  salary: number;
  verdict: 'safe' | 'suspicious' | 'dangerous';
  pros: string[];
  cons: string[];
}

function analyzeOffer(text: string, label: string, id: string): Offer {
  let riskScore = 10;
  const issues: string[] = [];

  Object.values(SCAM_PATTERNS).forEach((pattern) => {
    if (pattern.pattern.test(text)) {
      issues.push(pattern.description);
      riskScore += pattern.severity === 'critical' ? 25 : pattern.severity === 'high' ? 18 : pattern.severity === 'medium' ? 10 : 5;
    }
  });

  riskScore = Math.min(riskScore, 100);
  const trust = 100 - riskScore;

  const salaryMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(lpa|lakhs?|l\.?p\.?a|crore|cr)/i);
  const salary = salaryMatch ? parseFloat(salaryMatch[1].replace(',', '')) : 0;

  const verdict: Offer['verdict'] = riskScore >= 60 ? 'dangerous' : riskScore >= 30 ? 'suspicious' : 'safe';

  const pros: string[] = [];
  const cons: string[] = [];

  if (/health|insurance|medical/i.test(text)) pros.push('Health insurance mentioned');
  if (/work from home|remote|hybrid/i.test(text)) pros.push('Flexible work arrangement');
  if (/bonus|incentive|performance/i.test(text)) pros.push('Bonus / performance incentive');
  if (/esop|stock|equity/i.test(text)) pros.push('Stock options / equity');
  if (/interview|assessment|test/i.test(text)) pros.push('Proper hiring process mentioned');
  if (salary > 0) pros.push(`Salary: ${salary} LPA mentioned`);

  if (issues.length > 0) cons.push(...issues.slice(0, 3));
  if (!salary) cons.push('No salary mentioned');
  if (text.length < 200) cons.push('Very short offer — missing details');
  if (!/contact|email|hr@/i.test(text)) cons.push('No official contact information');

  return { id, label, text, riskScore, trust, issues: issues.length, salary, verdict, pros, cons };
}

export function OfferComparisonPage() {
  const [offers, setOffers] = useState<{ id: string; label: string; text: string }[]>([
    { id: '1', label: 'Offer A', text: '' },
    { id: '2', label: 'Offer B', text: '' },
  ]);
  const [results, setResults] = useState<Offer[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const addOffer = () => {
    if (offers.length >= 4) return;
    const id = crypto.randomUUID();
    setOffers((prev) => [...prev, { id, label: `Offer ${String.fromCharCode(65 + prev.length)}`, text: '' }]);
  };

  const removeOffer = (id: string) => {
    if (offers.length <= 2) return;
    setOffers((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOffer = (id: string, text: string) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const compare = async () => {
    const filled = offers.filter((o) => o.text.trim());
    if (filled.length < 2) return;
    setIsComparing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setResults(filled.map((o) => analyzeOffer(o.text, o.label, o.id)));
    setIsComparing(false);
  };

  const winner = results.length > 0
    ? results.reduce((best, curr) => (curr.trust > best.trust ? curr : best))
    : null;

  const chartData = results.map((r) => ({
    name: r.label,
    Risk: r.riskScore,
    Trust: r.trust,
    Salary: r.salary,
  }));

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-50">Offer Letter Comparison</h1>
          <p className="text-dark-400 mt-1">Compare up to 4 offer letters side by side for risk, salary, and legitimacy</p>
        </div>
        <div className="flex gap-3">
          {offers.length < 4 && (
            <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={addOffer}>
              Add Offer
            </Button>
          )}
          <Button onClick={compare} isLoading={isComparing} leftIcon={<Scale size={18} />}>
            {isComparing ? 'Comparing...' : 'Compare All'}
          </Button>
        </div>
      </div>

      <div className={cn('grid gap-4', offers.length === 2 ? 'grid-cols-1 md:grid-cols-2' : offers.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4')}>
        {offers.map((offer, idx) => (
          <Card key={offer.id} variant="gradient">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: colors[idx] }}>
                  {offer.label[6]}
                </span>
                <h3 className="font-semibold text-dark-100">{offer.label}</h3>
              </div>
              {offers.length > 2 && (
                <button onClick={() => removeOffer(offer.id)} className="text-dark-500 hover:text-danger-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <Textarea
              placeholder={`Paste ${offer.label} text here...`}
              value={offer.text}
              onChange={(e) => updateOffer(offer.id, e.target.value)}
              rows={10}
              className="text-sm"
            />
            {results.find((r) => r.id === offer.id) && (() => {
              const r = results.find((r) => r.id === offer.id)!;
              return (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={r.verdict === 'safe' ? 'success' : r.verdict === 'suspicious' ? 'warning' : 'danger'} dot>{r.verdict}</Badge>
                    <span className={cn('text-sm font-bold', r.riskScore < 30 ? 'text-success-400' : r.riskScore < 60 ? 'text-warning-400' : 'text-danger-400')}>
                      Risk: {r.riskScore}%
                    </span>
                  </div>
                  {winner?.id === r.id && (
                    <div className="flex items-center gap-1 text-xs text-warning-400">
                      <Trophy size={12} /> Best offer
                    </div>
                  )}
                </div>
              );
            })()}
          </Card>
        ))}
      </div>

      {results.length >= 2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {winner && (
            <Card className="border-warning-500/30 bg-warning-500/5">
              <div className="flex items-center gap-4">
                <Trophy size={32} className="text-warning-400" />
                <div>
                  <h3 className="text-xl font-semibold text-dark-50">
                    <span className="text-warning-400">{winner.label}</span> is the Best Offer
                  </h3>
                  <p className="text-dark-400 text-sm">
                    Highest trust score of {winner.trust}% with {winner.issues} red flag{winner.issues !== 1 ? 's' : ''} detected
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card variant="gradient">
            <h3 className="text-base font-semibold text-dark-100 mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-primary-400" /> Risk & Trust Comparison
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="Trust" radius={[4, 4, 0, 0]} fill="#10b981" />
                <Bar dataKey="Risk" radius={[4, 4, 0, 0]} fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className={cn('grid gap-4', results.length === 2 ? 'grid-cols-2' : results.length === 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4')}>
            {results.map((r, idx) => (
              <Card key={r.id} className={cn('border', winner?.id === r.id ? 'border-warning-500/40 bg-warning-500/5' : 'border-dark-700')}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: colors[idx] }}>
                    {r.label[6]}
                  </span>
                  <h4 className="font-semibold text-dark-100">{r.label}</h4>
                  {winner?.id === r.id && <Trophy size={14} className="text-warning-400 ml-auto" />}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Risk Score</span>
                    <span className={cn('font-bold', r.riskScore < 30 ? 'text-success-400' : r.riskScore < 60 ? 'text-warning-400' : 'text-danger-400')}>{r.riskScore}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Trust Score</span>
                    <span className={cn('font-bold', r.trust > 70 ? 'text-success-400' : r.trust > 40 ? 'text-warning-400' : 'text-danger-400')}>{r.trust}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Issues Found</span>
                    <span className={cn('font-bold', r.issues === 0 ? 'text-success-400' : 'text-danger-400')}>{r.issues}</span>
                  </div>
                  {r.salary > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Salary</span>
                      <span className="font-bold text-dark-200">{r.salary} LPA</span>
                    </div>
                  )}
                </div>

                {r.pros.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-success-400 font-medium mb-1">Pros</p>
                    {r.pros.slice(0, 3).map((pro, i) => (
                      <p key={i} className="flex items-start gap-1 text-xs text-dark-300 mb-1">
                        <CheckCircle2 size={10} className="text-success-400 mt-0.5 flex-shrink-0" /> {pro}
                      </p>
                    ))}
                  </div>
                )}

                {r.cons.length > 0 && (
                  <div>
                    <p className="text-xs text-danger-400 font-medium mb-1">Cons</p>
                    {r.cons.slice(0, 3).map((con, i) => (
                      <p key={i} className="flex items-start gap-1 text-xs text-dark-300 mb-1">
                        <XCircle size={10} className="text-danger-400 mt-0.5 flex-shrink-0" /> {con}
                      </p>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
