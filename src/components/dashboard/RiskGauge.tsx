import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn, getRiskBgColor } from '../../lib/supabase';

interface RiskGaugeProps {
  score: number;
  size?: number;
  animated?: boolean;
}

export function RiskGauge({ score, size = 200, animated = true }: RiskGaugeProps) {
  const riskLevel = score <= 25 ? 'Low' : score <= 50 ? 'Medium' : score <= 75 ? 'High' : 'Critical';

  const riskColors = {
    Low: { primary: '#10b981', secondary: '#065f46', label: 'Low Risk' },
    Medium: { primary: '#f59e0b', secondary: '#92400e', label: 'Medium Risk' },
    High: { primary: '#ef4444', secondary: '#991b1b', label: 'High Risk' },
    Critical: { primary: '#dc2626', secondary: '#7f1d1d', label: 'Critical Risk' },
  };

  const config = riskColors[riskLevel as keyof typeof riskColors];
  const angle = (score / 100) * 180;

  const data = [
    { value: score, color: config.primary },
    { value: 100 - score, color: 'rgba(255,255,255,0.05)' },
  ];

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <ResponsiveContainer width="100%" height={size / 2 + 20}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={size / 3}
              outerRadius={size / 2}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {animated && (
          <motion.div
            className="absolute bottom-0 left-1/2 w-1 origin-bottom"
            style={{ height: size / 3 - 10 }}
            initial={{ rotate: -90 }}
            animate={{ rotate: -180 + angle }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: config.primary }}
            />
            <div
              className="absolute -top-1 -left-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: config.primary, boxShadow: `0 0 10px ${config.primary}` }}
            />
          </motion.div>
        )}

        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-dark-500 px-2">
          <span>Safe</span>
          <span>Critical</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-4"
      >
        <p className="text-5xl font-bold" style={{ color: config.primary }}>
          {score}
        </p>
        <p className="text-lg font-medium text-dark-300 mt-1">{config.label}</p>
      </motion.div>
    </div>
  );
}

interface TrustMeterProps {
  score: number;
  label?: string;
}

export function TrustMeter({ score, label = 'Trust Score' }: TrustMeterProps) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="3"
          />
          <motion.path
            initial={{ strokeDasharray: '0, 100' }}
            animate={{ strokeDasharray: `${score}, 100` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {score}%
          </span>
        </div>
      </div>
      <p className="text-sm text-dark-400 mt-2">{label}</p>
    </div>
  );
}

interface RiskBreakdownChartProps {
  data: { category: string; count: number; color: string }[];
}

export function RiskBreakdownChart({ data }: RiskBreakdownChartProps) {
  return (
    <div className="flex items-center gap-6">
      <div className="w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="count"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 space-y-2">
        {data.map((item) => (
          <div key={item.category} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-dark-300 flex-1">{item.category}</span>
            <span className="text-sm font-medium text-dark-100">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
