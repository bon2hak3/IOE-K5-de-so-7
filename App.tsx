import React, { useState, useEffect } from 'react';
import { GameState, Question, UserAnswer } from './types';
import { QUIZ_DATA } from './constants';
import StartScreen from './components/StartScreen';
import ResultScreen from './components/ResultScreen';
import QuestionCard from './components/QuestionCard';
import QuestionGrid from './components/QuestionGrid';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.START);
    const [userName, setUserName] = useState('');
    const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [showGrid, setShowGrid] = useState(false);
    
    // Timer state (mocking 30 minutes countdown)
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

    // Navigation Bar State: Tracks the starting index of the visible 10 questions
    const [navStartIndex, setNavStartIndex] = useState(0);

    // Timer Logic
    useEffect(() => {
        let timer: any;
        if (gameState === GameState.PLAYING && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    // Auto-submit when time runs out
    useEffect(() => {
        if (gameState === GameState.PLAYING && timeLeft === 0) {
            handleFinish();
        }
    }, [timeLeft, gameState]);

    // Sync Navigation Bar with Current Question
    // When currentIndex changes (e.g. auto advance), ensure the nav bar shows the current question
    useEffect(() => {
        const newPageStart = Math.floor(currentIndex / 10) * 10;
        setNavStartIndex(newPageStart);
    }, [currentIndex]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleStart = (name: string) => {
        setUserName(name);
        startSession(QUIZ_DATA);
    };

    const startSession = (questions: Question[]) => {
        setActiveQuestions(questions);
        setCurrentIndex(0);
        setUserAnswers([]);
        setGameState(GameState.PLAYING);
        setTimeLeft(30 * 60);
        setNavStartIndex(0);
    };

    const handleAnswer = (response: string) => {
        const q = activeQuestions[currentIndex];
        const normalize = (s: string) => s.replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
        const isCorrect = normalize(response) === normalize(q.correctAnswer);
        
        setUserAnswers(prev => [...prev.filter(a => a.questionId !== q.id), { questionId: q.id, userResponse: response, isCorrect }]);

        // Auto advance if correct
        if (isCorrect && currentIndex < activeQuestions.length - 1) {
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 1500); // Wait 1.5s to show the green checkmark before moving
        }
    };

    const handleNext = () => currentIndex < activeQuestions.length - 1 && setCurrentIndex(prev => prev + 1);
    const handleSkip = () => handleNext();
    const handleFinish = () => setGameState(GameState.FINISHED);

    const handleRetryWrong = () => {
        const wrongIds = userAnswers.filter(a => !a.isCorrect).map(a => a.questionId);
        startSession(QUIZ_DATA.filter(q => wrongIds.includes(q.id)));
    };

    const handleJumpToQuestion = (index: number) => {
        setCurrentIndex(index);
    };

    // Navigation Bar Controls (Page by 10)
    const handleNavPrevPage = () => {
        setNavStartIndex(prev => Math.max(0, prev - 10));
    };

    const handleNavNextPage = () => {
        if (navStartIndex + 10 < activeQuestions.length) {
            setNavStartIndex(prev => prev + 10);
        }
    };

    if (gameState === GameState.START) return <StartScreen onStart={handleStart} />;
    if (gameState === GameState.FINISHED) return <ResultScreen userName={userName} userAnswers={userAnswers} onRetryAll={() => startSession(QUIZ_DATA)} onRetryWrong={handleRetryWrong} />;

    const currentQ = activeQuestions[currentIndex];
    const answer = userAnswers.find(a => a.questionId === currentQ.id);
    const isAnswered = !!answer;
    
    // Calculate Score: 10 points per correct answer
    const currentScore = userAnswers.filter(a => a.isCorrect).length * 10;
    const totalQ = activeQuestions.length;

    return (
        <div className="h-full flex flex-col bg-stone-100 overflow-hidden">
            {/* Header */}
            <div className="bg-[#1a4731] text-white h-16 flex items-center justify-between px-4 sm:px-6 shadow-md border-b-4 border-yellow-600 z-20 shrink-0">
                {/* Left: Logo & Title */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/50">
                        <span className="font-bold text-xs">IOE</span>
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="font-bold text-sm sm:text-base leading-tight uppercase">IOE K5 ĐỀ SỐ 06</h1>
                        <p className="text-xs text-emerald-200">Năm học 2025 - 2026</p>
                    </div>
                </div>

                {/* Center: Timer & Score */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                     {/* Timer */}
                    <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-white/10">
                        <span className="text-yellow-400 text-lg">⏰</span>
                        <span className="font-mono font-bold text-lg tracking-wider">{formatTime(timeLeft)}</span>
                    </div>
                    
                    {/* Score Display */}
                    <div className="hidden md:flex items-center gap-2 bg-yellow-600/30 px-3 py-1 rounded-full border border-yellow-500/30">
                        <span className="text-yellow-400 text-lg">★</span>
                        <span className="font-mono font-bold text-lg text-yellow-300">{currentScore} <span className="text-xs font-normal opacity-80">điểm</span></span>
                    </div>
                </div>

                {/* Right: User Info & Submit */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="font-bold text-sm">{userName}</div>
                        <div className="text-xs text-emerald-300">ID: {currentQ?.id}</div>
                    </div>
                    
                    {/* Mobile Score (visible only on small screens) */}
                    <div className="md:hidden font-bold text-yellow-400 text-sm">
                        {currentScore} pts
                    </div>

                    <button onClick={handleFinish} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-4 rounded shadow border-b-2 border-emerald-800 text-sm uppercase transition-transform active:scale-95">
                        Nộp bài
                    </button>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="bg-[#eecfa1] h-14 flex items-center justify-center px-2 border-b-4 border-[#8b4513] shadow-inner relative shrink-0">
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#8b4513]/20 to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#8b4513]/20 to-transparent pointer-events-none"></div>
                
                {/* Previous 10 Button */}
                <button 
                    onClick={handleNavPrevPage} 
                    disabled={navStartIndex === 0} 
                    className="w-8 h-8 flex items-center justify-center text-[#8b4513] bg-[#d4a373] hover:bg-[#c19a6b] rounded border border-[#8b4513]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="10 câu trước"
                >
                    ◀
                </button>
                
                {/* Question Numbers List */}
                <div className="flex gap-1.5 mx-3 overflow-hidden">
                    {activeQuestions.slice(navStartIndex, navStartIndex + 10).map((q, idx) => {
                        // The actual index in the main array
                        const realIndex = navStartIndex + idx;
                        const isCurrent = realIndex === currentIndex;
                        const isDone = userAnswers.some(a => a.questionId === q.id);
                        
                        return (
                            <button 
                                key={q.id}
                                onClick={() => handleJumpToQuestion(realIndex)}
                                className={`
                                    w-9 h-9 rounded-md border-2 font-bold text-sm shadow-sm transition-all flex items-center justify-center
                                    ${isCurrent 
                                        ? 'bg-[#ef4444] border-[#b91c1c] text-white scale-110 z-10 shadow-md ring-1 ring-white/50' 
                                        : isDone 
                                            ? 'bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400' 
                                            : 'bg-[#f59e0b] border-[#b45309] text-white hover:bg-[#fbbf24]'
                                    }
                                `}
                            >
                                {realIndex + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Next 10 Button */}
                <button 
                    onClick={handleNavNextPage} 
                    disabled={navStartIndex + 10 >= totalQ} 
                    className="w-8 h-8 flex items-center justify-center text-[#8b4513] bg-[#d4a373] hover:bg-[#c19a6b] rounded border border-[#8b4513]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="10 câu tiếp theo"
                >
                    ▶
                </button>
                
                <button onClick={() => setShowGrid(true)} className="ml-4 text-[#8b4513] text-xs font-bold underline hover:text-black">
                    DS ({userAnswers.length}/{totalQ})
                </button>
            </div>

            {/* Main Game Area */}
            <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-stone-300 relative overflow-y-auto">
                <div className="absolute inset-0 bg-[#d4a373] opacity-20 pointer-events-none mix-blend-multiply"></div>
                <QuestionCard 
                    question={currentQ} 
                    onAnswer={handleAnswer} 
                    isAnswered={isAnswered} 
                    userAnswer={answer?.userResponse} 
                />
            </div>

            {/* Footer Control */}
            <div className="h-8 bg-[#5d4037] flex items-center justify-between px-4 text-[#eecfa1] text-xs border-t border-[#3e2723] shrink-0">
                <span>Hệ thống ôn luyện IOE - AI Master</span>
                <div className="flex gap-4">
                    <button onClick={handleSkip} disabled={isAnswered} className="hover:text-white disabled:opacity-50 font-bold uppercase">Bỏ qua</button>
                </div>
            </div>

            {showGrid && <QuestionGrid questions={activeQuestions} userAnswers={userAnswers} currentIndex={currentIndex} onJump={handleJumpToQuestion} onClose={() => setShowGrid(false)} />}
        </div>
    );
};

export default App;