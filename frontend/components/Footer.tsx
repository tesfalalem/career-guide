import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram, GraduationCap, ArrowUp, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-10">

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-careermap-navy rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25">
                <GraduationCap size={22} strokeWidth={2.5} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Career<span className="text-teal-400">Guide</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Bridging the gap between BiT education and global tech careers.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { icon: Facebook,  href: '#' },
                { icon: Twitter,   href: '#' },
                { icon: Linkedin,  href: '#' },
                { icon: Instagram, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-careermap-navy border border-slate-700 hover:border-teal-500 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-250"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Contact</h4>
            <ul className="space-y-3">
              {[
                { icon: MapPin, text: 'Bahir Dar Institute of Technology, BDU' },
                { icon: Mail,   text: 'polybit1955@gmail.com' },
                { icon: Phone,  text: '(+251) 58-222-1953' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-slate-400 hover:text-slate-300 transition-colors">
                  <Icon size={15} className="text-teal-400 mt-0.5 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'BDU Website',          href: 'https://www.bdu.edu.et' },
                { label: 'BDU Mail Service',     href: '#' },
                { label: 'Main Registrar',        href: '#' },
                { label: 'EiTEX',                href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors relative group inline-block"
                  >
                    {label}
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-teal-400 group-hover:w-full transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Web Systems */}
          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Systems</h4>
            <ul className="space-y-2.5">
              {[
                'Learning Management System',
                'SIMS',
                'FTP Server',
                'BDU Journals',
                'HR Management System',
              ].map(label => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors relative group inline-block"
                  >
                    {label}
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-teal-400 group-hover:w-full transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2024 Bahir Dar University — CareerGuide. All Rights Reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-teal-400 border border-slate-700 hover:border-teal-500 px-4 py-2.5 rounded-xl transition-all"
          >
            <ArrowUp size={14} /> Back to Top
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
