import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  FolderHeart, 
  Users,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { SignatureRecord } from '../types';

interface DashboardProps {
  records: SignatureRecord[];
  onNavigate: (page: string) => void;
}

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#10b981', // emerald
  '#f59e0b', // amber
  '#3f51b5', // indigo
  '#f44336', // red
  '#009688', // teal
];

export default function Dashboard({ records, onNavigate }: DashboardProps) {
  // Current date constants
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const currentMonth = useMemo(() => new Date().getMonth(), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Compute stat counts
  const stats = useMemo(() => {
    let todayCount = 0;
    let monthCount = 0;
    let yearCount = 0;

    records.forEach(r => {
      if (r.date === todayStr) {
        todayCount++;
      }
      try {
        const d = new Date(r.date);
        if (d.getFullYear() === currentYear) {
          yearCount++;
          if (d.getMonth() === currentMonth) {
            monthCount++;
          }
        }
      } catch (e) {
        // ignore invalid dates
      }
    });

    return {
      today: todayCount,
      month: monthCount,
      year: yearCount,
      total: records.length
    };
  }, [records, todayStr, currentMonth, currentYear]);

  // Daily Trend Data (Last 7 active days)
  const dailyChartData = useMemo(() => {
    const dailyMap: { [date: string]: number } = {};
    records.forEach(r => {
      dailyMap[r.date] = (dailyMap[r.date] || 0) + 1;
    });

    // Sort dates
    const sortedDates = Object.keys(dailyMap).sort();
    const lastDates = sortedDates.slice(-7);

    // If less than 5 records, expand with some prior dates for styling
    if (lastDates.length < 5) {
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        result.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          signatures: dailyMap[dStr] || 0
        });
      }
      return result;
    }

    return lastDates.map(dStr => {
      const d = new Date(dStr);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        signatures: dailyMap[dStr]
      };
    });
  }, [records]);

  // Document Type Breakdown Data
  const docTypeChartData = useMemo(() => {
    const docMap: { [type: string]: number } = {};
    records.forEach(r => {
      docMap[r.docType] = (docMap[r.docType] || 0) + 1;
    });

    return Object.entries(docMap).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [records]);

  // Monthly Signature Report Data
  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts = Array(12).fill(0);

    records.forEach(r => {
      try {
        const d = new Date(r.date);
        if (d.getFullYear() === currentYear) {
          monthlyCounts[d.getMonth()]++;
        }
      } catch (e) {
        // ignore
      }
    });

    // return only up to the current month to avoid future empty months
    return months.slice(0, currentMonth + 1).map((m, idx) => ({
      month: m,
      signatures: monthlyCounts[idx]
    }));
  }, [records, currentYear, currentMonth]);

  // Recently Signed (Latest 5 records)
  const recentSignatures = useMemo(() => {
    return [...records]
      .sort((a, b) => {
        const dateTimeA = `${a.date}T${a.time || '00:00'}`;
        const dateTimeB = `${b.date}T${b.time || '00:00'}`;
        if (dateTimeA !== dateTimeB) {
          return dateTimeB.localeCompare(dateTimeA);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5);
  }, [records]);

  // Document Type badges styling helper
  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case 'Local Recruitment':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
      case 'International Recruitment':
        return 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400';
      case 'Training & Development':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
      case 'Compliance':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'Compensation & Benefits (C&B)':
        return 'bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400';
      case 'Payroll':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400';
      case 'Central HR Document':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time analytics and tracking status of Mr. Kafa's signature records.
          </p>
        </div>
        <button 
          onClick={() => onNavigate('add-signature')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-md shadow-blue-500/15 hover:shadow-blue-500/25"
        >
          <Sparkles className="w-4 h-4" /> Add New Signature
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-blue-500/30 dark:hover:border-blue-400/30 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Signed Today
            </span>
            <h3 className="font-display font-bold text-3xl text-slate-800 dark:text-white tracking-tight">
              {stats.today}
            </h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> Recent Actions
            </span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: This Month */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-violet-500/30 dark:hover:border-violet-400/30 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              This Month
            </span>
            <h3 className="font-display font-bold text-3xl text-slate-800 dark:text-white tracking-tight">
              {stats.month}
            </h3>
            <span className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-0.5">
              <Sparkles className="w-3.5 h-3.5" /> Active Period
            </span>
          </div>
          <div className="p-3 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-2xl">
            <FolderHeart className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: This Year */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-emerald-500/30 dark:hover:border-emerald-400/30 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              This Year
            </span>
            <h3 className="font-display font-bold text-3xl text-slate-800 dark:text-white tracking-tight">
              {stats.year}
            </h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> Annual Signatures
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total Signatures */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-amber-500/30 dark:hover:border-amber-400/30 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Recorded
            </span>
            <h3 className="font-display font-bold text-3xl text-slate-800 dark:text-white tracking-tight">
              {stats.total}
            </h3>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
              <Users className="w-3.5 h-3.5" /> Full Database
            </span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily trend area chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-sm md:text-base text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Daily Signature Trend (Last 7 Days)
            </h3>
          </div>
          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSig" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="signatures" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorSig)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Document types breakdown pie chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-sm md:text-base text-slate-800 dark:text-white">
              Document Types
            </h3>
          </div>
          <div className="h-52 relative flex items-center justify-center">
            {docTypeChartData.length === 0 ? (
              <p className="text-xs text-slate-400">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={docTypeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {docTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '11px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Custom legend */}
          <div className="max-h-24 overflow-y-auto mt-2 space-y-1 px-1">
            {docTypeChartData.slice(0, 4).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate font-medium">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">{item.value} ({Math.round(item.value / stats.total * 100 || 0)}%)</span>
              </div>
            ))}
            {docTypeChartData.length > 4 && (
              <div className="text-[10px] text-center text-slate-400 pt-0.5">
                + {docTypeChartData.length - 4} other document types
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Signatures Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm lg:col-span-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-display font-bold text-sm md:text-base text-slate-800 dark:text-white">
              Monthly Signature Activity
            </h3>
            <p className="text-xs text-slate-400">Total signatures recorded in {currentYear}</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Bar dataKey="signatures" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recently Signed list */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm lg:col-span-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-sm md:text-base text-slate-800 dark:text-white">
                Recently Signed Documents
              </h3>
              <p className="text-xs text-slate-400">Your latest signature operations</p>
            </div>
            <button 
              onClick={() => onNavigate('records')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            {recentSignatures.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center">
                <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs text-slate-400">No documents signed yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-2.5">Title</th>
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Doc Type</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Person</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {recentSignatures.map((item) => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const isCrossed = item.date < todayStr;
                    return (
                      <tr 
                        key={item.id} 
                        className={`text-xs transition-all ${
                          isCrossed 
                            ? 'bg-rose-50/60 dark:bg-rose-950/15 hover:bg-rose-50/80 dark:hover:bg-rose-950/20' 
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                        }`}
                      >
                        <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200 max-w-44 truncate pr-2">
                          {item.title}
                        </td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-tight inline-block ${getDocTypeBadge(item.docType)}`}>
                            {item.docType}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-tight inline-block ${
                            item.responsible === 'Approved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                            item.responsible === 'Verified' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                            item.responsible === 'Checked' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                            'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {item.responsible || 'N/A'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-medium text-slate-700 dark:text-slate-300">
                          {item.person}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
