import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, IndianRupee, Sparkles, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ category: 'Food', limit: '' });

  const categories = ['Food', 'Shopping', 'Bills', 'Travel', 'Entertainment', 'Healthcare', 'Recharge', 'Others', 'All'];

  const fetchBudgets = async () => {
    try {
      const { data } = await api.get('/budget');
      setBudgets(data);
    } catch (error) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date();
    try {
      await api.post('/budget', {
        ...formData,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });
      toast.success('Budget saved successfully');
      setShowModal(false);
      fetchBudgets();
    } catch (error) {
      toast.error('Failed to save budget');
    }
  };

  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
    if (percent >= 80) return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
    return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
  };

  return (
    <div className="space-y-6 select-none pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Monthly Budgets <Target className="text-indigo-500 dark:text-indigo-400" size={22} />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Set category spending goals to restrict unnecessary spending</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md hover:scale-102 select-none"
        >
          <Plus size={18} /> Add Budget Target
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500 animate-pulse">Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div className="col-span-full bg-white/70 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center select-none max-w-lg mx-auto w-full mt-6">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mb-4 border border-slate-200 dark:border-slate-700">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">No monthly targets yet</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-5 leading-relaxed max-w-sm">Setup initial budgets for your frequently matched expense categories.</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline select-none"
            >
              Create your first monthly target
            </button>
          </div>
        ) : (
          budgets.map((budget, idx) => (
            <motion.div
              key={budget._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.35 }}
              className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group h-48 select-none"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold tracking-tight text-base text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">{budget.category}</h3>
                <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-slate-600 dark:text-slate-300">
                  {budget.percentUsed}%
                </span>
              </div>
              
              <div className="flex items-end gap-1">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center tracking-tight">
                  <IndianRupee size={18} className="text-slate-400 dark:text-slate-500 mr-0.5" />
                  {budget.currentSpend?.toLocaleString() || '0'}
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 pb-1">of ₹{budget.limit?.toLocaleString()}</span>
              </div>

              <div className="space-y-2 mt-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-200/40 dark:border-slate-700/40 flex">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(budget.percentUsed)}`}
                    style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                  ></div>
                </div>
                
                {budget.percentUsed >= 100 ? (
                  <p className="text-xs text-red-500 font-bold flex items-center gap-1">Exceeded by ₹{(budget.currentSpend - budget.limit)?.toLocaleString()}</p>
                ) : budget.percentUsed >= 80 ? (
                  <p className="text-xs text-amber-500 font-bold flex items-center gap-1">Approaching limit: ₹{budget.remaining?.toLocaleString()} left</p>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">₹{budget.remaining?.toLocaleString()} remaining in budget</p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/60 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/40 dark:bg-slate-900/40 select-none">
              <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500 dark:text-indigo-400" /> Set Monthly Budget Limit
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Select Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 text-sm font-medium"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Limit Amount (₹)</label>
                <div className="relative rounded-xl shadow-sm group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200">
                    <IndianRupee className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500" />
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.limit}
                    onChange={(e) => setFormData({...formData, limit: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 text-sm"
                    placeholder="e.g. 8500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 select-none">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-102"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Budgets;

