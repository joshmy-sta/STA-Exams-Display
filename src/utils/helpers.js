export const formatTime = (date) => date.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
export const formatShortTime = (date) => date.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' });
export const formatDate = (date) => date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export const getExamTimings = (exam) => {
    const [startH, startM] = exam.startTime.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(startH, startM, 0);

    const readingDuration = exam.hasReadingTime ? parseInt(exam.readingTime) : 0;
    const writingDuration = parseInt(exam.duration);

    const readingEndTime = new Date(startTime);
    readingEndTime.setMinutes(startTime.getMinutes() + readingDuration);

    const endTime = new Date(readingEndTime);
    endTime.setMinutes(readingEndTime.getMinutes() + writingDuration);

    const warning30 = new Date(endTime);
    warning30.setMinutes(endTime.getMinutes() - 30);

    const warning05 = new Date(endTime);
    warning05.setMinutes(endTime.getMinutes() - 5);

    return { startTime, readingEndTime, endTime, warning30, warning05, writingDuration };
};

export const getExamStatus = (exam) => {
    const now = new Date();
    const { startTime, readingEndTime, endTime } = getExamTimings(exam);

    const formatRemaining = (diffMs) => {
        const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
        const totalMins = Math.ceil(diffMs / 60000); // Ceiling for "MM" display matches previous behavior
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;

        // Final 30 minutes includes everything from 30:00 down to 00:00
        if (diffMs <= 30 * 60 * 1000) {
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        return `${totalMins}`;
    };

    if (now < startTime) {
        const diffMs = startTime - now;
        return { status: 'UPCOMING', message: `Starts in ${formatRemaining(diffMs)}`, color: 'text-blue-600', code: 'upcoming' };
    } else if (exam.hasReadingTime && now < readingEndTime) {
        const diffMs = readingEndTime - now;
        return { status: 'READING TIME', message: `${formatRemaining(diffMs)} remaining`, color: 'text-amber-600', code: 'reading' };
    } else if (now < endTime) {
        const diffMs = endTime - now;
        const color = diffMs <= 5 * 60 * 1000 ? 'text-red-600' : 'text-green-600';
        return { status: 'WRITING TIME', message: `${formatRemaining(diffMs)} remaining`, color: color, code: 'writing' };
    } else {
        return { status: 'FINISHED', message: 'Exam Finished', color: 'text-[#003057]', code: 'finished' };
    }
};

export const getWarningStyles = (warningTime, currentTime) => {
    const diff = (warningTime - currentTime) / 60000;
    if (diff < 0) return { container: "bg-gray-100 border-gray-200 opacity-50 grayscale", icon: "text-gray-400", label: "text-gray-400", time: "text-gray-400 line-through" };
    if (diff <= 3) return { container: "bg-red-600 border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-[pulse_3s_ease-in-out_infinite] ring-2 ring-red-400", icon: "text-white", label: "text-white font-black", time: "text-white font-black" };
    return { container: "bg-gray-100 border-gray-300", icon: "text-gray-500", label: "text-gray-700 font-bold", time: "text-gray-900 font-black" };
};

export const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
};

export const parseDuration = (durationStr) => {
    if (!durationStr) return 0;
    if (String(durationStr).includes(':')) {
        const [h, m] = durationStr.split(':').map(Number);
        return (h * 60) + (m || 0);
    }
    return parseInt(durationStr) || 0;
};
