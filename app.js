
// Polskie święta ustawowo wolne od pracy (od 2025 r. również 24 grudnia).
function easterSunday(year){const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k+7)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=(h+l-7*m+114)%31+1;return new Date(year,month-1,day,12)}
function holidayName(iso){const [y,m,d]=iso.split('-').map(Number),fixed={'01-01':'Nowy Rok','01-06':'Święto Trzech Króli','05-01':'Święto Pracy','05-03':'Święto Konstytucji 3 Maja','08-15':'Wniebowzięcie NMP','11-01':'Wszystkich Świętych','11-11':'Święto Niepodległości','12-25':'Boże Narodzenie (pierwszy dzień)','12-26':'Boże Narodzenie (drugi dzień)'};if(y>=2025)fixed['12-24']='Wigilia Bożego Narodzenia';const name=fixed[`${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`];if(name)return name;const e=easterSunday(y),date=new Date(y,m-1,d,12),offset=Math.round((date-e)/86400000);return ({0:'Wielkanoc',1:'Poniedziałek Wielkanocny',49:'Zielone Świątki',60:'Boże Ciało'})[offset]||''}
const isHoliday=iso=>Boolean(holidayName(iso));
const saturdayHolidays=()=>Array.from({length:new Date(view.getFullYear(),view.getMonth()+1,0).getDate()},(_,i)=>dateFor(i+1)).filter(d=>isHoliday(d)&&new Date(d+'T12:00:00').getDay()===6);
const dayOffEligible=()=> $('employment').value==='etat';
function updateDayOffInfo(){const eligible=dayOffEligible();$('dayOffStatus').classList.toggle('hidden',!eligible);$('dayOffInfo').classList.add('hidden');}
const $=id=>document.getElementById(id);let view=new Date();view.setDate(1);view.setMonth(view.getMonth()+1);let status='available';let chosen=new Set();let editingDate=null;const saved={};const names=['Pn','Wt','Śr','Cz','Pt','So','Nd'];const labels={available:'Dostępny/a',limited:'Godziny',preferred:'Sobota',morning:'Praca rano',afternoon:'Praca po południu',work12h:'Praca cały dzień (12 h)',leave:'Urlop',unavailable:'Niedostępny/a',dayoff:'Dzień wolny'};const key=()=>`${view.getFullYear()}-${String(view.getMonth()+1).padStart(2,'0')}`;const dateFor=d=>`${key()}-${String(d).padStart(2,'0')}`;const count=()=>new Date(view.getFullYear(),view.getMonth()+1,0).getDate();function selectAll(fn){chosen=new Set(Array.from({length:count()},(_,i)=>dateFor(i+1)).filter(d=>!isHoliday(d)&&fn(d)));render()};function updateSelected(){$('selectionTitle').textContent=`Wybrano ${chosen.size} dni`;}
function render(){updateDayOffInfo(); $('monthTitle').textContent=view.toLocaleDateString('pl-PL',{month:'long',year:'numeric'});const cal=$('calendar');cal.replaceChildren();names.forEach(n=>{const el=document.createElement('div');el.className='dayname';el.textContent=n;cal.append(el)});for(let i=0;i<(view.getDay()+6)%7;i++){const b=document.createElement('div');b.className='blank';cal.append(b)}for(let d=1;d<=count();d++){const date=dateFor(d),holiday=holidayName(date),value=holiday?null:saved[date],b=document.createElement('button');b.type='button';b.className='day'+(holiday?' holiday':'')+(value?' '+value.status:'')+(chosen.has(date)?' marked':'');if(holiday){b.disabled=true;b.title=holiday;b.setAttribute('aria-label',date+' — '+holiday+' (dzień wolny)');}const number=document.createElement('span');number.textContent=d;b.append(number);if(holiday){const c=document.createElement('small');c.textContent='ŚWIĘTO';b.append(c)}if(value){const c=document.createElement('small');c.textContent=labels[value.status];b.append(c);if(value.start&&value.end){const t=document.createElement('span');t.className='day-hours';t.textContent=value.start+'–'+value.end;b.append(t)}}if(!holiday)b.setAttribute('aria-label',date);b.onclick=()=>{if(holiday)return;if(status==='select'){chosen.has(date)?chosen.delete(date):chosen.add(date)}else{if(status==='preferred'&&new Date(date+'T12:00:00').getDay()!==6)return alert('Preferowaną sobotę można zaznaczyć tylko w sobotę.');saved[date]={status,start:(status==='limited'||status==='preferred'||($('employment').value==='zlecenie'&&status==='available'))?$('start').value:'',end:(status==='limited'||status==='preferred'||($('employment').value==='zlecenie'&&status==='available'))?$('end').value:''};chosen.add(date);if(['available','limited','preferred'].includes(status))editingDate=date}render()};const tile=document.createElement('div');tile.className='day-tile';tile.append(b);if(value&&!holiday&&['available','limited','preferred'].includes(value.status)){const edit=document.createElement('button');edit.type='button';edit.className='day-edit';edit.textContent='✎';edit.title='Zmień godziny '+date;edit.setAttribute('aria-label','Zmień godziny '+date);edit.onclick=()=>{editingDate=date;render()};tile.append(edit)}cal.append(tile)}updateSelected();renderDayEditor();updateSummaryV2()}
function renderDayEditor(){const panel=$('dayEditor');if(!panel)return;const v=editingDate&&saved[editingDate];const visible=v&&['available','limited','preferred'].includes(v.status)&&editingDate.startsWith(key());panel.classList.toggle('hidden',!visible);if(!visible)return;$('editingDate').textContent=new Date(editingDate+'T12:00:00').toLocaleDateString('pl-PL',{day:'numeric',month:'long',year:'numeric'});$('editStart').value=v.start||$('start').value;$('editEnd').value=v.end||$('end').value}function setMode(s){status=s;document.querySelectorAll('[data-status]').forEach(x=>x.classList.toggle('active',x.dataset.status===s))}document.querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>setMode(b.dataset.status));$('prev').onclick=()=>{view.setMonth(view.getMonth()-1);chosen.clear();render();updateEmploymentStatuses()};$('next').onclick=()=>{view.setMonth(view.getMonth()+1);chosen.clear();render();updateEmploymentStatuses()};$('weekdays').onclick=()=>selectAll(d=>{const w=new Date(d+'T12:00:00').getDay();return w!==0&&w!==6});$('all').onclick=()=>selectAll(()=>true);$('unselect').onclick=()=>{chosen.clear();render()};$('applyHours').onclick=()=>{if(!chosen.size)return alert('Najpierw zaznacz dni');if(!$('start').value||!$('end').value||$('start').value>=$('end').value)return alert('Sprawdź godziny');chosen.forEach(d=>{if(isHoliday(d))return;saved[d]??={status:'limited',start:'',end:''};saved[d].start=$('start').value;saved[d].end=$('end').value;if(['available','limited','preferred'].includes(saved[d].status))saved[d].status='limited'});render()};$('applyStatus').onclick=()=>{if(status==='select')return alert('Wybierz status przed zastosowaniem');if(status==='preferred'&&new Date(date+'T12:00:00').getDay()!==6)return alert('Preferowaną sobotę można zaznaczyć tylko w sobotę.');if(status==='preferred'&&[...chosen].some(d=>new Date(d+'T12:00:00').getDay()!==6))return alert('Preferowaną sobotę można zaznaczyć tylko w sobotę.');if(status==='dayoff'){if(!dayOffEligible())return alert('Ta opcja dotyczy etatu i świąt przypadających w sobotę.');const other=Object.entries(saved).filter(([d,v])=>d.startsWith(key())&&v.status==='dayoff'&&!chosen.has(d)).length;const valid=[...chosen].filter(d=>!isHoliday(d)&&new Date(d+'T12:00:00').getDay()!==0);if(valid.length!==chosen.size)return alert('Dzień wolny można wskazać tylko na dzień roboczy.');if(other+valid.length>saturdayHolidays().length)return alert('Przekroczono limit proponowanych dni wolnych za święto.');}chosen.forEach(d=>{if(isHoliday(d))return;const old=saved[d]||{};saved[d]={status,start:['available','limited','preferred'].includes(status)&&old.start||$('start').value,end:['available','limited','preferred'].includes(status)&&old.end||$('end').value}});render()};$('clear').onclick=()=>{if(!confirm('Usunąć zaznaczenia bieżącego miesiąca?'))return;Object.keys(saved).filter(d=>d.startsWith(key())).forEach(d=>delete saved[d]);chosen.clear();editingDate=null;render()};$('copyPrev').onclick=()=>{const prev=new Date(view.getFullYear(),view.getMonth()-1,1),prefix=`${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}`;let n=0;for(let d=1;d<=count();d++){const src=saved[`${prefix}-${String(d).padStart(2,'0')}`];if(src&&!isHoliday(dateFor(d))&&!(src.status==='preferred'&&new Date(dateFor(d)+'T12:00:00').getDay()!==6)){saved[dateFor(d)]={...src};n++}}$('message').textContent=n?`Skopiowano ${n} dni z poprzedniego miesiąca.`:'Nie ma danych poprzedniego miesiąca w tej sesji. Wczytaj poprzednie zgłoszenie kodem edycji lub uzupełnij poprzedni miesiąc.';render()};function updateEmploymentStatuses(){
  const etat=$('employment').value==='etat';
  const options=etat?[
    ['morning','Praca rano (preferencja)'],
    ['afternoon','Praca po południu (preferencja)'],
    ['unavailable','Nie mogę'],
    ['preferred','Sobota (chcę pracować)'],
    ['work12h','Praca cały dzień (12 h)'],
    ['dayoff','Dzień wolny'],
    ['leave','Urlop']
  ]:[
    ['available','Dostępny/a'],['limited','Ograniczone godziny'],
    ['preferred','Preferowana sobota'],['unavailable','Niedostępny/a'],['leave','Urlop']
  ];
  const previous=$('statusV2').value;
  $('statusV2').replaceChildren();
  for(const [value,label] of options){
    
    const option=document.createElement('option');option.value=value;option.textContent=label;
    $('statusV2').append(option);
  }
  if([...$('statusV2').options].some(o=>o.value===previous))$('statusV2').value=previous;
  syncEditorV2();
  $('shiftPreferenceHint').classList.toggle('hidden',!etat);
  $('summaryInfo').textContent=etat?'Zmiana rano i po południu to preferencje. Praca cały dzień oznacza preferencję zmiany 12-godzinnej. Dodatkowe informacje wpisz w uwagach poniżej.':'Podsumowanie dotyczy zadeklarowanych godzin, nie zatwierdzonego grafiku.';
}
$('employment').onchange=()=>{const etat=$('employment').value==='etat';$('etatFields').classList.toggle('hidden',!etat);$('zlecenieFields').classList.toggle('hidden',etat);editingDate=null;Object.keys(saved).forEach(d=>{const s=saved[d].status;if(!etat&&['dayoff','work12h','saturdayoff','morning','afternoon'].includes(s))delete saved[d];if(etat&&['available','limited'].includes(s))delete saved[d]});render();updateEmploymentStatuses();$('employmentHelp').textContent=etat?'Zgłoś urlopy i preferencje zmian.':'Zaznacz dyspozycyjność oraz przedziały godzinowe.'};$('saveDayHours').onclick=()=>{if(!editingDate||!saved[editingDate])return;const start=$('editStart').value,end=$('editEnd').value;if(!start||!end||start>=end)return alert('Godzina zakończenia musi być późniejsza od rozpoczęcia.');saved[editingDate].start=start;saved[editingDate].end=end;editingDate=null;render()};$('closeDayEditor').onclick=()=>{editingDate=null;render()};$('load').onclick=()=>{$('message').textContent='Wersja GitHub Pages nie ma bazy zgłoszeń. Wczytywanie wymaga serwera.'};
$('send').onclick=()=>{const employee=$('employee').value.trim().replace(/\s+/g,' ');const days=Object.entries(saved).filter(([d])=>d.startsWith(key())&&!isHoliday(d)).sort((a,b)=>a[0].localeCompare(b[0]));if(employee.length<3||employee.length>100){$('message').textContent='Podaj imię i nazwisko (3–100 znaków).';return;}if(!$('role').value){$('message').textContent='Wybierz stanowisko pracownika.';$('role').focus();return;}if(!days.length){$('message').textContent='Najpierw zaznacz dni miesiąca.';return;}if(!window.GRAFIK_APPS_SCRIPT_URL||!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(window.GRAFIK_APPS_SCRIPT_URL)){$('message').textContent='Brak poprawnego adresu Apps Script w config.js.';return;}const payload={employee,role:$('role').value,employment:$('employment').value,month:key(),note:$('note').value,days:days.map(([date,v])=>({date,status:v.status,start:v.start||'',end:v.end||''}))};if(payload.employment==='etat'){payload.imageBase64=renderEtatPng(payload)}const form=$('uploadForm');form.action=window.GRAFIK_APPS_SCRIPT_URL;$('uploadPayload').value=JSON.stringify(payload);$('send').disabled=true;$('message').textContent='Wysyłanie do Google Drive…';let loaded=false;const frame=$('uploadFrame');const handler=()=>{if(loaded)return;loaded=true;$('send').disabled=false;$('message').textContent='Żądanie wysłano. Sprawdź odpowiedni folder Google Drive ('+(payload.employment==='etat'?'PNG':'CSV')+'). Samo załadowanie odpowiedzi nie gwarantuje zapisu.';frame.removeEventListener('load',handler)};frame.addEventListener('load',handler);form.submit();setTimeout(()=>{if(!loaded){$('send').disabled=false;$('message').textContent='Nie udało się potwierdzić wysłania. Sprawdź folder Drive i dziennik Apps Script przed ponowną próbą.';frame.removeEventListener('load',handler)}},15000)};
$('copyToken').onclick=()=>{};render();

// Ankieta 2.0: jeden panel edycji i podsumowanie na żywo.
function updateSummaryV2(){const rows=Object.entries(saved).filter(([d,v])=>d.startsWith(key())&&!isHoliday(d)&&['available','limited','preferred'].includes(v.status)&&v.start&&v.end&&v.end>v.start);let minutes=0;for(const [,v] of rows){const [sh,sm]=v.start.split(':').map(Number),[eh,em]=v.end.split(':').map(Number);minutes+=(eh*60+em)-(sh*60+sm)}const fmt=m=>Number.isInteger(m/60)?`${m/60} h`:`${(m/60).toLocaleString('pl-PL',{maximumFractionDigits:2})} h`;$('summaryDays').textContent=rows.length;$('summaryHours').textContent=fmt(minutes);$('summaryAvg').textContent=fmt(rows.length?Math.round(minutes/rows.length):0);void 0}
const statusV2=$('statusV2');function syncEditorV2(){const needs=$('employment').value==='zlecenie'&&['available','limited','preferred'].includes(statusV2.value);$('hoursFieldsV2').classList.toggle('hidden',!needs)}statusV2.addEventListener('change',syncEditorV2);syncEditorV2();
$('applyV2').onclick=()=>{if(!chosen.size)return alert('Najpierw zaznacz dni w kalendarzu.');const st=statusV2.value;if($('employment').value==='etat'&&!['morning','afternoon','unavailable','preferred','work12h','dayoff','leave'].includes(st))return alert('Nieprawidłowy status dla etatu.');if($('employment').value==='zlecenie'&&!['available','limited','preferred','unavailable','leave'].includes(st))return alert('Nieprawidłowy status dla zlecenia.');if(st==='preferred'&&[...chosen].some(d=>new Date(d+'T12:00:00').getDay()!==6))return alert('Preferowana sobota może być zaznaczona wyłącznie w sobotę.');const hasHours=$('employment').value==='zlecenie'&&['available','limited','preferred'].includes(st),start=$('startV2').value,end=$('endV2').value;if(hasHours&&(!start||!end||start>=end))return alert('Sprawdź godziny rozpoczęcia i zakończenia.');for(const d of chosen){if(isHoliday(d))continue;saved[d]={status:st,start:hasHours?start:'',end:hasHours?end:''}}editingDate=null;chosen.clear();render()};
$('unselectV2').onclick=()=>{$('unselect').click()};$('weekdaysV2').onclick=()=>{$('weekdays').click()};$('allV2').onclick=()=>{$('all').click()};$('copyPrevV2').onclick=()=>{$('copyPrev').click()};$('clearV2').onclick=()=>{$('clear').click()};
// Zaznaczanie dat bez natychmiastowej zmiany statusu.
setMode('select');

// Ankieta 2.3: inicjalizacja wyborów zależnych od rodzaju umowy.
$('employment').onchange();


// Ankieta 2.5: karta A4 PNG generowana lokalnie, bez zewnętrznych usług.
function renderEtatPng(p) {
  const W=1240,H=1754, c=document.createElement('canvas'); c.width=W;c.height=H;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#fffdfb';ctx.fillRect(0,0,W,H);
  const colors={morning:'#dceefb',afternoon:'#eee3fc',work12h:'#d7f3ef',preferred:'#fbe7cf',dayoff:'#e9e9f7',unavailable:'#f7dde0',leave:'#d9e5fa',holiday:'#e9ecef',empty:'#f8f8f7'};
  const codes={morning:'R',afternoon:'P',work12h:'12h',preferred:'S',dayoff:'W',unavailable:'X',leave:'U'};
  const legends=[['R','Praca rano','morning'],['P','Praca po południu','afternoon'],['12h','Praca cały dzień (12 h)','work12h'],['S','Preferowana sobota','preferred'],['W','Dzień wolny','dayoff'],['X','Nie mogę','unavailable'],['U','Urlop','leave'],['Ś','Święto','holiday']];
  const roles={asystent:'Asystent medyczny',pielegniarka:'Pielęgniarka / pielęgniarz',polozna:'Położna / położny'};
  const [year,month]=p.month.split('-').map(Number),monthTitle=new Date(year,month-1,1).toLocaleDateString('pl-PL',{month:'long',year:'numeric'});
  const data=Object.fromEntries(p.days.map(d=>[d.date,d.status]));
  const txt=(str,x,y,size=30,color='#28304a',weight='400')=>{ctx.fillStyle=color;ctx.font=`${weight} ${size}px Arial, sans-serif`;ctx.fillText(str,x,y)};
  function round(x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
  function wrap(text,maxWidth,size=26){ctx.font=`400 ${size}px Arial, sans-serif`;const lines=[];for(const para of String(text).split('\n')){let line='';for(const word of para.split(/\s+/)){const next=line?line+' '+word:word;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=word}else line=next}lines.push(line)}return lines}
  round(0,0,W,16,0,'#8759ad');
  txt('GRAFIK  /  KARTA DYSPOZYCYJNOŚCI',70,100,25,'#8759ad','700');
  txt(monthTitle.toUpperCase(),70,172,52,'#25243c','700');
  const employeeLines=wrap(p.employee,1070,42);
  employeeLines.slice(0,2).forEach((l,i)=>txt(l,70,245+i*48,42,'#25243c','700'));
  const infoY=265+Math.max(0,employeeLines.slice(0,2).length-1)*48;
  txt('Umowa o pracę   •   '+(roles[p.role]||p.role),70,infoY+36,26,'#5e5d70');
  const week=['PN','WT','ŚR','CZ','PT','SO','ND'];const left=70,gap=9,cw=(1100-gap*6)/7;
  const headY=360;
  week.forEach((w,i)=>txt(w,left+i*(cw+gap)+cw/2-ctx.measureText(w).width/2,headY,23,'#6d6880','700'));
  const first=(new Date(year,month-1,1).getDay()+6)%7,ndays=new Date(year,month,0).getDate();
  const cellH=118,gridY=384;
  for(let day=1;day<=ndays;day++){
    const index=first+day-1,row=Math.floor(index/7),col=index%7;
    const iso=p.month+'-'+String(day).padStart(2,'0');
    const holiday=holidayName(iso),st=holiday?'holiday':data[iso]||'empty';
    const x=left+col*(cw+gap),y=gridY+row*(cellH+8);
    round(x,y,cw,cellH,14,colors[st]||colors.empty);
    txt(String(day),x+15,y+35,28,'#25243c','700');
    const code=holiday?'Ś':codes[st];
    if(code){ctx.font='700 34px Arial';const width=ctx.measureText(code).width;txt(code,x+(cw-width)/2,y+83,34,'#31344a','700')}
  }
  const legendY=gridY+6*(cellH+8)+18;
  txt('LEGENDA',70,legendY,26,'#25243c','700');
  legends.forEach(([code,label,st],i)=>{const col=i%2,row=Math.floor(i/2),x=70+col*550,y=legendY+25+row*55;round(x,y,39,39,8,colors[st]);txt(code,x+8,y+29,21,'#25243c','700');txt(label,x+52,y+29,24,'#34364c')});
  const notesY=legendY+270;
  txt('UWAGI ORGANIZACYJNE',70,notesY,26,'#25243c','700');
  round(70,notesY+20,1100,170,12,'#f4eff8');
  const lines=wrap(p.note.trim()||'Brak dodatkowych uwag.',1040,24);
  lines.slice(0,5).forEach((l,i)=>txt(l,93,notesY+59+i*28,24,'#3e3c4c'));
  txt('Preferencje pracownika — nie są zatwierdzonym grafikiem pracy.',70,1710,21,'#777283');
  return c.toDataURL('image/png').split(',')[1];
}
