import React, { useEffect, useMemo, useState } from 'react';
import snapshot from '../data/calendar.json';
import { courseData } from '../constants';

// One row of the AP Biology COURSE CALENDAR sheet.
// Columns A–K are the original layout; L–N (dayType, assignmentDue, studentSummary) were added Nov 2026.
interface CalendarEntry {
  week:number; day:string; date:string; cedTopic:string; learningTarget:string; classwork:string;
  campbell:string; biozone:string; homework:string; apTarget:string; teacherNote:string;
  dayType:string; assignmentDue:string; studentSummary:string;
}
interface NavigatorProps { mode:'today'|'weekly'; }
type DayKind = 'class'|'block'|'exam'|'no-class'|'homework-only'|'tbd';

// Published COURSE CALENDAR tab of the master AP Biology Navigator sheet (Nov 2026).
const CSV_URL='https://docs.google.com/spreadsheets/d/e/2PACX-1vSkHbGP_LXyehmkA-s6KC7qT6hiGWszAQ1ZMBcNCRiSQg2GMSpB0VSzFashaOmt_B-7WocIR38xqJIw/pub?gid=1962443842&single=true&output=csv';
const COURSE='AP Biology';

function toIso(value:string){
  const raw=String(value||'').trim();if(!raw)return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw))return raw;
  const us=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})/);
  if(us){const year=us[3].length===2?`20${us[3]}`:us[3];return `${year}-${us[1].padStart(2,'0')}-${us[2].padStart(2,'0')}`;}
  const d=new Date(raw);return Number.isNaN(d.getTime())?raw:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function isIsoDate(value:string){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(new Date(`${value}T12:00:00`).getTime());}
const text=(v:unknown)=>String(v??'').trim();

// "None", "None today", "N/A" or a dash in the homework column means no assignment.
const NO_HOMEWORK=/^(none( today)?|no homework|n\/a|[-–—])\.?$/i;
function normalize(raw:Partial<CalendarEntry>):CalendarEntry{
  return {week:Number(raw.week)||0,day:text(raw.day),date:toIso(text(raw.date)),cedTopic:text(raw.cedTopic),learningTarget:text(raw.learningTarget),classwork:text(raw.classwork),
    campbell:text(raw.campbell),biozone:text(raw.biozone),homework:NO_HOMEWORK.test(text(raw.homework))?'':text(raw.homework),apTarget:text(raw.apTarget),teacherNote:text(raw.teacherNote),
    dayType:text(raw.dayType),assignmentDue:toIso(text(raw.assignmentDue)),studentSummary:text(raw.studentSummary)};
}

function parseCsv(csv:string):CalendarEntry[]{
  const rows:string[][]=[];let row:string[]=[];let cell='',quoted=false;
  for(let i=0;i<csv.length;i++){const c=csv[i],n=csv[i+1];if(c==='"'&&quoted&&n==='"'){cell+='"';i++;}else if(c==='"')quoted=!quoted;else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}else cell+=c;}
  if(cell||row.length){row.push(cell);rows.push(row);}
  const header=rows.findIndex(r=>r.some(v=>v.trim().toLowerCase()==='week'));if(header<0)return [];
  // Columns are found by header name, so inserting or reordering sheet columns cannot shift data into the wrong field.
  const names=rows[header].map(h=>h.replace(/\s+/g,' ').trim().toLowerCase());
  const col=(fallback:number,...labels:string[])=>{const i=names.findIndex(n=>labels.some(l=>n===l||n.startsWith(l)));return i>=0?i:fallback;};
  const exact=(...labels:string[])=>names.findIndex(n=>labels.includes(n));
  const c={week:col(0,'week'),day:exact('day')>=0?exact('day'):1,date:col(2,'date'),cedTopic:col(3,'ced topic'),learningTarget:col(4,'topic title'),classwork:exact('class')>=0?exact('class'):5,
    campbell:col(6,'campbell'),biozone:col(7,'biozone'),homework:col(8,'home after class'),apTarget:col(9,'ap target'),teacherNote:col(10,'teacher note','message'),
    dayType:col(-1,'day type'),assignmentDue:col(-1,'assignment due','due'),studentSummary:col(-1,'student summary')};
  const get=(r:string[],i:number)=>i>=0?r[i]||'':'';
  return rows.slice(header+1).map(r=>normalize(Object.fromEntries(Object.entries(c).map(([k,i])=>[k,get(r,i)])) as Partial<CalendarEntry>)).filter(e=>isIsoDate(e.date));
}

const hasLesson=(e:CalendarEntry)=>[e.cedTopic,e.learningTarget,e.classwork,e.campbell,e.biozone,e.homework,e.apTarget,e.teacherNote,e.studentSummary,e.dayType].some(Boolean);

// What kind of day is this for students? The sheet's Day Type column wins; otherwise infer it.
function dayKind(e:CalendarEntry):DayKind{
  const t=e.dayType.toLowerCase();
  if(t.startsWith('no'))return 'no-class';
  if(t.startsWith('home'))return 'homework-only';
  if(t.startsWith('exam')||t.startsWith('test'))return 'exam';
  if(t.startsWith('block'))return 'block';
  if(t.startsWith('class'))return 'class';
  if(/^no class\b/i.test(e.classwork))return 'no-class';
  if(/^thu/i.test(e.day))return 'homework-only'; // AP Biology does not meet on Thursdays
  if(!hasLesson(e))return 'tbd'; // nothing entered yet
  return 'class';
}
const meets=(e:CalendarEntry)=>['class','block','exam'].includes(dayKind(e));
const KIND_LABEL:Record<DayKind,string>={class:'Class',block:'Block day',exam:'Exam day','no-class':'No class','homework-only':'No class · homework only',tbd:'Plan not posted yet'};

const formatDate=(value:string,opts:Intl.DateTimeFormatOptions={weekday:'long',month:'long',day:'numeric'})=>{const d=new Date(`${value}T12:00:00`);return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat('en-US',opts).format(d);};
const shortDate=(v:string)=>formatDate(v,{weekday:'short',month:'numeric',day:'numeric'});
const localIso=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const addDays=(iso:string,n:number)=>{const d=new Date(`${iso}T12:00:00`);d.setDate(d.getDate()+n);return localIso(d);};
function dueLabel(due:string,todayIso:string){
  if(!due)return 'Due date TBA';
  if(due===todayIso)return 'Due today';
  if(due===addDays(todayIso,1))return `Due tomorrow (${shortDate(due)})`;
  if(due<todayIso)return `Was due ${shortDate(due)}`;
  return `Due ${shortDate(due)}`;
}
const unitColor=(entry:CalendarEntry)=>courseData.units[Number(entry.cedTopic.split('.')[0])-1]?.color||'#3e382b';
const headline=(e:CalendarEntry)=>e.studentSummary||e.learningTarget.split('\n')[0]||(e.cedTopic?`Topic ${e.cedTopic}`:'');
const iCan=(e:CalendarEntry)=>e.learningTarget.split('\n').slice(1).join('\n').trim();

function navigatorWeekBounds(now:Date){
  const monday=new Date(now);monday.setHours(12,0,0,0);
  const day=monday.getDay();
  monday.setDate(monday.getDate()+(day===6?2:day===0?1:1-day));
  const friday=new Date(monday);friday.setDate(monday.getDate()+4);
  return {start:localIso(monday),end:localIso(friday)};
}

function TeacherMessage({note}:{note:string}){
  return note?<aside className="teacher-message"><h4>From Mr. Zelensky</h4><p>{note}</p></aside>:null;
}

function LessonCard({entry,compact=false,todayIso,dueHere=[]}:{entry:CalendarEntry;compact?:boolean;todayIso:string;dueHere?:CalendarEntry[]}){
  const kind=dayKind(entry),isToday=entry.date===todayIso,past=entry.date<todayIso;
  const resources:Array<[string,string]>=[['I can',iCan(entry)],['Campbell (read)',entry.campbell],['BIOZONE',entry.biozone],['AP target',entry.apTarget]].filter(([,v])=>v) as Array<[string,string]>;
  return <article className={`dreadful-lesson kind-${kind} ${compact?'compact':''} ${isToday?'current':''}`} style={{'--unit-color':unitColor(entry)} as React.CSSProperties}>
    <header>
      <div><p className="issue-line">{KIND_LABEL[kind]}</p><h3>{formatDate(entry.date,compact?{weekday:'long',month:'short',day:'numeric'}:undefined)}</h3></div>
      <div className="lesson-marks">{isToday&&<span>Today</span>}{entry.cedTopic&&meets(entry)&&<b>CED {entry.cedTopic}</b>}</div>
    </header>
    {dueHere.length>0&&<section className="due-here"><h4>Due this day</h4><ul>{dueHere.map((d,i)=><li key={i}>{d.homework} <small>(assigned {shortDate(d.date)})</small></li>)}</ul></section>}
    <TeacherMessage note={entry.teacherNote}/>
    {meets(entry)?<>
      {headline(entry)&&<p className="lesson-headline">{headline(entry)}</p>}
      <section className="lesson-field field-classwork"><h4>{past?'What we did in class':isToday?'In class today':'Planned for class'}</h4><p>{entry.classwork||'Check with Mr. Zelensky in class.'}</p></section>
    </>:<section className="lesson-field field-noclass"><h4>{KIND_LABEL[kind]}</h4><p>{kind==='homework-only'?'AP Biology does not meet on Thursdays. Use the time for the assignment below.':kind==='tbd'?'Mr. Zelensky has not posted this day yet. Check back later.':'There is no AP Biology class on this day.'}</p></section>}
    <section className={`lesson-field field-homework ${entry.homework?'':'empty'}`}>
      <h4>Assignment</h4>
      {entry.homework?<><p>{entry.homework}</p><p className={`due-line ${entry.assignmentDue?'':'tba'}`}>{dueLabel(entry.assignmentDue,todayIso)}</p></>:<p>No assignment posted.</p>}
    </section>
    {resources.length>0&&meets(entry)&&<details className="lesson-resources"><summary>Learning target &amp; resources</summary>
      {resources.map(([label,value])=><section key={label} className="lesson-field"><h4>{label}</h4><p>{value}</p></section>)}
    </details>}
  </article>;
}

const Navigator:React.FC<NavigatorProps>=({mode})=>{
  const [entries,setEntries]=useState<CalendarEntry[]>(()=>(snapshot as Partial<CalendarEntry>[]).map(normalize).filter(e=>isIsoDate(e.date)));
  const [live,setLive]=useState(false),[weekIndex,setWeekIndex]=useState(0),[initializedKey,setInitializedKey]=useState('');
  useEffect(()=>{fetch(CSV_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.text();}).then(t=>{const parsed=parseCsv(t);if(parsed.some(hasLesson)){setEntries(parsed);setLive(true);}}).catch(()=>setLive(false));},[]);
  const now=new Date(),todayIso=localIso(now);
  const {start:weekStart,end:weekEnd}=navigatorWeekBounds(now);
  const sorted=useMemo(()=>[...entries].sort((a,b)=>a.date.localeCompare(b.date)),[entries]);
  const populated=useMemo(()=>sorted.filter(hasLesson),[sorted]);
  const classDays=useMemo(()=>populated.filter(meets),[populated]);

  // Today tab
  const todayRow=sorted.find(e=>e.date===todayIso);
  const classToday=todayRow&&meets(todayRow)&&hasLesson(todayRow)?todayRow:undefined;
  const lastClass=[...classDays].filter(e=>e.date<todayIso).pop();
  const nextClass=classDays.find(e=>e.date>todayIso);
  // Next day the class should meet, even if its plan is not posted yet
  const nextMeeting=sorted.find(e=>e.date>todayIso&&(meets(e)||dayKind(e)==='tbd'));
  const featured=classToday||lastClass||nextClass;
  const upcomingDue=populated.filter(e=>e.homework&&e.assignmentDue&&e.assignmentDue>=todayIso).sort((a,b)=>a.assignmentDue.localeCompare(b.assignmentDue)).slice(0,6);
  const datedText=new Set(upcomingDue.map(e=>e.homework.toLowerCase()));
  const recentTba=[lastClass,todayRow].filter((e,i,a):e is CalendarEntry=>!!e&&!!e.homework&&!e.assignmentDue&&a.indexOf(e)===i&&!datedText.has(e.homework.toLowerCase()));

  // Weekly tab: every weekday in the selected week, including no-class days
  const weeks=useMemo(()=>[...new Set(populated.map(e=>e.week).filter(Boolean))].sort((a,b)=>a-b),[populated]);
  const dataKey=`${weekStart}|${weeks.join(',')}|${populated.at(-1)?.date||''}`;
  useEffect(()=>{
    if(initializedKey===dataKey||!weeks.length)return;
    const currentWeekEntry=sorted.find(e=>e.date>=weekStart&&e.date<=weekEnd&&e.week);
    const fallback=[...populated].filter(e=>e.date<weekStart).pop()||populated.find(e=>e.date>weekEnd)||populated[0];
    setWeekIndex(Math.max(0,weeks.indexOf((currentWeekEntry||fallback)?.week as number)));
    setInitializedKey(dataKey);
  },[weeks,populated,sorted,weekStart,weekEnd,dataKey,initializedKey]);
  const selectedWeek=weeks[weekIndex],weekEntries=sorted.filter(e=>e.week===selectedWeek);
  const dueOn=(date:string)=>populated.filter(e=>e.homework&&e.assignmentDue===date&&e.date!==date);
  const weekRange=weekEntries.length?`${formatDate(weekEntries[0].date,{month:'short',day:'numeric'})} – ${formatDate(weekEntries.at(-1)!.date,{month:'short',day:'numeric'})}`:'—';

  return <main className="dreadful-main"><div className="dreadful-page">
    <section className="masthead"><p className="edition">lab notebook · 2025 CED edition</p><h2>{COURSE}</h2><div className="masthead-rule"><span>{mode==='today'?'Today':'Weekly Navigator'}</span><span>{live?'Live from the course sheet':'Saved copy (sheet offline)'}</span></div></section>
    {mode==='today'?<>
      <section className={`day-banner ${classToday?'is-class':'is-off'}`} role="status">
        <p className="kicker">{formatDate(todayIso)}</p>
        <h1>{classToday?(dayKind(classToday)==='exam'?'Exam today':'We have class today'):todayRow&&dayKind(todayRow)==='tbd'?'Today’s plan is not posted yet':'No AP Biology class today'}</h1>
        {!classToday&&<p>{nextMeeting?<>Next class: <strong>{formatDate(nextMeeting.date)}</strong>{!meets(nextMeeting)&&' (plan not posted yet)'}</>:'The next class has not been posted yet.'}</p>}
      </section>
      <section className="due-board" aria-labelledby="due-board-title">
        <h2 id="due-board-title">What’s due</h2>
        {upcomingDue.length||recentTba.length?<ul>
          {upcomingDue.map((e,i)=><li key={`d${i}`} className={e.assignmentDue===todayIso?'urgent':''}><strong>{dueLabel(e.assignmentDue,todayIso)}</strong><span>{e.homework}</span><small>Assigned {shortDate(e.date)}</small></li>)}
          {recentTba.map((e,i)=><li key={`t${i}`} className="tba"><strong>Due date TBA</strong><span>{e.homework}</span><small>Assigned {shortDate(e.date)}</small></li>)}
        </ul>:<p className="empty-due">Nothing posted as due right now.</p>}
      </section>
      <nav className="today-quick-links" aria-label="AP Biology class tools"><a href="https://teach-quest.com/" target="_blank" rel="noreferrer">TeachQuest ↗</a><a href="https://apclassroom.collegeboard.org/" target="_blank" rel="noreferrer">AP Classroom ↗</a></nav>
      {featured&&<><p className="card-caption">{featured===classToday?'Today’s class':featured===lastClass?`Last class · ${formatDate(featured.date,{weekday:'long',month:'short',day:'numeric'})}`:'Next class'}</p><LessonCard entry={featured} todayIso={todayIso}/></>}
      {!classToday&&todayRow?.teacherNote&&<TeacherMessage note={todayRow.teacherNote}/>}
      {featured&&featured!==nextClass&&nextClass&&<p className="next-up">Coming up next class ({formatDate(nextClass.date,{weekday:'long',month:'short',day:'numeric'})}): <strong>{headline(nextClass)||'see Weekly Navigator'}</strong></p>}
      {!featured&&<p className="empty-edition">No class entry has been posted yet.</p>}
    </>:<>
      <section className="weekly-toolbar"><button onClick={()=>setWeekIndex(Math.max(0,weekIndex-1))} disabled={weekIndex===0}>← Previous week</button><div><small>Week {selectedWeek||'—'}</small><strong>{weekRange}</strong></div><button onClick={()=>setWeekIndex(Math.min(weeks.length-1,weekIndex+1))} disabled={weekIndex>=weeks.length-1}>Next week →</button></section>
      <section className="weekly-grid">{weekEntries.map((entry,index)=><LessonCard key={`${entry.date}-${index}`} entry={entry} compact todayIso={todayIso} dueHere={dueOn(entry.date)}/>)}{!weekEntries.length&&<p className="empty-edition">No class entries are posted for this week.</p>}</section>
    </>}
  </div></main>;
};
export default Navigator;
