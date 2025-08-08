// ===== 설정 =====
const pattern = [
  '오전1','오전2','오전3','오전4','오전5',
  '휴','휴',
  '심야1','심야2','심야3','심야4','심야5',
  '휴','휴',
  '오후1','오후2','오후3','오후4','오후5',
  '휴'
];
// 기준일: 2025-08-07 = '오전1'
const PATTERN_START = new Date(2025,7,7);

// ===== 공휴일 로드 =====
async function loadHolidays(year){
  try{
    const r = await fetch('./holidays-v3.json?v=1', {cache:'no-store'});
    const j = await r.json();
    return j[String(year)]||{};
  }catch(e){ console.log(e); return {}; }
}

// ===== 유틸 =====
function ymd(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function shiftOf(d){
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.floor((a - PATTERN_START)/(24*60*60*1000));
  const idx = ((diff % pattern.length)+pattern.length)%pattern.length;
  return pattern[idx];
}
function shiftClass(name){
  if(name.startsWith('오전')) return 'morning';
  if(name.startsWith('오후')) return 'evening';
  if(name.startsWith('심야')) return 'night';
  return 'off';
}

// ===== 렌더 =====
const titleEl = document.getElementById('title');
const daysEl = document.getElementById('days');
const holistEl = document.getElementById('holist');

let view = new Date(); // 현재 보이는 달
const today = new Date();

async function render(){
  const y = view.getFullYear(), m0 = view.getMonth(), m = m0+1;
  titleEl.textContent = `${y}년 ${m}월`;
  const holidays = await loadHolidays(y);

  const first = new Date(y, m0, 1);
  const lastDate = new Date(y, m, 0).getDate();
  const blanks = (first.getDay()+7)%7;

  daysEl.innerHTML = '';
  for(let i=0;i<blanks;i++){ const sp=document.createElement('div'); daysEl.appendChild(sp); }

  // 하단 리스트 준비
  const monthH = [];

  for(let d=1; d<=lastDate; d++){
    const date = new Date(y, m0, d);
    const cell = document.createElement('div');
    cell.className = 'cell';
    const dateSpan = document.createElement('div'); dateSpan.className='date'; dateSpan.textContent = d; cell.appendChild(dateSpan);

    const shift = shiftOf(date);
    const shiftEl = document.createElement('div');
    shiftEl.className = 'shift ' + shiftClass(shift);
    shiftEl.textContent = shift.startsWith('휴') ? '휴무' : shift;
    cell.appendChild(shiftEl);

    const key = ymd(date);
    if(holidays[key]){
      const badge = document.createElement('div');
      badge.className='badge';
      badge.textContent = holidays[key];
      cell.appendChild(badge);
      monthH.push([key, holidays[key]]);
    }

    // 오늘 표시
    if(ymd(date)===ymd(today)) cell.classList.add('today');

    // 주(월~일) 6번째 근무 표시
    const dow = date.getDay();
    const mondayOffset = (dow+6)%7; // 월=0
    let work=0;
    for(let k=0;k<=mondayOffset;k++){
      const chk=new Date(y,m0,d-mondayOffset+k);
      const s=shiftOf(chk);
      if(!s.startsWith('휴')) work++;
    }
    if(work===6 && !shift.startsWith('휴')) cell.classList.add('sixth');

    daysEl.appendChild(cell);
  }

  // 하단 리스트 렌더
  if(monthH.length){
    holistEl.innerHTML = '<b>이번 달 공휴일</b><ul>' + monthH.map(([d,n])=>`<li>${d} — ${n}</li>`).join('') + '</ul>';
  }else{
    holistEl.innerHTML = '';
  }
}

// ===== 이벤트 =====
document.getElementById('prev').onclick = ()=>{ view = new Date(view.getFullYear(), view.getMonth()-1, 1); render(); };
document.getElementById('next').onclick = ()=>{ view = new Date(view.getFullYear(), view.getMonth()+1, 1); render(); };
document.getElementById('today').onclick = ()=>{ view = new Date(); render(); };

render();
