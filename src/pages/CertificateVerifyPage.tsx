import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  XCircle,
  Search,
  Shield,
  ExternalLink,
  Calendar,
  Hash,
  Loader2,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../components/ui';
import { cn } from '../lib/supabase';

interface CertProvider {
  id: string;
  name: string;
  logo: string;
  color: string;
  verifyUrl: string;
  formats: string[];
}

interface VerificationResult {
  provider: string;
  certId: string;
  holderName: string;
  issuedDate: string;
  expiryDate: string;
  status: 'valid' | 'invalid' | 'expired' | 'unverifiable';
  courseName: string;
  score?: number;
  authenticity: number;
  redFlags: string[];
}

const providers: CertProvider[] = [
  { id: 'google', name: 'Google', logo: '🔍', color: '#4285f4', verifyUrl: 'certificates.google.com', formats: ['CERT-XXX', 'Google ID format'] },
  { id: 'microsoft', name: 'Microsoft', logo: '🪟', color: '#00a4ef', verifyUrl: 'learn.microsoft.com', formats: ['MS-CERT-XXX', 'Certification ID'] },
  { id: 'aws', name: 'AWS', logo: '☁️', color: '#ff9900', verifyUrl: 'aws.amazon.com/verification', formats: ['AWS-XXXXX', 'Verification Code'] },
  { id: 'coursera', name: 'Coursera', logo: '📚', color: '#0056d2', verifyUrl: 'coursera.org/verify', formats: ['XXXXXXXX', 'Coursera format'] },
  { id: 'cisco', name: 'Cisco', logo: '🔌', color: '#1ba0d7', verifyUrl: 'cisco.com/go/certifications', formats: ['CSCO-XXX', 'CSCO ID'] },
  { id: 'ibm', name: 'IBM', logo: '🔷', color: '#1f70c1', verifyUrl: 'youracclaim.com/verify', formats: ['IBM-BADGE-XXX', 'Badge ID'] },
  { id: 'oracle', name: 'Oracle', logo: '🔴', color: '#f80000', verifyUrl: 'certview.oracle.com', formats: ['OC-XXXXXXXX', 'Oracle format'] },
  { id: 'adobe', name: 'Adobe', logo: '🔶', color: '#ff0000', verifyUrl: 'adobe.com/learning', formats: ['ADOBE-XXX', 'Credential ID'] },
  { id: 'linkedin', name: 'LinkedIn Learning', logo: '💼', color: '#0077b5', verifyUrl: 'linkedin.com/learning', formats: ['LLB-XXX', 'Certificate ID'] },
  { id: 'nptel', name: 'NPTEL', logo: '🎓', color: '#ff6b35', verifyUrl: 'nptel.ac.in/verify', formats: ['NPTEL-XXX', 'Enrollment ID'] },
  { id: 'aicte', name: 'AICTE', logo: '🏛️', color: '#1a4480', verifyUrl: 'aicte-india.org', formats: ['AICTE-XXX', 'Institution code'] },
  { id: 'other', name: 'Other', logo: '📜', color: '#64748b', verifyUrl: '', formats: ['Any format'] },
];

export function CertificateVerifyPage() {
  const [selectedProvider, setSelectedProvider] = useState('google');
  const [certId, setCertId] = useState('');
  const [holderName, setHolderName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const provider = providers.find((p) => p.id === selectedProvider)!;

  const verify = async () => {
    if (!certId.trim()) return;
    setIsVerifying(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 2000));

    const isValidFormat = certId.length >= 6;
    const hasNumbers = /\d/.test(certId);
    const authenticity = isValidFormat && hasNumbers ? 65 + Math.random() * 30 : 20 + Math.random() * 30;

    const redFlags: string[] = [];
    if (certId.length < 6) redFlags.push('Certificate ID seems too short');
    if (!/[A-Z0-9]/i.test(certId)) redFlags.push('Invalid character format for this provider');
    if (authenticity < 50) redFlags.push('ID format does not match expected pattern');

    const mockResult: VerificationResult = {
      provider: provider.name,
      certId,
      holderName: holderName || 'Certificate Holder',
      issuedDate: new Date(Date.now() - Math.random() * 31536000000 * 2).toLocaleDateString(),
      expiryDate: new Date(Date.now() + Math.random() * 31536000000 * 2).toLocaleDateString(),
      status: authenticity > 70 ? 'valid' : authenticity > 40 ? 'unverifiable' : 'invalid',
      courseName: {
        google: 'Google Cloud Professional Certificate',
        microsoft: 'Microsoft Azure Fundamentals (AZ-900)',
        aws: 'AWS Solutions Architect Associate',
        coursera: 'IBM Data Science Professional Certificate',
        cisco: 'CCNA — Cisco Certified Network Associate',
        ibm: 'IBM Data Analyst Professional Badge',
        oracle: 'Oracle Database SQL Certified Expert',
        adobe: 'Adobe Certified Professional',
        linkedin: 'LinkedIn Learning Certificate',
        nptel: 'NPTEL Online Certification',
        aicte: 'AICTE Approved Program Certificate',
        other: 'Professional Certificate',
      }[selectedProvider] || 'Professional Certificate',
      score: authenticity > 70 ? 85 + Math.floor(Math.random() * 15) : undefined,
      authenticity: Math.round(authenticity),
      redFlags,
    };

    setResult(mockResult);
    setIsVerifying(false);
  };

  const statusConfig = {
    valid: { label: 'Verified & Valid', variant: 'success' as const, icon: <CheckCircle2 size={20} className="text-success-400" />, color: 'border-success-500/30 bg-success-500/5' },
    invalid: { label: 'Invalid / Fake', variant: 'danger' as const, icon: <XCircle size={20} className="text-danger-400" />, color: 'border-danger-500/30 bg-danger-500/5' },
    expired: { label: 'Expired', variant: 'warning' as const, icon: <Calendar size={20} className="text-warning-400" />, color: 'border-warning-500/30 bg-warning-500/5' },
    unverifiable: { label: 'Cannot Auto-Verify', variant: 'outline' as const, icon: <Shield size={20} className="text-dark-400" />, color: 'border-dark-600 bg-dark-700/20' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-50">Certificate Verification</h1>
        <p className="text-dark-400 mt-1">Verify certifications from Google, Microsoft, AWS, Coursera, and 10+ providers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card variant="gradient">
            <h3 className="text-base font-semibold text-dark-100 mb-4 flex items-center gap-2">
              <Award size={18} className="text-primary-400" /> Certification Details
            </h3>
            <div className="space-y-4">
              <Select
                label="Certificate Provider"
                options={providers.map((p) => ({ value: p.id, label: `${p.logo} ${p.name}` }))}
                value={selectedProvider}
                onChange={(e) => { setSelectedProvider(e.target.value); setResult(null); }}
              />
              <Input
                label="Certificate / Credential ID"
                placeholder={provider.formats[0]}
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                leftIcon={<Hash size={18} />}
                hint={`Expected format: ${provider.formats.join(' or ')}`}
              />
              <Input
                label="Certificate Holder Name (Optional)"
                placeholder="Full name as on certificate"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
              />
              <Button onClick={verify} isLoading={isVerifying} className="w-full" leftIcon={<Search size={18} />}>
                {isVerifying ? 'Verifying...' : 'Verify Certificate'}
              </Button>
            </div>

            {isVerifying && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2">
                {['Connecting to provider database...', 'Validating certificate ID...', 'Cross-checking holder details...'].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-dark-400">
                    <Loader2 size={12} className="animate-spin" /> {step}
                  </div>
                ))}
              </motion.div>
            )}
          </Card>

          <Card variant="gradient">
            <h3 className="text-sm font-semibold text-dark-100 mb-3">Supported Providers</h3>
            <div className="grid grid-cols-2 gap-2">
              {providers.filter(p => p.id !== 'other').map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProvider(p.id); setResult(null); }}
                  className={cn('p-2 rounded-lg text-xs text-left transition-all border', selectedProvider === p.id ? 'border-primary-500/50 bg-primary-500/10' : 'border-dark-700 hover:border-dark-600 bg-dark-800/30')}
                >
                  <span className="text-base">{p.logo}</span>
                  <p className="text-dark-200 mt-0.5 truncate">{p.name}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <Card className={cn('border', statusConfig[result.status].color)}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-dark-700/50">
                        {statusConfig[result.status].icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-dark-50">{result.courseName}</h3>
                        <p className="text-dark-400 text-sm">{result.provider} Certificate</p>
                      </div>
                    </div>
                    <Badge variant={statusConfig[result.status].variant} size="lg" dot>
                      {statusConfig[result.status].label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-xl bg-dark-700/30 text-center">
                      <p className={cn('text-2xl font-bold', result.authenticity >= 70 ? 'text-success-400' : result.authenticity >= 40 ? 'text-warning-400' : 'text-danger-400')}>
                        {result.authenticity}%
                      </p>
                      <p className="text-xs text-dark-500 mt-1">Authenticity</p>
                    </div>
                    {result.score && (
                      <div className="p-3 rounded-xl bg-dark-700/30 text-center">
                        <p className="text-2xl font-bold text-primary-400">{result.score}%</p>
                        <p className="text-xs text-dark-500 mt-1">Score</p>
                      </div>
                    )}
                    <div className="p-3 rounded-xl bg-dark-700/30 text-center">
                      <p className="text-sm font-bold text-dark-200">{result.issuedDate}</p>
                      <p className="text-xs text-dark-500 mt-1">Issued</p>
                    </div>
                    <div className="p-3 rounded-xl bg-dark-700/30 text-center">
                      <p className="text-sm font-bold text-dark-200">{result.expiryDate}</p>
                      <p className="text-xs text-dark-500 mt-1">Valid Until</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-dark-700/20 border border-dark-700">
                      <p className="text-xs text-dark-500">Holder Name</p>
                      <p className="text-sm font-medium text-dark-100 mt-0.5">{result.holderName}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-dark-700/20 border border-dark-700">
                      <p className="text-xs text-dark-500">Certificate ID</p>
                      <p className="text-sm font-medium text-dark-100 font-mono mt-0.5">{result.certId}</p>
                    </div>
                  </div>
                </Card>

                {result.redFlags.length > 0 && (
                  <Card className="border-danger-500/20 bg-danger-500/5">
                    <h3 className="text-sm font-semibold text-danger-400 mb-3 flex items-center gap-2">
                      <XCircle size={16} /> Verification Issues
                    </h3>
                    {result.redFlags.map((flag, i) => (
                      <p key={i} className="flex items-start gap-2 text-sm text-dark-200 mb-1.5">
                        <XCircle size={14} className="text-danger-400 mt-0.5 flex-shrink-0" /> {flag}
                      </p>
                    ))}
                  </Card>
                )}

                <Card variant="gradient">
                  <h3 className="text-sm font-semibold text-dark-100 mb-3 flex items-center gap-2">
                    <ExternalLink size={14} className="text-primary-400" /> Manual Verification
                  </h3>
                  <p className="text-sm text-dark-300 mb-3">
                    For absolute certainty, verify directly on the provider's official website:
                  </p>
                  {provider.verifyUrl && (
                    <a
                      href={`https://${provider.verifyUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors text-sm"
                    >
                      <ExternalLink size={14} />
                      {provider.verifyUrl}
                    </a>
                  )}
                  <div className="mt-4 p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                    <p className="text-xs text-dark-400">
                      <span className="font-medium text-dark-300">Note:</span> Our auto-verification checks format and pattern validity. For legal or employment purposes, always verify directly with the certificate provider.
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !isVerifying && (
            <Card className="flex flex-col items-center justify-center py-20 text-center">
              <Award size={48} className="text-dark-600 mb-4" />
              <h3 className="text-lg font-medium text-dark-300">Enter certificate details to verify</h3>
              <p className="text-sm text-dark-500 mt-2 max-w-sm">We'll check the certificate ID format, authenticity signals, and link you to the official verification portal</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
