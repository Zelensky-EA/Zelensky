import React, { useEffect, useState } from 'react';
import Navigator from './components/Navigator';
import ProgressTracker from './components/ProgressTracker';
import ExamGuide from './components/ExamGuide';

type Tab = 'today' | 'weekly' | 'progress' | 'exam';

const App: React.FC = () => {
  const [tab, setTab] = useState<Tab>('today');
  // Ribbon bookmark: expose scroll progress (0–1) as a CSS variable so the ribbon slides down as the page scrolls.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0; const root = document.documentElement; const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty('--scroll', String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
      // Keep the ribbon in the empty left margin of the notebook page so it never covers content.
      const page = document.querySelector('.course-shell .dreadful-page') || document.querySelector('.course-shell main');
      if (page) root.style.setProperty('--ribbon-left', `${Math.round(page.getBoundingClientRect().left)}px`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll);
    const late = window.setTimeout(update, 400);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (frame) cancelAnimationFrame(frame); window.clearTimeout(late); };
  }, [tab]);
  return <div className="course-shell notebook min-h-screen">
    <div className="ribbon-bookmark" aria-hidden="true" />
    <header className="rpg-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><a className="home-rune" href="../" aria-label="Return to Mr. Zelensky's course selection">Home</a><div><p className="text-xs font-bold uppercase tracking-[0.18em]">Mr. Zelensky’s Notebook</p><h1 className="text-xl font-extrabold">AP Biology</h1></div></div>
        <nav className="rpg-tabs flex p-1" aria-label="AP Biology tools">
          <button className={`rounded px-4 py-2 text-sm font-semibold ${tab === 'today' ? 'active' : ''}`} onClick={() => setTab('today')}>Today</button>
          <button className={`rounded px-4 py-2 text-sm font-semibold ${tab === 'weekly' ? 'active' : ''}`} onClick={() => setTab('weekly')}>Weekly Navigator</button>
          <button className={`rounded px-4 py-2 text-sm font-semibold ${tab === 'progress' ? 'active' : ''}`} onClick={() => setTab('progress')}>CED Progress</button>
          <button className={`rounded px-4 py-2 text-sm font-semibold ${tab === 'exam' ? 'active' : ''}`} onClick={() => setTab('exam')}>AP Exam</button>
        </nav>
      </div>
    </header>
    {tab === 'today' ? <Navigator mode="today" /> : tab === 'weekly' ? <Navigator mode="weekly" /> : tab === 'progress' ? <ProgressTracker /> : <ExamGuide />}
  </div>;
};
export default App;
