import React, { useEffect } from 'react';
import { Clock, Calendar, Bell } from './Icons';
import { formatTime, formatDate, formatShortTime, getExamStatus, getExamTimings, getWarningStyles, formatDuration } from '../utils/helpers';
import logo from '../assets/logo.png';

const ExamBoard = ({
    centerName,
    currentTime,
    activeDay
}) => {
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <div className="bg-[#003057] text-[#fcc314] px-4 md:px-6 shadow-md shrink-0 z-10">
                <div className="flex justify-between items-center max-w-full mx-auto w-full">
                    <div className="flex items-center space-x-8 min-w-0">
                        <img src={logo} alt="Logo" className="h-32 md:h-52 w-auto object-contain" />
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-4xl md:text-6xl font-bold tracking-wider uppercase truncate">{centerName}</h1>
                            <h2 className="text-xl md:text-2xl mt-2 font-light flex items-center opacity-90">
                                <span className="mr-4">{formatDate(currentTime)}</span>
                                <span className="px-2 py-0.5 bg-[#fcc314]/20 rounded text-sm text-[#fcc314] uppercase tracking-widest">{activeDay.name}</span>
                            </h2>
                        </div>
                    </div>
                    <div className="text-right bg-[#003057]/50 p-3 rounded-xl ml-4 shrink-0">
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-right opacity-70">Current Time</div>
                        <div className="text-7xl md:text-9xl font-mono font-bold tracking-tighter tabular-nums leading-none">
                            {formatTime(currentTime).slice(0, 5)}
                            <span className="text-4xl md:text-6xl ml-1 opacity-75">{formatTime(currentTime).slice(6)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-grow bg-gray-50 p-4 pb-12 overflow-hidden">
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

                        // Precise font size calculation based on character count
                        const getSubjectStyle = (text) => {
                            const len = text.length;
                            let fontSize = '1.25rem';
                            let lineHeight = '1.2';

                            if (len > 80) { fontSize = '0.85rem'; lineHeight = '1.1'; }
                            else if (len > 60) { fontSize = '1rem'; lineHeight = '1.1'; }
                            else if (len > 45) { fontSize = '1.15rem'; lineHeight = '1.2'; }
                            else if (len > 30) { fontSize = '1.35rem'; lineHeight = '1.2'; }

                            return { fontSize, lineHeight };
                        };

                        const subjectStyle = getSubjectStyle(exam.subject);

                        return (
                            <div key={exam.id} className={`bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 flex flex-col h-full relative ${status.code === 'finished' ? 'opacity-40 grayscale bg-gray-200' : ''}`}>
                                <div className={`h-1.5 w-full shrink-0 ${status.code === 'writing' ? 'bg-green-500 animate-pulse' : status.code === 'reading' ? 'bg-amber-500 animate-pulse' : status.code === 'finished' ? 'bg-[#003057]' : 'bg-gray-300'}`}></div>

                                <div className="flex-grow flex flex-col px-4 pt-3 pb-3 justify-between min-h-0">
                                    {/* Subject Header - Capped at 2 lines */}
                                    <div className="h-12 mb-1 shrink-0 flex justify-between items-start gap-2">
                                        <h3
                                            className="font-bold text-gray-900 line-clamp-2 leading-tight"
                                            style={{ fontSize: subjectStyle.fontSize }}
                                            title={exam.subject}
                                        >
                                            {exam.subject}
                                        </h3>
                                        <div className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${status.code === 'writing' ? 'bg-green-100 text-green-800 border border-green-200' : status.code === 'reading' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                            {status.status}
                                        </div>
                                    </div>

                                    {/* Countdown Area - Consistent large size */}
                                    <div className="flex-grow flex flex-col items-center justify-center min-h-0">
                                        <div className={`text-center ${status.color}`}>
                                            <div className="flex items-baseline justify-center">
                                                <div className={`${status.code === 'finished' ? 'text-xl md:text-2xl' : (status.message.includes(':') ? 'text-4xl md:text-6xl' : 'text-6xl md:text-8xl')} font-bold leading-none tracking-tight font-mono`}>
                                                    {status.message.replace(/remaining|Starts in/g, '').trim()}
                                                </div>
                                                {status.code !== 'finished' && (
                                                    <span className="text-[10px] md:text-xs font-bold ml-1.5 lowercase opacity-80">minutes</span>
                                                )}
                                            </div>
                                            {status.code !== 'finished' && (
                                                <div className="text-[8px] font-bold uppercase tracking-[0.25em] text-gray-400 mt-0.5">Time Left</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timings Footer - Guaranteed clearance */}
                                    <div className="shrink-0 mt-2">
                                        <div className={`grid grid-cols-3 gap-1 mb-2 bg-gray-50 rounded p-1.5 border border-gray-100`}>
                                            <div className="text-center">
                                                <div className="text-[8px] text-gray-400 font-bold uppercase mb-0">Start</div>
                                                <div className="text-xl md:text-2xl font-mono font-bold text-gray-700 leading-tight">{formatShortTime(timings.startTime)}</div>
                                            </div>
                                            <div className="text-center border-l border-gray-200">
                                                <div className="text-[8px] text-gray-400 font-bold uppercase mb-0">Duration</div>
                                                <div className="text-lg md:text-xl font-mono font-bold text-gray-700 leading-tight">{formatDuration(timings.writingDuration)}</div>
                                            </div>
                                            <div className="text-center border-l border-gray-200">
                                                <div className="text-[8px] text-gray-400 font-bold uppercase mb-0">End</div>
                                                <div className="text-xl md:text-2xl font-mono font-bold text-gray-700 leading-tight">{formatShortTime(timings.endTime)}</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 justify-center">
                                            <div className={`flex items-center justify-center px-2 py-1.5 rounded border font-bold w-1/2 ${style30.container} !text-[10px]`}>
                                                <span className={`${style30.label} mr-1`}>30m:</span>
                                                <span className={`${style30.time}`}>{formatShortTime(timings.warning30)}</span>
                                            </div>
                                            <div className={`flex items-center justify-center px-2 py-1.5 rounded border font-bold w-1/2 ${style05.container} !text-[10px]`}>
                                                <span className={`${style05.label} mr-1`}>5m:</span>
                                                <span className={`${style05.time}`}>{formatShortTime(timings.warning05)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="h-10 shrink-0"></div> {/* Spacer for Silence Please */}
                <div className="absolute bottom-2 left-0 right-0 text-center py-2 text-gray-400 flex items-center justify-center opacity-70 pointer-events-none">
                    <Clock size={14} className="mr-2 animate-pulse" />
                    <span className="uppercase text-[10px] tracking-[0.3em] font-medium">Silence Please</span>
                </div>
            </div>
        </div>
    );
};

export default ExamBoard;
