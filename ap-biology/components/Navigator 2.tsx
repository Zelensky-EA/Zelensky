import React, { useEffect, useMemo, useState } from 'react';
import snapshot from '../data/calendar.json';
import { courseData } from '../constants';

interface CalendarEntry { week:number; day:string; date:string; cedTopic:string; learningTarget:string; classwork:string; campbell:string; biozone:string; homework:string; apTarget:string; teacherNote:string; }
interface NavigatorProps { mode:'today'|'weekly'; }
const CSV_URL=(import.meta.env.VITE_NAVIGATOR_CSV_URL as string|undefined)||'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQmAQUeLO19pcXizo9fhfSULh1KEewdq4Og3vnTLBxgrA7QYpKq_NNwcqoFDaf57OMiFf7FQx3MM5E/pub?gid=135989314&single=true&output=csv';
const fields:Array<[keyof CalendarEntry,string]>=[['learningTarget','Learning target'],['classwork','In class'],['homework','HOME After Class'],['teacherNote','Teacher Notes'],['campbell','Campbell'],['biozone','BIOZONE'],['apTarget','AP target']];
const alwaysVisible=new Set<keyof CalendarEntry>(['homework','teacherNote']);

function toIso(value:string){
  const raw=String(value||'').trim();if(!raw)return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw))return raw;
  const us=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})/);
  if(us){const year=us[3].length===2?`20${us[3]}`:us[3];return `${year}-${us[1].padStart(2,'0')}-${us[2].padStart(2,'0')}`;}
  const d=new Date(raw);return Number.isNaN(d.getTime())?raw:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function parseCsv(text:string):CalendarEntry[]{
  const rows:string[][]=[];let row:string[]=[];let cell='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'&&quoted&&n==='"'){cell+='"';i++;}else if(c==='"')quoted=!quoted;else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}else cell+=c;}
  if(cell||row.length){row.push(cell);rows.push(row);}const header=rows.findIndex(r=>r.some(v=>v.trim().toLowerCase()==='week'));if(header<0)return [];
  return rows.slice(header+1).map(r=>({week:Number(r[0])||0,day:r[1]||'',date:toIso(r[2]||''),cedTopic:r[3]||'',learningTarget:r[4]||'',classwork:r[5]||'',campbell:r[6]||'',biozone:r[7]||'',homework:r[8]||'',apTarget:r[9]||'',teacherNote:r[10]||''})).filter(e=>e.date&&hasLesson(e));
}
const hasLesson=(e:CalendarEntry)=>[e.cedTopic,e.learningTarget,e.classwork,e.campbell,e.biozone,e.homework,e.apTarget,e.teacherNote].some(v=>String(v||'').trim());
const formatDate=(value:string)=>new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric'}).format(new Date(`${value}T12:00:00`));
const unitColor=(entry:CalendarEntry)=>courseData.units[Number(entry.cedTopic.split('.')[0])-1]?.color||'#3e382b';
const localIso=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
function navigatorWeekBounds(now:Date){
  const monday=new Date(now);monday.setHours(12,0,0,0);
  const day=monday.getDay();
  monday.setDate(monday.getDate()+(day===6?2:day===0?1:1-day));
  const sunday=new Date(monday);sunday.setDate(monday.getDate()+6);
  return {start:localIso(monday),end:localIso(sunday)};
}

function LessonCard({entry,compact=false,todayIso}:{entry:CalendarEntry;compact?:boolean;todayIso:string}){
  const color=unitColor(entry),isToday=entry.date===todayIso;
  return <article className={`dreadful-lesson ${compact?'compact':''} ${isToday?'current':''}`} style={{'--unit-color':color} as React.CSSProperties}>
    <header><div><p className="issue-line">Week {entry.week} · {entry.day||'Class Day'}</p><h3>{formatDate(entry.date)}</h3></div><div className="lesson-marks">{isToday&&<span>Today</span>}{entry.cedTopic&&<b>CED {entry.cedTopic}</b>}</div></header>
    <div className="lesson-columns">{fields.map(([key,label])=>(entry[key]||alwaysVisible.has(key))?<section key={key} className={`lesson-field field-${key}`}><h4>{label}</h4><p>{entry[key]||(key==='homework'?'No HOME After Class posted.':'No teacher note posted.')}</p></section>:null)}</div>
  </article>;
}

const Navigator:React.FC<NavigatorProps>=({mode})=>{
  const [entries,setEntries]=useState<CalendarEntry[]>(snapshot as CalendarEntry[]),[live,setLive]=useState(false),[weekIndex,setWeekIndex]=useState(0),[initializedKey,setInitializedKey]=useState('');
  useEffect(()=>{fetch(CSV_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.text();}).then(t=>{const parsed=parseCsv(t);if(parsed.length){setEntries(parsed);setLive(true);}}).catch(()=>setLive(false));},[]);
  const now=new Date(),todayIso=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const {start:weekStart,end:weekEnd}=navigatorWeekBounds(now);
  const populated=useMemo(()=>entries.filter(hasLesson).sort((a,b)=>a.date.localeCompare(b.date)),[entries]);
  const featured=useMemo(()=>populated.find(e=>e.date===todayIso)||[...populated].filter(e=>e.date<todayIso).pop()||populated[0],[populated,todayIso]);
  const weeks=useMemo(()=>[...new Set(populated.map(e=>e.week).filter(Boolean))].sort((a,b)=>a-b),[populated]);
  const dataKey=`${weekStart}|${weeks.join(',')}|${populated.at(-1)?.date||''}`;
  useEffect(()=>{
    if(initializedKey===dataKey||!weeks.length)return;
    const currentWeekEntry=populated.find(e=>e.date>=weekStart&&e.date<=weekEnd);
    const fallback=[...populated].filter(e=>e.date<weekStart).pop()||populated.find(e=>e.date>weekEnd)||populated[0];
    setWeekIndex(Math.max(0,weeks.indexOf((currentWeekEntry||fallback)?.week)));
    setInitializedKey(dataKey);
  },[weeks,populated,weekStart,weekEnd,dataKey,initializedKey]);
  const selectedWeek=weeks[weekIndex],weekEntries=populated.filter(e=>e.week===selectedWeek).sort((a,b)=>a.date.localeCompare(b.date));
  return <main className="dreadful-main"><div className="dreadful-page">
    <section className="masthead"><p className="edition">The Scholarly Chronicle · 2025 CED Edition</p><h2>AP Biology</h2><div className="masthead-rule"><span>{mode==='today'?'Today’s Dispatch':'Weekly Navigator'}</span><span>{live?'Published Sheet Online':'Saved Edition'}</span></div></section>
    {mode==='today'?<>
      <section className="lead-story"><p className="kicker">Latest Classroom Dispatch</p><h1>{featured?.date===todayIso?'Today’s Class':'Most Recent Class'}</h1><p>{featured?`The lesson recorded for ${formatDate(featured.date)} appears below.`:'No populated class entry has been posted yet.'}</p></section>
      {featured&&<LessonCard entry={featured} todayIso={todayIso}/>} 
    </>:<>
      <section className="weekly-toolbar"><button onClick={()=>setWeekIndex(Math.max(0,weekIndex-1))} disabled={weekIndex===0}>← Previous</button><div><small>Course Week</small><strong>{selectedWeek||'—'}</strong></div><button onClick={()=>setWeekIndex(Math.min(weeks.length-1,weekIndex+1))} disabled={weekIndex>=weeks.length-1}>Next →</button></section>
      <section className="weekly-grid">{weekEntries.map((entry,index)=><LessonCard key={`${entry.date}-${index}`} entry={entry} compact todayIso={todayIso}/>)}{!weekEntries.length&&<p className="empty-edition">No class entries are posted for this week.</p>}</section>
    </>}
  </div></main>;
};
export default Navigator;
