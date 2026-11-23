// 1) Paste your Supabase project URL and anon key below. See README.md.
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const hasConfig = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("YOUR_") && SUPABASE_ANON_KEY.length > 20;
const db = hasConfig && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const likertQuestions = [
"Giá cả ở Việt Nam rẻ hơn nơi tôi sống nên tôi có thể tận hưởng mà không quá tốn kém.",
"Đồ ăn và thức uống Việt Nam có mức hài lòng cao so với giá tiền.",
"Cảnh quan Việt Nam đẹp khiến tôi muốn quay lại.",
"Người Việt Nam tạo cho tôi cảm giác thân thiện và ấm áp.",
"Nội dung giới thiệu Việt Nam của người nổi tiếng/influencer nước ngoài ảnh hưởng đến sự quan tâm của tôi.",
"Tôi quan tâm đến âm nhạc, phim ảnh và nội dung văn hóa Việt Nam."
];
function initSurvey(){
 const form=document.getElementById("surveyForm"); if(!form)return;
 const likert=document.getElementById("likert");
 likert.innerHTML='<div class="likert-row"><strong>Nhận định</strong>'+[1,2,3,4,5].map(n=>'<span class="likert-head">'+n+'</span>').join('')+'</div>'+likertQuestions.map((q,i)=>'<div class="likert-row"><span>'+String.fromCharCode(97+i)+') '+q+'</span>'+[1,2,3,4,5].map(n=>'<label><input type="radio" name="likert'+i+'" value="'+n+'" required aria-label="Điểm '+n+'"></label>').join('')+'</div>').join('');
 const sourcePanels=[...form.querySelectorAll(':scope > .panel')];
 const identityPanel=sourcePanels[0];
 const questions=sourcePanels.slice(1).flatMap(p=>[...p.querySelectorAll('.question')]);
 const steps=[];
 identityPanel.classList.add('wizard-step');
 identityPanel.dataset.step='0';
 steps.push(identityPanel);
 const sectionNames=['PHẦN A · THÔNG TIN CƠ BẢN VÀ NHẬN THỨC','PHẦN B · HÌNH ẢNH VÀ SỨC HẤP DẪN CỦA VIỆT NAM','PHẦN C · NGUỒN THÔNG TIN VÀ DỰ ĐỊNH TƯƠNG LAI'];
 questions.forEach((q,i)=>{
   const originalPanel=q.closest('.panel');
   const section=originalPanel.querySelector('.section-tag')?.textContent||'';
   const panel=document.createElement('section');panel.className='panel wizard-step';panel.dataset.step=String(i+1);
   const tag=document.createElement('div');tag.className='section-tag';tag.textContent=section;panel.append(tag,q);
   steps.push(panel);
 });
 sourcePanels.forEach(p=>p.remove());
 const nav=document.createElement('div');nav.className='wizard-nav';
 nav.innerHTML='<button class="btn secondary" type="button" id="prevStep">← Quay lại</button><span id="stepCounter" aria-live="polite"></span><button class="btn primary" type="button" id="nextStep">Tiếp theo →</button>';
 const submitRow=form.querySelector('.submit-row');
 const resetButton=submitRow?.querySelector('[type=reset]');
 const submitButton=submitRow?.querySelector('[type=submit]');
 if(submitRow)submitRow.remove();
 steps.forEach(p=>form.appendChild(p));
 form.appendChild(nav);
 const finalRow=document.createElement('div');finalRow.className='submit-row wizard-final hidden';
 if(resetButton)finalRow.appendChild(resetButton);
 if(submitButton)finalRow.appendChild(submitButton);
 form.appendChild(finalRow);
 let current=0;
 function updateProgress(){
   const pct=Math.round((current/steps.length)*100);
   document.getElementById('progressFill').style.width=pct+'%';
   document.getElementById('progressText').textContent='Tiến độ: '+pct+'%';
   document.getElementById('stepCounter').textContent='Câu '+(current+1)+' / '+steps.length;
   steps.forEach((p,i)=>p.classList.toggle('hidden',i!==current));
   document.getElementById('prevStep').disabled=current===0;
   document.getElementById('nextStep').classList.toggle('hidden',current===steps.length-1);
   finalRow.classList.toggle('hidden',current!==steps.length-1);
   document.getElementById('nextStep').textContent=current===0?'Bắt đầu →':'Tiếp theo →';
   const active=steps[current].querySelector('input:not([type=hidden]),textarea');
   if(active)active.focus({preventScroll:true});
   window.scrollTo({top:0,behavior:'smooth'});
 }
 function validateStep(){
   const panel=steps[current];
   const required=[...panel.querySelectorAll('[required]')];
   for(const el of required){
     if(el.type==='radio'){
       if(!panel.querySelector('input[name="'+CSS.escape(el.name)+'"]:checked')){el.focus();el.reportValidity?.();return false;}
     }else if(!el.checkValidity()){el.reportValidity();return false;}
   }
   const limits=[['firstImpression',3],['attractions',3],['cities',2]];
   for(const [name,max] of limits){
     const group=[...panel.querySelectorAll('input[name="'+name+'"]:checked')];
     if(panel.querySelector('input[name="'+name+'"]')&&group.length===0){
       const first=panel.querySelector('input[name="'+name+'"]');
       const message=name==='cities'?'Vui lòng chọn ít nhất một thành phố.':'Vui lòng chọn ít nhất một đáp án.';
       document.getElementById('formMessage').textContent=message;first.focus();return false;
     }
     if(group.length>max){document.getElementById('formMessage').textContent='Vui lòng chọn tối đa '+max+' đáp án.';return false;}
   }
   document.getElementById('formMessage').textContent='';
   return true;
 }
 document.getElementById('nextStep').addEventListener('click',()=>{if(!validateStep())return;current=Math.min(current+1,steps.length-1);updateProgress();});
 document.getElementById('prevStep').addEventListener('click',()=>{current=Math.max(0,current-1);document.getElementById('formMessage').textContent='';updateProgress();});
 form.addEventListener('change',e=>{
   if(e.target.name==='identity')document.getElementById('nameWrap').classList.toggle('hidden',e.target.value!=='Ghi tên');
   const groups=['firstImpression','attractions','cities'];
   groups.forEach(g=>{const selected=[...form.querySelectorAll('input[name="'+g+'"]:checked')];const max=g==='cities'?2:3;form.querySelectorAll('input[name="'+g+'"]').forEach(el=>{el.disabled=selected.length>=max&&!el.checked;});});
 });
 form.addEventListener('reset',()=>setTimeout(()=>{
   form.querySelectorAll('input').forEach(x=>x.disabled=false);
   document.getElementById('nameWrap').classList.add('hidden');
   current=0;document.getElementById('formMessage').textContent='';updateProgress();
 },0));
 form.addEventListener('submit',async e=>{
  e.preventDefault();const msg=document.getElementById('formMessage');msg.textContent='';
  if(current!==steps.length-1){msg.textContent='Vui lòng hoàn thành từng câu hỏi trước khi gửi.';return;}
  if(!validateStep())return;
  const get=n=>form.querySelector('[name="'+n+'"]:checked')?.value||'';
  const many=n=>[...form.querySelectorAll('[name="'+n+'"]:checked')].map(x=>x.value);
  const limited=[['firstImpression',3],['attractions',3],['cities',2]];
  if(limited.some(([n,max])=>many(n).length>max)){msg.textContent='Vui lòng kiểm tra giới hạn số lựa chọn.';return;}
  if(!db){msg.textContent='Chưa kết nối cơ sở dữ liệu. Vui lòng cấu hình Supabase theo hướng dẫn trong README.md.';return;}
  const data={identity:get('identity'),respondent_name:form.name.value.trim()||null,nationality:form.nationality.value.trim()||null,age:get('age'),visit:get('visit'),affinity:get('affinity'),first_impression:[...many('firstImpression'),form.firstImpressionOther.value.trim()].filter(Boolean),attractions:[...many('attractions'),form.attractionsOther.value.trim()].filter(Boolean),likert:likertQuestions.map((_,i)=>Number(get('likert'+i))),sources:many('sources'),cities:[...many('cities'),form.citiesOther.value.trim()].filter(Boolean),intention:get('intention'),comments:form.comments.value.trim(),feedback:form.feedback.value.trim()};
  const btn=form.querySelector('[type=submit]');btn.disabled=true;btn.textContent='Đang gửi...';
  const {error}=await db.from('survey_responses').insert(data);
  btn.disabled=false;btn.textContent='Gửi khảo sát →';
  if(error){msg.textContent='Không thể gửi phản hồi: '+error.message;return;}
  form.reset();msg.textContent='Cảm ơn bạn! Câu trả lời đã được ghi nhận.';
 });
 updateProgress();
}
function initAdmin(){
 const login=document.getElementById("loginForm");if(!login)return;
 const loginPanel=document.getElementById("loginPanel"),dash=document.getElementById("dashboard");
 if(!db){document.getElementById("loginMessage").textContent="Cần cấu hình Supabase trong app.js trước khi sử dụng trang quản lý.";return;}
 login.addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(login);const {error}=await db.auth.signInWithPassword({email:f.get("email"),password:f.get("password")});document.getElementById("loginMessage").textContent=error?error.message:"";if(!error)showDashboard();});
 document.getElementById("logoutBtn").onclick=async()=>{await db.auth.signOut();dash.classList.add("hidden");loginPanel.classList.remove("hidden");};
 document.getElementById("refreshBtn").onclick=loadData;
 document.getElementById("exportBtn").onclick=()=>{if(!window.surveyRows?.length)return;const rows=window.surveyRows;const cols=Object.keys(rows[0]);const csv=[cols.join(","),...rows.map(r=>cols.map(k=>'"'+String(Array.isArray(r[k])?r[k].join("; "):r[k]??"").replaceAll('"','""')+'"').join(","))].join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));a.download="vietnam-survey-responses.csv";a.click();URL.revokeObjectURL(a.href);};
 db.auth.getSession().then(({data})=>{if(data.session)showDashboard();});
 async function showDashboard(){loginPanel.classList.add("hidden");dash.classList.remove("hidden");await loadData();}
 async function loadData(){const {data,error}=await db.from("survey_responses").select("*").order("created_at",{ascending:false});if(error){alert("Không tải được dữ liệu: "+error.message);return;}window.surveyRows=data||[];renderDashboard(window.surveyRows);}
}
const chartInstances={};
function countValues(rows,key){const m={};rows.forEach(r=>(Array.isArray(r[key])?r[key]:[r[key]]).filter(Boolean).forEach(v=>m[v]=(m[v]||0)+1));return Object.entries(m).sort((a,b)=>b[1]-a[1]);}
function draw(id,type,labels,values,label){if(chartInstances[id])chartInstances[id].destroy();const ctx=document.getElementById(id);if(!ctx)return;chartInstances[id]=new Chart(ctx,{type,data:{labels,datasets:[{label,data:values,backgroundColor:['#176b66','#df6258','#e8b65c','#729b91','#8c8eb2','#b9c9bd','#d28e7c','#7c9bb4'],borderColor:'#fff',borderWidth:2,borderRadius:type==='bar'?6:0}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:type==='doughnut'||type==='pie',position:'bottom'}},scales:type==='bar'?{y:{beginAtZero:true,ticks:{precision:0}}}:{} }});}
function renderDashboard(rows){
 const total=rows.length;const pct=n=>total?Math.round(n/total*100)+"%":"0%";
 document.getElementById("totalCount").textContent=total;document.getElementById("visitedCount").textContent=pct(rows.filter(r=>r.visit&&r.visit!=="Chưa từng").length);document.getElementById("positiveCount").textContent=pct(rows.filter(r=>["Cao","Rất cao"].includes(r.affinity)).length);document.getElementById("intentCount").textContent=pct(rows.filter(r=>["Có","Chắc chắn có"].includes(r.intention)).length);document.getElementById("lastUpdated").textContent="Cập nhật: "+new Date().toLocaleString("vi-VN");document.getElementById("responseCount").textContent=total+" phản hồi";
 const charts=[["ageChart","bar","age","Người trả lời"],["visitChart","doughnut","visit","Người trả lời"],["affinityChart","bar","affinity","Người trả lời"],["impressionChart","bar","first_impression","Lượt chọn"],["attractionChart","bar","attractions","Lượt chọn"],["sourceChart","bar","sources","Lượt chọn"],["cityChart","bar","cities","Lượt chọn"],["intentionChart","doughnut","intention","Người trả lời"]];
 charts.forEach(([id,type,key,label])=>{const entries=countValues(rows,key);draw(id,type,entries.map(x=>x[0]),entries.map(x=>x[1]),label);});
 const averages=likertQuestions.map((_,i)=>{const a=rows.map(r=>Number(r.likert?.[i])).filter(n=>n>=1&&n<=5);return a.length?Number((a.reduce((x,y)=>x+y,0)/a.length).toFixed(2)):0;});draw("likertChart","bar",["Giá cả","Ẩm thực","Cảnh quan","Con người","Influencer","Văn hóa"],averages,"Điểm trung bình");
 document.getElementById("responseRows").innerHTML=rows.slice(0,30).map(r=>'<tr><td>'+new Date(r.created_at).toLocaleString("vi-VN")+'</td><td>'+escapeHtml(r.nationality||"—")+'</td><td>'+escapeHtml(r.age||"—")+'</td><td>'+escapeHtml(r.affinity||"—")+'</td><td>'+escapeHtml(r.intention||"—")+'</td><td>'+escapeHtml(r.comments||"—")+'</td></tr>').join("")||'<tr><td colspan="6">Chưa có phản hồi.</td></tr>';
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
document.addEventListener("DOMContentLoaded",()=>{initSurvey();initAdmin();});