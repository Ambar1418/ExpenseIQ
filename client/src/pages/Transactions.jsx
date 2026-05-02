import { useState, useEffect } from 'react';
import { IndianRupee, Search, Filter, Trash2, ArrowUpDown, Plus, Edit, CheckSquare, Square, X, Sparkles, SlidersHorizontal, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtering & Sorting
  const [categoryFilter, setCategoryFilter] = useState('');
  const [appFilter, setAppFilter] = useState('');
  const [sortField, setSortField] = useState('latest');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Bulk deletion
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals visibility
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // Modal form data
  const [formData, setFormData] = useState({
    merchantName: '',
    amount: '',
    category: 'Food',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentApp: 'Imported',
    notes: '',
    tags: ''
  });

  const categories = ['Food', 'Shopping', 'Bills', 'Travel', 'Entertainment', 'Healthcare', 'Recharge', 'Others'];

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/transactions');
      setTransactions(data);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        setTransactions(transactions.filter(t => t._id !== id));
        setSelectedIds(selectedIds.filter(val => val !== id));
        toast.success('Transaction deleted');
      } catch (error) {
        toast.error('Failed to delete transaction');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected transactions?`)) {
      try {
        await api.post('/transactions/bulk-delete', { ids: selectedIds });
        setTransactions(transactions.filter(t => !selectedIds.includes(t._id)));
        setSelectedIds([]);
        toast.success('Selected transactions deleted');
      } catch (error) {
        toast.error('Failed to clear selection');
      }
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('WARNING: Are you sure you want to delete ALL transaction history? This cannot be undone.')) {
      try {
        await api.delete('/transactions');
        setTransactions([]);
        setSelectedIds([]);
        toast.success('All history cleared successfully');
      } catch (error) {
        toast.error('Failed to clear history');
      }
    }
  };

  const openAddModal = () => {
    setFormData({
      merchantName: '',
      amount: '',
      category: 'Food',
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentApp: 'Manual Entry',
      notes: '',
      tags: ''
    });
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean)
      };
      const { data } = await api.post('/transactions', payload);
      setTransactions([data, ...transactions]);
      setShowAddModal(false);
      toast.success('New transaction recorded');
    } catch (error) {
      toast.error('Could not save transaction');
    }
  };

  const openEditModal = (tx) => {
    setEditingTx(tx);
    setFormData({
      merchantName: tx.merchantName,
      amount: tx.amount,
      category: tx.category,
      date: tx.date ? format(new Date(tx.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      paymentApp: tx.paymentApp || '',
      notes: tx.notes || '',
      tags: tx.tags ? tx.tags.join(', ') : ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean)
      };
      const { data } = await api.put(`/transactions/${editingTx._id}`, payload);
      setTransactions(transactions.map(t => t._id === data._id ? data : t));
      setShowEditModal(false);
      toast.success('Transaction saved');
    } catch (error) {
      toast.error('Could not modify record');
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(val => val !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map(t => t._id));
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !categoryFilter || t.category === categoryFilter;
    const matchesApp = !appFilter || t.paymentApp === appFilter;
    
    const matchesMinAmount = !minAmount || t.amount >= parseFloat(minAmount);
    const matchesMaxAmount = !maxAmount || t.amount <= parseFloat(maxAmount);

    return matchesSearch && matchesCategory && matchesApp && matchesMinAmount && matchesMaxAmount;
  }).sort((a, b) => {
    if (sortField === 'highest') return b.amount - a.amount;
    if (sortField === 'latest') return new Date(b.date) - new Date(a.date);
    if (sortField === 'oldest') return new Date(a.date) - new Date(b.date);
    if (sortField === 'category') return a.category.localeCompare(b.category);
    return 0;
  });

  return (
    <div className="space-y-6 select-none pb-8">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Expense Ingests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Edit, purge, or ingest manually without OCR dependencies</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleClearHistory}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50/60 hover:bg-red-100/60 dark:bg-red-950/20 dark:hover:bg-red-950/40 border border-red-200/50 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all"
          >
            Clear All Data
          </button>
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm hover:scale-101"
          >
            <Plus size={16} /> Manual Ingest
          </button>
        </div>
      </div>

      {/* Advanced Filter Action Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500" />
          </div>
          <input
            type="text"
            placeholder="Search merchant or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white text-xs font-medium outline-none transition-all duration-200"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-2.5 bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl text-slate-700 dark:text-white text-xs outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="w-full p-2.5 bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl text-slate-700 dark:text-white text-xs outline-none focus:border-indigo-500"
          >
            <option value="latest">Latest Ingest</option>
            <option value="highest">Highest Amount</option>
            <option value="oldest">Oldest Entry</option>
            <option value="category">Category Type</option>
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl text-slate-900 dark:text-white text-xs font-medium outline-none"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl text-slate-900 dark:text-white text-xs font-medium outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setAppFilter('');
              setSortField('latest');
              setMinAmount('');
              setMaxAmount('');
            }}
            className="flex-1 flex items-center justify-center gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <RotateCw size={14} /> Clear Filter
          </button>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Delete ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100/60 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/20 dark:bg-slate-900/30 select-none">
          <button 
            onClick={toggleSelectAll}
            className="text-xs font-bold flex items-center gap-1.5 text-slate-500 dark:text-slate-400 select-none hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0 ? (
              <CheckSquare size={16} className="text-indigo-500" />
            ) : (
              <Square size={16} />
            )}
            {selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            {filteredTransactions.length} Transactions Listed
          </span>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60 select-none">
          {loading ? (
            <div className="p-6 text-center text-slate-500 font-medium animate-pulse">Loading transaction records...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-6 text-center text-slate-400 font-medium text-sm">No transaction matches found.</div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx._id} className="p-4 flex justify-between items-center hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-all duration-200 group select-none">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleSelect(tx._id)} className="text-slate-400 hover:text-indigo-500 shrink-0">
                    {selectedIds.includes(tx._id) ? <CheckSquare size={16} className="text-indigo-500" /> : <Square size={16} />}
                  </button>
                  <div className="w-11 h-11 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-base transition-all duration-300 group-hover:scale-105 shrink-0">
                    {tx.merchantName ? tx.merchantName.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">{tx.merchantName}</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {format(new Date(tx.date), 'MMM dd, yyyy')} • {tx.paymentApp}
                    </p>
                    <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-bold rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-100/40 dark:border-indigo-900/40 tracking-wider">
                      {tx.category?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right shrink-0">
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                    ₹{tx.amount?.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1 select-none">
                    <button onClick={() => openEditModal(tx)} className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => handleDelete(tx._id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto select-none">
          <table className="min-w-full divide-y divide-slate-200/40 dark:divide-slate-800/60">
            <thead className="bg-slate-50/50 dark:bg-slate-900/40 select-none">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"></th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Merchant</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Method</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-medium animate-pulse">Loading transaction records...</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium text-sm">No transaction matches found.</td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-all duration-200 group select-none">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => toggleSelect(tx._id)} className="text-slate-400 hover:text-indigo-500 shrink-0">
                        {selectedIds.includes(tx._id) ? <CheckSquare size={16} className="text-indigo-500" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {format(new Date(tx.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold transition-all duration-300 group-hover:scale-105 shrink-0 select-none">
                          {tx.merchantName ? tx.merchantName.charAt(0).toUpperCase() : 'M'}
                        </div>
                        {tx.merchantName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs font-bold rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-100/40 dark:border-indigo-900/40 tracking-wider">
                        {tx.category?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {tx.paymentApp || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                      ₹{tx.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1 select-none">
                        <button onClick={() => openEditModal(tx)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 rounded-xl">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(tx._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 rounded-xl">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Addition Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/60 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/40 dark:bg-slate-900/40 select-none">
              <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500 dark:text-indigo-400" /> Record Expense Entry
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Merchant</label>
                <input
                  type="text"
                  required
                  value={formData.merchantName}
                  onChange={(e) => setFormData({...formData, merchantName: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition-all duration-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition-all duration-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Payment App</label>
                  <input
                    type="text"
                    value={formData.paymentApp}
                    onChange={(e) => setFormData({...formData, paymentApp: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition-all duration-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Tags / Custom Context</label>
                <input
                  type="text"
                  placeholder="e.g. hackathon, personal, lunch"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition-all duration-200"
                />
              </div>
              <div className="flex gap-3 pt-3 select-none">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md hover:scale-101 duration-200"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Editing Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/60 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/40 dark:bg-slate-900/40 select-none">
              <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500 dark:text-indigo-400" /> Edit Entry Detail
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Merchant</label>
                <input
                  type="text"
                  required
                  value={formData.merchantName}
                  onChange={(e) => setFormData({...formData, merchantName: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition-all duration-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition-all duration-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Payment App</label>
                  <input
                    type="text"
                    value={formData.paymentApp}
                    onChange={(e) => setFormData({...formData, paymentApp: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition-all duration-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Tags / Custom Context</label>
                <input
                  type="text"
                  placeholder="e.g. hackathon, personal, lunch"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition-all duration-200"
                />
              </div>
              <div className="flex gap-3 pt-3 select-none">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md hover:scale-101 duration-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Transactions;

