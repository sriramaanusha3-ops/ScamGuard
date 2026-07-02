export { RiskGauge, TrustMeter, RiskBreakdownChart } from './RiskGauge';
export { AgentWorkflow, AgentTimeline } from './AgentWorkflow';
export { IssueList, RecommendationList } from './IssueList';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '../../lib/supabase';

interface TrendChartProps {
  data: { date: string; value: number }[];
  title: string;
  color?: string;
  height?: number;
}

export function TrendChart({
  data,
  title,
  color = '#6366f1',
  height = 200,
}: TrendChartProps) {
  return (
    <div className="h-full">
      <h4 className="text-sm font-medium text-dark-300 mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CategoryBarChartProps {
  data: { name: string; value: number; color: string }[];
  title: string;
  height?: number;
}

export function CategoryBarChart({
  data,
  title,
  height = 200,
}: CategoryBarChartProps) {
  return (
    <div className="h-full">
      <h4 className="text-sm font-medium text-dark-300 mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" stroke="#64748b" fontSize={12} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#64748b"
            fontSize={12}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface StatsChartProps {
  data: { name: string; safe: number; suspicious: number; dangerous: number }[];
}

export function StatsChart({ data }: StatsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="safe"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="suspicious"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="dangerous"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
