import { motion } from 'motion/react';

interface Props {
  language: 'en' | 'pt';
  onToggle: () => void;
}

export default function LanguageToggle({ language, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-medium tracking-tight overflow-hidden relative group"
    >
      <div className="flex items-center gap-2 relative z-10">
        <span className={language === 'en' ? 'text-white' : 'text-white/40'}>EN</span>
        <div className="w-[1px] h-3 bg-white/20" />
        <span className={language === 'pt' ? 'text-white' : 'text-white/40'}>PT</span>
      </div>
      <motion.div
        layoutId="toggle"
        className="absolute inset-0 bg-blue-500/20"
        animate={{
          x: language === 'en' ? '-50%' : '50%'
        }}
      />
    </button>
  );
}
