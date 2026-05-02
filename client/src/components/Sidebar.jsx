import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, UploadCloud, Target, Settings, LogOut, Table } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={19} /> },
    { name: 'Transactions', path: '/transactions', icon: <Receipt size={19} /> },
    { name: 'Upload', path: '/upload', icon: <UploadCloud size={19} /> },
    { name: 'CSV Statements', path: '/csv-import', icon: <Table size={19} /> },
    { name: 'Analytics', path: '/analytics', icon: <PieChart size={19} /> },
    { name: 'Budgets', path: '/budget', icon: <Target size={19} /> },
    { name: 'Profile', path: '/profile', icon: <Settings size={19} /> },
  ];

  return (
    <aside className="w-64 h-screen bg-white/60 dark:bg-[#0A0F1C]/60 border-r border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md hidden md:flex flex-col sticky top-0 z-40 select-none">
      <div className="p-6 pb-2 select-none">
        <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-emerald-400 flex items-center gap-2.5">
          <PieChart className="text-indigo-600 dark:text-indigo-400 shrink-0" size={26} />
          <span className="tracking-tight">SpendSense</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-6 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 relative group
                ${isActive 
                  ? 'text-indigo-600 dark:text-indigo-300 font-semibold shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/40 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              <span className="font-medium relative z-10 text-sm tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200/40 dark:border-slate-800/40 select-none">
        <button
          onClick={logout}
          className="flex items-center gap-3.5 px-4 py-3 w-full text-left text-slate-600 dark:text-slate-400 hover:bg-red-50/60 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200 group font-medium text-sm"
        >
          <LogOut className="text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400" size={19} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

