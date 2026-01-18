import React, { useEffect } from 'react';
import { Clock, Calendar, Bell } from './Icons';
import { formatTime, formatDate, formatShortTime, getExamStatus, getExamTimings, getWarningStyles, formatDuration } from '../utils/helpers';
import logo from '../assets/logo.png';

const ExamBoard = ({
    centerName,
    currentTime,
    activeDay
}) => {
    const visibleExams = activeDay.exams
        .filter(e => !e.isHidden)
        .sort((a, b) => getExamTimings(a).endTime - getExamTimings(b).endTime);

    // Grid Layout Logic
    const examCount = visibleExams.length;
    const isHighDensity = examCount > 6;
    const is2x2 = examCount === 2;
    let gridClass = "grid-cols-3 grid-rows-2";

    if (examCount === 1) gridClass = "grid-cols-1 grid-rows-1";
    else if (examCount === 2) gridClass = "grid-cols-2 grid-rows-1";
    else if (isHighDensity) gridClass = "grid-cols-3 grid-rows-3";

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
                <div className={`w-full h-full grid ${gridClass} gap-4`}>
                    {visibleExams.length === 0 && (
                        <div className={`col-span-3 ${isHighDensity ? 'row-span-3' : 'row-span-2'} flex flex-col items-center justify-center text-gray-400`}>
                            <Calendar size={64} className="mb-4 opacity-20" />
                            <p className="text-2xl font-light">No exams visible for {activeDay.name}.</p>
                            <p className="mt-2 text-sm opacity-60">Check settings to add exams or unhide them.</p>
                        </div>
                    )}

                    {visibleExams.slice(0, isHighDensity ? 9 : 6).map((exam) => {
                        const status = getExamStatus(exam);
                        const timings = getExamTimings(exam);
                        const style30 = getWarningStyles(timings.warning30, currentTime);
                        const style05 = getWarningStyles(timings.warning05, currentTime);

                        const getSubjectStyle = (text) => {
                            const len = text.length;
                            // Scale UP for high density (3x3)
                            if (isHighDensity) {
                                let fontSize = '1.4rem';
                                let lineHeight = '1.1';
                                if (len > 80) { fontSize = '0.95rem'; lineHeight = '1.1'; }
                                else if (len > 60) { fontSize = '1.05rem'; lineHeight = '1.1'; }
                                else if (len > 45) { fontSize = '1.15rem'; lineHeight = '1.1'; }
                                else if (len > 30) { fontSize = '1.25rem'; lineHeight = '1.1'; }
                                return { fontSize, lineHeight };
                            }

                            // 2x2 display - keep larger
                            if (is2x2) {
                                let fontSize = '2.0rem';
                                let lineHeight = '1.1';
                                if (len > 80) { fontSize = '1.1rem'; lineHeight = '1.1'; }
                                else if (len > 60) { fontSize = '1.25rem'; lineHeight = '1.1'; }
                                else if (len > 45) { fontSize = '1.4rem'; lineHeight = '1.1'; }
                                else if (len > 30) { fontSize = '1.6rem'; lineHeight = '1.1'; }
                                return { fontSize, lineHeight };
                            }

                            // 2x3 display - smaller, with extra reduction for 2-line titles
                            let fontSize = '1.75rem';
                            let lineHeight = '1.1';
                            if (len > 80) { fontSize = '0.95rem'; lineHeight = '1.1'; }
                            else if (len > 60) { fontSize = '1.05rem'; lineHeight = '1.1'; }
                            else if (len > 45) { fontSize = '1.2rem'; lineHeight = '1.1'; }
                            else if (len > 30) { fontSize = '1.4rem'; lineHeight = '1.1'; }
                            return { fontSize, lineHeight };
                        };

                        const subjectStyle = getSubjectStyle(exam.subject);

                        // Check for final 2 minutes
                        const msRemaining = timings.endTime - currentTime;
                        const isFinalTwoMinutes = status.code === 'writing' && msRemaining <= 120000 && msRemaining > 0;

                        // Calculate progress
                        let progress = 0;
                        if (status.code === 'reading') {
                            const totalDuration = timings.readingEndTime - timings.startTime;
                            const elapsed = currentTime - timings.startTime;
                            progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                        } else if (status.code === 'writing') {
                            const totalDuration = timings.endTime - timings.readingEndTime;
                            const elapsed = currentTime - timings.readingEndTime;
                            progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                        } else if (status.code === 'finished') {
                            progress = 100;
                        }

                        return (
                            <div key={exam.id} className={`bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 flex flex-col h-full relative ${status.code === 'finished' ? 'opacity-30 grayscale-[0.8] bg-gray-50 border-gray-100' : ''}`}>
                                <div className="h-1.5 w-full shrink-0 bg-gray-200">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-linear ${status.code === 'writing' ? 'bg-green-500 animate-pulse' : status.code === 'reading' ? 'bg-amber-500 animate-pulse' : status.code === 'finished' ? 'bg-[#003057]' : 'bg-transparent'}`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>

                                <div className={`flex-grow flex flex-col px-4 ${isHighDensity ? 'pt-2 pb-1' : 'pt-3 pb-3'} justify-between min-h-0`}>
                                    {/* Subject Header - Row layout with flex constraints */}
                                    <div className={`shrink-0 flex justify-between items-start gap-2 mb-1 ${isHighDensity ? 'h-12' : 'h-16'}`}>
                                        <h3
                                            className="font-bold text-gray-900 line-clamp-2 leading-tight flex-1 min-w-0"
                                            style={{ fontSize: subjectStyle.fontSize, lineHeight: subjectStyle.lineHeight }}
                                            title={exam.subject}
                                        >
                                            {exam.subject}
                                        </h3>
                                        <div className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${status.code === 'writing' ? 'bg-green-100 text-green-800 border border-green-200' : status.code === 'reading' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                            {status.status}
                                        </div>
                                    </div>

                                    {/* Countdown Area - Consistent large size */}
                                    <div className={`flex-grow flex flex-col items-center justify-center min-h-0 ${isHighDensity ? '-mt-4' : 'pb-4'}`}>
                                        <div className={`text-center ${status.color}`}>
                                            <div className="flex items-baseline justify-center">
                                                <div className={`${status.code === 'finished' ? (isHighDensity ? 'text-lg md:text-xl' : 'text-xl md:text-2xl') : (isHighDensity ? 'text-4xl md:text-5xl' : (examCount <= 2 ? 'text-7xl md:text-9xl' : 'text-5xl md:text-7xl'))} font-bold leading-none tracking-tight font-mono`}>
                                                    {status.message.replace(/remaining|Starts in/g, '').trim()}
                                                </div>
                                                {status.code !== 'finished' && status.showMinutesLabel && (
                                                    <span className={`${isHighDensity ? 'text-[8px] md:text-[9px]' : 'text-[10px] md:text-xs'} font-bold ml-1.5 lowercase opacity-80`}>minutes</span>
                                                )}
                                            </div>
                                            {status.code !== 'finished' && (
                                                <div className={`${isHighDensity ? 'text-[6px] mt-0.5' : 'text-[8px] mt-0.5'} font-bold uppercase tracking-[0.25em] text-gray-500`}>Time Remaining</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timings Footer - Guaranteed clearance */}
                                    <div className={`shrink-0 ${isHighDensity ? 'mt-0.5' : 'mt-2'}`}>
                                        <div className={`grid grid-cols-3 gap-1 ${isHighDensity ? 'mb-1 p-0.5' : 'mb-2 p-1.5'} ${status.code === 'finished' ? 'bg-gray-50 border-gray-100 opacity-75' : 'bg-gray-100 border-gray-300'} rounded border`}>
                                            <div className="text-center flex flex-col justify-center h-full">
                                                <div className={`text-[8px] ${status.code === 'finished' ? 'text-gray-400' : 'text-gray-500'} font-bold uppercase mb-0`}>Start</div>
                                                <div className={`${isHighDensity ? 'text-base md:text-lg' : 'text-xl md:text-2xl'} font-mono font-bold ${status.code === 'finished' ? 'text-gray-400' : 'text-gray-900'} leading-tight`}>{formatShortTime(timings.startTime)}</div>
                                            </div>
                                            <div className={`text-center flex flex-col justify-center h-full border-l ${status.code === 'finished' ? 'border-gray-200' : 'border-gray-300'}`}>
                                                <div className={`text-[8px] ${status.code === 'finished' ? 'text-gray-400' : 'text-gray-500'} font-bold uppercase mb-0`}>Duration</div>
                                                <div className={`${isHighDensity ? 'text-sm md:text-base' : 'text-lg md:text-xl'} font-mono font-bold ${status.code === 'finished' ? 'text-gray-400' : 'text-gray-900'} leading-tight`}>{formatDuration(timings.writingDuration)}</div>
                                            </div>
                                            <div className={`text-center flex flex-col justify-center h-full ${isFinalTwoMinutes ? 'bg-red-600 border border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-[pulse_3s_ease-in-out_infinite] ring-2 ring-red-400 rounded' : `border-l ${status.code === 'finished' ? 'border-gray-200' : 'border-gray-300'}`}`}>
                                                <div className={`text-[8px] ${isFinalTwoMinutes ? 'text-white font-black' : (status.code === 'finished' ? 'text-gray-400' : 'text-gray-500')} font-bold uppercase mb-0`}>End</div>
                                                <div className={`${isHighDensity ? 'text-lg md:text-xl' : 'text-3xl md:text-4xl'} font-mono font-black ${isFinalTwoMinutes ? 'text-white' : (status.code === 'finished' ? 'text-gray-400' : 'text-red-600')} leading-tight`}>{formatShortTime(timings.endTime)}</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 justify-center">
                                            <div className={`flex items-center justify-center ${isHighDensity ? 'px-1 py-0.5' : 'px-2 py-1.5'} rounded border font-bold w-1/2 ${style30.container} ${isHighDensity ? '!text-[8px]' : '!text-[10px]'}`}>
                                                <span className={`${style30.label} mr-1`}>30m:</span>
                                                <span className={`${style30.time}`}>{formatShortTime(timings.warning30)}</span>
                                            </div>
                                            <div className={`flex items-center justify-center ${isHighDensity ? 'px-1 py-0.5' : 'px-2 py-1.5'} rounded border font-bold w-1/2 ${style05.container} ${isHighDensity ? '!text-[8px]' : '!text-[10px]'}`}>
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
