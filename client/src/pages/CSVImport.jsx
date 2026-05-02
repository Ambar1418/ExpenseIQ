import { useState, useMemo } from 'react';
import { UploadCloud, File, CheckCircle, Loader2, Sparkles, X, Table, IndianRupee, TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, Calendar, Tag, ArrowRight, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#3B82F6', '#F97316', '#06B6D4'];

// ─── Stat Card ────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color = 'indigo', delay = 0 }) => {
  const colorMap = {
    indigo:  'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-100/50 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-300',
    emerald: 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-100/50 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-300',
    amber:   'bg-amber-50/60 dark:bg-amber-950/40 border-amber-100/50 dark:border-amber-900/40 text-amber-600 dark:text-amber-300',
    violet:  'bg-violet-50/60 dark:bg-violet-950/40 border-violet-100/50 dark:border-violet-900/40 text-violet-600 dark:text-violet-300',
    rose:    'bg-rose-50/60 dark:bg-rose-950/40 border-rose-100/50 dark:border-rose-900/40 text-rose-600 dark:text-rose-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="p-4 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-xl flex items-center gap-3.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold shrink-0 ${colorMap[color]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">{label}</p>
        <h4 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white">{value}</h4>
      </div>
    </motion.div>
  );
};

// ─── Custom Tooltip ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 shadow-xl text-xs">
      <p className="font-bold text-white mb-0.5">{payload[0]?.payload?.name || label}</p>
      <p className="text-slate-300">₹{payload[0]?.value?.toLocaleString()}</p>
    </div>
  );
};

// ─── Main CSVImport Component ─────────────────────────────────
const CSVImport = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResults(null);
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(response.data);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import and parse statement');
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Compute analytics from imported transactions ──────────
  const analytics = useMemo(() => {
    if (!results?.transactions?.length) return null;

    const txs = results.transactions;
    const totalSpend = txs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const avgTransaction = totalSpend / txs.length;
    const maxTx = txs.reduce((max, tx) => tx.amount > max.amount ? tx : max, txs[0]);
    const minTx = txs.reduce((min, tx) => tx.amount < min.amount ? tx : min, txs[0]);

    // Category breakdown
    const categoryMap = {};
    txs.forEach(tx => {
      const cat = tx.category || 'Others';
      categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount;
    });
    const categories = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);

    // Top category
    const topCategory = categories[0] || { name: 'N/A', value: 0 };
    const topCategoryPercent = totalSpend > 0 ? ((topCategory.value / totalSpend) * 100).toFixed(1) : 0;

    // Merchant breakdown
    const merchantMap = {};
    txs.forEach(tx => {
      const m = tx.merchantName || 'Unknown';
      merchantMap[m] = (merchantMap[m] || 0) + tx.amount;
    });
    const topMerchants = Object.entries(merchantMap)
      .map(([name, value]) => ({ name: name.length > 14 ? name.substring(0, 14) + '…' : name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Daily spending
    const dailyMap = {};
    txs.forEach(tx => {
      const d = new Date(tx.date);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      dailyMap[key] = (dailyMap[key] || 0) + tx.amount;
    });
    const dailySpending = Object.entries(dailyMap)
      .map(([date, total]) => ({ date, total: Math.round(total) }))
      .sort((a, b) => {
        const [am, ad] = a.date.split('/').map(Number);
        const [bm, bd] = b.date.split('/').map(Number);
        return am !== bm ? am - bm : ad - bd;
      });

    // Date range
    const dates = txs.map(tx => new Date(tx.date)).filter(d => !isNaN(d));
    const earliest = dates.length ? new Date(Math.min(...dates)) : null;
    const latest = dates.length ? new Date(Math.max(...dates)) : null;
    const dateRange = earliest && latest
      ? `${earliest.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${latest.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
      : 'N/A';

    // Unique categories count
    const uniqueCategories = Object.keys(categoryMap).length;

    return {
      totalSpend,
      avgTransaction,
      maxTx,
      minTx,
      categories,
      topCategory,
      topCategoryPercent,
      topMerchants,
      dailySpending,
      dateRange,
      uniqueCategories,
    };
  }, [results]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none pb-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Statement Import <Sparkles className="text-indigo-500 dark:text-indigo-400 fill-indigo-500/10" size={22} />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated transcription and ingestion using intelligent CSV/Excel mapping</p>
      </div>

      {/* ── Upload Card ──────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 select-none"
      >
        {!file ? (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 rounded-xl p-10 sm:p-14 text-center cursor-pointer flex flex-col items-center justify-center transition-all duration-300 relative">
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              onChange={handleFileChange} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-14 h-14 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-105 shadow-inner">
              <Table className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1.5 tracking-tight">
              Select or drop financial CSV statements
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed mb-6">Import statements exported from banks, GPay, PhonePe, and digital passbooks</p>
            <span className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm transition-all duration-200 hover:bg-slate-50/80">
              Browse Statements
            </span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/40 dark:hover:bg-slate-800/40 border border-slate-200/40 dark:border-slate-800/40 rounded-xl transition-all duration-200 group select-none">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold transition-all duration-300 group-hover:scale-105 shrink-0 select-none">
                  <File size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white text-sm tracking-wide truncate max-w-[180px] sm:max-w-xs">{file.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              {!isUploading && !results && (
                <button onClick={clearFile} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors duration-200 rounded-xl select-none">
                  <X size={18} />
                </button>
              )}
            </div>

            {!results ? (
              <button
                onClick={handleImport}
                disabled={isUploading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 select-none hover:scale-101 duration-200"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Extracting data using AI...
                  </>
                ) : (
                  <>
                    <UploadCloud size={18} />
                    Analyze & Import Statement
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2 select-none animate-fadeIn">
                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100/50 dark:border-emerald-900/40 rounded-xl flex items-start gap-3.5 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" size={20} />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-200 tracking-tight">Statement Ingested</h4>
                    <p className="text-xs text-emerald-600/90 dark:text-emerald-400/90 mt-0.5 leading-relaxed">Successfully extracted and generated {results.count} expense transaction record(s) from your statement sheet.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
           ANALYTICS DASHBOARD — appears after import success
         ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {analytics && (
          <motion.div
            key="analytics-dashboard"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-6"
          >
            {/* ── Section Header ───────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="text-indigo-500 dark:text-indigo-400" size={20} />
                  Import Analysis
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{analytics.dateRange} • {results.count} records processed</p>
              </div>
              <Link
                to="/analytics"
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
              >
                Full Analytics <ArrowRight size={14} />
              </Link>
            </div>

            {/* ── Top Stats Grid ───────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={IndianRupee} label="Total Spend" value={`₹${analytics.totalSpend.toLocaleString()}`} color="indigo" delay={0} />
              <StatCard icon={TrendingUp} label="Avg / Transaction" value={`₹${Math.round(analytics.avgTransaction).toLocaleString()}`} color="emerald" delay={0.05} />
              <StatCard icon={TrendingDown} label="Highest Expense" value={`₹${analytics.maxTx?.amount?.toLocaleString()}`} color="rose" delay={0.1} />
              <StatCard icon={Tag} label="Categories" value={`${analytics.uniqueCategories} types`} color="violet" delay={0.15} />
            </div>

            {/* ── Charts Row ───────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-sm font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                    <PieChartIcon size={16} className="text-indigo-500" /> Category Breakdown
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                    {analytics.topCategory.name} — {analytics.topCategoryPercent}%
                  </span>
                </div>
                <div className="h-56 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={200}
                        animationDuration={800}
                      >
                        {analytics.categories.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {analytics.categories.slice(0, 6).map((cat, idx) => (
                    <div key={cat.name} className="flex items-center text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <div className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="truncate">{cat.name}</span>
                      <span className="ml-auto text-slate-400 dark:text-slate-500 font-bold text-[10px]">₹{cat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Top Merchants Bar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-sm font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                    <Store size={16} className="text-emerald-500" /> Top Merchants
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                    {analytics.topMerchants.length} merchants
                  </span>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.topMerchants} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={800}>
                        {analytics.topMerchants.map((_, idx) => (
                          <Cell key={`bar-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* ── Transactions Table ───────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold tracking-tight text-slate-800 dark:text-white">
                  Imported Transactions ({results.count})
                </h3>
                <Link
                  to="/transactions"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={13} />
                </Link>
              </div>

              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {results.transactions?.map((tx, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                    className="p-3.5 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/40 dark:hover:bg-slate-800/20 rounded-xl flex justify-between items-center transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm shrink-0 group-hover:scale-105 transition-transform duration-200">
                        {tx.merchantName?.charAt(0)?.toUpperCase() || 'M'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">{tx.merchantName}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                          {tx.category} • {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {tx.paymentApp && tx.paymentApp !== 'Imported' ? ` • ${tx.paymentApp}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm tracking-tight flex items-center gap-0.5">
                      <IndianRupee size={13} className="text-slate-400" />
                      {tx.amount?.toLocaleString()}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── Bottom Actions ────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={clearFile}
                className="flex-1 py-3 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 hover:scale-101 select-none"
              >
                Upload New Statement
              </button>
              <Link
                to="/dashboard"
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 hover:scale-101 duration-200"
              >
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CSVImport;
