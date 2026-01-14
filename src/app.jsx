import React, { useState, useEffect } from 'react';
import { Settings, Maximize, Minimize } from './components/Icons';
import SetupPanel from './components/SetupPanel';
import ExamBoard from './components/ExamBoard';

const App = () => {
  // --- PERSISTENCE HELPER ---
  // Load state from local storage or use default
  const loadState = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.warn("Failed to load from local storage", e);
      return defaultValue;
    }
  };

  // --- STATE ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDayId, setActiveDayId] = useState(1);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [importStatus, setImportStatus] = useState("");

  // Persisted States
  const [centerName, setCenterName] = useState(() => loadState('examCenterName', "MOCK EXAMINATION WEEK"));
  const [logoUrl, setLogoUrl] = useState(() => loadState('examLogoUrl', "https://img.icons8.com/color/96/school.png"));
  const [schedule, setSchedule] = useState(() => loadState('examSchedule', [
    {
      id: 1, name: "Day 1", exams: [
        { id: 101, subject: "Biology/Chemistry/Physics/SEHS HL P2", startTime: "08:15", duration: 150, readingTime: 5, hasReadingTime: true, isHidden: false },
        { id: 102, subject: "Comp Sci HL P1", startTime: "08:15", duration: 130, readingTime: 5, hasReadingTime: true, isHidden: false },
        { id: 103, subject: "ESS SL P2", startTime: "08:15", duration: 120, readingTime: 5, hasReadingTime: true, isHidden: false },
        { id: 104, subject: "Bio/Chem/Phys/SEHS SL P2 / Comp Sci SL P1 / DT HL P3", startTime: "08:15", duration: 90, readingTime: 5, hasReadingTime: true, isHidden: false }
      ]
    },
    { id: 2, name: "Day 2", exams: [] }
  ]));

  // --- EFFECTS ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save to LocalStorage whenever these change
  useEffect(() => { localStorage.setItem('examCenterName', JSON.stringify(centerName)); }, [centerName]);
  useEffect(() => { localStorage.setItem('examLogoUrl', JSON.stringify(logoUrl)); }, [logoUrl]);
  useEffect(() => { localStorage.setItem('examSchedule', JSON.stringify(schedule)); }, [schedule]);

  // --- HELPERS ---
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) { console.warn(err); }
  };

  // --- CRUD OPERATIONS ---
  const addDay = () => {
    const newId = Math.max(...schedule.map(d => d.id), 0) + 1;
    setSchedule([...schedule, { id: newId, name: `Day ${newId}`, exams: [] }]);
    setActiveDayId(newId);
  };
  const updateDayName = (id, name) => setSchedule(schedule.map(day => day.id === id ? { ...day, name } : day));
  const deleteDay = (id) => {
    if (schedule.length <= 1) return;
    const newSchedule = schedule.filter(d => d.id !== id);
    setSchedule(newSchedule);
    if (activeDayId === id) setActiveDayId(newSchedule[0].id);
  };
  const activeDay = schedule.find(d => d.id === activeDayId) || schedule[0];
  const updateActiveDayExams = (newExams) => setSchedule(schedule.map(d => d.id === activeDayId ? { ...d, exams: newExams } : d));
  const addExam = () => updateActiveDayExams([...activeDay.exams, { id: Date.now(), subject: "New Subject", startTime: "09:00", duration: 60, readingTime: 0, hasReadingTime: false, isHidden: false }]);
  const removeExam = (examId) => updateActiveDayExams(activeDay.exams.filter(e => e.id !== examId));
  const updateExam = (examId, field, value) => updateActiveDayExams(activeDay.exams.map(e => e.id === examId ? { ...e, [field]: value } : e));
  const toggleHideExam = (examId) => updateActiveDayExams(activeDay.exams.map(e => e.id === examId ? { ...e, isHidden: !e.isHidden } : e));

  const duplicateExam = (examId, extraTimePercent) => {
    const original = activeDay.exams.find(e => e.id === examId);
    if (!original) return;
    const newDuration = Math.ceil(parseInt(original.duration) * (1 + extraTimePercent / 100));
    const etExams = activeDay.exams.filter(e => /^ET-\d+$/.test(e.subject));
    let maxNum = 0;
    etExams.forEach(e => { const num = parseInt(e.subject.replace('ET-', '')); if (!isNaN(num) && num > maxNum) maxNum = num; });
    updateActiveDayExams([...activeDay.exams, { ...original, id: Date.now(), subject: `ET-${maxNum + 1}`, duration: newDuration, isHidden: false }]);
  };

  const handleBulkImport = () => {
    if (!bulkText.trim()) return;
    const regex = /([a-zA-Z\s\/&]+?)\s+(HL|SL)\s+(P\d)\s*(\d{1,2}:\d{2})\s*(\d{1,2}:\d{2})\s*(\d{1,2}:\d{2})/gi;
    const matches = [...bulkText.matchAll(regex)];
    if (matches.length === 0) { setImportStatus("No valid exams found. Check format."); return; }
    const parsedExams = [];
    matches.forEach(match => {
      const [durH, durM] = match[4].split(':').map(Number);
      parsedExams.push({ subjectRaw: `${match[1].trim()} ${match[2]} ${match[3]}`, startTime: match[5].padStart(5, '0'), duration: (durH * 60) + durM });
    });
    const mergedExamsMap = new Map();
    parsedExams.forEach(exam => {
      const key = `${exam.startTime}-${exam.duration}`;
      if (mergedExamsMap.has(key)) mergedExamsMap.get(key).subjectRaw += ` / ${exam.subjectRaw}`;
      else mergedExamsMap.set(key, { ...exam });
    });
    const newExamObjects = Array.from(mergedExamsMap.values()).map((ex, index) => ({ id: Date.now() + index, subject: ex.subjectRaw, startTime: ex.startTime, duration: ex.duration, readingTime: 5, hasReadingTime: true, isHidden: false }));
    updateActiveDayExams([...activeDay.exams, ...newExamObjects]);
    setBulkText("");
    setImportStatus(`Successfully added ${newExamObjects.length} exam slots.`);
    setTimeout(() => setImportStatus(""), 3000);
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col ${isSetupMode ? 'bg-gray-100' : 'bg-gray-50'}`}>
      <div className={`fixed top-0 left-0 right-0 p-2 flex justify-between items-center z-50 transition-opacity duration-300 ${!isSetupMode ? 'opacity-0 hover:opacity-100 bg-gray-900/90 text-white' : 'bg-white shadow-sm text-gray-800'}`}>
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsSetupMode(!isSetupMode)} className="flex items-center space-x-2 px-3 py-1 rounded hover:bg-gray-200 hover:text-gray-900 transition">
            <Settings size={18} /> <span className="text-sm font-medium">{isSetupMode ? 'Go to Exam View' : 'Edit Settings'}</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleFullscreen} className="p-1 hover:text-blue-500">{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}</button>
        </div>
      </div>

      {isSetupMode ? (
        <SetupPanel
          centerName={centerName}
          setCenterName={setCenterName}
          logoUrl={logoUrl}
          setLogoUrl={setLogoUrl}
          schedule={schedule}
          activeDayId={activeDayId}
          setActiveDayId={setActiveDayId}
          addDay={addDay}
          updateDayName={updateDayName}
          deleteDay={deleteDay}
          activeDay={activeDay}
          setIsSetupMode={setIsSetupMode}
          isBulkImportOpen={isBulkImportOpen}
          setIsBulkImportOpen={setIsBulkImportOpen}
          bulkText={bulkText}
          setBulkText={setBulkText}
          importStatus={importStatus}
          handleBulkImport={handleBulkImport}
          addExam={addExam}
          toggleHideExam={toggleHideExam}
          duplicateExam={duplicateExam}
          removeExam={removeExam}
          updateExam={updateExam}
        />
      ) : (
        <ExamBoard
          centerName={centerName}
          logoUrl={logoUrl}
          currentTime={currentTime}
          activeDay={activeDay}
        />
      )}
    </div>
  );
};

export default App;