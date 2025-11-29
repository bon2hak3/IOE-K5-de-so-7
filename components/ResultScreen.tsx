import React from 'react';
import { UserAnswer } from '../types';
import Button from './Button';

interface ResultScreenProps {
    userName: string;
    userAnswers: UserAnswer[];
    onRetryAll: () => void;
    onRetryWrong: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ userName, userAnswers, onRetryAll, onRetryWrong }) => {
    const correct = userAnswers.filter(a => a.isCorrect).length;
    const total = userAnswers.length;
    const percent = total > 0 ? Math.round((correct/total)*100) : 0;
    const hasWrong = correct < total;
    const score = correct * 10;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in bg-[#eecfa1] relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center border-[10px] border-[#8b4513] relative z-10">
                <div className="mb-6 relative inline-block">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                        <circle cx="60" cy="60" r="54" fill="none" stroke={percent >= 80 ? '#10b981' : percent >= 50 ? '#3b82f6' : '#ef4444'} strokeWidth="12" strokeDasharray="339.292" strokeDashoffset={339.292 - (339.292 * percent) / 100} className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-extrabold text-slate-800">{percent}%</div>
                </div>
                <h2 className="text-2xl font-bold text-[#8b4513] mb-2 uppercase">Kết quả bài thi</h2>
                <p className="text-slate-600 mb-6 text-lg">Thí sinh: <b className="text-[#1a4731]">{userName}</b></p>
                
                <div className="mb-8 inline-flex items-center gap-3 bg-yellow-50 px-8 py-4 rounded-xl border-2 border-yellow-200 shadow-sm">
                        <span className="text-5xl font-extrabold text-[#d97706] drop-shadow-sm">{score}</span>
                        <span className="text-xl text-yellow-800 font-bold uppercase tracking-wider">Điểm</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100"><div className="text-3xl font-bold text-green-600">{correct}</div><div className="text-xs uppercase text-green-800 font-bold mt-1">Câu Đúng</div></div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100"><div className="text-3xl font-bold text-red-500">{total - correct}</div><div className="text-xs uppercase text-red-800 font-bold mt-1">Câu Sai</div></div>
                </div>
                
                <div className="flex gap-4 justify-center">
                    <Button onClick={onRetryAll} variant="primary">Thi lại</Button>
                    {hasWrong && <Button onClick={onRetryWrong} variant="danger">Làm lại câu sai</Button>}
                </div>
            </div>
        </div>
    );
};

export default ResultScreen;