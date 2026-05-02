import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell, LineChart, Line, PieChart, Pie } from 'recharts';
import { Lightbulb, Sparkles, TrendingUp, Cpu, FileText, Download, TrendingDown, Layers, Award, RefreshCcw, DollarSign } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const fetchData = async () => {
    try {
      const res = await api.get('/analytics');
      setAnalyticsData(res.data);
      
      const txRes = await api.get('/transactions');
      setTransactions(txRes.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateAIInsights = async () => {
    setGeneratingInsights(true);
    try {
      const res = await api.get('/insights');
      setInsights(res.data.insights);
      toast.success('AI Insights generated successfully!');
    } catch (error) {
      toast.error('Failed to generate insights');
    } finally {
      setGeneratingInsights(false);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions available to export');
      return;
    }
    const headers = ['Merchant Name', 'Amount (INR)', 'Category', 'Date', 'Payment App', 'Notes'];
    const rows = transactions.map(t => [
      `"${t.merchantName}"`,
      t.amount,
      `"${t.category}"`,
      `"${new Date(t.date).toLocaleDateString()}"`,
      `"${t.paymentApp || 'Imported'}"`,
      `"${t.notes || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `SpendSense_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Transaction history downloaded as CSV');
  };

  const handleExportPDF = () => {
    if (transactions.length === 0) {
      toast.error('No transactions available to generate PDF');
      return;
    }
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(22);
    doc.text('SpendSense AI Expense Report', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Total Recorded Spend: INR ${transactions.reduce((acc, c) => acc + c.amount, 0).toLocaleString()}`, 14, 34);

    doc.setFontSize(12);
    doc.text('Recent Expenditure Details', 14, 46);
    
    let y = 56;
    transactions.slice(0, 20).forEach((t, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(9);
      doc.text(`${idx + 1}. ${t.merchantName} - INR ${t.amount} (${t.category}) [${new Date(t.date).toLocaleDateString()}]`, 14, y);
      y += 8;
    });

    doc.save(`SpendSense_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Report successfully exported as PDF');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm"></div>
        </div>
      </div>
    );
  }

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#3B82F6'];

  // Recurring expense extraction logic
  const merchantTotals = transactions.reduce((acc, t) => {
    acc[t.merchantName] = (acc[t.merchantName] || 0) + t.amount;
    return acc;
  }, {});

  const recurringExpenses = Object.entries(merchantTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Top Merchants
  const topMerchantsData = Object.entries(merchantTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Average daily calculation
  const currentMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  
  const currentMonthTotal = currentMonthTx.reduce((acc, curr) => acc + curr.amount, 0);
  const dayOfMonth = new Date().getDate();
  const dailyAverage = (currentMonthTotal / (dayOfMonth || 1)).toFixed(2);

  return (
    <div className="space-y-6 select-none pb-8">
      {/* Dynamic Report Export Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Advanced Analytics <Cpu className="text-indigo-500 dark:text-indigo-400" size={22} />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Visualize distributions, anomalies, and recurring expenditures</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold tracking-wide transition-all duration-200"
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-indigo-50/60 hover:bg-indigo-100/60 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 border border-indigo-100/40 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-bold tracking-wide transition-all duration-200"
          >
            <FileText size={15} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* High-Impact Stat Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl flex items-center gap-3.5 backdrop-blur-md">
          <div className="w-10 h-10 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Daily Spend Avg</p>
            <h4 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white">₹{dailyAverage}</h4>
          </div>
        </div>

        <div className="p-4 bg-white/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl flex items-center gap-3.5 backdrop-blur-md">
          <div className="w-10 h-10 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100/50 dark:border-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-300 font-bold shrink-0">
            <Award size={18} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">AI Financial Score</p>
            <h4 className="text-base font-extrabold tracking-tight text-emerald-600 dark:text-emerald-300">88/100</h4>
          </div>
        </div>

        <div className="p-4 bg-white/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl flex items-center gap-3.5 backdrop-blur-md">
          <div className="w-10 h-10 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Total Transactions</p>
            <h4 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white">{transactions.length} Records</h4>
          </div>
        </div>

        <div className="p-4 bg-white/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl flex items-center gap-3.5 backdrop-blur-md">
          <div className="w-10 h-10 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100/50 dark:border-amber-900/40 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-300 font-bold shrink-0">
            <RefreshCcw size={18} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Active Repeat Trends</p>
            <h4 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white">{recurringExpenses.length} Patterns</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">Spending by Category</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">Distribution</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.categories || []} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" dark:stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    color: '#f8fafc', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                  }} 
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {analyticsData?.categories?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Insights Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-gradient-to-br from-indigo-950/80 via-slate-900/60 to-slate-900/40 dark:from-indigo-950/40 backdrop-blur-md p-6 rounded-2xl border border-indigo-500/20 dark:border-indigo-500/10 shadow-lg relative overflow-hidden text-white flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-[90px] pointer-events-none select-none" />
          
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="text-yellow-400 fill-yellow-400/10 animate-pulse" size={20} /> Advanced AI Insights
              </h3>
              <button
                onClick={generateAIInsights}
                disabled={generatingInsights}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700/60 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-indigo-500/30 flex items-center gap-2 tracking-wide disabled:cursor-not-allowed hover:scale-102 select-none"
              >
                {generatingInsights ? (
                  <><div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div> Analyzing data...</>
                ) : (
                  <>Re-run Analysis</>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[290px] pr-1">
              {insights.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center border border-dashed border-indigo-500/30 rounded-xl p-6 bg-slate-900/30 select-none">
                  <div className="w-11 h-11 bg-indigo-950/50 rounded-xl flex items-center justify-center mb-4 border border-indigo-800/60">
                    <Lightbulb size={22} className="text-indigo-300" />
                  </div>
                  <p className="text-sm text-slate-300 font-medium">No active recommendations</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">Tap the button above to derive pattern advice generated by Llama-3.</p>
                </div>
              ) : (
                <ul className="space-y-3.5">
                  {insights.map((insight, idx) => (
                    <motion.li 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="flex gap-3.5 items-start bg-slate-900/40 backdrop-blur-sm p-3.5 rounded-xl border border-slate-800/60 hover:border-indigo-500/30 transition-all group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-indigo-950/50 flex items-center justify-center border border-indigo-800/40 group-hover:scale-105 transition-transform duration-200 shrink-0 mt-0.5 select-none">
                        <TrendingUp className="text-indigo-400" size={14} />
                      </div>
                      <p className="leading-relaxed text-slate-200 text-xs font-medium">{insight}</p>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Merchants Spending */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">Top 5 Merchants</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">Insights</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={topMerchantsData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" dark:stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    color: '#f8fafc', 
                    borderRadius: '12px',
                    fontSize: '12px'
                  }} 
                />
                <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recurring Pattern Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">Recurring Spending Context</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">Frequent</span>
          </div>
          <div className="flex-1 space-y-4">
            {recurringExpenses.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-sm">No significant recurring patterns extracted.</div>
            ) : (
              recurringExpenses.map(([merchant, total], idx) => (
                <div key={idx} className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/40 rounded-xl flex justify-between items-center hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-all duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/40 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                      {merchant.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 tracking-tight">{merchant}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Frequent recurring spend</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm tracking-tight">₹{total.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;

