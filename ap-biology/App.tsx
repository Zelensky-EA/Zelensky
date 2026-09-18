import React, { useState } from 'react';
import Navigator from './components/Navigator';
import ProgressTracker from './components/ProgressTracker';
import ExamGuide from './components/ExamGuide';

type Tab = 'navigator' | 'progress' | 'exam';

const App: React.FC = () => {
  const [tab, setTab] = useState<Tab>('navigator');
  return <div className="course-shell min-h-screen text-slate-100">
    <header className="rpg-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><a className="home-rune" href="../" aria-label="Return to Mr. Zelensky's course selection">⌂</a><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Science Navigator // Quest Log</p><h1 className="text-xl font-extrabold text-white">AP Biology</h1></div></div>
        <nav className="rpg-tabs flex p-1" aria-label="AP Biology tools">
          <button className={`rounded px-4 py-2 text-sm font-semibold ${tab === 'navigator' ? 'active' : ''}`} onClick={() => setTab('navigator')}>Daily Navigator</button>
          <button className={`rounded px-4 py-2 text-sm font-semibold ${tab === 'progress' ? 'active' : ''}`} onClick={() => setTab('progress')}>CED Progress</button>
          <button className={`rounded px-4 py-2 text-sm font-semibold ${tab === 'exam' ? 'active' : ''}`} onClick={() => setTab('exam')}>AP Exam</button>
        </nav>
      </div>
    </header>
    {tab === 'navigator' ? <Navigator /> : tab === 'progress' ? <ProgressTracker /> : <ExamGuide />}
  </div>;
};
export default App;
