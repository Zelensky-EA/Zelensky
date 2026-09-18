import React from 'react';
import { courseData } from '../constants';

const examSource = 'https://apstudents.collegeboard.org/courses/ap-biology/assessment';
const datesSource = 'https://apstudents.collegeboard.org/exam-dates';
const calculatorSource = 'https://apstudents.collegeboard.org/exam-policies-guidelines/calculator-policies';

const taskVerbs = [
  ['Calculate', 'Show the mathematical steps, substitute values, and include units and significant figures.'],
  ['Construct / Draw', 'Create the requested graph, model, diagram, or representation; include accurate labels when needed.'],
  ['Describe', 'Give the relevant characteristics, patterns, or features. Say what is happening.'],
  ['Determine', 'Reach a conclusion using reasoning, observations, calculations, or the provided data.'],
  ['Evaluate', 'Judge the significance, accuracy, or quality of information or a claim using evidence.'],
  ['Explain', 'State how or why something occurs and connect the evidence to biological reasoning.'],
  ['Identify', 'Name or indicate the requested information. Extra explanation is not required.'],
  ['Justify', 'Give evidence and explain how that evidence supports, qualifies, or defends the claim.'],
  ['Make a claim', 'State a defensible answer based on biological knowledge or evidence.'],
  ['Predict', 'State the likely effect of a change and base the prediction on a pattern, model, or relationship.'],
  ['Represent', 'Use a graph, model, symbols, words, illustrations, or a table to show a biological relationship.'],
  ['State a null hypothesis', 'State that there is no meaningful difference or relationship between the experimental variables.'],
  ['Support a claim', 'Use evidence and reasoning to show why the claim is valid or should be qualified.'],
];

const mcqTips = [
  'Read the question stem before studying a long graph, passage, or diagram so you know what evidence to find.',
  'Translate the question into a simpler sentence: “What changed, and what biological process explains it?”',
  'Predict an answer before reading the choices, then eliminate options that contradict the data or a core principle.',
  'Treat unfamiliar organisms and experiments as applications of familiar biology—the needed evidence is usually in the stimulus.',
  'Use units, axis labels, legends, controls, and error bars; do not answer from the picture alone.',
  'If stuck, mark the question and move on. Return after collecting the points you can earn quickly.',
];

const frqTips = [
  'Circle or underline each task verb and answer every requested part in the labeled space.',
  'Start with a direct answer. Then add only the evidence and reasoning needed for that verb.',
  'Use specific biological language: name the molecule, structure, process, direction of change, and consequence when relevant.',
  'For data questions, cite a value or trend and include units. Do not merely say that one result is “higher.”',
  'For calculations, show your setup and work; for graphs, include labeled axes, an appropriate scale, plotted data, and error bars when supplied.',
  'Do not contradict a correct response with extra guesses. Clear, concise scientific writing earns points.',
];

const ExamGuide: React.FC = () => (
  <main className="exam-guide mx-auto max-w-7xl px-4 py-8">
    <section className="exam-date mb-7 overflow-hidden border border-slate-300 bg-white shadow-xl">
      <div className="flex h-2">{courseData.units.map(unit => <span key={unit.id} className="flex-1" style={{backgroundColor: unit.color}} />)}</div>
      <div className="p-6 sm:p-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-700">2027 AP Biology Exam</p>
        <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Monday, May 3, 2027</h2>
        <p className="mt-2 text-lg font-semibold text-slate-700">Session 2 · Your AP coordinator will provide the exact local start time and room.</p>
      </div>
    </section>

    <section className="mb-6 grid gap-5 lg:grid-cols-2">
      <article className="exam-panel border-t-4 border-cyan-500 bg-white p-6 shadow-md">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-wider text-cyan-800">Section I</p><h3 className="mt-1 text-2xl font-black text-slate-950">Multiple Choice</h3></div><span className="score-badge bg-cyan-100 px-3 py-1 text-sm font-bold text-cyan-900">50%</span></div>
        <div className="my-5 grid grid-cols-2 gap-3"><div className="stat-box bg-slate-100 p-4"><p className="text-3xl font-black text-slate-950">60</p><p className="text-sm text-slate-700">questions</p></div><div className="stat-box bg-slate-100 p-4"><p className="text-3xl font-black text-slate-950">90</p><p className="text-sm text-slate-700">minutes</p></div></div>
        <ul className="list-disc space-y-2 pl-5 text-slate-800"><li>Completed in the Bluebook testing app.</li><li>Includes discrete questions and stimulus-based sets.</li><li>Tests concepts, visual analysis, scientific investigation, calculations, and evidence-based claims.</li></ul>
      </article>

      <article className="exam-panel border-t-4 border-violet-500 bg-white p-6 shadow-md">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-wider text-violet-800">Section II</p><h3 className="mt-1 text-2xl font-black text-slate-950">Free Response</h3></div><span className="score-badge bg-violet-100 px-3 py-1 text-sm font-bold text-violet-900">50%</span></div>
        <div className="my-5 grid grid-cols-2 gap-3"><div className="stat-box bg-slate-100 p-4"><p className="text-3xl font-black text-slate-950">6</p><p className="text-sm text-slate-700">questions</p></div><div className="stat-box bg-slate-100 p-4"><p className="text-3xl font-black text-slate-950">90</p><p className="text-sm text-slate-700">minutes</p></div></div>
        <ul className="list-disc space-y-2 pl-5 text-slate-800"><li>Prompts appear in Bluebook; answers are handwritten in the exam booklet.</li><li>2 long questions worth 9 points each.</li><li>4 short questions worth 4 points each.</li></ul>
      </article>
    </section>

    <section className="exam-section mb-6 border border-slate-300 bg-white p-6 shadow-sm">
      <p className="section-kicker">Write what the exam requests</p>
      <h3 className="text-2xl font-black text-slate-950">AP Biology Task Verbs</h3>
      <p className="mt-1 text-sm text-slate-700">These verbs tell you exactly what earns the point. Match the type and length of your response to the verb.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {taskVerbs.map(([verb, meaning]) => <article className="task-verb" key={verb}><h4>{verb}</h4><p>{meaning}</p></article>)}
      </div>
    </section>

    <section className="mb-6 grid gap-5 lg:grid-cols-2">
      <article className="exam-panel strategy-panel strategy-mcq bg-white p-6 shadow-sm"><h3 className="text-xl font-black text-slate-950">MCQ Tips &amp; Tricks</h3><ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-800">{mcqTips.map(tip => <li key={tip}>{tip}</li>)}</ol></article>
      <article className="exam-panel strategy-panel strategy-frq bg-white p-6 shadow-sm"><h3 className="text-xl font-black text-slate-950">FRQ Tips &amp; Tricks</h3><ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-800">{frqTips.map(tip => <li key={tip}>{tip}</li>)}</ol></article>
    </section>

    <section className="exam-section mb-6 border border-slate-300 bg-white p-6 shadow-sm">
      <p className="section-kicker">Plan before exam day</p>
      <h3 className="text-2xl font-black text-slate-950">How to Study and Prepare</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="prep-card prep-yellow"><h4>What should I highlight?</h4><ul><li>Repeated relationships, cause-and-effect statements, and model limitations.</li><li>Words such as increase, decrease, inhibit, activate, control, and compare.</li><li>Evidence that supports or contradicts a claim—not whole paragraphs.</li></ul></article>
        <article className="prep-card prep-blue"><h4>How to “read” Campbell</h4><ol><li>Preview headings, figures, and summaries first.</li><li>Turn each heading into a question the section should answer.</li><li>Read actively; stop after each process and explain it without looking.</li><li>Redraw figures from memory and connect them to the learning target.</li></ol></article>
        <article className="prep-card prep-pink"><h4>Move Campbell notes into BIOZONE</h4><ol><li>Complete the BIOZONE pages after reading the matching Campbell section.</li><li>Use Campbell to correct or add missing mechanisms and examples—not to copy paragraphs.</li><li>Label every model, figure, and table with the biological “why.”</li><li>Use the finished pages as your compact review guide.</li></ol></article>
        <article className="prep-card prep-green"><h4>Take useful self-notes</h4><ul><li>Write from memory first, then check and correct. Copying while looking creates weak recall.</li><li>Favor diagrams, comparison tables, annotated graphs, and process chains over long sentences.</li><li>For every process, record purpose, location, inputs, steps, outputs, regulation, and what happens when disrupted.</li><li>End each topic with: “Can I explain it? predict it? calculate it? justify it?”</li></ul></article>
      </div>
    </section>

    <section className="study-cycle mb-6 p-6 text-white shadow-sm">
      <h3 className="text-xl font-black">A Study Cycle That Works</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {[['1', 'Retrieve', 'Write or sketch what you remember with notes closed.'], ['2', 'Check', 'Compare with the CED, BIOZONE, Campbell, and class materials.'], ['3', 'Correct', 'Fix misconceptions in a different color and explain the correction.'], ['4', 'Apply', 'Complete mixed MCQs, data analysis, and FRQs.'], ['5', 'Return', 'Review after a delay; do not study a topic only once.']].map(([n, title, detail]) => <article key={n}><b>{n}</b><h4>{title}</h4><p>{detail}</p></article>)}
      </div>
      <p className="mt-4 text-sm">Best evidence of readiness: you can explain an unfamiliar scenario, interpret its data, and justify a prediction without relying on recognition alone.</p>
    </section>

    <section className="calculator-alert mb-6 border-2 border-amber-500 bg-amber-50 p-6 shadow-sm">
      <p className="section-kicker">Rule change for 2027</p>
      <h3 className="text-xl font-black text-slate-950">AP Biology Calculator Policy Change</h3>
      <p className="mt-2 leading-7 text-slate-800"><strong>Handheld calculators with storage capabilities, including graphing calculators, are not allowed on the 2027 AP Biology Exam.</strong> Students may use a 4-function calculator with square root, a scientific nongraphing calculator, or the built-in Desmos scientific calculator in Bluebook.</p>
      <a className="source-button mt-4 inline-block" href={calculatorSource} target="_blank" rel="noreferrer">View the official calculator policy →</a>
    </section>

    <section className="exam-section border border-slate-300 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-black text-slate-950">Exam-day essentials</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-3"><div className="essential-card"><p className="font-bold text-slate-950">Hybrid digital</p><p className="mt-1 text-sm text-slate-700">MCQs and FRQ prompts are delivered in Bluebook; FRQ responses are handwritten.</p></div><div className="essential-card"><p className="font-bold text-slate-950">Calculator permitted</p><p className="mt-1 text-sm text-slate-700">Use an allowed nongraphing handheld calculator or Bluebook’s built-in Desmos scientific calculator.</p></div><div className="essential-card"><p className="font-bold text-slate-950">Reference information</p><p className="mt-1 text-sm text-slate-700">Official equation and reference materials are supplied for the exam.</p></div></div>
      <p className="mt-5 text-sm text-slate-600">Official sources: <a className="font-semibold underline" href={examSource} target="_blank" rel="noreferrer">AP Biology exam format</a> · <a className="font-semibold underline" href={datesSource} target="_blank" rel="noreferrer">2027 AP exam dates</a> · <a className="font-semibold underline" href={calculatorSource} target="_blank" rel="noreferrer">calculator policy</a></p>
    </section>
  </main>
);

export default ExamGuide;
