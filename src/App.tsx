/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Play, BookOpen, Crown, Zap, Globe2 } from 'lucide-react';
import { GameState, Language } from './types';
import { UI_DATA, QUESTIONS, RULES } from './constants';
import BattleScene from './components/BattleScene';
import QuestionCard from './components/QuestionCard';
import LanguageToggle from './components/LanguageToggle';

export default function App() {
  const INITIAL_STATE: GameState = {
    p1Score: 0,
    p2Score: 0,
    level: 1,
    health: 100,
    enemyHealth: 100,
    streak: 0,
    currentQuestionIndex: 0,
    status: 'start',
  };

  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [language, setLanguage] = useState<Language>('pt');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackTarget, setAttackTarget] = useState<'player' | 'enemy' | null>(null);

  const [maximizedRuleIndex, setMaximizedRuleIndex] = useState<number | null>(null);
  const [isObjectiveMaximized, setIsObjectiveMaximized] = useState(false);

  const t = UI_DATA[language];

  const handleStart = () => {
    setState({ ...INITIAL_STATE, status: 'playing' });
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsObjectiveMaximized(false);
  };

  const handleAnswer = useCallback((option: string) => {
    if (showFeedback) return;

    setSelectedAnswer(option);
    setShowFeedback(true);
    
    const currentQuestion = QUESTIONS[state.currentQuestionIndex];
    const correct = option === currentQuestion.correctAnswer;

    setIsAttacking(true);
    setAttackTarget(correct ? 'enemy' : 'player');

    setTimeout(() => {
      setIsAttacking(false);
      setAttackTarget(null);
      
      setState(prev => {
        const nextHealth = correct ? prev.health : Math.max(0, prev.health - 25);
        const nextEnemyHealth = correct ? Math.max(0, prev.enemyHealth - 25) : prev.enemyHealth;
        
        // P1 Scores +2 on correct, -1 on wrong
        // P2 Scores +2 only when P1 gets it wrong
        const nextP1Score = Math.max(0, correct ? prev.p1Score + 2 : prev.p1Score - 1);
        const nextP2Score = correct ? prev.p2Score : prev.p2Score + 2;
        
        const nextStreak = correct ? prev.streak + 1 : 0;

        if (nextHealth <= 0) {
          return { ...prev, health: 0, status: 'gameover' };
        }
        if (nextEnemyHealth <= 0) {
          return { ...prev, enemyHealth: 0, p1Score: nextP1Score, p2Score: nextP2Score, status: 'victory' };
        }

        return {
          ...prev,
          health: nextHealth,
          enemyHealth: nextEnemyHealth,
          p1Score: nextP1Score,
          p2Score: nextP2Score,
          streak: nextStreak,
        };
      });
    }, 1000);
  }, [state, showFeedback]);

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setState(prev => ({
      ...prev,
      currentQuestionIndex: (prev.currentQuestionIndex + 1) % QUESTIONS.length,
    }));
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-[#FFCC00]/30 selection:text-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 border-b-4 border-[#FFCC00] bg-[#121212]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFCC00]">Missão 01</span>
              <h1 className="text-xl font-black uppercase tracking-tight">{t.title}</h1>
            </div>
          </div>
          <LanguageToggle language={language} onToggle={() => setLanguage(l => l === 'en' ? 'pt' : 'en')} />
        </div>
      </header>

      <main className={`pt-24 pb-12 px-4 ${state.status === 'playing' ? 'max-w-[1600px]' : 'max-w-4xl'} mx-auto transition-all duration-700`}>
        <AnimatePresence mode="wait">
          {state.status === 'lesson' && (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">{language === 'pt' ? 'Resumo das Regras' : 'Rules Summary'}</h2>
                <button onClick={() => setState(s => ({ ...s, status: 'start' }))} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                   {language === 'pt' ? 'Voltar' : 'Back'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {RULES[language].map((rule, i) => (
                  <motion.div 
                    key={i} 
                    layoutId={`rule-${i}`}
                    whileHover={{ scale: 1.1, zIndex: 50 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMaximizedRuleIndex(i)}
                    className="p-8 rounded-3xl bg-[#1E1E1E] border-4 border-white/10 hover:border-[#FFCC00] transition-colors group cursor-pointer shadow-2xl"
                  >
                    <h3 className="text-2xl font-black uppercase text-[#FFCC00] mb-4 tracking-tight">{rule.title}</h3>
                    <p className="text-xl font-medium text-white/90 mb-6 leading-tight">{rule.rule}</p>
                    <div className="p-4 bg-black/60 rounded-2xl font-black text-lg border-2 border-white/5 text-white/40 group-hover:text-[#FFCC00] transition-colors">
                      <span className="text-[10px] uppercase block mb-1 tracking-widest">Example:</span>
                      {rule.example}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Full-Screen Rule Modal */}
              <AnimatePresence>
                {maximizedRuleIndex !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-[#121212] flex flex-col items-center justify-center p-12 text-center"
                    onClick={() => setMaximizedRuleIndex(null)}
                  >
                    <motion.div
                      layoutId={`rule-${maximizedRuleIndex}`}
                      className="max-w-6xl w-full max-h-full overflow-y-auto custom-scrollbar flex flex-col justify-center py-12"
                    >
                      <span className="text-sm md:text-xl font-black uppercase tracking-[0.4em] text-[#FFCC00] mb-6 block opacity-50">
                        {language === 'pt' ? 'FOCO NA REGRA' : 'RULE FOCUS'}
                      </span>
                      <h2 className="text-4xl md:text-7xl lg:text-8xl font-black uppercase text-[#FFCC00] leading-[1.1] mb-8 tracking-tighter break-words">
                        {RULES[language][maximizedRuleIndex].title}
                      </h2>
                      <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-12 leading-snug max-w-4xl mx-auto">
                        {RULES[language][maximizedRuleIndex].rule}
                      </p>
                      <div className="p-8 md:p-12 lg:p-16 bg-white/5 border-4 border-[#FFCC00] rounded-3xl relative overflow-hidden mx-auto w-full">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                           <Zap size={160} fill="currentColor" className="text-[#FFCC00]" />
                        </div>
                        <span className="text-xs md:text-base uppercase block mb-4 tracking-[0.5em] text-white/40">EXAMPLE:</span>
                        <p className="text-3xl md:text-6xl lg:text-7xl font-black text-[#FFCC00] tracking-tight relative z-10 break-words">
                          {RULES[language][maximizedRuleIndex].example}
                        </p>
                      </div>
                      
                      <button 
                        className="mt-12 text-sm md:text-lg font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                      >
                        {language === 'pt' ? 'Clique em qualquer lugar para sair' : 'Tap anywhere to exit'}
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

               <button
                  onClick={handleStart}
                  className="mt-8 flex items-center justify-center gap-3 bg-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-500 transition-all mx-auto"
                >
                  <Play size={20} fill="currentColor" />
                  {t.startBtn}
                </button>
            </motion.div>
          )}

          {state.status === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`text-center py-12 flex flex-col items-center gap-8 ${isObjectiveMaximized ? 'justify-center min-h-screen' : ''}`}
            >
              {!isObjectiveMaximized && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 p-1 relative z-10">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center p-8 overflow-hidden">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 opacity-10 border-2 border-dashed border-white rounded-full"
                        />
                        <Globe2 size={80} className="text-blue-500 relative z-20" />
                    </div>
                  </div>
                </div>
              )}

              <div className={`flex flex-col items-center ${isObjectiveMaximized ? 'w-full' : 'max-w-2xl'}`}>
                {!isObjectiveMaximized && (
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">
                    COMPARE & <span className="text-blue-500">CONQUER</span>
                  </h2>
                )}
                
                <motion.div
                  layout
                  onClick={() => setIsObjectiveMaximized(!isObjectiveMaximized)}
                  className={`cursor-pointer transition-all duration-500 relative group
                    ${isObjectiveMaximized 
                      ? 'fixed inset-0 z-[200] bg-[#121212] flex flex-col items-center justify-center p-8' 
                      : 'p-8 rounded-[2rem] bg-[#1E1E1E] border-4 border-white/5 hover:border-[#FFCC00] shadow-2xl relative mb-8 w-full max-w-2xl'
                    }`}
                >
                  {isObjectiveMaximized ? (
                    <div className="absolute top-8 right-8 flex items-center gap-2 text-[#FFCC00] font-black uppercase tracking-widest text-lg md:text-2xl hover:scale-110 transition-transform">
                      <span>{language === 'pt' ? 'Clique para fechar' : 'Click to close'}</span>
                      <RotateCcw size={40} className="rotate-45" />
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Zap size={24} className="text-[#FFCC00]" />
                    </div>
                  )}

                  <div className={`flex flex-col items-center ${isObjectiveMaximized ? 'w-full max-w-[90vw] px-4' : 'w-full'}`}>
                    <span className={`${isObjectiveMaximized ? 'text-lg md:text-3xl lg:text-4xl font-black' : 'text-[10px]'} font-black uppercase tracking-[0.4em] text-[#FFCC00] mb-8 md:mb-16 block text-center opacity-60`}>
                      {language === 'pt' ? 'OBJETIVO DA SESSÃO' : 'SESSION OBJECTIVE'}
                    </span>
                    
                    <p className={`${isObjectiveMaximized ? 'text-2xl md:text-4xl lg:text-[3.5vw] leading-[1.2] text-center' : 'text-lg leading-relaxed text-center'} text-white font-black transition-all duration-500 tracking-tight w-full max-w-none`}>
                      {t.onboardingText}
                    </p>
                  </div>

                  {!isObjectiveMaximized && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-[#FFCC00] font-black uppercase tracking-widest text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">
                      <span>{language === 'pt' ? 'Clique para ampliar' : 'Click to expand'}</span>
                    </div>
                  )}
                </motion.div>

                {!isObjectiveMaximized && (
                  <div className="flex flex-col sm:flex-row gap-6 justify-center mt-4 w-full">
                    <button
                      onClick={handleStart}
                      className="flex items-center justify-center gap-4 bg-[#FFCC00] text-[#121212] px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all group border-b-8 border-black/20"
                    >
                      <Play size={24} fill="currentColor" />
                      {t.startBtn}
                    </button>
                    <button 
                      onClick={() => setState(s => ({ ...s, status: 'lesson' }))}
                      className="flex items-center justify-center gap-4 bg-[#1E1E1E] border-4 border-white/10 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:border-[#FFCC00] hover:text-[#FFCC00] transition-all"
                    >
                      <BookOpen size={24} />
                      {language === 'pt' ? 'Resumo de Regras' : 'Rules Summary'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {state.status === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-12 w-full"
            >
              <BattleScene
                playerHealth={state.health}
                enemyHealth={state.enemyHealth}
                isAttacking={isAttacking}
                attackTarget={attackTarget}
                language={language}
                p1Score={state.p1Score}
                p2Score={state.p2Score}
                activePlayer={!showFeedback ? 'p1' : (selectedAnswer === QUESTIONS[state.currentQuestionIndex].correctAnswer ? 'p1' : 'p2')}
              />
              
              <QuestionCard
                question={QUESTIONS[state.currentQuestionIndex]}
                selectedAnswer={selectedAnswer}
                showFeedback={showFeedback}
                onSelect={handleAnswer}
                language={language}
              />

              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center mt-6"
                >
                  <button
                    onClick={nextQuestion}
                    className="flex items-center justify-center gap-4 bg-[#FFCC00] text-[#121212] px-16 py-8 rounded-full font-black uppercase tracking-[0.2em] text-2xl hover:scale-105 transition-all shadow-[0_20px_50px_rgba(255,204,0,0.3)] group"
                  >
                    {t.next}
                    <Zap size={32} fill="currentColor" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {(state.status === 'gameover' || state.status === 'victory') && (
            <motion.div
              key="end"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 flex flex-col items-center gap-8"
            >
              <div className={`p-8 rounded-full ${state.status === 'victory' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>
                {state.status === 'victory' ? <Crown size={120} /> : <RotateCcw size={120} />}
              </div>
              <div>
                <h2 className="text-6xl font-black mb-2 uppercase italic tracking-tighter">
                  {state.status === 'victory' ? t.victoryTitle : t.gameoverTitle}
                </h2>
                <p className="text-white/40 font-mono tracking-widest uppercase mb-12">
                  Player 1 Score: {state.p1Score}
                </p>
                <button
                  onClick={handleStart}
                  className="flex items-center justify-center gap-3 bg-white text-black px-12 py-5 rounded-full font-bold hover:bg-blue-400 transition-all active:scale-95 mx-auto"
                >
                  <RotateCcw size={20} />
                  {t.playAgain}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_bottom_right,#1e293b,transparent)]" />
    </div>
  );
}

