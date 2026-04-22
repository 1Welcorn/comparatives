import { motion, AnimatePresence } from 'motion/react';
import { User, Bot, Swords, Zap } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface Props {
  playerHealth: number;
  enemyHealth: number;
  isAttacking: boolean;
  attackTarget: 'player' | 'enemy' | null;
  language: 'en' | 'pt';
  p1Score: number;
  p2Score: number;
  activePlayer?: 'p1' | 'p2';
}

export default function BattleScene({ 
  playerHealth, 
  enemyHealth, 
  isAttacking, 
  attackTarget, 
  language, 
  p1Score, 
  p2Score,
  activePlayer 
}: Props) {
  const p1Pulse = activePlayer === 'p1' ? {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 30px 60px rgba(0,0,0,0.5)',
      '0 0 80px rgba(255,204,0,0.4)',
      '0 30px 60px rgba(0,0,0,0.5)'
    ]
  } : {};

  const p2Pulse = activePlayer === 'p2' ? {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 30px 60px rgba(0,0,0,0.5)',
      '0 0 80px rgba(255,51,102,0.4)',
      '0 30px 60px rgba(0,0,0,0.5)'
    ]
  } : {};

  return (
    <div className="relative w-full h-[40vh] md:h-[50vh] flex items-center justify-between px-12 overflow-hidden rounded-[3rem] bg-[#1E1E1E] border-8 border-white/10 shadow-2xl">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-12 h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-white/20 h-full" />
          ))}
        </div>
      </div>

      {/* Player 1 Section */}
      <div className="flex items-center gap-12 relative z-10">
        <div className="flex flex-col items-center gap-8 px-4">
          <motion.div
            animate={attackTarget === 'player' ? {
              x: [0, -20, 20, -20, 20, 0],
              backgroundColor: ['#1E1E1E', '#FF3366', '#1E1E1E'],
              scale: [1, 1.2, 1]
            } : p1Pulse}
            transition={activePlayer === 'p1' && !attackTarget ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            } : { duration: 0.5 }}
            className="w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] bg-[#FFCC00] flex items-center justify-center border-8 border-black relative shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
          >
            <User size={120} className="text-black" strokeWidth={3} />
            <AnimatePresence>
              {isAttacking && attackTarget === 'enemy' && (
                <motion.div
                  initial={{ x: 40, scale: 0 }}
                  animate={{ x: 200, scale: 3, rotate: 45 }}
                  exit={{ x: 300, opacity: 0 }}
                  className="absolute text-[#FFCC00]"
                >
                  <Zap size={60} fill="currentColor" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <div className="w-full max-w-md">
            <ProgressBar
              current={playerHealth}
              max={100}
              color="bg-[#FFCC00]"
              label="PLAYER 1"
            />
          </div>
        </div>

        {/* Score Right of Player 1 */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-black text-white/40 uppercase mb-2">Points</span>
          <div className="text-6xl font-black text-[#FFCC00] tabular-nums">{p1Score}</div>
        </div>
      </div>

      <div className="h-24 w-[2px] bg-white/10 hidden md:block" />

      {/* Player 2 Section */}
      <div className="flex items-center gap-12 relative z-10 flex-row-reverse">
        <div className="flex flex-col items-center gap-8 px-4">
          <motion.div
            animate={attackTarget === 'enemy' ? {
              x: [0, -20, 20, -20, 20, 0],
              backgroundColor: ['#1E1E1E', '#FF3366', '#1E1E1E'],
              scale: [1, 1.2, 1]
            } : p2Pulse}
            transition={activePlayer === 'p2' && !attackTarget ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            } : { duration: 0.5 }}
            className="w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] bg-[#FF3366] flex items-center justify-center border-8 border-white relative shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
          >
            <Bot size={120} className="text-white" strokeWidth={3} />
            <AnimatePresence>
              {isAttacking && attackTarget === 'player' && (
                <motion.div
                  initial={{ x: -40, scale: 0 }}
                  animate={{ x: -200, scale: 3, rotate: -45 }}
                  exit={{ x: -300, opacity: 0 }}
                  className="absolute text-[#FF3366]"
                >
                  <Zap size={60} fill="currentColor" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <div className="w-full max-w-md">
            <ProgressBar
              current={enemyHealth}
              max={100}
              color="bg-[#FF3366]"
              label="PLAYER 2"
            />
          </div>
        </div>

        {/* Score Left of Player 2 */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-black text-white/40 uppercase mb-2">Points</span>
          <div className="text-6xl font-black text-[#FF3366] tabular-nums">{p2Score}</div>
        </div>
      </div>
    </div>
  );
}
