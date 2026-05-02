import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 relative select-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none select-none z-0" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 select-none">
        <Link to="/" className="flex justify-center text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform duration-200">
          <PieChart size={48} className="text-indigo-600 dark:text-indigo-400" />
        </Link>
        <h2 className="mt-5 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome back
        </h2>
        <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
          Log in to your SpendSense AI dashboard
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 16 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md py-8 px-4 sm:px-10 border border-slate-200/50 dark:border-slate-800/50 shadow-xl rounded-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative rounded-xl shadow-sm group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 outline-none transition-all duration-200 text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 outline-none transition-all duration-200 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md hover:shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:scale-102"
              >
                <span>Sign in</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/60 dark:border-slate-800/60" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-slate-900 text-slate-500">
                  New to SpendSense?
                </span>
              </div>
            </div>

            <div className="mt-5 text-center">
              <Link to="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors duration-200">
                Create a free account
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

