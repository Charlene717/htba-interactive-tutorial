// ===== quiz-engine.js =====
// Profiles + chapter / random / wrong / full modes
const PROFILE_KEY = 'htba_quiz_profiles';
const CURRENT_KEY = 'htba_quiz_current';

const CH_NAMES = {
  1:{zh:'01 數據總覽',en:'01 Overview'},2:{zh:'02 實驗設計',en:'02 Design'},
  3:{zh:'03 上游流程',en:'03 Upstream'},4:{zh:'04 變異呼叫',en:'04 Variants'},
  5:{zh:'05 結構變異',en:'05 SV'},6:{zh:'06 ATAC/CUT&RUN',en:'06 ATAC'},
  7:{zh:'07 DNA 甲基化',en:'07 Methylation'},8:{zh:'08 Bulk RNA',en:'08 Bulk RNA'},
  9:{zh:'09 scRNA-seq',en:'09 scRNA'},10:{zh:'10 空間轉錄組',en:'10 Spatial'},
  11:{zh:'11 長讀 RNA',en:'11 Long-read'},12:{zh:'12 蛋白質體',en:'12 Proteomics'},
  13:{zh:'13 代謝體',en:'13 Metabolomics'},14:{zh:'14 批次校正',en:'14 Batch'},
  15:{zh:'15 多體學整合',en:'15 Multi-omics'},16:{zh:'16 空間×單細胞',en:'16 Spatial×SC'},
  17:{zh:'17 功能富集',en:'17 Enrichment'},18:{zh:'18 網絡分析',en:'18 Network'},
  19:{zh:'19 基礎模型',en:'19 FMs'},20:{zh:'20 可重現性',en:'20 Reproducibility'}
};

let profiles, current, qSet=[], qIdx=0, qAns=[], qCorrect=[];

function loadProfiles(){
  profiles = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{"default":{"answered":{},"wrong":[]}}');
  current  = localStorage.getItem(CURRENT_KEY) || 'default';
  if(!profiles[current]) current = Object.keys(profiles)[0];
  refreshProfileBar();
  refreshHome();
}
function saveProfiles(){ localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles)); localStorage.setItem(CURRENT_KEY, current);}

function refreshProfileBar(){
  const sel=document.getElementById('profileSel'); sel.innerHTML='';
  Object.keys(profiles).forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;if(n===current)o.selected=true;sel.append(o);});
  sel.onchange=()=>{current=sel.value;saveProfiles();refreshHome();};
}
function addProfile(){const nm=document.getElementById('newProfileName').value.trim();if(!nm)return;if(!profiles[nm])profiles[nm]={answered:{},wrong:[]};current=nm;document.getElementById('newProfileName').value='';saveProfiles();refreshProfileBar();refreshHome();}
function deleteProfile(){if(Object.keys(profiles).length<=1)return alert('Cannot delete the only profile');delete profiles[current];current=Object.keys(profiles)[0];saveProfiles();refreshProfileBar();refreshHome();}

function refreshHome(){
  const p=profiles[current];
  const total=QUESTIONS.length;const done=Object.keys(p.answered).length;
  document.getElementById('totalProgressBar').style.width=(done/total*100)+'%';
  document.getElementById('totalProgressLabel').textContent=`${done} / ${total} ${(window.I18n&&I18n.get()==='en'?'attempted':'已作答')}, ${p.wrong.length} ${(window.I18n&&I18n.get()==='en'?'wrong-list':'錯題待複習')}`;
  const grid=document.getElementById('chapterGrid');grid.innerHTML='';
  const lang=window.I18n?I18n.get():'en';
  for(let c=1;c<=20;c++){
    const qs=QUESTIONS.filter(q=>q.ch===c);
    const cd=qs.filter(q=>p.answered[q.id]&&p.answered[q.id].correct).length;
    const b=document.createElement('div');b.className='chapter-btn';b.onclick=()=>startMode('chapter',c);
    b.innerHTML=`<div>${CH_NAMES[c][lang]}</div><span class="ch-progress">${cd}/${qs.length}</span>`;
    grid.append(b);
  }
}

function startMode(mode,ch){
  qIdx=0;qAns=[];qCorrect=[];
  if(mode==='chapter'){qSet=QUESTIONS.filter(q=>q.ch===ch);}
  else if(mode==='random20'){qSet=[...QUESTIONS].sort(()=>Math.random()-.5).slice(0,20);}
  else if(mode==='wrong'){const wIds=new Set(profiles[current].wrong);qSet=QUESTIONS.filter(q=>wIds.has(q.id));if(qSet.length===0)return alert(window.I18n&&I18n.get()==='en'?'No wrong-answer items':'沒有錯題');}
  else if(mode==='full'){qSet=[...QUESTIONS];}
  document.getElementById('homeView').classList.add('hidden');
  document.getElementById('quizView').classList.remove('hidden');
  document.getElementById('resultView').classList.add('hidden');
  const lang=window.I18n?I18n.get():'en';
  document.getElementById('quizModeLabel').textContent=
    mode==='chapter'?`📚 ${CH_NAMES[ch][lang]} (${qSet.length})`:
    mode==='random20'?(lang==='en'?'🎲 Random 20':'🎲 隨機 20 題'):
    mode==='wrong'?(lang==='en'?`🔁 Wrong-answer review (${qSet.length})`:`🔁 錯題複習 (${qSet.length})`):
    (lang==='en'?'📝 Full exam (200)':'📝 完整模擬考 (200)');
  renderQ();
}

function renderQ(){
  const q=qSet[qIdx];const lang=window.I18n?I18n.get():'en';
  const card=document.createElement('div');card.className='question-card';
  const tagCls=q.type==='multi'?'tag-multi':(q.type==='tf'?'tag-tf':'tag-single');
  const tagLbl=q.type==='multi'?'Multi':(q.type==='tf'?'T/F':'Single');
  card.innerHTML=`<div class="q-num"><span class="tag-q ${tagCls}">${tagLbl}</span> Q${qIdx+1} / ${qSet.length} · Ch ${q.ch}</div><div class="q-text">${q[lang]}</div>`;
  const opts=document.createElement('div');opts.className='options-list';
  q.opts.forEach((o,i)=>{
    const row=document.createElement('label');row.className='option-row';row.dataset.idx=i;
    row.innerHTML=`<input type="${q.type==='multi'?'checkbox':'radio'}" name="opt" value="${i}"><span>${o[lang]}</span>`;
    if(qAns[qIdx]&&qAns[qIdx].includes(i))row.classList.add('selected');
    row.onclick=(e)=>{if(card.dataset.submitted)return e.preventDefault();setTimeout(()=>collectSel(card),10);};
    opts.append(row);
  });
  card.append(opts);
  const exp=document.createElement('div');exp.className='explain';card.append(exp);
  const cont=document.getElementById('questionContainer');cont.innerHTML='';cont.append(card);
  // restore if already answered
  const ans=profiles[current].answered[q.id];
  if(ans){
    qAns[qIdx]=ans.sel;
    revealAnswer(card,q,ans.sel);
    document.getElementById('btnSubmit').disabled=true;
  }else{
    document.getElementById('btnSubmit').disabled=false;
  }
  document.getElementById('btnPrev').disabled=(qIdx===0);
  document.getElementById('btnNext').disabled=(qIdx===qSet.length-1);
  const pct=((qIdx+1)/qSet.length*100).toFixed(0);
  document.getElementById('quizProgressBar').style.width=pct+'%';
  document.getElementById('quizProgressLabel').textContent=`Q${qIdx+1} / ${qSet.length}`;
}
function collectSel(card){
  const sels=[...card.querySelectorAll('input:checked')].map(x=>+x.value);
  qAns[qIdx]=sels;
  card.querySelectorAll('.option-row').forEach(r=>{r.classList.toggle('selected',sels.includes(+r.dataset.idx));});
}
function arrEq(a,b){if(a.length!==b.length)return false;const A=[...a].sort(),B=[...b].sort();return A.every((v,i)=>v===B[i]);}
function submitQ(){
  const q=qSet[qIdx]; const sel=qAns[qIdx]||[]; if(sel.length===0)return alert(window.I18n&&I18n.get()==='en'?'Please select an answer':'請先選答案');
  const correct=arrEq(sel,q.ans);
  const card=document.getElementById('questionContainer').firstChild;
  card.dataset.submitted=1;
  qCorrect[qIdx]=correct;
  // save
  profiles[current].answered[q.id]={sel,correct,t:Date.now()};
  const wIdx=profiles[current].wrong.indexOf(q.id);
  if(!correct&&wIdx<0)profiles[current].wrong.push(q.id);
  if(correct&&wIdx>=0)profiles[current].wrong.splice(wIdx,1);
  saveProfiles();
  revealAnswer(card,q,sel);
  document.getElementById('btnSubmit').disabled=true;
}
function revealAnswer(card,q,sel){
  card.querySelectorAll('.option-row').forEach(r=>{
    const i=+r.dataset.idx;
    r.style.pointerEvents='none';
    r.querySelector('input').disabled=true;
    if(q.ans.includes(i))r.classList.add('correct');
    else if(sel.includes(i))r.classList.add('wrong');
  });
  const correct=arrEq(sel,q.ans);
  const exp=card.querySelector('.explain');
  const lang=window.I18n?I18n.get():'en';
  exp.classList.add('show',correct?'correct-fb':'wrong-fb');
  exp.innerHTML=(correct?'✓ ':'✗ ')+q['exp_'+lang];
}
function nextQ(){if(qIdx<qSet.length-1){qIdx++;renderQ();}else finishQuiz();}
function prevQ(){if(qIdx>0){qIdx--;renderQ();}}
function finishQuiz(){
  document.getElementById('quizView').classList.add('hidden');
  document.getElementById('resultView').classList.remove('hidden');
  // compute score from saved answered (covers re-answers)
  let total=0,correct=0,perCh={};
  qSet.forEach(q=>{total++;const a=profiles[current].answered[q.id];const ok=a&&a.correct;if(ok)correct++;if(!perCh[q.ch])perCh[q.ch]={c:0,t:0};perCh[q.ch].t++;if(ok)perCh[q.ch].c++;});
  document.getElementById('finalScore').textContent=`${(correct/total*100).toFixed(0)}%`;
  const lang=window.I18n?I18n.get():'en';
  document.getElementById('finalSummary').textContent=`${correct} / ${total} ${lang==='en'?'correct':'答對'}`;
  let html='<div style="background:var(--c-surface);border:1px solid var(--c-border-light);border-radius:14px;padding:18px;margin-top:14px"><h3 style="font-family:var(--font-display);margin-bottom:10px">'+(lang==='en'?'Per-chapter score':'各章成績')+'</h3>';
  Object.keys(perCh).sort((a,b)=>+a-+b).forEach(ch=>{const o=perCh[ch];const pct=(o.c/o.t*100).toFixed(0);html+=`<div style="display:flex;align-items:center;gap:10px;font-size:.86rem;margin:4px 0"><span style="width:140px">${CH_NAMES[ch][lang]}</span><div style="flex:1;height:10px;background:var(--c-bg-alt);border-radius:5px;overflow:hidden"><div style="width:${pct}%;height:100%;background:${pct>=80?'#059669':(pct>=60?'#f59e0b':'#dc2626')}"></div></div><span style="width:60px;text-align:right">${o.c}/${o.t} (${pct}%)</span></div>`;});
  html+='</div>';document.getElementById('resultDetail').innerHTML=html;
}
function restartQuiz(){qIdx=0;qAns=[];qCorrect=[];document.getElementById('resultView').classList.add('hidden');document.getElementById('quizView').classList.remove('hidden');renderQ();}
function backHome(){document.getElementById('quizView').classList.add('hidden');document.getElementById('resultView').classList.add('hidden');document.getElementById('homeView').classList.remove('hidden');refreshHome();}

document.addEventListener('langchange',()=>{refreshHome();if(!document.getElementById('quizView').classList.contains('hidden'))renderQ();});
document.addEventListener('DOMContentLoaded',loadProfiles);
