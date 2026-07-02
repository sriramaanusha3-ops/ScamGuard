import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Globe,
  Shield,
  Lock,
  Mail,
  Phone,
  Linkedin,
  Github,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Server,
  FileText,
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/ui';
import { useAppStore } from '../store';
import { cn } from '../lib/supabase';

interface CompanyVerification {
  companyName: string;
  website: string;
  httpsEnabled: boolean;
  sslValid: boolean;
  websiteReachable: boolean;
  domainAge: number;
  careerPageExists: boolean;
  contactPageExists: boolean;
  linkedinExists: boolean;
  githubExists: boolean;
  privacyPolicyExists: boolean;
  termsExists: boolean;
  reputationScore: number;
  verificationScore: number;
}

export function CompanyVerifyPage() {
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verification, setVerification] = useState<CompanyVerification | null>(null);
  const { addNotification } = useAppStore();

  const handleVerify = async () => {
    if (!website.trim()) {
      addNotification({
        type: 'error',
        title: 'Input Required',
        message: 'Please enter a company website to verify',
      });
      return;
    }

    setIsVerifying(true);
    setVerification(null);

    await new Promise((r) => setTimeout(r, 2500));

    const mockVerification: CompanyVerification = {
      companyName: companyName || 'Example Corp',
      website: website,
      httpsEnabled: website.startsWith('https'),
      sslValid: Math.random() > 0.3,
      websiteReachable: Math.random() > 0.2,
      domainAge: Math.floor(Math.random() * 3650),
      careerPageExists: Math.random() > 0.5,
      contactPageExists: Math.random() > 0.3,
      linkedinExists: Math.random() > 0.4,
      githubExists: Math.random() > 0.6,
      privacyPolicyExists: Math.random() > 0.3,
      termsExists: Math.random() > 0.4,
      reputationScore: 0,
      verificationScore: 0,
    };

    const checks = [
      mockVerification.httpsEnabled,
      mockVerification.sslValid,
      mockVerification.websiteReachable,
      mockVerification.careerPageExists,
      mockVerification.contactPageExists,
      mockVerification.linkedinExists,
      mockVerification.privacyPolicyExists,
      mockVerification.termsExists,
    ];

    const passedChecks = checks.filter(Boolean).length;
    mockVerification.verificationScore = Math.round((passedChecks / checks.length) * 100);
    mockVerification.reputationScore = Math.round(
      mockVerification.verificationScore * 0.6 +
      (mockVerification.domainAge > 365 ? 20 : 10) +
      (mockVerification.githubExists ? 10 : 0)
    );

    setVerification(mockVerification);
    setIsVerifying(false);
  };

  const verificationItems = verification
    ? [
        {
          label: 'HTTPS Enabled',
          value: verification.httpsEnabled,
          icon: <Lock size={18} />,
        },
        {
          label: 'SSL Certificate Valid',
          value: verification.sslValid,
          icon: <Shield size={18} />,
        },
        {
          label: 'Website Reachable',
          value: verification.websiteReachable,
          icon: <Globe size={18} />,
        },
        {
          label: 'Career Page',
          value: verification.careerPageExists,
          icon: <Building2 size={18} />,
        },
        {
          label: 'Contact Page',
          value: verification.contactPageExists,
          icon: <Phone size={18} />,
        },
        {
          label: 'LinkedIn Presence',
          value: verification.linkedinExists,
          icon: <Linkedin size={18} />,
        },
        {
          label: 'GitHub Organization',
          value: verification.githubExists,
          icon: <Github size={18} />,
        },
        {
          label: 'Privacy Policy',
          value: verification.privacyPolicyExists,
          icon: <FileText size={18} />,
        },
        {
          label: 'Terms of Service',
          value: verification.termsExists,
          icon: <FileText size={18} />,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-50">Company Verification</h1>
        <p className="text-dark-400 mt-1">
          Verify company legitimacy, domain age, and online presence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card variant="gradient">
            <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-primary-400" />
              Company Details
            </h3>

            <div className="space-y-4">
              <Input
                label="Company Name"
                placeholder="e.g., Google Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                leftIcon={<Building2 size={18} />}
              />

              <Input
                label="Company Website"
                placeholder="e.g., https://google.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                leftIcon={<Globe size={18} />}
              />

              <Button
                onClick={handleVerify}
                isLoading={isVerifying}
                className="w-full"
                leftIcon={<Shield size={18} />}
              >
                {isVerifying ? 'Verifying...' : 'Start Verification'}
              </Button>
            </div>

            {isVerifying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 space-y-3"
              >
                {['Checking HTTPS...', 'Validating SSL...', 'Scanning pages...', 'Checking social presence...'].map(
                  (step, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center gap-3 text-sm transition-opacity duration-500',
                        idx === Math.floor((Date.now() / 600) % 4)
                          ? 'text-dark-200 opacity-100'
                          : 'text-dark-500 opacity-50'
                      )}
                    >
                      <Loader2 size={16} className="animate-spin" />
                      {step}
                    </div>
                  )
                )}
              </motion.div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          {verification ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card variant="gradient">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-dark-50">
                      {verification.companyName}
                    </h3>
                    <a
                      href={verification.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 flex items-center gap-1 mt-1"
                    >
                      {verification.website}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        'text-3xl font-bold',
                        verification.verificationScore >= 70
                          ? 'text-success-400'
                          : verification.verificationScore >= 40
                          ? 'text-warning-400'
                          : 'text-danger-400'
                      )}
                    >
                      {verification.verificationScore}%
                    </div>
                    <p className="text-sm text-dark-500">Verification Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {verificationItems.map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border',
                        item.value
                          ? 'bg-success-500/10 border-success-500/30'
                          : 'bg-danger-500/10 border-danger-500/30'
                      )}
                    >
                      <span
                        className={
                          item.value ? 'text-success-400' : 'text-danger-400'
                        }
                      >
                        {item.value ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                      </span>
                      <div>
                        <p className="text-sm text-dark-200">{item.label}</p>
                        <p className="text-xs text-dark-500">
                          {item.value ? 'Verified' : 'Not Found'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card variant="gradient">
                <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
                  <Server size={20} className="text-accent-400" />
                  Domain Information
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-dark-700/30 text-center">
                    <Calendar size={24} className="mx-auto text-primary-400 mb-2" />
                    <p className="text-2xl font-bold text-dark-50">
                      {Math.floor(verification.domainAge / 365)}
                    </p>
                    <p className="text-sm text-dark-500">Years Active</p>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-700/30 text-center">
                    <Mail size={24} className="mx-auto text-accent-400 mb-2" />
                    <p className="text-2xl font-bold text-dark-50">
                      {verification.contactPageExists ? 'Yes' : 'No'}
                    </p>
                    <p className="text-sm text-dark-500">Contact Page</p>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-700/30 text-center">
                    <Building2 size={24} className="mx-auto text-warning-400 mb-2" />
                    <p className="text-2xl font-bold text-dark-50">
                      {verification.careerPageExists ? 'Yes' : 'No'}
                    </p>
                    <p className="text-sm text-dark-500">Careers Page</p>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-700/30 text-center">
                    <Shield size={24} className="mx-auto text-success-400 mb-2" />
                    <p className="text-2xl font-bold text-dark-50">
                      {verification.reputationScore}%
                    </p>
                    <p className="text-sm text-dark-500">Reputation</p>
                  </div>
                </div>
              </Card>

              <Card variant="gradient">
                <h3 className="text-lg font-semibold text-dark-50 mb-4">
                  Social Presence
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <a
                    href="#"
                    className={cn(
                      'p-4 rounded-xl border flex flex-col items-center gap-2 transition-all',
                      verification.linkedinExists
                        ? 'bg-[#0077b5]/20 border-[#0077b5]/30 hover:bg-[#0077b5]/30'
                        : 'bg-dark-700/30 border-dark-600 opacity-50'
                    )}
                  >
                    <Linkedin size={24} className="text-[#0077b5]" />
                    <span className="text-sm text-dark-200">LinkedIn</span>
                    <Badge
                      variant={verification.linkedinExists ? 'success' : 'outline'}
                      size="sm"
                    >
                      {verification.linkedinExists ? 'Found' : 'Not Found'}
                    </Badge>
                  </a>

                  <a
                    href="#"
                    className={cn(
                      'p-4 rounded-xl border flex flex-col items-center gap-2 transition-all',
                      verification.githubExists
                        ? 'bg-dark-700/50 border-dark-600 hover:bg-dark-600/50'
                        : 'bg-dark-700/30 border-dark-600 opacity-50'
                    )}
                  >
                    <Github size={24} />
                    <span className="text-sm text-dark-200">GitHub</span>
                    <Badge
                      variant={verification.githubExists ? 'success' : 'outline'}
                      size="sm"
                    >
                      {verification.githubExists ? 'Found' : 'Not Found'}
                    </Badge>
                  </a>
                </div>
              </Card>
            </motion.div>
          ) : (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 size={48} className="text-dark-600 mb-4" />
              <h3 className="text-lg font-medium text-dark-300">
                Enter a company website to verify
              </h3>
              <p className="text-sm text-dark-500 mt-2">
                We'll check SSL, domain age, social presence, and more
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
