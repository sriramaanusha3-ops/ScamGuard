import { motion } from 'framer-motion';
import {
  FileSearch,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Clock,
  FileText,
  Building2,
  Users,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Card, StatCard, Button } from '../components/ui';
import { RiskGauge, TrendChart, CategoryBarChart } from '../components/dashboard';
import { useAppStore } from '../store';
import { Link, useNavigate } from '../lib/router';

const recentActivity = [
  { date: 'Mon', value: 25 },
  { date: 'Tue', value: 42 },
  { date: 'Wed', value: 35 },
  { date: 'Thu', value: 55 },
  { date: 'Fri', value: 28 },
  { date: 'Sat', value: 48 },
  { date: 'Sun', value: 32 },
];

const categoryData = [
  { name: 'Financial', value: 45, color: '#ef4444' },
  { name: 'Identity', value: 32, color: '#f59e0b' },
  { name: 'Promise', value: 28, color: '#6366f1' },
  { name: 'Process', value: 15, color: '#10b981' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export function DashboardPage() {
  const { analysisHistory } = useAppStore();
  const navigate = useNavigate();

  const total = analysisHistory.length || 156;
  const safe = analysisHistory.filter((a) => a.verdict === 'safe').length || 89;
  const suspicious = analysisHistory.filter((a) => a.verdict === 'suspicious').length || 45;
  const dangerous = analysisHistory.filter((a) => a.verdict === 'dangerous').length || 22;
  const avgRisk = 32;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-50">Dashboard</h1>
          <p className="text-dark-400 mt-1">
            Monitor your document analyses and scam detections
          </p>
        </div>
        <Button leftIcon={<FileSearch size={18} />} onClick={() => navigate('/analyze')}>
          New Analysis
        </Button>
      </div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total Analyses"
          value={total}
          subtitle="All time"
          icon={<FileText size={24} />}
          color="primary"
        />
        <StatCard
          title="Safe Documents"
          value={safe}
          subtitle={`${Math.round((safe / total) * 100)}% safe rate`}
          icon={<ShieldCheck size={24} />}
          color="success"
        />
        <StatCard
          title="Suspicious"
          value={suspicious}
          subtitle="Need review"
          icon={<AlertTriangle size={24} />}
          color="warning"
        />
        <StatCard
          title="Dangerous"
          value={dangerous}
          subtitle="Flagged as scam"
          icon={<AlertTriangle size={24} />}
          color="danger"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card variant="gradient">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-dark-50">Risk Overview</h2>
                <p className="text-sm text-dark-400 mt-1">Current system risk assessment</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-700/50">
                <Activity size={18} className="text-primary-400" />
                <span className="text-sm font-medium text-dark-200">Live</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <RiskGauge score={avgRisk} size={220} />
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-dark-700/30 border border-dark-600/50">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp size={18} className="text-primary-400" />
                    <span className="text-sm font-medium text-dark-200">Average Risk Score</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-50">{avgRisk}%</p>
                  <p className="text-xs text-dark-500 mt-1">Based on {total} analyses</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-700/30 border border-dark-600/50">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck size={18} className="text-success-400" />
                    <span className="text-sm font-medium text-dark-200">Protection Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-50">
                    {Math.round(((suspicious + dangerous) / total) * 100)}%
                  </p>
                  <p className="text-xs text-dark-500 mt-1">Threats detected & blocked</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card variant="gradient" className="h-full">
            <h3 className="text-lg font-semibold text-dark-50 mb-4">Scam Categories</h3>
            <CategoryBarChart data={categoryData} title="" height={180} />
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card variant="gradient">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-50">Activity Trend</h3>
            <select className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-dark-200">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <TrendChart data={recentActivity} title="" height={200} color="#6366f1" />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            path: '/upload' as const,
            icon: <FileText size={24} />,
            color: 'bg-primary-500/20 text-primary-400 group-hover:bg-primary-500/30',
            title: 'Upload Document',
            desc: 'Analyze offer letters, resumes, certificates',
          },
          {
            path: '/company' as const,
            icon: <Building2 size={24} />,
            color: 'bg-success-500/20 text-success-400 group-hover:bg-success-500/30',
            title: 'Verify Company',
            desc: 'Check company legitimacy and reputation',
          },
          {
            path: '/recruiter' as const,
            icon: <Users size={24} />,
            color: 'bg-warning-500/20 text-warning-400 group-hover:bg-warning-500/30',
            title: 'Check Recruiter',
            desc: 'Verify recruiter identity and contact info',
          },
        ].map((item) => (
          <Card key={item.path} hover className="group cursor-pointer" onClick={() => navigate(item.path)}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-dark-100 group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-dark-400 mt-1">{item.desc}</p>
              </div>
              <ArrowRight size={20} className="text-dark-500 group-hover:text-dark-300 transition-colors" />
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-50">Recent Analyses</h3>
            <button
              onClick={() => navigate('/history')}
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'TechCorp_Offer_Letter.pdf', type: 'Offer Letter', risk: 15, status: 'safe' },
              { name: 'Internship_MikeSoft.pdf', type: 'Internship', risk: 78, status: 'dangerous' },
              { name: 'Resume_JohnDoe.pdf', type: 'Resume', risk: 0, status: 'safe' },
              { name: 'Job_Description_ABC.pdf', type: 'Job Description', risk: 45, status: 'suspicious' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-700/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-dark-700">
                  <FileText size={18} className="text-dark-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-100 truncate">{item.name}</p>
                  <p className="text-xs text-dark-500">{item.type}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === 'safe'
                      ? 'bg-success-500/20 text-success-400'
                      : item.status === 'suspicious'
                      ? 'bg-warning-500/20 text-warning-400'
                      : 'bg-danger-500/20 text-danger-400'
                  }`}
                >
                  {item.risk}% Risk
                </div>
                <Clock size={16} className="text-dark-500" />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
