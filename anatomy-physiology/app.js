const DATA = window.COURSE_DATA;
const main = document.querySelector('#main');
const glyphs = {compass:'⌖',cells:'🔬',skin:'☝',bone:'🦴',muscle:'💪',brain:'🧠',hormone:'⚗',heart:'🫀',shield:'⚕',lungs:'🫁',digest:'♨',kidney:'◒',dna:'🧬'};

const escapeHTML = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const formatDate = (iso, opts={month:'short',day:'numeric'}) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US',opts);
const youtubeSearch = title => `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' Crash Course')}`;
const topicByCode = code => DATA.systems.flatMap(s=>s.topics).find(t=>t.code===String(code));
const toISODate = value => {
  if(!value) return '';
  const raw=String(value).trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const shortUs=raw.match(/^(\d{1,2})\/(\d{1,2})$/);
  if(shortUs){
    const now=new Date(),month=Number(shortUs[1]),currentMonth=now.getMonth()+1;
    let year=now.getFullYear();
    if(currentMonth>=7&&month<7)year+=1;
    else if(currentMonth<7&&month>=7)year-=1;
    return `${year}-${shortUs[1].padStart(2,'0')}-${shortUs[2].padStart(2,'0')}`;
  }
  const us=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})(?:\s.*)?$/);
  if(us){const year=us[3].length===2?`20${us[3]}`:us[3];return `${year}-${us[1].padStart(2,'0')}-${us[2].padStart(2,'0')}`}
  const parsed = new Date(raw);
  if(Number.isNaN(parsed.valueOf())) return value;
  const y=parsed.getFullYear(),m=String(parsed.getMonth()+1).padStart(2,'0'),d=String(parsed.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
};

function anatomyGraphic(){return `<div class="body-map" aria-hidden="true"><svg viewBox="0 0 260 390" fill="none"><circle cx="130" cy="41" r="28" stroke="#cfe88b" stroke-width="2"/><path d="M110 72C87 82 78 111 80 146L65 242M150 72c23 10 32 39 30 74l15 96M86 126l-7 116m95-116 7 116M101 176l-7 170m65-170 7 170M94 346l-9 26m81-26 9 26M97 79c9 8 19 12 33 12s24-4 33-12" stroke="#cfe88b" stroke-width="2.2" stroke-linecap="round"/><path d="M102 108c10-12 46-12 56 0l-5 62c-11 13-35 13-46 0l-5-62Z" stroke="#cfe88b" opacity=".7"/><path class="pulse" d="M130 122c-12-18-34 1-18 17l18 18 18-18c16-16-6-35-18-17Z" fill="#ef6b49"/><path d="M118 96c-15 2-17 24-8 32M142 96c15 2 17 24 8 32" stroke="#89c9c0" stroke-width="4" stroke-linecap="round"/><path d="M123 26c-10 5-15 21-5 26 4 8 15 8 20 1 11-4 7-24-2-27-3-7-10-7-13 0Z" stroke="#efc34e" stroke-width="3"/><path d="M111 161c-2 15 8 25 19 25s21-10 19-25" stroke="#60a5fa" stroke-width="3"/></svg></div>`}

function renderHome(){
  const systemCards = DATA.systems.map(systemCard).join('');
  main.innerHTML = `<section class="section home-today" id="today-panel"></section><section class="section systems-section"><div class="section-heading"><div><p class="eyebrow" style="color:var(--teal)">Course atlas</p><h2>Learn by system.</h2></div><p>Every page connects the structures you must identify with the processes you must explain, plus learning targets, textbook work, and review resources.</p></div><div class="systems-grid">${systemCards}</div></section>`;
  renderToday();
}

function systemCard(s){return `<a class="system-card" href="#system/${s.unit}" style="--unit-color:${s.color}"><div class="system-art"><span class="system-glyph">${glyphs[s.icon]||'◉'}</span><span class="unit-number">${String(s.unit).padStart(2,'0')}</span></div><div class="system-card-copy"><p class="eyebrow">Unit ${s.unit}</p><h3>${escapeHTML(s.name)}</h3><p class="card-kicker">${escapeHTML(s.kicker)}</p><span class="card-link">Explore ${s.topics.length} topics <b>→</b></span></div></a>`}

function mostRelevantDay(rows=DATA.dailyFallback){
  const today = new Date(); today.setHours(0,0,0,0);
  const todayIso=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const entries=[...rows].filter(x=>x.date).sort((a,b)=>xDate(a).localeCompare(xDate(b)));
  const exact=entries.find(x=>xDate(x)===todayIso);
  if(exact)return exact;
  const previous=entries.filter(x=>xDate(x)<todayIso&&hasLessonData(x)).at(-1);
  return previous || null;
}

function xDate(entry){return toISODate(entry.date)}
function hasLessonData(entry){return [entry.topic,entry.topicText,entry.classwork,entry.biozone,entry.video,entry.home,entry.standard,entry.teacherNote,entry.summary,entry.dayType].some(value=>String(value||'').trim())}
// ---- Student-clarity helpers (Nov 2026): day type, due dates, what's due ----
const clean=v=>String(v??'').trim();
function dayKind(d){const t=clean(d.dayType).toLowerCase();
  if(t.startsWith('no'))return 'no-class';if(t.startsWith('home'))return 'homework-only';if(t.startsWith('exam')||t.startsWith('test'))return 'exam';if(t.startsWith('block'))return 'block';if(t.startsWith('class'))return 'class';
  if(/^no class\b/i.test(clean(d.classwork)))return 'no-class';
  if(!hasLessonData(d))return 'tbd';
  return 'class';}
const meets=d=>['class','block','exam'].includes(dayKind(d));
const KIND_LABEL={'class':'Class','block':'Block day','exam':'Exam day','no-class':'No class','homework-only':'No class · homework only','tbd':'Plan not posted yet'};
const addDaysIso=(iso,n)=>{const d=new Date(`${iso}T12:00:00`);d.setDate(d.getDate()+n);return localISODate(d)};
const shortDay=iso=>formatDate(iso,{weekday:'short',month:'numeric',day:'numeric'});
function dueLabel(due,today=localISODate()){if(!due)return 'Due date TBA';if(due===today)return 'Due today';if(due===addDaysIso(today,1))return `Due tomorrow (${shortDay(due)})`;if(due<today)return `Was due ${shortDay(due)}`;return `Due ${shortDay(due)}`}
function teacherMessage(note){return clean(note)?`<aside class="teacher-message"><b>From Mr. Zelensky</b><p>${escapeHTML(note)}</p></aside>`:''}
function assignmentBlock(d,today){return clean(d.home)?`<p>${escapeHTML(d.home)}</p><p class="due-line ${d.due?'':'tba'}">${dueLabel(d.due,today)}</p>`:'<p class="muted-line">No assignment posted.</p>'}
function schoolTerm(entry){
  const iso=xDate(entry),month=Number(iso.slice(5,7));
  return month>=7?'Fall':'Spring';
}
function termWeekKey(entry){return `${schoolTerm(entry)}|${String(entry.week||'').trim()}`}
function localISODate(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function oddityPanel(topicCode){
  const item=DATA.oddityFacts?.[String(topicCode)];
  if(!item)return '';
  return `<aside class="oddity-panel" aria-labelledby="oddity-title"><div class="oddity-titlebar"><span>ANATOMY_ODDITY.EXE</span><span>VERIFIED FILE</span></div><div class="oddity-body"><div class="oddity-stamp" aria-hidden="true">BELIEVE<br>IT OR NOT</div><div class="oddity-copy"><p class="eyebrow">TODAY'S ANATOMY ODDITY</p><h2 id="oddity-title">${escapeHTML(item.title)}</h2><p>${escapeHTML(item.body)}</p><a href="${escapeHTML(item.url)}" target="_blank" rel="noopener">Source: ${escapeHTML(item.source)} ↗</a></div></div></aside>`;
}

async function renderToday(){
  const host=document.querySelector('#today-panel'); if(!host)return;
  const source=await loadDaily();
  if(!document.querySelector('#today-panel'))return;
  const today=localISODate();
  const all=[...source.rows].filter(x=>x.date).sort((a,b)=>xDate(a).localeCompare(xDate(b)));
  const posted=all.filter(hasLessonData);
  if(!posted.length){host.innerHTML='<div class="today-card"><div class="today-content"><h2>No daily plan posted yet.</h2><p class="empty-state">Check back when the Navigator is updated.</p></div></div>';return}
  const todayRow=all.find(x=>xDate(x)===today);
  const classToday=todayRow&&meets(todayRow)?todayRow:null;
  const lastClass=posted.filter(x=>xDate(x)<today&&meets(x)).at(-1);
  const nextClass=posted.find(x=>xDate(x)>today&&meets(x));
  const nextMeeting=all.find(x=>xDate(x)>today&&(meets(x)||dayKind(x)==='tbd'));
  const d=classToday||lastClass||nextClass;
  const upcoming=posted.filter(x=>clean(x.home)&&x.due&&x.due>=today).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,6);
  const dated=new Set(upcoming.map(x=>clean(x.home).toLowerCase()));
  const tba=[lastClass,todayRow].filter((x,i,a)=>x&&clean(x.home)&&!x.due&&a.indexOf(x)===i&&!dated.has(clean(x.home).toLowerCase()));
  const dueItems=[...upcoming.map(x=>`<li class="${x.due===today?'urgent':''}"><strong>${dueLabel(x.due,today)}</strong><span>${escapeHTML(x.home)}</span><small>Assigned ${shortDay(xDate(x))}</small></li>`),...tba.map(x=>`<li class="tba"><strong>Due date TBA</strong><span>${escapeHTML(x.home)}</span><small>Assigned ${shortDay(xDate(x))}</small></li>`)].join('');
  const heading=classToday?(dayKind(classToday)==='exam'?'Exam today':'We have class today'):(todayRow&&dayKind(todayRow)==='tbd'?'Today’s plan is not posted yet':'No A&P class today');
  const nextLine=!classToday?`<p>${nextMeeting?`Next class: <strong>${formatDate(xDate(nextMeeting),{weekday:'long',month:'long',day:'numeric'})}</strong>${meets(nextMeeting)?'':' (plan not posted yet)'}`:'The next class has not been posted yet.'}</p>`:'';
  const caption=d===classToday?'Today’s class':d===lastClass?`Last class · ${formatDate(xDate(d),{weekday:'long',month:'short',day:'numeric'})}`:'Next class';
  const topic=topicByCode(d.topic);
  const oddity=oddityPanel(d.topic);
  const past=xDate(d)<today;
  const headline=clean(d.summary)||topic?.title||clean(d.topicText).split('\n')[0]||'Course work';
  const resources=[topic?.target||clean(d.topicText).split('\n').slice(1).join(' ')?`<div><span>I can</span><p>${escapeHTML(topic?.target||clean(d.topicText).split('\n').slice(1).join(' '))}</p></div>`:'',clean(d.biozone)?`<div><span>BIOZONE</span><p>${escapeHTML(d.biozone)}</p></div>`:'',clean(d.video)?`<div><span>Video</span>${navigatorVideos(d.video)}</div>`:'',clean(d.standard)?`<div><span>A&amp;P target</span><p>${escapeHTML(d.standard)}</p></div>`:''].join('');
  host.innerHTML=`<div class="home-toolbar"><div><p class="eyebrow">ANATOMY_OS // DAILY FILE</p><h1>Today’s Briefing</h1></div><div><a class="button teachquest-button" href="https://teach-quest.com/" target="_blank" rel="noopener">TeachQuest ↗</a><a class="button" href="#calendar">Full Navigator</a><a class="button secondary" href="#systems">System Directory</a></div></div>
  <section class="day-banner ${classToday?'is-class':'is-off'}" role="status"><p class="eyebrow">${escapeHTML(formatDate(today,{weekday:'long',month:'long',day:'numeric'}))}</p><h2>${heading}</h2>${nextLine}</section>
  ${!classToday&&todayRow?teacherMessage(todayRow.teacherNote):''}
  <section class="due-board"><h2>What’s due</h2>${dueItems?`<ul>${dueItems}</ul>`:'<p class="empty-due">Nothing posted as due right now.</p>'}</section>
  <p class="card-caption">${caption}</p>
  <article class="today-card kind-${dayKind(d)}"><div class="today-commandbar"><div class="command-date"><span class="signal-dot ${source.live?'':'fallback'}" aria-hidden="true"></span><strong>${escapeHTML(formatDate(xDate(d),{weekday:'long',month:'long',day:'numeric'}))}</strong></div><div class="command-codes"><span>${escapeHTML(KIND_LABEL[dayKind(d)].toUpperCase())}</span><span>${topic?`TOPIC ${escapeHTML(topic.code)}`:'DAILY PLAN'}</span><span class="system-online ${source.live?'':'fallback'}">${source.live?'SHEET ONLINE':'BACKUP MODE'}</span></div></div><div class="today-content"><div class="today-primary">${teacherMessage(d.teacherNote)}<h2>${escapeHTML(headline)}</h2>${topic?`<a class="topic-jump" href="#system/${Number(topic.unit.split(' ')[1])}">OPEN SYSTEM FILE <span>▶</span></a>`:''}</div><div class="today-main"><div class="today-grid two"><div><span>01 // ${past?'WHAT WE DID IN CLASS':d===classToday?'IN CLASS TODAY':'PLANNED FOR CLASS'}</span><p>${escapeHTML(d.classwork||'See classroom instructions.')}</p></div><div class="assignment-cell"><span>02 // ASSIGNMENT</span>${assignmentBlock(d,today)}</div></div>${resources?`<details class="today-resources"><summary>Learning target &amp; resources</summary><div class="today-grid">${resources}</div></details>`:''}</div></div></article>
  ${d!==nextClass&&nextClass?`<p class="next-up">Coming up next class (${escapeHTML(formatDate(xDate(nextClass),{weekday:'long',month:'short',day:'numeric'}))}): <strong>${escapeHTML(clean(nextClass.summary)||topicByCode(nextClass.topic)?.title||'see Full Navigator')}</strong></p>`:''}`;
  if(oddity)host.insertAdjacentHTML('beforeend',oddity);
}

function parseCSV(text){
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'&&quoted&&n==='"'){field+='"';i++}else if(c==='"'){quoted=!quoted}else if(c===','&&!quoted){row.push(field);field=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(field);rows.push(row);row=[];field=''}else field+=c}
  if(field||row.length){row.push(field);rows.push(row)}return rows;
}
function normalizeLiveRows(rows){
  const headerIndex=rows.findIndex(r=>r.includes('Week')&&r.includes('Date')); if(headerIndex<0)return [];
  const h=rows[headerIndex].map(x=>x.replace(/\s+/g,' ').trim()); const col=(...names)=>{for(const n of names){const i=h.indexOf(n);if(i>=0)return i}return -1};
  const get=(r,i)=>i>=0?(r[i]||''):'';
  const c={week:col('Week'),day:col('Day'),date:col('Date'),topic:col('Topic'),topicText:col('Topic Title / I Can…'),classwork:col('Class'),biozone:col('BIOZONE'),video:col('Crash Course / Video'),home:col('HOME After Class'),standard:col('A&P Target'),teacherNote:col('Teacher Note'),dayType:col('Day Type'),due:col('Assignment Due'),summary:col('Student Summary')};
  return rows.slice(headerIndex+1).map(r=>{const o=Object.fromEntries(Object.entries(c).map(([k,i])=>[k,get(r,i)]));o.date=toISODate(o.date);if(/^(none( today)?|no homework|n\/a|[-–—])\.?$/i.test(String(o.home||'').trim()))o.home='';o.due=o.due?toISODate(o.due):'';return o}).filter(x=>x.date&&x.week&&/^\d{4}-\d{2}-\d{2}$/.test(x.date));
}

async function loadDaily(){
  try{const separator=DATA.dailyCsv.includes('?')?'&':'?';const liveUrl=`${DATA.dailyCsv}${separator}_=${Date.now()}`;const res=await fetch(liveUrl,{cache:'no-store'});if(!res.ok)throw new Error('Unavailable');const live=normalizeLiveRows(parseCSV(await res.text()));if(!live.length)throw new Error('Empty');return {rows:live,live:true}}catch{return {rows:DATA.dailyFallback,live:false}}
}

async function renderCalendar(){
  main.innerHTML=`<section class="navigator-hero"><p class="overline">Daily course map</p><h1>Daily Navigator</h1><p>Learning targets, classwork, BIOZONE pages, videos, and what to complete after class—all in one place.</p></section><section class="navigator-wrap"><div class="navigator-toolbar"><div class="week-controls"><button class="icon-btn" id="prev-week" aria-label="Previous week">←</button><span class="week-label" id="week-label">Loading…</span><button class="icon-btn" id="next-week" aria-label="Next week">→</button></div><span class="sync-status" id="sync-status">Loading published plan</span></div><div class="week-grid" id="week-grid"></div></section>`;
  const {rows:loadedRows,live}=await loadDaily(); let weekIndex=0;
  const allRows=loadedRows.filter(row=>row.date&&row.week).sort((a,b)=>xDate(a).localeCompare(xDate(b)));
  const rows=allRows.filter(hasLessonData);
  const weeks=[...new Map(rows.map(row=>[termWeekKey(row),{key:termWeekKey(row),term:schoolTerm(row),number:String(row.week).trim(),start:xDate(row)}])).values()];
  const todayIso=localISODate();
  const currentRow=rows.find(row=>xDate(row)===todayIso);
  if(currentRow)weekIndex=Math.max(0,weeks.findIndex(week=>week.key===termWeekKey(currentRow)));
  else {const future=rows.find(row=>xDate(row)>=todayIso);weekIndex=future?weeks.findIndex(week=>week.key===termWeekKey(future)):Math.max(0,weeks.length-1)}
  const draw=()=>{const week=weeks[weekIndex];if(!week){document.querySelector('#week-label').textContent='No current week';document.querySelector('#week-grid').innerHTML='<p>No plans posted.</p>';return}const wk=allRows.filter(row=>termWeekKey(row)===week.key);document.querySelector('#week-label').textContent=wk.length?`${formatDate(xDate(wk[0]))} – ${formatDate(xDate(wk.at(-1)))} · ${week.term} wk ${week.number}`:`${week.term} ${week.number}`;document.querySelector('#prev-week').disabled=weekIndex===0;document.querySelector('#next-week').disabled=weekIndex===weeks.length-1;document.querySelector('#week-grid').innerHTML=allRows.filter(row=>termWeekKey(row)===week.key).map(row=>dayCard(row,rows)).join('')||'<p>No plans posted for this week.</p>'};
  const status=document.querySelector('#sync-status');status.textContent=live?'Live from the published course sheet':'Showing the framework’s saved schedule';status.classList.toggle('live',live);
  document.querySelector('#prev-week').onclick=()=>{weekIndex=Math.max(0,weekIndex-1);draw()};document.querySelector('#next-week').onclick=()=>{weekIndex=Math.min(weeks.length-1,weekIndex+1);draw()};draw();
}
function navigatorVideos(value){return String(value||'').split(/\n+/).map(v=>v.trim()).filter(Boolean).map(v=>`<a class="navigator-video" href="${youtubeSearch(v)}" target="_blank" rel="noopener">▶ ${escapeHTML(v)}</a>`).join('')}
function dayCard(d,posted=[]){const t=topicByCode(d.topic);const todayIso=localISODate();const iso=xDate(d);const today=iso===todayIso;const kind=dayKind(d);const videos=navigatorVideos(d.video);const past=iso<todayIso;
  const dueHere=posted.filter(x=>clean(x.home)&&x.due===iso&&xDate(x)!==iso);
  const head=clean(d.summary)||t?.title||clean(d.topicText).split('\n')[0];
  const res=[t?.target?`<p class="mini-target">${escapeHTML(t.target)}</p>`:'',clean(d.biozone)?`<div class="day-block biozone-block"><b>BIOZONE</b><p>${escapeHTML(d.biozone)}</p></div>`:'',videos?`<div class="day-block video-block"><b>Video</b>${videos}</div>`:'',t?`<div class="day-block"><a class="back-link" href="#system/${Number(t.unit.split(' ')[1])}">Open unit guide →</a></div>`:''].join('');
  return `<article class="day-card kind-${kind} ${today?'current':''}"><div class="date-line"><span class="weekday">${escapeHTML(d.day||formatDate(iso,{weekday:'short'}))}</span><span class="date-small">${formatDate(iso)}</span></div><p class="kind-label">${KIND_LABEL[kind]}${today?' · Today':''}</p>${dueHere.length?`<div class="due-here"><b>Due this day</b><ul>${dueHere.map(x=>`<li>${escapeHTML(x.home)} <small>(assigned ${shortDay(xDate(x))})</small></li>`).join('')}</ul></div>`:''}${teacherMessage(d.teacherNote)}${meets(d)?`${t?`<span class="topic-badge">${escapeHTML(t.code)}</span>`:''}${head?`<h3>${escapeHTML(head)}</h3>`:''}<div class="day-block class-block"><b>${past?'What we did':today?'In class today':'Planned for class'}</b><p>${escapeHTML(d.classwork||'—')}</p></div>`:`<p class="noclass-line">${kind==='tbd'?'Mr. Zelensky has not posted this day yet.':'There is no A&amp;P class on this day.'}</p>`}<div class="day-block home-block"><b>Assignment</b>${assignmentBlock(d,todayIso)}</div>${res&&meets(d)?`<details class="day-resources"><summary>Target &amp; resources</summary>${res}</details>`:''}</article>`}

function renderSystems(){main.innerHTML=`<section class="navigator-hero"><p class="overline">The complete course</p><h1>Body Systems</h1><p>Begin with foundations, then move through twelve connected units. Each guide includes every framework target, BIOZONE assignment, key vocabulary, and aligned video.</p></section><section class="section"><div class="systems-grid">${DATA.systems.map(systemCard).join('')}</div></section>`}

function renderSystem(id){
  const s=DATA.systems.find(x=>x.unit===Number(id));if(!s)return render404();
  const prev=DATA.systems.find(x=>x.unit===s.unit-1),next=DATA.systems.find(x=>x.unit===s.unit+1);
  const records=s.vocabularyRecords||[];
  const coreCount=records.filter(v=>v.priority.startsWith('Core')).length;
  const identificationCount=records.filter(v=>v.priority.includes('Identification')).length;
  main.innerHTML=`<section class="system-hero" style="--unit-color:${s.color}"><div class="breadcrumbs"><a href="#systems">Body Systems</a> / Unit ${s.unit}</div><p class="overline">Unit ${s.unit}</p><h1>${escapeHTML(s.name)}</h1><p>${escapeHTML(s.kicker)}. Use this guide to connect what you must identify with what you must explain.</p><div class="system-stats"><div class="system-stat"><span>${s.topics.length}</span><small>Learning topics</small></div><div class="system-stat"><span>${records.length}</span><small>Master vocabulary terms</small></div><div class="system-stat"><span>${new Set(s.topics.flatMap(t=>t.videos)).size}</span><small>Video alignments</small></div></div></section><div class="system-layout" style="--unit-color:${s.color}"><section><div class="section-heading"><div><p class="eyebrow" style="color:var(--unit-color)">Learning sequence</p><h2>What you’ll master</h2></div></div><div class="topic-list">${s.topics.map(topicItem).join('')}</div>${vocabularyDatabase(s)}<div class="hero-actions">${prev?`<a class="button secondary" href="#system/${prev.unit}">← ${escapeHTML(prev.name)}</a>`:''}${next?`<a class="button" href="#system/${next.unit}">${escapeHTML(next.name)} →</a>`:''}</div></section><aside class="side-panel"><div class="vocab-card anatomy-vocab vocab-summary"><p class="eyebrow">VOCAB_DATABASE.DAT</p><h2>${records.length} terms</h2><p>This unit contains ${coreCount} core terms and ${identificationCount} identification terms. Select any term to open its course record.</p><a class="button vocab-launch" href="#glossary/${s.unit}">Open vocabulary database</a></div><div class="connections-card"><p class="eyebrow">How to use it</p><h2>Study by topic</h2><p>Learn terms with the topic they support. For structures, practice identification and function. For processes, practice causes, steps, and effects.</p><a class="back-link" href="#calendar">View this week’s work →</a></div></aside></div>`;
}

function vocabularyDatabase(system){
  const groups=new Map();
  (system.vocabularyRecords||[]).forEach(record=>{const key=`${record.topic}|${record.topicTitle}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(record)});
  const groupHTML=[...groups.entries()].map(([key,records])=>{const [topic,title]=key.split('|');return `<section class="vocab-topic-group" data-vocab-group><div class="vocab-group-heading"><span>${escapeHTML(topic)}</span><h3>${escapeHTML(title)}</h3><small>${records.length} terms</small></div><div class="master-vocab-list">${records.map(record=>{const honors=record.priority.startsWith('Honors');const identification=record.priority.includes('Identification');return `<button class="master-vocab-term ${honors?'honors':''} ${identification?'identification':''}" type="button" data-vocab-term="${escapeHTML(record.term)}" data-vocab-priority="${escapeHTML(record.priority)}" data-vocab-topic="${escapeHTML(record.topic)}" data-vocab-title="${escapeHTML(record.topicTitle)}" data-vocab-definition="${escapeHTML(record.definition)}" data-vocab-connection="${escapeHTML(record.connection)}">${escapeHTML(record.term)}${honors?'<sup>H</sup>':''}${identification?'<sup>ID</sup>':''}</button>`}).join('')}</div></section>`}).join('');
  return `<section class="vocab-database" id="vocabulary-unit-${system.unit}"><div class="vocab-database-titlebar"><span>VOCAB_DATABASE.DAT</span><span>UNIT_${String(system.unit).padStart(2,'0')}</span></div><div class="vocab-database-body"><div class="vocab-database-heading"><div><p class="eyebrow">Clickable master list</p><h2>Unit vocabulary</h2><p>Choose any term to see its priority, topic, course connection, and mastery expectations.</p></div><label class="vocab-filter-label">Find a term<input class="vocab-filter" type="search" placeholder="Search this unit…" data-vocab-filter></label></div><div class="vocab-priority-key"><span><i></i> Core</span><span><i class="honors"></i> Honors extension</span><span><i class="identification"></i> Identification</span></div><div class="vocab-groups">${groupHTML}</div></div></section>`;
}
function topicItem(t){const videos=t.videos.map(v=>`<a class="resource-pill" href="${youtubeSearch(v)}" target="_blank" rel="noopener">▶ ${escapeHTML(v.replace('Crash Course A&P ','CC A&P '))}</a>`).join('');return `<details class="topic-item" id="topic-${t.code}"><summary><span class="topic-code">${escapeHTML(t.code)}</span><h3>${escapeHTML(t.title)}</h3></summary><div class="topic-body"><p class="i-can">${escapeHTML(t.target)}</p><div class="topic-meta"><div class="meta-box"><span>Performance target</span><p>${escapeHTML(t.detail)}</p></div><div class="meta-box"><span>BIOZONE 3rd Edition</span><p>Activities ${escapeHTML(t.biozoneActivities)} · Pages ${escapeHTML(t.biozonePages)}</p></div><div class="meta-box"><span>Course target</span><p>${escapeHTML(t.standard)}</p></div><div class="meta-box"><span>Digital support</span><p>${escapeHTML(t.hubSupport||'Check the course resources.')}</p></div></div><div class="resource-links"><a class="resource-pill" href="${DATA.biozoneHub}" target="_blank" rel="noopener">BIOZONE Resource Hub ↗</a>${videos||`<a class="resource-pill" href="${DATA.crashCourseHub}" target="_blank" rel="noopener">Crash Course A&P hub ↗</a>`}</div></div></details>`}

function renderGlossary(id){
  const s=DATA.systems.find(x=>x.unit===Number(id));if(!s)return render404();
  main.innerHTML=`<section class="navigator-hero glossary-hero"><p class="overline">Unit ${s.unit} vocabulary database</p><h1>${escapeHTML(s.name)} Glossary</h1><p>Search the complete unit vocabulary. Every Core, Honors, and Identification term opens a definition and its course connection.</p><a class="button secondary" href="#system/${s.unit}">← Return to unit guide</a></section><section class="section glossary-page">${vocabularyDatabase(s)}</section>`;
}

function renderResources(){main.innerHTML=`<section class="resources-hero"><p class="overline">External course tools</p><h1>Course Resources</h1><p>Direct access to the two outside resources used throughout the course. Unit pages provide the specific BIOZONE assignments and aligned Crash Course episodes.</p></section><section class="resources-grid focused-resources"><article class="resource-card"><span class="resource-icon">📗</span><h2>BIOZONE Hub</h2><p>Online support paired with Anatomy &amp; Physiology, 3rd Edition activities. Each system guide identifies the relevant activity and textbook page range.</p><a href="${DATA.biozoneHub}" target="_blank" rel="noopener">Open resource hub ↗</a></article><article class="resource-card"><span class="resource-icon">▶</span><h2>Crash Course A&amp;P</h2><p>Short review videos aligned to the course topics. Each system guide links students to the episodes that support that unit.</p><a href="${DATA.crashCourseHub}" target="_blank" rel="noopener">Browse the official series ↗</a></article></section>`}
function render404(){main.innerHTML='<section class="error-page"><h1>404</h1><p>That body system was not found.</p><a class="back-link" href="#systems">Return to the course atlas</a></section>'}

function route(){const route=location.hash.slice(1)||'today';document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',route.startsWith(a.dataset.nav)||((route.startsWith('system/')||route.startsWith('glossary/'))&&a.dataset.nav==='systems')));if(route==='today')renderHome();else if(route==='calendar')renderCalendar();else if(route==='systems')renderSystems();else if(route==='resources')renderResources();else if(route.startsWith('system/'))renderSystem(route.split('/')[1]);else if(route.startsWith('glossary/'))renderGlossary(route.split('/')[1]);else render404();window.scrollTo(0,0)}

const dialog=document.querySelector('#search-dialog'),search=document.querySelector('#global-search'),results=document.querySelector('#search-results');
document.querySelector('#open-search').onclick=()=>{dialog.showModal();setTimeout(()=>search.focus(),50)};
search.oninput=()=>{const q=search.value.trim().toLowerCase();if(q.length<2){results.innerHTML='<p class="empty-state">Type at least two letters to search the full course.</p>';return}const found=[];DATA.systems.forEach(s=>{s.topics.forEach(t=>{const topicVocab=(s.vocabularyRecords||[]).filter(v=>v.topic===t.code).flatMap(v=>[v.term,v.definition]);if([t.title,t.target,t.detail,t.standard,...topicVocab].join(' ').toLowerCase().includes(q))found.push({s,t})})});results.innerHTML=found.slice(0,30).map(({s,t})=>`<a class="search-result" href="#system/${s.unit}" data-close><b>${escapeHTML(t.code)} · ${escapeHTML(t.title)}</b><p>Unit ${s.unit}: ${escapeHTML(s.name)}</p></a>`).join('')||'<p class="empty-state">No matching course topics or vocabulary.</p>';results.querySelectorAll('[data-close]').forEach(a=>a.onclick=()=>dialog.close())};

const vocabDialog=document.querySelector('#vocab-dialog');
document.querySelector('#close-vocab').onclick=()=>vocabDialog.close();
main.addEventListener('click',event=>{
  const button=event.target.closest('[data-vocab-term]');if(!button)return;
  document.querySelector('#vocab-term').textContent=button.dataset.vocabTerm;
  document.querySelector('#vocab-priority').textContent=button.dataset.vocabPriority;
  document.querySelector('#vocab-priority').className=button.dataset.vocabPriority.startsWith('Honors')?'honors':button.dataset.vocabPriority.includes('Identification')?'identification':'core';
  document.querySelector('#vocab-path').textContent=`UNIT / ${button.dataset.vocabTopic} / ${button.dataset.vocabTitle}`;
  document.querySelector('#vocab-definition').textContent=button.dataset.vocabDefinition||'Definition unavailable.';
  document.querySelector('#vocab-connection').textContent=button.dataset.vocabConnection||'Use this term accurately within the current learning target.';
  vocabDialog.showModal();
});
main.addEventListener('input',event=>{
  if(!event.target.matches('[data-vocab-filter]'))return;
  const query=event.target.value.trim().toLowerCase();
  main.querySelectorAll('[data-vocab-group]').forEach(group=>{
    let visible=0;
    group.querySelectorAll('[data-vocab-term]').forEach(button=>{const show=!query||button.dataset.vocabTerm.toLowerCase().includes(query);button.hidden=!show;if(show)visible++});
    group.hidden=visible===0;
  });
});
document.querySelector('.menu-toggle').onclick=e=>{const nav=document.querySelector('#site-nav');nav.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',nav.classList.contains('open'))};document.querySelectorAll('nav a').forEach(a=>a.onclick=()=>document.querySelector('#site-nav').classList.remove('open'));
window.addEventListener('hashchange',route);route();
