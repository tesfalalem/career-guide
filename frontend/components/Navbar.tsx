import React, { useState, useEffect } from 'react';
import { Menu, GraduationCap, Sun, Moon, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: 'home' | 'login' | 'signup') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NAV_ITEMS = [
  { label: 'Roadmaps', href: '#roadmaps' },
  { label: 'Careers',  href: '#careers'  },
  { label: 'Network',  href: '#network'  },
];

const Navbar: React.FC<NavbarProps> = ({ onNavigate, theme, onToggleTheme }) => {
  const [isScrolled,    setIsScrolled]    = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [revealed,      setRevealed]      = useState(false);

  // Reveal on mount
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Scroll state
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section tracking
  useEffect(() => {
    const sections = NAV_ITEMS.map(item => document.querySelector(item.href));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection('#' + entry.target.id);
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach(s => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-[100] flex justify-center px-6 py-5 pointer-events-none ${revealed ? 'animate-nav-reveal' : 'opacity-0'}`}>
        <nav
          className={`w-full max-w-[1440px] flex items-center justify-between pointer-events-auto transition-all duration-500
          ${isScrolled
            ? 'px-6 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md shadow-slate-200/50 dark:shadow-slate-900/50'
            : 'py-3'}`}
        >
          {/* Brand */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-careermap-navy rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/25 group-hover:shadow-teal-500/40 transition-shadow">
              <GraduationCap size={22} strokeWidth={2.5} />
            </div>
            <span className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">
              Career<span className="text-careermap-teal">Guide</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-full px-1.5 py-1">
            {NAV_ITEMS.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => scrollTo(href)}
                className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all
                  ${activeSection === href
                    ? 'bg-white dark:bg-slate-700 text-careermap-teal dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-careermap-teal dark:hover:text-teal-400 hover:bg-white/60 dark:hover:bg-slate-700/60'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="p-2.5 text-slate-400 hover:text-careermap-teal dark:hover:text-teal-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-careermap-teal dark:hover:text-teal-400 px-4 py-2 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="bg-careermap-navy hover:bg-[#023058] text-white px-6 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all active:scale-95"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[90] md:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-[76px] left-4 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl mobile-menu-open overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 space-y-1">
              {NAV_ITEMS.map(({ label, href }) => (
                <button
                  key={label}
                  onClick={() => scrollTo(href)}
                  className={`w-full text-left px-5 py-3 rounded-xl font-bold text-sm transition-all
                    ${activeSection === href
                      ? 'bg-teal-50 dark:bg-teal-900/30 text-careermap-teal dark:text-teal-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-3">
              <button
                onClick={() => { onNavigate('login'); setMobileOpen(false); }}
                className="w-full py-3 rounded-xl font-bold text-sm text-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-400 transition-all"
              >
                Login
              </button>
              <button
                onClick={() => { onNavigate('signup'); setMobileOpen(false); }}
                className="w-full py-3 rounded-xl font-bold text-sm text-center bg-careermap-navy hover:bg-[#023058] text-white transition-all"
              >
                Get Started
              </button>
              <button
                onClick={onToggleTheme}
                className="w-full py-3 rounded-xl font-bold text-sm text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2"
              >
                {theme === 'light' ? <><Moon size={16} /> Dark Mode</> : <><Sun size={16} /> Light Mode</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
