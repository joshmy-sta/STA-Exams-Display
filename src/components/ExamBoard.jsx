import React, { useEffect } from 'react';
import { Clock, Calendar, Bell } from './Icons';
import { formatTime, formatDate, formatShortTime, getExamStatus, getExamTimings, getWarningStyles } from '../utils/helpers';

const ExamBoard = ({
    centerName,
    logoUrl,
    currentTime,
    activeDay
}) => {
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <div className="bg-[#003057] text-[#fcc314] p-4 md:p-6 shadow-md shrink-0 z-10">
                <div className="flex justify-between items-center max-w-full mx-auto w-full">
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center space-x-4">
                            {logoUrl && <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain" />}
                            <h1 className="text-3xl md:text-5xl font-bold tracking-wider uppercase truncate">{centerName}</h1>
                        </div>
                        <h2 className="text-xl md:text-2xl mt-2 font-light flex items-center opacity-90">
                            <span className="mr-4">{formatDate(currentTime)}</span>
                            <span className="px-2 py-0.5 bg-[#fcc314]/20 rounded text-sm text-[#fcc314] uppercase tracking-widest">{activeDay.name}</span>
                        </h2>
                    </div>
                    <div className="text-right bg-[#003057]/50 p-3 rounded-xl ml-4 shrink-0">
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-right opacity-70">Current Time</div>
                        <div className="text-6xl md:text-8xl font-mono font-bold tracking-tighter tabular-nums leading-none">
                            {formatTime(currentTime).slice(0, 5)}
                            <span className="text-3xl md:text-5xl ml-1 opacity-75">{formatTime(currentTime).slice(6)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-grow bg-gray-50 p-4 overflow-hidden">
                <div className="w-full h-full grid grid-cols-3 grid-rows-2 gap-4">
                    {activeDay.exams.filter(e => !e.isHidden).length === 0 && (
                        <div className="col-span-3 row-span-2 flex flex-col items-center justify-center text-gray-400">
                            <Calendar size={64} className="mb-4 opacity-20" />
                            <p className="text-2xl font-light">No exams visible for {activeDay.name}.</p>
                            <p className="mt-2 text-sm opacity-60">Check settings to add exams or unhide them.</p>
                        </div>
                    )}

                    {activeDay.exams.filter(e => !e.isHidden).slice(0, 6).map((exam) => {
                        const status = getExamStatus(exam);
                        const timings = getExamTimings(exam);
                        const style30 = getWarningStyles(timings.warning30, currentTime);
                        const style05 = getWarningStyles(timings.warning05, currentTime);

                        return (
                            <div key={exam.id} className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 flex flex-col h-full relative">
                                <div className={`h-1.5 w-full shrink-0 ${status.code === 'writing' ? 'bg-green-500 animate-pulse' : status.code === 'reading' ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`}></div>

                                <div className="flex-grow flex flex-col px-4 py-2 justify-between">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight line-clamp-2 w-2/3" title={exam.subject}>{exam.subject}</h3>
                                        <div className={`shrink-0 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${status.code === 'writing' ? 'bg-green-100 text-green-800 border border-green-200' : status.code === 'reading' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                            {status.status}
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center items-center flex-grow">
                                        <div className={`text-center ${status.color}`}>
                                            <div className="text-4xl md:text-5xl font-bold leading-none tracking-tight">
                                                {status.message.replace(/mins?|remaining|Starts in/g, '').trim()}
                                            </div>
                                            <div className="text-xs font-medium uppercase tracking-widest opacity-70">Minutes Left</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="grid grid-cols-3 gap-2 mb-1 bg-gray-50 rounded p-1.5 border border-gray-100">
                                            <div className="text-center">
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">Start</div>
                                                <div className="text-base md:text-lg font-mono font-bold text-gray-700">{formatShortTime(timings.startTime)}</div>
                                            </div>
                                            <div className="text-center border-l border-gray-200">
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">Duration</div>
                                                <div className="text-base md:text-lg font-mono font-bold text-gray-700">{timings.writingDuration}m</div>
                                            </div>
                                            <div className="text-center border-l border-gray-200">
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">End</div>
                                                <div className="text-base md:text-lg font-mono font-bold text-gray-700">{formatShortTime(timings.endTime)}</div>
                                            </div>
                                        </div>

                                        {(timings.writingDuration > 5) && (
                                            <div className="flex gap-2 justify-center">
                                                {timings.writingDuration > 30 && (
                                                    <div className={`flex items-center justify-center px-2 py-1 rounded border text-[10px] font-bold w-1/2 ${style30.container.replace('text-lg', 'text-xs').replace('px-3 py-1', 'px-1 py-0.5')}`}>
                                                        <span className={`${style30.label} mr-1`}>30m:</span>
                                                        <span className={`${style30.time}`}>{formatShortTime(timings.warning30)}</span>
                                                    </div>
                                                )}
                                                <div className={`flex items-center justify-center px-2 py-1 rounded border text-[10px] font-bold w-1/2 ${style05.container.replace('text-lg', 'text-xs').replace('px-3 py-1', 'px-1 py-0.5')}`}>
                                                    <span className={`${style05.label} mr-1`}>5m:</span>
                                                    <span className={`${style05.time}`}>{formatShortTime(timings.warning05)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="absolute bottom-2 left-0 right-0 text-center py-2 text-gray-400 flex items-center justify-center opacity-70 pointer-events-none">
                    <Clock size={14} className="mr-2 animate-pulse" />
                    <span className="uppercase text-[10px] tracking-[0.3em] font-medium">Silence Please</span>
                </div>
            </div>
        </div>
    );
};

export default ExamBoard;
