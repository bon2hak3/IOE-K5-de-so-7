import React, { useState, useEffect, useCallback } from 'react';
import { Question, QuestionType } from '../types';
import Button from './Button';
import AudioPlayer from './AudioPlayer';

interface QuestionCardProps {
    question: Question;
    onAnswer: (response: string) => void;
    isAnswered: boolean;
    userAnswer?: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, isAnswered, userAnswer }) => {
    const [inputVal, setInputVal] = useState('');
    const [selectedParts, setSelectedParts] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [hintText, setHintText] = useState('');
    
    // Reset state when question changes
    useEffect(() => {
        setInputVal('');
        setSelectedParts([]);
        setSelectedOption(null);
        setShowHint(false);
        setHintText('');
    }, [question.id]);

    const normalize = (str: string) => str ? str.replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim().toLowerCase() : "";
    
    // Determine if the answer provided is correct (for display purposes)
    const checkCorrect = (ans: string) => normalize(ans) === normalize(question.correctAnswer);
    const isCorrect = userAnswer ? checkCorrect(userAnswer) : false;

    // Handlers
    const handleOptionSelect = (opt: string) => {
        if (!isAnswered) setSelectedOption(opt);
    };

    const handlePartClick = (part: string) => { 
        if (!isAnswered) setSelectedParts(prev => prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]); 
    };

    // Main submission handler
    const handleSubmit = useCallback(() => {
        if (isAnswered) return;

        let response = '';
        if (question.type === QuestionType.MULTIPLE_CHOICE) {
            if (selectedOption) response = selectedOption;
        } else if (question.type === QuestionType.FILL_IN_BLANK) {
            if (inputVal.trim()) response = inputVal.trim();
        } else if (question.type === QuestionType.REARRANGE) {
            if (selectedParts.length > 0) response = selectedParts.join(' ');
        }

        if (response) {
            onAnswer(response);
        }
    }, [isAnswered, question.type, selectedOption, inputVal, selectedParts, onAnswer]);

    // Keyboard listener for Enter key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent default behavior (like form submission)
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSubmit]);

    // Hint Logic
    const generateHint = () => {
        if (hintText) return;
        let text = '';
        if (question.type === QuestionType.MULTIPLE_CHOICE) {
            const wrongOptions = question.options?.filter(opt => normalize(opt) !== normalize(question.correctAnswer)) || [];
            if (wrongOptions.length > 0) {
                 const randomWrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
                 text = `💡 Loại bỏ 1 đáp án sai: "${randomWrong}"`;
            }
        } else if (question.type === QuestionType.FILL_IN_BLANK) {
             const answer = question.correctAnswer.trim();
             text = `💡 Gợi ý chữ cái đầu: "${answer.charAt(0).toUpperCase()}..."`;
        } else if (question.type === QuestionType.REARRANGE) {
             const answerParts = question.correctAnswer.split(' ');
             text = `💡 Từ đầu tiên là: "${answerParts[0]}"`;
        }
        setHintText(text);
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 w-full h-full relative">
            {/* Blackboard Container */}
            <div className="relative w-full max-w-5xl bg-blackboard border-[12px] border-[#c19a6b] rounded-xl shadow-2xl overflow-hidden flex flex-col p-6 sm:p-10 min-h-[500px]">
                
                {/* Wood Frame Detail - Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 bg-[#8b5a2b] opacity-50"></div>
                <div className="absolute top-0 right-0 w-4 h-4 bg-[#8b5a2b] opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#8b5a2b] opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#8b5a2b] opacity-50"></div>

                {/* --- EASY TO UNDERSTAND HINT BUTTON (STICKY NOTE STYLE) --- */}
                {!isAnswered && (
                    <div className="absolute top-0 right-8 z-30 flex flex-col items-end">
                        {/* The Sticky Note Button */}
                        <button 
                            onClick={() => { generateHint(); setShowHint(!showHint); }}
                            className="bg-[#fef3c7] hover:bg-[#fffbeb] text-yellow-900 w-24 h-24 shadow-lg transform -rotate-3 transition-transform hover:rotate-0 flex flex-col items-center justify-center border-t-8 border-yellow-200/50"
                            style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 90%, 90% 100%, 0% 100%)" }} // Slight dog-ear effect
                            title="Bấm để xem gợi ý"
                        >
                            <span className="text-2xl mb-1">💡</span>
                            <span className="font-chalk font-bold text-lg leading-none border-b-2 border-yellow-900/20 pb-1">GỢI Ý</span>
                        </button>
                        
                        {/* The Hint Content (Appears below the note) */}
                        {showHint && hintText && (
                            <div className="mt-2 bg-white/95 backdrop-blur-sm border-2 border-yellow-400 text-slate-800 p-3 rounded-lg shadow-xl text-base font-bold animate-fade-in max-w-xs text-center relative">
                                {/* Triangle pointer */}
                                <div className="absolute -top-2 right-8 w-4 h-4 bg-white border-t-2 border-l-2 border-yellow-400 transform rotate-45"></div>
                                {hintText}
                            </div>
                        )}
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 z-10 w-full pt-8">
                    
                    {/* Media Section */}
                    {(question.imageUrl || question.audioUrl) && (
                        <div className="flex flex-col items-center gap-4 mb-4 bg-black/20 p-4 rounded-xl border border-white/10">
                            {question.imageUrl && (
                                <img src={question.imageUrl} className="max-h-40 sm:max-h-52 rounded-lg border-2 border-white/20 shadow-md" alt="Question Visual" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                            )}
                            {question.audioUrl && (
                                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-full">
                                    <AudioPlayer src={question.audioUrl} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Question Text */}
                    <h2 className="text-2xl sm:text-4xl font-chalk font-bold text-white tracking-wide leading-relaxed drop-shadow-md px-4">
                        {question.questionText}
                    </h2>

                    {/* Interaction Area */}
                    <div className="w-full mt-4 flex flex-col items-center">
                        
                        {/* Multiple Choice */}
                        {question.type === QuestionType.MULTIPLE_CHOICE && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-6 max-w-4xl">
                                {question.options?.map((opt, idx) => {
                                    const isSelected = selectedOption === opt;
                                    const showResult = isAnswered;
                                    const isThisCorrect = checkCorrect(opt);
                                    const isThisUserAnswer = userAnswer === opt;
                                    
                                    let cardClass = "bg-transparent border-2 border-white/30 text-white hover:bg-white/10";
                                    if (showResult) {
                                        if (isThisCorrect) cardClass = "bg-green-600/80 border-green-400 text-white";
                                        else if (isThisUserAnswer) cardClass = "bg-red-600/80 border-red-400 text-white";
                                        else cardClass = "bg-black/20 border-white/10 text-white/50";
                                    } else if (isSelected) {
                                        cardClass = "bg-blue-600/60 border-blue-400 ring-2 ring-blue-300 text-white scale-[1.02]";
                                    }

                                    return (
                                        <button 
                                            key={idx} 
                                            onClick={() => handleOptionSelect(opt)} 
                                            disabled={isAnswered} 
                                            className={`p-4 sm:p-5 rounded-lg text-left text-lg sm:text-xl font-bold transition-all duration-200 flex items-center shadow-sm ${cardClass}`}
                                        >
                                            <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 mr-4 text-sm sm:text-base border border-white/30 font-sans">
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Fill in Blank */}
                        {question.type === QuestionType.FILL_IN_BLANK && (
                            <div className="flex flex-col items-center gap-2 mt-4 w-full max-w-lg">
                                <input 
                                    type="text" 
                                    value={isAnswered ? userAnswer : inputVal} 
                                    onChange={(e) => setInputVal(e.target.value)} 
                                    disabled={isAnswered} 
                                    className={`w-full bg-transparent border-b-4 text-center text-3xl sm:text-4xl text-white font-chalk placeholder-white/30 focus:outline-none transition-colors py-2 ${isAnswered ? (isCorrect ? 'border-green-400 text-green-300' : 'border-red-400 text-red-300') : 'border-white/50 focus:border-yellow-400'}`}
                                    placeholder="Nhập đáp án..." 
                                    autoFocus
                                    autoComplete="off"
                                />
                                {!isAnswered && <div className="text-white/50 text-sm font-sans">Nhấn Enter để trả lời</div>}
                            </div>
                        )}

                        {/* Rearrange */}
                        {question.type === QuestionType.REARRANGE && (
                            <div className="space-y-6 w-full max-w-4xl">
                                <div className="flex flex-wrap justify-center gap-3 p-6 bg-black/20 rounded-xl border border-white/10 min-h-[100px] items-center">
                                    {question.rearrangeParts?.map((part, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => handlePartClick(part)} 
                                            disabled={isAnswered || selectedParts.includes(part)} 
                                            className={`px-4 py-2 rounded-lg bg-white/10 text-white border border-white/30 font-bold shadow-sm transition-all hover:bg-white/20 text-lg ${selectedParts.includes(part) ? 'opacity-30 scale-90 pointer-events-none' : 'active:scale-95'}`}
                                        >
                                            {part}
                                        </button>
                                    ))}
                                </div>
                                <div className={`min-h-[80px] p-4 rounded-xl border-2 border-dashed flex flex-wrap justify-center gap-2 items-center transition-colors ${isAnswered ? (isCorrect ? 'border-green-500 bg-green-900/30' : 'border-red-500 bg-red-900/30') : 'border-white/30 bg-white/5'}`}>
                                     {selectedParts.length === 0 && !isAnswered && <div className="text-white/30 italic font-chalk text-xl">Bấm vào các từ ở trên để sắp xếp...</div>}
                                    {selectedParts.map((part, idx) => (
                                        <button key={idx} onClick={() => handlePartClick(part)} disabled={isAnswered} className="bg-yellow-100 text-slate-900 px-3 py-1.5 rounded shadow font-bold hover:bg-red-100 hover:text-red-900 text-lg animate-fade-in">
                                            {part}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Answer / Feedback Section */}
                    <div className="mt-8 mb-2 h-24 flex items-center justify-center w-full">
                        {!isAnswered ? (
                            <Button 
                                onClick={handleSubmit} 
                                variant="gold" 
                                size="lg"
                                className="min-w-[220px] text-xl py-3"
                                disabled={question.type === QuestionType.MULTIPLE_CHOICE ? !selectedOption : question.type === QuestionType.FILL_IN_BLANK ? !inputVal.trim() : selectedParts.length === 0}
                            >
                                TRẢ LỜI (Enter)
                            </Button>
                        ) : (
                            <div className="bg-white/95 backdrop-blur rounded-xl p-4 shadow-2xl border-4 border-white animate-slide-up max-w-2xl w-full mx-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-2xl ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {isCorrect ? '✓' : '✕'}
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className={`font-bold text-xl ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                            {isCorrect ? 'CHÍNH XÁC!' : 'CHƯA CHÍNH XÁC'}
                                        </h3>
                                        {!isCorrect && (
                                            <div className="text-slate-800 text-lg mt-1">
                                                Đáp án đúng: <span className="font-bold text-green-700">{question.correctAnswer}</span>
                                            </div>
                                        )}
                                        <div className="text-sm text-slate-500 mt-2 italic border-t pt-2 border-slate-200">
                                            {question.explanation}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default QuestionCard;