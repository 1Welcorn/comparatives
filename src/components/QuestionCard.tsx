import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../types';
import { Zap, Maximize2, Minimize2, Home, ArrowLeft } from 'lucide-react';

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
    <div className="flex flex-col gap-6 w-full">
      {/* Sentence Display */}
      <motion.div 
        layoutId="question-box"
        onClick={() => !showFeedback && setIsMaximized(!isMaximized)}
        className={`challenge-box py-8 cursor-pointer relative group ${isMaximized ? 'fixed inset-0 z-[100] bg-[#121212] flex flex-col items-center justify-center p-8 md:p-20 overflow-y-auto' : ''}`}
      >
        {!isMaximized && (
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 size={40} className="text-[#FFCC00]" />
          </div>
        )}
        
        {isMaximized && (
          <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10 flex items-center gap-3 text-[#FFCC00] font-black uppercase tracking-widest bg-black/40 p-4 md:p-6 rounded-2xl backdrop-blur-md opacity-60 hover:opacity-100 transition-all hover:scale-110">
            <ArrowLeft size={32} />
            <Home size={40} />
          </div>
        )}

        <h2 className={`${isMaximized ? 'text-[6vh] md:text-[9vh] lg:text-[11vh]' : 'text-[5vh] md:text-[7vh] lg:text-[9vh]'} text-white text-center transition-all duration-500 font-black uppercase leading-[1] w-full max-w-[98vw] mx-auto tracking-tighter whitespace-normal md:whitespace-nowrap flex flex-wrap justify-center items-center gap-x-[1vw]`}>
          {question.sentence.split('___').map((part, i, arr) => (
            <span key={i} className="flex items-center">
              {part}
              {i < arr.length - 1 && (
                <span className={`inline-block border-b-[max(8px,1vw)] px-[2vw] text-[#FFCC00] transition-all duration-300 mx-2 ${showFeedback ? 'text-green-400 border-green-400' : 'border-white/20'}`}>
                  {showFeedback ? question.correctAnswer : (selectedAnswer || '...')}
                </span>
              )}
            </span>
          ))}
        </h2>
      </motion.div>

      {/* Options Grid - Adjusted to 2 columns for long adjectives visibility */}
      <div className={`grid grid-cols-1 md:grid-cols-2 transition-all duration-500 w-full ${showFeedback ? 'gap-6 lg:gap-11' : 'gap-8 lg:gap-16'}`}>
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
              className={`flex flex-col items-center justify-center py-6 md:py-8 lg:py-10 rounded-[2.5rem] border-[4px] md:border-[8px] cursor-pointer transition-all box-border min-h-[10vh] md:min-h-[12vh] shadow-2xl relative overflow-hidden group ${stateClass}`}
              whileHover={!showFeedback ? { 
                scale: 1.05, 
                zIndex: 40,
                borderColor: '#FFCC00',
                boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
              } : {}}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter relative z-10 px-8 text-center leading-none">
                {option}
              </span>
            </motion.button>
          );
        })}
      </div>

    </div>
  );
}
