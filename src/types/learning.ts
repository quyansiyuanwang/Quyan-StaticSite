export interface VocabularyWord {
  id: string
  word: string
  meaning: string
  example?: string
  phonetic: string
  category: string
  partOfSpeech?: string
  rawLine?: string
}

export interface QuizQuestion {
  id: string
  question: string
  choices: string[]
  correctIndex: number
  explanation: string
  level: 'easy' | 'medium' | 'hard'
  category: string
}

export interface WordCategory {
  id: string
  label: string
  description: string
}

export type PracticeQuestionType = 'enToZhChoice' | 'zhToEnChoice' | 'zhToEnInput'

export interface WrongNotebookItem {
  id: string
  wordId: string
  word: string
  meaning: string
  category: string
  questionType: PracticeQuestionType
  wrongCount: number
  updatedAt: string
}

export interface ProgressState {
  vocabulary: {
    masteredWordIds: string[]
    dailyGoal: number
    streakDays: number
    lastStudyDate: string | null
  }
  practice: {
    totalAnswered: number
    correctAnswered: number
    wrongNotebook: WrongNotebookItem[]
  }
  game: {
    totalRounds: number
    bestMoves: number
    bestSeconds: number
    reactionBestMs: number
    reactionPlays: number
    guessWins: number
    guessBestAttempts: number
    popBestScore: number
    popPlays: number
  }
  preferences: {
    locale: 'zh-CN' | 'en'
  }
}

export interface MemoryCard {
  id: string
  pairId: string
  text: string
}
