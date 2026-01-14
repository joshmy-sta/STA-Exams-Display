import React from 'react';
import { Settings, Plus, Trash2, Eye, EyeOff, Copy, FileText, ChevronDown, ChevronUp } from './Icons';
import { formatShortTime, getExamTimings } from '../utils/helpers';

const SetupPanel = ({
    centerName,
    setCenterName,
    logoUrl,
    setLogoUrl,
    schedule,
    activeDayId,
    setActiveDayId,
    addDay,
    updateDayName,
    deleteDay,
    activeDay,
    setIsSetupMode,
    isBulkImportOpen,
    setIsBulkImportOpen,
    bulkText,
    setBulkText,
    importStatus,
    handleBulkImport,
    addExam,
    toggleHideExam,
    duplicateExam,
    removeExam,
    updateExam
}) => {
    return (
        <div className="container mx-auto pt-20 pb-10 px-4 max-w-6xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Exam Dashboard Setup</h1>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-sm font-bold uppercase text-gray-500 mb-3 tracking-wider">Global Title</h2>
                        <input
                            type="text"
                            value={centerName}
                            onChange={(e) => setCenterName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <label className="block text-xs font-bold text-gray-500 uppercase mt-3 mb-1">Logo URL (Optional)</label>
                        <input
                            type="text"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm outline-none"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-sm font-bold uppercase text-gray-500 tracking-wider">Days</h2>
                            <button onClick={addDay} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Plus size={16} /></button>
                        </div>
                        <div className="space-y-2">
                            {schedule.map(day => (
                                <div
                                    key={day.id}
                                    onClick={() => setActiveDayId(day.id)}
                                    className={`p-3 rounded-lg cursor-pointer border transition-all flex justify-between items-center group ${activeDayId === day.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                                >
                                    <div className="flex-1">
                                        {activeDayId === day.id ? (
                                            <input
                                                type="text"
                                                value={day.name}
                                                onChange={(e) => updateDayName(day.id, e.target.value)}
                                                className="bg-transparent font-medium text-blue-900 w-full outline-none"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (<span className="font-medium text-gray-700">{day.name}</span>)}
                                        <div className="text-xs text-gray-400 mt-1">{day.exams.length} exams</div>
                                    </div>
                                    {schedule.length > 1 && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteDay(day.id); }}
                                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex justify-between items-end mb-2">
                        <h2 className="text-xl font-bold text-gray-800">Schedule for <span className="text-blue-600">{activeDay.name}</span></h2>
                        <button
                            onClick={() => setIsSetupMode(false)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm font-bold text-sm transition flex items-center"
                        >
                            <Eye size={16} className="mr-2" /> View Board
                        </button>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <button
                            onClick={() => setIsBulkImportOpen(!isBulkImportOpen)}
                            className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition text-left"
                        >
                            <div className="flex items-center text-gray-700 font-bold"><FileText size={18} className="mr-2 text-blue-600" /> Bulk Import Exams</div>
                            {isBulkImportOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                        </button>
                        {isBulkImportOpen && (
                            <div className="p-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500 mb-2">Paste exams in format: <strong>Subject HL/SL P# Duration Start Finish</strong>.</p>
                                <textarea
                                    value={bulkText}
                                    onChange={(e) => setBulkText(e.target.value)}
                                    placeholder={"Biology HL P2 2:30 08:15 10:45"}
                                    className="w-full h-32 p-3 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-y mb-3"
                                />
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm font-bold ${importStatus.includes("No") ? "text-red-500" : "text-green-600"}`}>{importStatus}</span>
                                    <button onClick={handleBulkImport} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-bold">Process & Add Exams</button>
                                </div>
                            </div>
                        )}
                    </div>
                    {activeDay.exams.map((exam) => {
                        const timings = getExamTimings(exam);
                        return (
                            <div key={exam.id} className={`bg-white p-4 rounded-lg shadow-sm border transition-all ${exam.isHidden ? 'border-gray-200 opacity-60 bg-gray-50' : 'border-gray-300'}`}>
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => toggleHideExam(exam.id)}
                                            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${exam.isHidden ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}
                                        >
                                            {exam.isHidden ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />} <span>{exam.isHidden ? "Hidden" : "Visible"}</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase mr-2">Create Extra Time:</span>
                                        <button onClick={() => duplicateExam(exam.id, 25)} className="flex items-center px-2 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-xs font-bold transition"><Copy size={12} className="mr-1" /> +25%</button>
                                        <button onClick={() => duplicateExam(exam.id, 50)} className="flex items-center px-2 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-xs font-bold transition"><Copy size={12} className="mr-1" /> +50%</button>
                                        <div className="w-px h-4 bg-gray-200 mx-2"></div>
                                        <button onClick={() => removeExam(exam.id)} className="text-gray-400 hover:text-red-500 transition p-1"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-4"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label><input type="text" value={exam.subject} onChange={(e) => updateExam(exam.id, 'subject', e.target.value)} className="w-full p-2 border border-gray-300 rounded font-medium text-sm" /></div>
                                    <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label><input type="time" value={exam.startTime} onChange={(e) => updateExam(exam.id, 'startTime', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm" /></div>
                                    <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (Mins)</label><input type="number" value={exam.duration} onChange={(e) => updateExam(exam.id, 'duration', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm" /></div>
                                    <div className="md:col-span-3">
                                        <div className="flex items-center space-x-2 mb-2"><input type="checkbox" checked={exam.hasReadingTime} onChange={(e) => updateExam(exam.id, 'hasReadingTime', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" /><label className="text-xs text-gray-700">Reading Time?</label></div>
                                        {exam.hasReadingTime && (<div className="flex items-center space-x-2"><input type="number" value={exam.readingTime} onChange={(e) => updateExam(exam.id, 'readingTime', e.target.value)} className="w-16 p-2 border border-gray-300 rounded text-xs" /><span className="text-xs text-gray-500">mins</span></div>)}
                                    </div>
                                    <div className="md:col-span-1 text-center bg-gray-50 p-2 rounded"><div className="text-[10px] text-gray-500 uppercase font-bold">End</div><div className="font-bold text-gray-800 text-sm">{formatShortTime(timings.endTime)}</div></div>
                                </div>
                            </div>
                        );
                    })}
                    <button onClick={addExam} className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition flex items-center justify-center font-medium"><Plus size={20} className="mr-2" /> Add Subject</button>
                </div>
            </div>
        </div>
    );
};

export default SetupPanel;
