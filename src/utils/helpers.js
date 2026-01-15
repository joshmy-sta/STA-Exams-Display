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

    if (now < startTime) {
        const diff = Math.ceil((startTime - now) / 60000);
        return { status: 'UPCOMING', message: `Starts in ${diff} mins`, color: 'text-blue-600', code: 'upcoming' };
    } else if (exam.hasReadingTime && now < readingEndTime) {
        const diff = Math.ceil((readingEndTime - now) / 60000);
        return { status: 'READING TIME', message: `${diff} mins remaining`, color: 'text-amber-600', code: 'reading' };
    } else if (now < endTime) {
        const diff = Math.ceil((endTime - now) / 60000);
        return { status: 'WRITING TIME', message: `${diff} mins remaining`, color: 'text-green-600', code: 'writing' };
    } else {
        return { status: 'FINISHED', message: 'Exam Ended', color: 'text-green-600', code: 'finished' };
    }
};

export const getWarningStyles = (warningTime, currentTime) => {
    const diff = (warningTime - currentTime) / 60000;
    if (diff < 0) return { container: "bg-gray-100 border-gray-200 opacity-50 grayscale", icon: "text-gray-400", label: "text-gray-400", time: "text-gray-400 line-through" };
    if (diff <= 3) return { container: "bg-red-50 border-red-200 shadow-md animate-pulse ring-1 ring-red-200", icon: "text-red-500", label: "text-red-700 font-bold", time: "text-red-900 font-bold" };
    return { container: "bg-gray-50 border-gray-100", icon: "text-gray-400", label: "text-gray-600 font-semibold", time: "text-gray-900 font-bold" };
};

export const parseDuration = (durationStr) => {
    if (!durationStr) return 0;
    if (String(durationStr).includes(':')) {
        const [h, m] = durationStr.split(':').map(Number);
        return (h * 60) + (m || 0);
    }
    return parseInt(durationStr) || 0;
};
