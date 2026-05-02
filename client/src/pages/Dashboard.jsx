import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, IndianRupee, TrendingUp, CreditCard, Sparkles, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics');
        setData(response.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-8 w-60 bg-slate-200 dark:bg-slate-800 rounded-xl mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm"></div>
          <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm"></div>
          <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <div className="space-y-6 select-none pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Dashboard Overview <Sparkles className="text-indigo-500 dark:text-indigo-400 fill-indigo-500/10" size={20} />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time breakdown of your expense metrics</p>
        </div>
        <Link to="/upload" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm hover:shadow-md hover:scale-102">
          <Plus size={18} /> Upload Receipt
        </Link>
      </div>
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 relative group flex flex-col justify-between h-36"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Spent This Month</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 flex items-center tracking-tight">
                <IndianRupee size={24} className="text-slate-400 dark:text-slate-500 shrink-0" />
                {data?.totalSpend?.toLocaleString() || '0'}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl transition-transform duration-300 group-hover:scale-105">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="flex items-center text-xs">
            {data?.delta <= 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-100/40 dark:border-emerald-900/40">
                <ArrowDownRight size={15} className="mr-0.5" /> {Math.abs(data?.delta)}% less vs last month
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400 flex items-center font-bold bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-xl border border-red-100/40 dark:border-red-900/40">
                <ArrowUpRight size={15} className="mr-0.5" /> {data?.delta}% more vs last month
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.1 }} 
          className="lg:col-span-2 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">Daily Spending Curve</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">Current Month</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.dailySpending || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" dark:stroke="#334155" opacity={0.3} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => val.substring(5)} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    color: '#f8fafc', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                  }} 
                />
                <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={3} dot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.2 }} 
          className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white mb-6">Category Allocation</h3>
            <div className="h-60 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.categories || []} cx="50%" cy="50%" innerRadius={56} outerRadius={76} paddingAngle={4} dataKey="value">
                    {data?.categories?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      color: '#f8fafc', 
                      borderRadius: '12px',
                      fontSize: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-left">
            {data?.categories?.slice(0, 4).map((cat, idx) => (
              <div key={cat.name} className="flex items-center text-xs text-slate-600 dark:text-slate-400 font-medium">
                <div className="w-2.5 h-2.5 rounded-full mr-2 shrink-0 animate-pulse" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                <span className="truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.3 }} 
        className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">Recent Spending Activities</h3>
          <Link to="/transactions" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">View All</Link>
        </div>
        <div className="space-y-3">
          {data?.recentTransactions?.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm py-4">No recent transactions. Upload a screenshot to get started.</p>
          ) : (
            data?.recentTransactions?.map(tx => (
              <div key={tx._id} className="flex justify-between items-center p-3.5 hover:bg-slate-100/40 dark:hover:bg-slate-800/30 border border-transparent hover:border-slate-200/40 dark:hover:border-slate-800/40 rounded-xl transition-all duration-200 group">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold transition-all duration-300 group-hover:scale-105 shrink-0 select-none">
                    {tx.merchantName ? tx.merchantName.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">{tx.merchantName}</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5">{new Date(tx.date).toLocaleDateString()} • {tx.category}</p>
                  </div>
                </div>
                <div className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base flex items-center gap-0.5 tracking-tight">
                  <span className="text-slate-400 dark:text-slate-500 font-normal">-</span>
                  <IndianRupee size={15} className="text-slate-400 dark:text-slate-500" />
                  {tx.amount?.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

