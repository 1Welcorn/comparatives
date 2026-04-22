import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

interface Props {
  current: number;
  max: number;
  color: string;
  label: string;
}

export default function ProgressBar({ current, max, color, label }: Props) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#FFCC00]">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden p-[2px]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full rounded-full ${color === 'bg-blue-500' ? 'bg-[#FFCC00]' : 'bg-[#FF3366]'}`}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
        />
      </div>
    </div>
  );
}
