// ----- 공휴일 불러오기 (별도 파일) -----
async function loadHolidays(year){
  const url = './holidays-final.json?v=1';
  try{
    const res = await fetch(url, {cache:'no-store'});
    if(!res.ok) throw new Error('holidays-final.json load failed');
    const data = await res.json();
    return data[String(year)] || {};
  }catch(e){
    console.log(e);
    return {};
  }
}

// ----- 교대근무 패턴 (오5-2휴-심5-2휴-후5-1휴) -----
const pattern = [
  '오전1','오전2','오전3','오전4','오전5',
  '휴','휴',
  '심야1','심야2','심야3','심야4','심야5',
  '휴','휴',
  '오후1','오후2','오후3','오후4','오후5',
  '휴'
];
// 기준: 2025-08-07 = '오전1'
const patternStartDate = new Date(2025,7,7);

function getShift(date){
  const ms = 86400000;
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // strip time
  const diff = Math.floor((local - patternStartDate)/ms);
  const idx = ((diff % pattern.length)+pattern.length)%pattern.length;
  return pattern[idx];
}

function createCalendar(year, month, holidays){
  const cal = document.getElementById('calendar');
  cal.innerHTML = '';

  const dows = ['일','월','화','수','목','금','토'];
  dows.forEach(d=>{ const el=document.createElement('div'); el.className='dow'; el.textContent=d; cal.appendChild(el); });

  const first = new Date(year, month-1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const startBlank = (first.getDay()+7)%7;
  for(let i=0;i<startBlank;i++) cal.appendChild(document.createElement('div'));

  const list=[];
  for(let day=1; day<=lastDate; day++){
    const d = new Date(year, month-1, day);
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    const cell = document.createElement('div');
    cell.className='day';
    cell.innerHTML = `<strong>${day}</strong>`;

    const shift = getShift(d);
    cell.innerHTML += `<span class="shift">${shift}</span>`;

    if(holidays[dateStr]){
      cell.classList.add('holiday');
      cell.innerHTML += `<span class="holiday-name">${holidays[dateStr]}</span>`;
      list.push(`${dateStr} = ${holidays[dateStr]}`);
    }

    // 주(월~일) 기준 6번째 근무일
    const dow = d.getDay();
    const mondayOffset = (dow+6)%7;
    let workCount=0;
    for(let k=0;k<=mondayOffset;k++){
      const chk = new Date(d); chk.setDate(d.getDate()-mondayOffset+k);
      if(getShift(chk)!=='휴') workCount++;
    }
    if(workCount===6 && shift!=='휴') cell.classList.add('sixth-day');

    cal.appendChild(cell);
  }

  const holder = document.getElementById('holiday-list');
  holder.innerHTML = list.length ? `<b>이번 달 공휴일</b><br>${list.join('<br>')}` : '이번 달 공휴일 없음';
}

// ----- 초기 렌더 -----
(async function(){
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth()+1;
  const holidays = await loadHolidays(y);
  createCalendar(y, m, holidays);
})();