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
 form.addEventListener("change",e=>{
  if(e.target.name==="identity") document.getElementById("nameWrap").classList.toggle("hidden",e.target.value!=="Ghi tên");
  const checks=[...form.querySelectorAll('input[type=checkbox]:checked')]; const groups=["firstImpression","attractions","cities"];
  groups.forEach(g=>{const selected=[...form.querySelectorAll('input[name="'+g+'"]:checked')];selected.forEach(el=>{el.disabled=selected.length>= (g==="cities"?2:3) && !el.checked});});
  const required=form.querySelectorAll("[required]");const done=[...required].filter(el=>el.type==="radio"?form.querySelector('input[name="'+el.name+'"]:checked'):el.checked).length;document.getElementById("progressFill").style.width=Math.round(done/required.length*100)+"%";document.getElementById("progressText").textContent="Tiến độ: "+Math.round(done/required.length*100)+"%";
 });
 form.addEventListener("reset",()=>setTimeout(()=>{form.querySelectorAll("input").forEach(x=>x.disabled=false);document.getElementById("nameWrap").classList.add("hidden");document.getElementById("progressFill").style.width="0%";document.getElementById("progressText").textContent="Tiến độ: 0%";},0));
 form.addEventListener("submit",async e=>{
  e.preventDefault();const msg=document.getElementById("formMessage");msg.textContent="";
  const get=n=>form.querySelector('[name="'+n+'"]:checked')?.value||"";
  const many=n=>[...form.querySelectorAll('[name="'+n+'"]:checked')].map(x=>x.value);
  const limited=[["firstImpression",3],["attractions",3],["cities",2]];
  if(limited.some(([n,max])=>many(n).length>max)){msg.textContent="Vui lòng kiểm tra giới hạn số lựa chọn.";return;}
  if(!db){msg.textContent="Chưa kết nối cơ sở dữ liệu. Vui lòng cấu hình Supabase theo hướng dẫn trong README.md.";return;}
  const data={identity:get("identity"),respondent_name:form.name.value.trim()||null,nationality:form.nationality.value.trim()||null,age:get("age"),visit:get("visit"),affinity:get("affinity"),first_impression:[...many("firstImpression"),form.firstImpressionOther.value.trim()].filter(Boolean),attractions:[...many("attractions"),form.attractionsOther.value.trim()].filter(Boolean),likert:likertQuestions.map((_,i)=>Number(get("likert"+i))),sources:many("sources"),cities:[...many("cities"),form.citiesOther.value.trim()].filter(Boolean),intention:get("intention"),comments:form.comments.value.trim(),feedback:form.feedback.value.trim()};
  const btn=form.querySelector('[type=submit]');btn.disabled=true;btn.textContent="Đang gửi...";
  const {error}=await db.from("survey_responses").insert(data);
  btn.disabled=false;btn.textContent="Gửi khảo sát →";
  if(error){msg.textContent="Không thể gửi phản hồi: "+error.message;return;}
  form.reset();msg.textContent="Cảm ơn bạn! Câu trả lời đã được ghi nhận.";
 });
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