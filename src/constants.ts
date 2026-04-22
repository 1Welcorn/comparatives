import { Question, UIStrings, Language } from './types';

export const UI_DATA: Record<'en' | 'pt', UIStrings> = {
  en: {
    title: "English Duel: Comparisons",
    startBtn: "Start Duel",
    howToPlay: "How to Play",
    health: "Health",
    score: "XP",
    streak: "Streak",
    level: "Level",
    correct: "Great job!",
    wrong: "Oops!",
    next: "Next Challenge",
    victoryTitle: "Victory!",
    gameoverTitle: "Game Over",
    playAgain: "Try Again",
    onboardingText: "The primary objective of this session is to consolidate and internalize the grammatical structures discussed in previous classes. Master Comparatives and Superlatives to sharpen your linguistic precision and conquer the challenge.",
  },
  pt: {
    title: "Duelo de Inglês: Comparações",
    startBtn: "Iniciar Duelo",
    howToPlay: "Como Jogar",
    health: "Vida",
    score: "XP",
    streak: "Combo",
    level: "Nível",
    correct: "Mandou bem!",
    wrong: "Quase lá!",
    next: "Próximo Desafio",
    victoryTitle: "Vitória!",
    gameoverTitle: "Fim de Jogo",
    playAgain: "Tentar Novamente",
    onboardingText: "O objetivo principal desta sessão é consolidar e internalizar as estruturas gramaticais discutidas em aulas anteriores. Domine os Comparativos e Superlativos para aprimorar sua precisão linguística e vencer o desafio.",
  }
};

export const QUESTIONS: Question[] = [
  {
    id: '1',
    type: 'comparative',
    baseWord: 'fast',
    sentence: "A cheetah is ___ than a lion.",
    options: ['faster', 'fastest', 'more fast', 'most fast'],
    correctAnswer: 'faster',
    explanation: "Para adjetivos curtos como 'fast', usamos '-er' no final para comparar duas coisas."
  },
  {
    id: '2',
    type: 'comparative',
    baseWord: 'expensive',
    sentence: "An iPhone is ___ than a simple Nokia.",
    options: ['expensiver', 'expensivest', 'more expensive', 'most expensive'],
    correctAnswer: 'more expensive',
    explanation: "Para adjetivos longos (3+ sílabas), usamos 'more' antes da palavra."
  },
  {
    id: '3',
    type: 'superlative',
    baseWord: 'hot',
    sentence: "Mercury is the ___ planet in the solar system.",
    options: ['hotter', 'hottest', 'more hot', 'most hot'],
    correctAnswer: 'hottest',
    explanation: "Para o superlativo (o mais de todos) de adjetivos curtos, usamos '-est'. Lembre-se de dobrar o 't' em 'hot'."
  },
  {
    id: '4',
    type: 'superlative',
    baseWord: 'beautiful',
    sentence: "Rio de Janeiro is the ___ city in Brazil.",
    options: ['beautifuller', 'beautifullest', 'more beautiful', 'most beautiful'],
    correctAnswer: 'most beautiful',
    explanation: "Para adjetivos longos no superlativo, usamos 'most' antes da palavra."
  },
  {
    id: '5',
    type: 'comparative',
    baseWord: 'good',
    sentence: "Fruits are ___ for you than candy.",
    options: ['gooder', 'best', 'more good', 'better'],
    correctAnswer: 'better',
    explanation: "'Good' é um adjetivo irregular. O comparativo é 'better'."
  },
  {
    id: '6',
    type: 'superlative',
    baseWord: 'bad',
    sentence: "That was the ___ movie I have ever seen.",
    options: ['badder', 'worst', 'worse', 'most bad'],
    correctAnswer: 'worst',
    explanation: "'Bad' é irregular. O superlativo é 'worst' (o pior)."
  },
  {
    id: '7',
    type: 'comparative',
    baseWord: 'happy',
    sentence: "Today I am ___ than yesterday.",
    options: ['happier', 'happyer', 'more happy', 'happiest'],
    correctAnswer: 'happier',
    explanation: "Adjetivos que terminam em 'y' trocam o 'y' por 'i' antes de adicionar '-er'."
  },
  {
    id: '8',
    type: 'superlative',
    baseWord: 'tall',
    sentence: "Mount Everest is the ___ mountain in the world.",
    options: ['taller', 'tallest', 'more tall', 'most tall'],
    correctAnswer: 'tallest',
    explanation: "Superlativo de adjetivo curto: adicione '-est'."
  },
  {
    id: '9',
    type: 'comparative',
    baseWord: 'far',
    sentence: "Pluto is ___ from the sun than Earth.",
    options: ['farer', 'farthest', 'further', 'more far'],
    correctAnswer: 'further',
    explanation: "'Far' é irregular. O comparativo pode ser 'further' ou 'farther'."
  },
  {
    id: '10',
    type: 'superlative',
    baseWord: 'big',
    sentence: "The blue whale is the ___ animal on Earth.",
    options: ['bigger', 'biggest', 'more big', 'most big'],
    correctAnswer: 'biggest',
    explanation: "Em palavras curtas que terminam em Consoante-Vogal-Consoante (CVC), dobramos a última letra antes de '-est'."
  },
  {
    id: '11',
    type: 'comparative',
    baseWord: 'comfortable',
    sentence: "This sofa is ___ than that wooden chair.",
    options: ['comfortabler', 'comfortablest', 'more comfortable', 'most comfortable'],
    correctAnswer: 'more comfortable',
    explanation: "Adjetivos longos pedem 'more' para comparar."
  },
  {
    id: '12',
    type: 'superlative',
    baseWord: 'heavy',
    sentence: "This is the ___ suitcase in the car.",
    options: ['heavier', 'heaviest', 'heavyest', 'most heavy'],
    correctAnswer: 'heaviest',
    explanation: "Terminou em 'y'? Troque por 'i' e coloque '-est' para o superlativo."
  },
  {
    id: '13',
    type: 'comparative',
    baseWord: 'bad',
    sentence: "Raining is ___ than just being cloudy.",
    options: ['badder', 'worst', 'worse', 'more bad'],
    correctAnswer: 'worse',
    explanation: "O comparativo de 'bad' (ruim) é 'worse' (pior). 'Badder' não existe!"
  },
  {
    id: '14',
    type: 'superlative',
    baseWord: 'small',
    sentence: "The hummingbird is the ___ bird in the world.",
    options: ['smaller', 'smalliest', 'smallest', 'most small'],
    correctAnswer: 'smallest',
    explanation: "Adjetivo curto no superlativo? Basta adicionar '-est'."
  },
  {
    id: '15',
    type: 'superlative',
    baseWord: 'intelligent',
    sentence: "Some say the dolphin is the ___ animal in the ocean.",
    options: ['intelligenter', 'intelligentest', 'more intelligent', 'most intelligent'],
    correctAnswer: 'most intelligent',
    explanation: "Para adjetivos muito longos, o superlativo é feito com 'most'."
  },
  {
    id: '16',
    type: 'comparative',
    baseWord: 'cold',
    sentence: "Winter is ___ than autumn.",
    options: ['colder', 'coldest', 'more cold', 'most cold'],
    correctAnswer: 'colder',
    explanation: "Comparativo de adjetivo curto: apenas adicione '-er'."
  }
];

export interface ComparisonRule {
  title: string;
  rule: string;
  example: string;
}

export const RULES: Record<Language, ComparisonRule[]> = {
  en: [
    { title: "Short Adjectives", rule: "Add -er for comparative, -est for superlative.", example: "Tall -> Taller -> Tallest" },
    { title: "Long Adjectives", rule: "Use more/most before the word.", example: "Beautiful -> More beautiful -> Most beautiful" },
    { title: "Ending in 'y'", rule: "Change 'y' to 'i' then add -er/-est.", example: "Happy -> Happier -> Happiest" },
    { title: "Irregulars", rule: "Some words change completely.", example: "Good -> Better -> Best | Bad -> Worse -> Worst" }
  ],
  pt: [
    { title: "Adjetivos Curtos", rule: "Adicione -er para comparar, -est para superlativo.", example: "Tall -> Taller -> Tallest" },
    { title: "Adjetivos Longos", rule: "Use 'more'/'most' antes da palavra.", example: "Beautiful -> More beautiful -> Most beautiful" },
    { title: "Terminados em 'y'", rule: "Troque 'y' por 'i' e adicione -er/-est.", example: "Happy -> Happier -> Happiest" },
    { title: "Irregulares", rule: "Algumas palavras mudam completamente.", example: "Good -> Better -> Best | Bad -> Worse -> Worst" }
  ]
};
