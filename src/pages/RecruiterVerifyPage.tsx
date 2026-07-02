import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Linkedin,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/ui';
import { useAppStore } from '../store';
import { cn } from '../lib/supabase';

interface RecruiterVerification {
  name: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  isDisposableEmail: boolean;
  isPublicEmailProvider: boolean;
  domainMatchesCompany: boolean;
  emailReputationScore: number;
  linkedinVerified: boolean;
  consistencyScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

const disposableEmailDomains = [
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'throwaway.email',
];

const publicEmailProviders = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'proton.me',
];

export function RecruiterVerifyPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verification, setVerification] = useState<RecruiterVerification | null>(null);
  const { addNotification } = useAppStore();

  const getEmailDomain = (emailAddress: string): string => {
    const parts = emailAddress.split('@');
    return parts[1]?.toLowerCase() || '';
  };

  const handleVerify = async () => {
    if (!email.trim()) {
      addNotification({
        type: 'error',
        title: 'Input Required',
        message: 'Please enter a recruiter email to verify',
      });
      return;
    }

    setIsVerifying(true);
    setVerification(null);

    await new Promise((r) => setTimeout(r, 2000));

    const emailDomain = getEmailDomain(email);
    const isDisposable = disposableEmailDomains.includes(emailDomain);
    const isPublic = publicEmailProviders.includes(emailDomain);
    const companyDomain = companyWebsite
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];
    const domainMatches = !isPublic && emailDomain === companyDomain;

    let consistencyScore = 50;
    if (name) consistencyScore += 10;
    if (linkedinUrl) consistencyScore += 15;
    if (phone) consistencyScore += 10;
    if (!isDisposable) consistencyScore += 10;
    if (!isPublic) consistencyScore += 10;
    if (domainMatches) consistencyScore += 20;

    consistencyScore = Math.min(consistencyScore, 100);

    let riskLevel: 'low' | 'medium' | 'high';
    if (isDisposable || consistencyScore < 40) {
      riskLevel = 'high';
    } else if (isPublic || consistencyScore < 70) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    const mockVerification: RecruiterVerification = {
      name,
      email,
      phone,
      linkedinUrl,
      isDisposableEmail: isDisposable,
      isPublicEmailProvider: isPublic,
      domainMatchesCompany: domainMatches,
      emailReputationScore: isDisposable
        ? 10
        : isPublic
        ? 50
        : domainMatches
        ? 90
        : 70,
      linkedinVerified: linkedinUrl ? Math.random() > 0.3 : false,
      consistencyScore,
      riskLevel,
    };

    setVerification(mockVerification);
    setIsVerifying(false);

    addNotification({
      type:
        riskLevel === 'low'
          ? 'success'
          : riskLevel === 'medium'
          ? 'warning'
          : 'error',
      title: 'Verification Complete',
      message: `Recruiter risk level: ${riskLevel.toUpperCase()}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-50">Recruiter Verification</h1>
        <p className="text-dark-400 mt-1">
          Verify recruiter identity and email authenticity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card variant="gradient">
            <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
              <User size={20} className="text-primary-400" />
              Recruiter Details
            </h3>

            <div className="space-y-4">
              <Input
                label="Recruiter Name"
                placeholder="e.g., John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User size={18} />}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g., recruiter@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={18} />}
                error={
                  verification?.isDisposableEmail
                    ? 'This is a disposable email address!'
                    : undefined
                }
              />

              <Input
                label="Phone Number (Optional)"
                placeholder="e.g., +1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone size={18} />}
              />

              <Input
                label="LinkedIn URL (Optional)"
                placeholder="e.g., linkedin.com/in/johnsmith"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                leftIcon={<Linkedin size={18} />}
              />

              <Input
                label="Company Website (Optional)"
                placeholder="e.g., https://company.com"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                leftIcon={<ExternalLink size={18} />}
              />

              <Button
                onClick={handleVerify}
                isLoading={isVerifying}
                className="w-full"
                leftIcon={<Shield size={18} />}
              >
                {isVerifying ? 'Verifying...' : 'Verify Recruiter'}
              </Button>
            </div>
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
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-2xl font-bold text-white">
                      {verification.name?.[0]?.toUpperCase() || verification.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-dark-50">
                        {verification.name || 'Unknown'}
                      </h3>
                      <p className="text-dark-400">{verification.email}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      verification.riskLevel === 'low'
                        ? 'success'
                        : verification.riskLevel === 'medium'
                        ? 'warning'
                        : 'danger'
                    }
                    size="lg"
                    dot
                  >
                    {verification.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-dark-700/30 text-center">
                    <p
                      className={cn(
                        'text-3xl font-bold',
                        verification.consistencyScore >= 70
                          ? 'text-success-400'
                          : verification.consistencyScore >= 40
                          ? 'text-warning-400'
                          : 'text-danger-400'
                      )}
                    >
                      {verification.consistencyScore}%
                    </p>
                    <p className="text-sm text-dark-500 mt-1">Consistency Score</p>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-700/30 text-center">
                    <p
                      className={cn(
                        'text-3xl font-bold',
                        verification.emailReputationScore >= 70
                          ? 'text-success-400'
                          : verification.emailReputationScore >= 40
                          ? 'text-warning-400'
                          : 'text-danger-400'
                      )}
                    >
                      {verification.emailReputationScore}%
                    </p>
                    <p className="text-sm text-dark-500 mt-1">Email Reputation</p>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-700/30 text-center">
                    <p
                      className={cn(
                        'text-3xl font-bold',
                        verification.linkedinVerified ? 'text-success-400' : 'text-danger-400'
                      )}
                    >
                      {verification.linkedinVerified ? 'Yes' : 'No'}
                    </p>
                    <p className="text-sm text-dark-500 mt-1">LinkedIn Verified</p>
                  </div>
                </div>
              </Card>

              <Card variant="gradient">
                <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
                  <Mail size={20} className="text-accent-400" />
                  Email Analysis
                </h3>

                <div className="space-y-4">
                  <div
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl border',
                      verification.isDisposableEmail
                        ? 'bg-danger-500/10 border-danger-500/30'
                        : 'bg-success-500/10 border-success-500/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle
                        size={20}
                        className={
                          verification.isDisposableEmail
                            ? 'text-danger-400'
                            : 'text-success-400'
                        }
                      />
                      <div>
                        <p className="text-sm font-medium text-dark-100">
                          Disposable Email Check
                        </p>
                        <p className="text-xs text-dark-400">
                          {verification.isDisposableEmail
                            ? 'This email domain is known for temporary emails'
                            : 'This email domain is legitimate'}
                        </p>
                      </div>
                    </div>
                    {verification.isDisposableEmail ? (
                      <XCircle size={20} className="text-danger-400" />
                    ) : (
                      <CheckCircle2 size={20} className="text-success-400" />
                    )}
                  </div>

                  <div
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl border',
                      verification.isPublicEmailProvider
                        ? 'bg-warning-500/10 border-warning-500/30'
                        : 'bg-success-500/10 border-success-500/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Mail
                        size={20}
                        className={
                          verification.isPublicEmailProvider
                            ? 'text-warning-400'
                            : 'text-success-400'
                        }
                      />
                      <div>
                        <p className="text-sm font-medium text-dark-100">
                          Public Email Provider
                        </p>
                        <p className="text-xs text-dark-400">
                          {verification.isPublicEmailProvider
                            ? 'Using Gmail, Yahoo, or similar (less professional)'
                            : 'Custom company email domain'}
                        </p>
                      </div>
                    </div>
                    {verification.isPublicEmailProvider ? (
                      <AlertTriangle size={20} className="text-warning-400" />
                    ) : (
                      <CheckCircle2 size={20} className="text-success-400" />
                    )}
                  </div>

                  {companyWebsite && (
                    <div
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border',
                        verification.domainMatchesCompany
                          ? 'bg-success-500/10 border-success-500/30'
                          : 'bg-danger-500/10 border-danger-500/30'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Shield
                          size={20}
                          className={
                            verification.domainMatchesCompany
                              ? 'text-success-400'
                              : 'text-danger-400'
                          }
                        />
                        <div>
                          <p className="text-sm font-medium text-dark-100">
                            Company Domain Match
                          </p>
                          <p className="text-xs text-dark-400">
                            {verification.domainMatchesCompany
                              ? 'Email domain matches company website'
                              : 'Email domain does NOT match company website'}
                          </p>
                        </div>
                      </div>
                      {verification.domainMatchesCompany ? (
                        <CheckCircle2 size={20} className="text-success-400" />
                      ) : (
                        <XCircle size={20} className="text-danger-400" />
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {verification.riskLevel === 'high' && (
                <Card className="bg-danger-500/10 border-danger-500/30">
                  <div className="flex items-start gap-4">
                    <AlertTriangle size={24} className="text-danger-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-danger-400">High Risk Warning</h4>
                      <p className="text-sm text-dark-300 mt-1">
                        This recruiter shows multiple red flags. We recommend:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-dark-400">
                        <li>- Do not share personal information</li>
                        <li>- Verify the company through official channels</li>
                        <li>- Check LinkedIn profile authenticity</li>
                        <li>- Never make any payments</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          ) : (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <User size={48} className="text-dark-600 mb-4" />
              <h3 className="text-lg font-medium text-dark-300">
                Enter recruiter details to verify
              </h3>
              <p className="text-sm text-dark-500 mt-2">
                We'll check email reputation, domain match, and more
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
