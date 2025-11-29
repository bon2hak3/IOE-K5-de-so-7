import React, { useState } from 'react';
import Button from './Button';

interface StartScreenProps {
    onStart: (name: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
    const [name, setName] = useState('');
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (name.trim()) onStart(name.trim()); };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1a4731] p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/blackboard.png')]"></div>
            
            <div className="bg-[#fdfbf7] rounded-xl shadow-2xl p-8 max-w-md w-full text-center animate-slide-up border-8 border-[#d4a373] relative z-10">
                <div className="mb-8">
                    <div className="w-20 h-20 bg-[#ef4444] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-white font-bold text-2xl">IOE</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#1a4731] mb-2 uppercase tracking-wide">IOE K5 ĐỀ SỐ 06</h1>
                    <p className="text-slate-500 font-medium">Luyện thi tiếng Anh IOE cùng AI Master</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-left">
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Tên của bạn</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên học sinh..." className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-[#d4a373] focus:ring-0 outline-none transition-all bg-slate-50 font-bold text-lg" required />
                    </div>
                    <Button type="submit" className="w-full shadow-lg" size="lg" disabled={!name.trim()} variant="gold">Bắt đầu thi</Button>
                </form>
            </div>
        </div>
    );
};

export default StartScreen;