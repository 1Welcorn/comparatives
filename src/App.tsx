/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Play, BookOpen, Crown, Zap, Globe2, User, Bot, Home, ArrowLeft, Swords } from 'lucide-react';
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
    p2Errors: 0,
    currentQuestionIndex: 0,
    shuffledQuestionIndices: QUESTIONS.map((_, i) => i), // initial unshuffled sequence
    status: 'start',
    turnPhase: 'intro',
    activePlayer: 'p1',
    questionsPlayed: 0,
    isTiebreaker: false,
    showTiebreakerAnnounce: false,
    winner: null,
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
    // Generate a new shuffled array for the match
    const indices = QUESTIONS.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
  
    setState({ 
      ...INITIAL_STATE, 
      shuffledQuestionIndices: indices,
      status: 'playing', 
      turnPhase: 'intro', 
      activePlayer: 'p1' 
    });
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsObjectiveMaximized(false);
  };

  const startTurn = () => {
    setState(prev => ({ ...prev, turnPhase: 'question' }));
  };

  const handleAnswer = useCallback((option: string) => {
    if (showFeedback) return;

    setSelectedAnswer(option);
    setShowFeedback(true);
    
    // Get the actual question from the shuffled indices array
    const realIndex = state.shuffledQuestionIndices[state.currentQuestionIndex];
    const currentQuestion = QUESTIONS[realIndex];
    const correct = option === currentQuestion.correctAnswer;

    setIsAttacking(true);
    
    // If P1 is active and correct -> hits P2 (enemy)
    // If P1 is active and fails -> P1 (player) takes hit
    // If P2 is active and correct -> hits P1 (player)
    // If P2 is active and fails -> P2 (enemy) takes hit
    
    const target = state.activePlayer === 'p1' 
      ? (correct ? 'enemy' : 'player')
      : (correct ? 'player' : 'enemy');
      
    setAttackTarget(target);

    setTimeout(() => {
      setIsAttacking(false);
      setAttackTarget(null);
      
      setState(prev => {
        const isP1 = prev.activePlayer === 'p1';
        
        let nextHealth = prev.health;
        let nextEnemyHealth = prev.enemyHealth;
        let nextP1Score = prev.p1Score;
        let nextP2Score = prev.p2Score;
        let nextP2Errors = prev.p2Errors;

        if (isP1) {
          if (correct) {
            nextEnemyHealth = Math.max(0, prev.enemyHealth - 25);
            nextP1Score += 2;
          } else {
            nextHealth = Math.max(0, prev.health - 25);
            nextP1Score = Math.max(0, prev.p1Score - 1);
          }
        } else {
          // Player 2's turn
          if (correct) {
            nextHealth = Math.max(0, prev.health - 25);
            nextP2Score += 2;
          } else {
            nextEnemyHealth = Math.max(0, prev.enemyHealth - 25);
            nextP2Score = Math.max(0, prev.p2Score - 1);
            nextP2Errors += 1;
          }
        }
        
        const nextStreak = correct ? prev.streak + 1 : 0;

        return {
          ...prev,
          health: nextHealth,
          enemyHealth: nextEnemyHealth,
          p1Score: nextP1Score,
          p2Score: nextP2Score,
          streak: nextStreak,
          p2Errors: nextP2Errors,
        };
      });
    }, 1000);
  }, [state.currentQuestionIndex, showFeedback]);

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setState(prev => {
      const nextQuestionsPlayed = prev.questionsPlayed + 1;
      
      let nextStatus = prev.status;
      let nextIsTiebreaker = prev.isTiebreaker;
      let nextWinner = prev.winner;
      let nextShowTiebreakerAnnounce = prev.showTiebreakerAnnounce;
      
      if (!prev.isTiebreaker && nextQuestionsPlayed === 10) {
        if (prev.p1Score !== prev.p2Score) {
          nextStatus = 'victory';
          nextWinner = prev.p1Score > prev.p2Score ? 'p1' : 'p2';
        } else {
          nextIsTiebreaker = true;
          nextShowTiebreakerAnnounce = true;
        }
      } else if (prev.isTiebreaker && nextQuestionsPlayed >= 16) {
        // max tiebreakers used (3 more for each side -> 6 questions total -> 16 questions)
        nextStatus = 'victory';
        if (prev.p1Score > prev.p2Score) nextWinner = 'p1';
        else if (prev.p2Score > prev.p1Score) nextWinner = 'p2';
        else nextWinner = 'tie';
      }

      if (nextStatus === 'victory') {
         return {
           ...prev,
           questionsPlayed: nextQuestionsPlayed,
           isTiebreaker: nextIsTiebreaker,
           status: nextStatus,
           winner: nextWinner
         }
      }

      return {
        ...prev,
        questionsPlayed: nextQuestionsPlayed,
        isTiebreaker: nextIsTiebreaker,
        showTiebreakerAnnounce: nextShowTiebreakerAnnounce,
        turnPhase: 'intro',
        activePlayer: prev.activePlayer === 'p1' ? 'p2' : 'p1',
        currentQuestionIndex: (prev.currentQuestionIndex + 1) % QUESTIONS.length,
      };
    });
  };

  const closeTiebreakerAnnounce = () => {
    setState(prev => ({ ...prev, showTiebreakerAnnounce: false }));
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-[#FFCC00]/30 selection:text-black">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-[100] p-6 border-b-4 border-[#FFCC00] bg-[#121212] transition-transform duration-500 ${isObjectiveMaximized || state.status === 'playing' ? '-translate-y-full' : ''}`}>
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

      <main className={`${(isObjectiveMaximized || state.status === 'playing') ? 'pt-0' : 'pt-24'} pb-12 px-4 ${isObjectiveMaximized ? 'max-w-none' : (state.status === 'playing' ? 'max-w-none' : 'max-w-4xl')} mx-auto transition-all duration-700`}>
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
                <div className="flex gap-4">
                   <button 
                      onClick={() => setState(s => ({ ...s, status: 'start' }))} 
                      className="p-3 bg-white/5 border-2 border-white/10 rounded-xl text-[#FFCC00] hover:bg-white/10 transition-colors"
                    >
                      <ArrowLeft size={24} />
                    </button>
                    <button 
                      onClick={() => setState(s => ({ ...s, status: 'start' }))} 
                      className="p-3 bg-white/5 border-2 border-white/10 rounded-xl text-[#FFCC00] hover:bg-white/10 transition-colors"
                    >
                      <Home size={24} />
                    </button>
                </div>
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
                      {/* Floating Navigation Icons */}
                      <div className="fixed top-8 right-8 z-[200] flex items-center gap-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); setMaximizedRuleIndex(null); }}
                          className="p-4 bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-2xl text-[#FFCC00] hover:bg-white/10 transition-colors shadow-2xl"
                        >
                          <ArrowLeft size={32} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); setMaximizedRuleIndex(null); setState(s => ({ ...s, status: 'start' })); }}
                          className="p-4 bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-2xl text-[#FFCC00] hover:bg-white/10 transition-colors shadow-2xl"
                        >
                          <Home size={32} />
                        </motion.button>
                      </div>

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
                        <div className="text-3xl md:text-5xl lg:text-7xl font-black text-[#FFCC00] tracking-tight relative z-10 flex flex-col items-center">
                          {RULES[language][maximizedRuleIndex].example.includes(' -> ') ? (
                            <div className="text-left">
                              {(() => {
                                const parts = RULES[language][maximizedRuleIndex].example.split(' -> ');
                                if (parts.length === 3) {
                                  return (
                                    <div className="grid grid-cols-[auto_auto_auto] gap-x-6 md:gap-x-12 gap-y-4 md:gap-y-8 items-center">
                                      <span className="opacity-30">{parts[0]}</span>
                                      <span className="opacity-20 text-white">→</span>
                                      <span className="text-[#FFCC00]">{parts[1]}</span>
                                      
                                      <span /> {/* Empty cell below the base word */}
                                      <span className="opacity-20 text-white">→</span>
                                      <span className="text-[#FFCC00]">{parts[2]}</span>
                                    </div>
                                  );
                                }
                                return RULES[language][maximizedRuleIndex].example;
                              })()}
                            </div>
                          ) : (
                            <p className="break-words">
                              {RULES[language][maximizedRuleIndex].example}
                            </p>
                          )}
                        </div>
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
                  <div className="absolute inset-0 bg-[#FFCC00] blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-[#FFCC00] to-yellow-400 p-1 relative z-10">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://i.ibb.co/M5BFjJVj/Gemini-Generated-Image-pegvmmpegvmmpegv.png" 
                          alt="Will Apps" 
                          className="w-full h-full object-cover rounded-full relative z-20"
                          referrerPolicy="no-referrer"
                        />
                    </div>
                  </div>
                </div>
              )}

              <div className={`flex flex-col items-center ${isObjectiveMaximized ? 'w-full' : 'max-w-4xl'}`}>
                {!isObjectiveMaximized && (
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 whitespace-nowrap flex items-center gap-4">
                    COMPARE <span className="text-white/20">&</span> <span className="text-blue-500">CONQUER</span>
                  </h2>
                )}
                
                <motion.div
                  layout
                  onClick={() => setIsObjectiveMaximized(!isObjectiveMaximized)}
                  className={`cursor-pointer transition-all duration-500 relative group
                    ${isObjectiveMaximized 
                      ? 'fixed inset-0 z-[200] bg-[#121212] flex flex-col items-center justify-center p-4 md:p-8' 
                      : 'p-8 rounded-[2rem] bg-[#1E1E1E] border-4 border-white/5 hover:border-[#FFCC00] shadow-2xl relative mb-8 w-full max-w-2xl'
                    }`}
                >
                  {isObjectiveMaximized ? (
                    <div className="fixed top-8 right-8 flex items-center gap-4 z-[210]">
                       <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); setIsObjectiveMaximized(false); }}
                          className="p-4 bg-black/40 backdrop-blur-xl border-2 border-white/10 rounded-2xl text-[#FFCC00] hover:bg-white/10 transition-colors shadow-2xl"
                        >
                          <ArrowLeft size={32} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); setIsObjectiveMaximized(false); }}
                          className="p-4 bg-black/40 backdrop-blur-xl border-2 border-white/10 rounded-2xl text-[#FFCC00] hover:bg-white/10 transition-colors shadow-2xl"
                        >
                          <Home size={32} />
                        </motion.button>
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Zap size={24} className="text-[#FFCC00]" />
                    </div>
                  )}

                  <div className={`flex flex-col items-center w-full ${isObjectiveMaximized ? 'max-w-[95vw]' : ''}`}>
                    <span className={`${isObjectiveMaximized ? 'text-xl md:text-4xl font-black' : 'text-[10px]'} font-black uppercase tracking-[0.4em] text-[#FFCC00] mb-12 block text-center opacity-70`}>
                      {language === 'pt' ? 'OBJETIVO DA AULA' : 'CLASS OBJECTIVE'}
                    </span>
                    
                    <p className={`${isObjectiveMaximized ? 'text-2xl md:text-4xl lg:text-[4.5vw] leading-[1.2] text-center' : 'text-lg leading-relaxed text-center'} text-white font-black transition-all duration-500 tracking-tight w-full`}>
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
              <AnimatePresence>
                {state.showTiebreakerAnnounce && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none animate-pulse">
                      <div className="w-[150vw] h-[150vw] bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#FF3366] via-black to-transparent rounded-full" />
                    </div>
                    <motion.div 
                      className="relative z-10 flex flex-col items-center"
                      initial={{ y: 50 }}
                      animate={{ y: 0 }}
                      transition={{ type: "spring", bounce: 0.6 }}
                    >
                      <Swords size={120} className="text-[#FFCC00] mb-8 animate-bounce" />
                      <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                        {language === 'pt' ? 'EMPATE!' : 'DRAW!'}
                      </h2>
                      <p className="text-2xl md:text-4xl text-[#FFCC00] font-black uppercase tracking-widest mb-12">
                        {language === 'pt' ? 'MORTE SÚBITA' : 'SUDDEN DEATH'}
                      </p>
                      <p className="text-xl md:text-2xl text-white/70 font-bold max-w-2xl mx-auto mb-16">
                        {language === 'pt' 
                          ? 'Muralha! Estão empatados. Iremos para 3 rodadas de desempate.' 
                          : 'You are tied. We are entering 3 tiebreaker rounds.'}
                      </p>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={closeTiebreakerAnnounce}
                        className="bg-[#FFCC00] text-black px-12 py-6 rounded-full font-black uppercase tracking-widest text-2xl shadow-[0_20px_50px_rgba(255,204,0,0.4)] hover:bg-white transition-colors"
                      >
                        {language === 'pt' ? 'VAMOS AO DESEMPATE' : 'START TIEBREAKER'}
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {state.turnPhase === 'intro' ? (
                <div className="flex flex-col items-center gap-12">
                   <div className="text-center">
                      <span className="text-sm font-black uppercase tracking-[0.4em] text-[#FFCC00] mb-4 block opacity-60">
                        {language === 'pt' ? 'VEZ DO JOGADOR' : 'PLAYER TURN'}
                      </span>
                   </div>
                   
                   <BattleScene
                    playerHealth={state.health}
                    enemyHealth={state.enemyHealth}
                    isAttacking={isAttacking}
                    attackTarget={attackTarget}
                    language={language}
                    p1Score={state.p1Score}
                    p2Score={state.p2Score}
                    activePlayer={state.activePlayer} 
                    isFullPage={true}
                  />

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startTurn}
                    className="bg-[#FFCC00] text-[#121212] px-10 py-5 rounded-full font-black uppercase tracking-tight text-xl shadow-[0_15px_40px_rgba(255,204,0,0.3)] mt-8"
                  >
                    {language === 'pt' ? 'COMEÇAR DESAFIO' : 'START CHALLENGE'}
                  </motion.button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 w-full mx-auto px-[2.5vw]">
                    {/* Minimal Score Bar for reference */}
                    {!showFeedback && (
                      <div className="flex justify-between items-center w-full px-8 py-4 bg-white/5 rounded-[2rem] border-4 border-white/10 shadow-xl relative overflow-hidden">
                        <div className={`flex items-center gap-6 p-3 rounded-2xl transition-all duration-500 ${state.activePlayer === 'p1' ? 'bg-[#FFCC00]/20 ring-4 ring-[#FFCC00] scale-110' : 'opacity-40'}`}>
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-[#FFCC00] flex items-center justify-center">
                            <User className="text-black" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">Player 1</span>
                            <span className="text-4xl font-black text-[#FFCC00]">{state.p1Score}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center flex-1">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key="zap-icon"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <Zap className="text-[#FFCC00] animate-pulse" size={32} />
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        <div className={`flex items-center gap-6 text-right p-3 rounded-2xl transition-all duration-500 ${state.activePlayer === 'p2' ? 'bg-[#FF3366]/20 ring-4 ring-[#FF3366] scale-110' : 'opacity-40'}`}>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">Player 2</span>
                            <span className="text-4xl font-black text-[#FF3366]">{state.p2Score}</span>
                          </div>
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-[#FF3366] flex items-center justify-center">
                            <Bot className="text-white" />
                          </div>
                        </div>
                      </div>
                    )}

                    <AnimatePresence>
                      {showFeedback && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: -20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -20 }}
                          className={`w-full p-6 md:p-8 rounded-[2.5rem] border-[4px] backdrop-blur-3xl text-center shadow-[0_30px_100px_rgba(0,0,0,0.5)] z-30 flex flex-col md:flex-row items-center justify-between gap-6 ${
                            selectedAnswer === QUESTIONS[state.shuffledQuestionIndices[state.currentQuestionIndex]].correctAnswer 
                              ? 'bg-[#FFCC00] text-black border-white/20' 
                              : 'bg-[#FF3366] text-white border-white/20'
                          }`}
                        >
                          <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            {selectedAnswer === QUESTIONS[state.shuffledQuestionIndices[state.currentQuestionIndex]].correctAnswer ? (
                              <>
                                <div className="flex items-center gap-4 mb-1">
                                  <Zap fill="currentColor" size={24} />
                                  <p className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                                    {language === 'pt' ? 'MANDOU MUITO BEM!' : 'GREAT JOB!'}
                                  </p>
                                </div>
                                <p className="text-lg md:text-xl font-bold opacity-80">
                                  {language === 'pt' ? 'Você ganhou 2 pontos e atacou com sucesso!' : 'You earned 2 points and attacked successfully!'}
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-4 mb-1">
                                  <RotateCcw size={24} />
                                  <p className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                                    {state.activePlayer === 'p2' && state.p2Errors >= 2 
                                      ? (language === 'pt' ? 'Meu Deus, errou de novo!!' : 'My God, missed again!!')
                                      : (language === 'pt' ? 'FOI QUASE LÁ!' : 'ALMOST THERE!')}
                                  </p>
                                </div>
                                <p className="text-lg md:text-xl font-bold opacity-80">
                                  {language === 'pt' ? 'Perdeu 1 ponto. Mais sorte na próxima!' : 'Lost 1 point. Better luck next time!'}
                                </p>
                              </>
                            )}
                          </div>

                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={nextQuestion}
                            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-tight text-lg transition-all shadow-xl group z-40 ${
                              selectedAnswer === QUESTIONS[state.shuffledQuestionIndices[state.currentQuestionIndex]].correctAnswer
                                ? 'bg-black text-[#FFCC00] hover:scale-105'
                                : 'bg-white text-[#FF3366] hover:scale-105'
                            }`}
                          >
                            {t.next}
                            <Zap size={20} fill="currentColor" />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                   <div className="w-full">
                     <QuestionCard
                      question={QUESTIONS[state.shuffledQuestionIndices[state.currentQuestionIndex]]}
                      selectedAnswer={selectedAnswer}
                      showFeedback={showFeedback}
                      onSelect={handleAnswer}
                      language={language}
                    />
                  </div>

                  {/* Floating Game Navigation */}
                  <div className="fixed top-8 right-8 z-[50] flex gap-4">
                    <button 
                        onClick={() => setState(s => ({ ...s, status: 'start' }))} 
                        className="p-4 bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-2xl text-[#FFCC00] hover:bg-white/10 transition-colors shadow-2xl"
                        title={language === 'pt' ? 'Sair do Jogo' : 'Exit Game'}
                      >
                        <Home size={24} />
                      </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {state.status === 'victory' && (
            <motion.div
              key="end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[200] bg-[#121212] flex flex-col items-center justify-center p-8 overflow-hidden"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none animate-spin-slow">
                <div className="w-[150vw] h-[150vw] bg-[conic-gradient(var(--tw-gradient-stops))] from-transparent via-[#FFCC00] to-transparent rounded-full" />
              </div>

              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5, duration: 1 }}
                className="relative z-10 flex flex-col items-center"
              >
                <div className={`p-4 rounded-full border-8 shadow-[0_0_150px_rgba(255,204,0,0.5)] mb-8 ${state.winner === 'p1' ? 'bg-[#FFCC00] border-[#FFCC00]' : state.winner === 'p2' ? 'bg-[#FF3366] border-[#FF3366]' : 'bg-gray-500 border-gray-500'}`}>
                  <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden">
                    <img 
                      src="https://i.ibb.co/M5BFjJVj/Gemini-Generated-Image-pegvmmpegvmmpegv.png" 
                      alt="Will Apps Victory" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div className="text-center relative z-10">
                  <span className="text-2xl font-black text-[#FFCC00] tracking-[0.5em] uppercase mb-4 block">
                    {language === 'pt' ? 'Fim do Duelo' : 'Duel Ended'}
                  </span>
                  <h2 className="text-[10vw] md:text-8xl font-black mb-6 uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                    {state.winner === 'p1' ? (language === 'pt' ? 'Jogador 1 Venceu!' : 'Player 1 Wins!') : 
                     state.winner === 'p2' ? (language === 'pt' ? 'Jogador 2 Venceu!' : 'Player 2 Wins!') : 
                     (language === 'pt' ? 'Empate Épico!' : 'Epic Draw!')}
                  </h2>

                  <div className="flex gap-12 justify-center mb-16">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-black text-[#FFCC00]/50 uppercase tracking-widest mb-2">Player 1</span>
                      <span className="text-6xl font-black text-[#FFCC00]">{state.p1Score}</span>
                    </div>
                    <div className="text-4xl font-black text-white/20 self-center">VS</div>
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-black text-[#FF3366]/50 uppercase tracking-widest mb-2">Player 2</span>
                      <span className="text-6xl font-black text-[#FF3366]">{state.p2Score}</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStart}
                    className="flex items-center justify-center gap-4 bg-white text-black px-12 py-6 rounded-full font-black uppercase tracking-widest text-2xl hover:bg-[#FFCC00] transition-colors relative group mx-auto shadow-[0_20px_50px_rgba(255,255,255,0.2)]"
                  >
                    <RotateCcw size={28} className="group-hover:-rotate-90 transition-transform duration-500" />
                    {language === 'pt' ? 'NOVO DUELO' : 'NEW DUEL'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_bottom_right,#1e293b,transparent)]" />
    </div>
  );
}

