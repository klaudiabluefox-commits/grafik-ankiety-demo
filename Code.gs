// GRAFIK Ankiety 0.9 — tylko testowe zgłoszenia, bez publicznego odczytu.
const FOLDER_ID = '1kUTOknV1Wi8jmkcaVFhzoYbg2AIdOY0o';
const STATUSES = ['available','limited','preferred','leave','unavailable','dayoff'];
function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return ContentService.createTextOutput('BUSY');
  try {
    const raw = e && e.parameter && e.parameter.payload;
    if (!raw || raw.length > 30000) throw new Error('Nieprawidłowy rozmiar zgłoszenia');
    const p = JSON.parse(raw);
    const employee = String(p.employee || '').trim().replace(/\s+/g,' ');
    const employment = String(p.employment || '');
    const month = String(p.month || '');
    const note = String(p.note || '');
    if (employee.length < 3 || employee.length > 100 || /[\r\n]/.test(employee)) throw new Error('Nieprawidłowe imię i nazwisko');
    if (!['etat','zlecenie'].includes(employment)) throw new Error('Nieprawidłowe zatrudnienie');
    if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Nieprawidłowy miesiąc');
    if (note.length > 500) throw new Error('Za długie uwagi');
    if (!Array.isArray(p.days) || p.days.length < 1 || p.days.length > 31) throw new Error('Nieprawidłowe dni');
    const seen = new Set();
    const rows = [['pracownik','rodzaj_zatrudnienia','miesiac','data','status','od','do','uwagi']];
    p.days.forEach(x => {
      const date = String(x.date || '');
      const status = String(x.status || '');
      const start = String(x.start || '');
      const end = String(x.end || '');
      if (!/^20\d{2}-\d{2}-\d{2}$/.test(date) || !date.startsWith(month+'-')) throw new Error('Nieprawidłowa data');
      const parsed = new Date(date+'T12:00:00Z');
      if (isNaN(parsed.getTime()) || parsed.toISOString().slice(0,10)!==date || seen.has(date)) throw new Error('Data powtórzona lub nieistniejąca');
      seen.add(date);
      if (!STATUSES.includes(status)) throw new Error('Nieprawidłowy status');
      if ((start && !/^([01]\d|2[0-3]):[0-5]\d$/.test(start)) || (end && !/^([01]\d|2[0-3]):[0-5]\d$/.test(end)) || (start && end && start >= end)) throw new Error('Nieprawidłowe godziny');
      if (status==='dayoff' && employment!=='etat') throw new Error('Wolne za święto tylko dla etatu');
      rows.push([employee,employment,month,date,status,start,end,note]);
    });
    const safe = employee.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').slice(0,55);
    const filename = 'GRAFIK_'+month+'_'+safe+'_'+Utilities.getUuid().slice(0,8)+'.csv';
    const csv = '\uFEFF'+rows.map(row=>row.map(csvCell).join(';')).join('\r\n');
    const file = DriveApp.getFolderById(FOLDER_ID).createFile(filename,csv,MimeType.CSV);
    console.log('Zapisano '+file.getName());
    return ContentService.createTextOutput('OK');
  } catch(err) {
    console.error('Odrzucono zgłoszenie: '+err.message);
    return ContentService.createTextOutput('ERROR: '+err.message);
  } finally { lock.releaseLock(); }
}
function csvCell(value) {
  let s=String(value==null?'':value);
  // Ochrona przed wykonaniem formuły po otwarciu CSV w arkuszu kalkulacyjnym.
  if (/^[\s]*[=+@-]/.test(s)) s="'"+s;
  return '"'+s.replace(/"/g,'""')+'"';
}
