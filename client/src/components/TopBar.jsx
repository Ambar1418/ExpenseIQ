import { useContext } from 'react';
import { Sun, Moon, Bell, Menu } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';
import AuthContext from '../context/AuthContext';

const TopBar = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  return (
    <header className="h-18 px-6 md:px-8 flex items-center justify-between bg-white/70 dark:bg-[#0A0F1C]/70 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200/50 dark:border-slate-800/50 select-none">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors duration-200">
          <Menu size={22} />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'User'} <span className="animate-bounce origin-bottom inline-block">👋</span>
          </h2>
          <p className="text-xs text-slate-400 font-normal">AI spending insights at your fingertips</p>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl transition-all duration-200 relative group">
          <Bell size={19} className="group-hover:rotate-12 transition-transform duration-200" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
        </button>
        
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl transition-all duration-200"
        >
          {darkMode ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div className="h-9 w-px bg-slate-200/60 dark:bg-slate-800/60 mx-1"></div>

        <div className="flex items-center gap-3 pl-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-200/40 dark:border-indigo-800/40 shadow-sm transition-all duration-300 hover:scale-105 cursor-pointer">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-400 font-normal mt-0.5 leading-none">{user?.role || 'Basic'} Plan</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

