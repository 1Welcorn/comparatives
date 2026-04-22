import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../types';
import { Zap, Maximize2, Minimize2 } from 'lucide-react';

interface Props {
  question: Question;
  selectedAnswer: string | null;
  showFeedback: boolean;
  onSelect: (option: string) => void;
  language: 'en' | 'pt';
}

export default function QuestionCard({ question, selectedAnswer, showFeedback, onSelect, language }: Props) {
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <div className="flex flex-col gap-12 w-full">
      {/* Sentence Display */}
      <motion.div 
        layoutId="question-box"
        onClick={() => !showFeedback && setIsMaximized(!isMaximized)}
        className={`challenge-box py-12 cursor-pointer relative group ${isMaximized ? 'fixed inset-0 z-[100] bg-[#121212] flex flex-col items-center justify-center p-8 md:p-20 overflow-y-auto' : ''}`}
      >
        {!isMaximized && (
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 size={40} className="text-[#FFCC00]" />
          </div>
        )}
        
        {isMaximized && (
          <div className="absolute top-6 right-6 md:top-12 md:right-12 z-10 flex items-center gap-2 text-[#FFCC00] font-black uppercase tracking-widest text-lg bg-black/40 p-4 md:p-6 rounded-2xl backdrop-blur-md">
            <span>{language === 'pt' ? 'Toque para fechar' : 'Tap to close'}</span>
            <Minimize2 size={40} />
          </div>
        )}

        <h2 className={`${isMaximized ? 'text-[5vh] md:text-[8vh] lg:text-[12vh]' : 'text-[4vh] md:text-[6vh] lg:text-[8vh]'} text-white text-center transition-all duration-500 font-black uppercase leading-[1.1] w-full max-w-[90vw] mx-auto break-words tracking-tighter`}>
          {question.sentence.split('___').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className={`inline-block border-b-[max(8px,1vw)] px-[2vw] text-[#FFCC00] transition-all duration-300 ${showFeedback ? (selectedAnswer === question.correctAnswer ? 'text-green-500 border-green-500' : 'text-[#FF3366] border-[#FF3366]') : 'border-white/20'}`}>
                  {selectedAnswer || '...'}
                </span>
              )}
            </span>
          ))}
        </h2>
      </motion.div>

      {/* Options Grid - Adjusted to 2 columns for long adjectives visibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {question.options.map((option) => {
          const isCorrect = option === question.correctAnswer;
          const isSelected = option === selectedAnswer;
          
          let stateClass = "border-white/10 bg-[#1E1E1E] text-white";

          if (showFeedback) {
            if (isCorrect) {
              stateClass = "bg-[#FFCC00] border-[#FFCC00] text-[#121212]";
            } else if (isSelected) {
              stateClass = "bg-[#FF3366] border-[#FF3366] text-white shadow-[0_0_80px_rgba(255,51,102,0.4)]";
            } else {
              stateClass = "border-white/5 opacity-20 bg-[#1E1E1E] text-white";
            }
          }

          return (
            <motion.button
              key={option}
              disabled={showFeedback}
              onClick={() => onSelect(option)}
              className={`flex flex-col items-center justify-center py-12 md:py-16 lg:py-20 rounded-[2.5rem] border-[8px] cursor-pointer transition-all box-border ${stateClass} shadow-2xl relative overflow-hidden group min-h-[15vh] md:min-h-[20vh]`}
              whileHover={!showFeedback ? { 
                scale: 1.05, 
                zIndex: 40,
                borderColor: '#FFCC00',
                boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
              } : {}}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter relative z-10 px-8 text-center leading-none">
                {option}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation as a badge */}
      <AnimatePresence mode="wait">
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-4 bg-white/5 border-l-4 border-[#FFCC00] p-6 rounded-r-xl"
          >
             <div className="text-[#FFCC00]">
                <Zap size={32} fill="currentColor" />
             </div>
             <div>
               <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">{language === 'pt' ? 'POR QUE?' : 'WHY?'}</p>
               <p className="text-lg font-medium leading-tight text-white/90">{question.explanation}</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
