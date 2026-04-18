import React from 'react';
import { Facebook, Twitter, Linkedin, Send, GraduationCap, ArrowUp, Mail, Phone, MapPin, ShieldCheck, HelpCircle, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'login' | 'signup' | 'onboarding' | 'dashboard' | 'mission' | 'faq' | 'user-guide' | 'privacy' | 'terms') => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-10">

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand & Description */}
          <div className="md:col-span-1">
            <div 
              className="flex items-center gap-3 mb-4 cursor-pointer group"
              onClick={() => onNavigate('home')}
            >
              <div className="w-10 h-10 bg-careermap-navy rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:scale-110 transition-transform">
                <GraduationCap size={22} strokeWidth={2.5} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Career<span className="text-teal-400">Guide</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              AI-powered platform for career guidance and skill roadmapping
            </p>
            
            {/* Social & Institutional Links */}
            <div className="flex flex-wrap gap-3">
              {[
                { 
                  icon: Globe, 
                  href: 'https://bdu.edu.et/bit',
                  label: 'Official Website'
                },
                { 
                  icon: Send, 
                  href: 'https://t.me/bitpoly',
                  label: 'Telegram'
                },
                { 
                  icon: Facebook, 
                  href: 'https://www.facebook.com/bitpoly',
                  label: 'Facebook'
                },
                { 
                  icon: Twitter, 
                  href: 'https://twitter.com/BiT_BDU',
                  label: 'Twitter'
                },
                { 
                  icon: Linkedin, 
                  href: 'https://www.linkedin.com/company/bitpoly/',
                  label: 'LinkedIn'
                },
              ].map(({ icon: Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-careermap-navy border border-slate-700 hover:border-teal-500 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 group"
                >
                  <Icon size={18} className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Mission & Help */}
          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
              <HelpCircle size={16} className="text-teal-400" />
              Support
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Mission or purpose', view: 'mission' },
                { label: 'FAQ', view: 'faq' },
                { label: 'User Guide', view: 'user-guide' },
              ].map(({ label, view }) => (
                <li key={label}>
                  <span
                    onClick={() => onNavigate(view as any)}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors relative group inline-block text-left cursor-pointer"
                  >
                    {label}
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-teal-400 group-hover:w-full transition-all duration-300" />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
              <Phone size={16} className="text-teal-400" />
              Contact
            </h4>
            <ul className="space-y-4">
              {[
                { icon: Mail,   text: 'polybit1955@gmail.com', href: 'mailto:polybit1955@gmail.com' },
                { icon: Phone,  text: '+251 58 222 1953', href: 'tel:+251582221953' },
                { icon: MapPin, text: 'Bahir Dar Institute of Technology (BiT)', href: 'https://maps.app.goo.gl/4wbGiqMXaEdfGWCJ9?g_st=aw' },
              ].map(({ icon: Icon, text, href }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-slate-400 hover:text-slate-300 transition-colors">
                  <Icon size={16} className="text-teal-400 shrink-0 mt-0.5" />
                  <a 
                    href={href} 
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="hover:underline"
                  >
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Information */}
          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={16} className="text-teal-400" />
              Legal
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Privacy Policy', view: 'privacy' },
                { label: 'Terms of Service', view: 'terms' },
              ].map(({ label, view }) => (
                <li key={label}>
                  <span
                    onClick={() => onNavigate(view as any)}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors relative group inline-block text-left cursor-pointer"
                  >
                    {label}
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-teal-400 group-hover:w-full transition-all duration-300" />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} Bahir Dar University — CareerGuide. All Rights Reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-teal-400 border border-slate-700 hover:border-teal-500 px-5 py-3 rounded-xl transition-all active:scale-95 bg-slate-800/50"
          >
            <ArrowUp size={14} /> Back to Top
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
