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
  const [centerName, setCenterName] = useState(() => loadState('examCenterName', "STA IB MOCK EXAMS"));
  const [schedule, setSchedule] = useState(() => loadState('examSchedule', [
    { id: 1, name: "New Session", exams: [] }
  ]));

  // --- EFFECTS ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save to LocalStorage whenever these change
  useEffect(() => { localStorage.setItem('examCenterName', JSON.stringify(centerName)); }, [centerName]);
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
    const lines = bulkText.split('\n').filter(l => l.trim());
    const newExams = [];

    lines.forEach((line, index) => {
      // Find the first occurrence of HH:MM for start time
      const timeMatch = line.match(/(\d{1,2}:\d{2})/);
      if (timeMatch) {
        const startTime = timeMatch[1].padStart(5, '0');
        const timeIdx = line.indexOf(timeMatch[1]);
        const subject = line.substring(0, timeIdx).trim();
        const afterTime = line.substring(timeIdx + timeMatch[1].length).trim();
        const durationPart = afterTime.split(/\s+/)[0];

        if (subject && startTime && durationPart) {
          let duration = 0;
          if (durationPart.includes(':')) {
            const [h, m] = durationPart.split(':').map(Number);
            duration = (h * 60) + (m || 0);
          } else {
            duration = parseInt(durationPart) || 0;
          }

          if (duration > 0) {
            newExams.push({
              id: Date.now() + index + Math.random(),
              subject,
              startTime,
              duration,
              readingTime: 5,
              hasReadingTime: true,
              isHidden: false
            });
          }
        }
      }
    });

    if (newExams.length === 0) {
      setImportStatus("No valid exams found. Format: Subject Start Dur");
      return;
    }

    updateActiveDayExams([...activeDay.exams, ...newExams]);
    setBulkText("");
    setImportStatus(`Successfully added ${newExams.length} exams.`);
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
          updateActiveDayExams={updateActiveDayExams}
          setSchedule={setSchedule}
        />
      ) : (
        <ExamBoard
          centerName={centerName}
          currentTime={currentTime}
          activeDay={activeDay}
        />
      )}
    </div>
  );
};

export default App;