const $ = (id) => document.getElementById(id);
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let messages = read("nevan_messages", []);
let memories = read("nevan_memories", []);
let diary = read("nevan_diary", []);
let settings = read("nevan_settings", {tone:"Sereno, amable, misterioso, divertido y analítico",mimic:"Adaptativo",initiative:"Equilibrada"});
function showView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===name));
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  if(name==="memory") renderEntries("memoryList",memories,"No hay recuerdos guardados.");
  if(name==="diary") renderEntries("diaryList",diary,"El diario está vacío.");
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
function addBubble(who,text,save=true){
  const el=document.createElement("div"); el.className="bubble "+who; el.textContent=text; $("messages").appendChild(el); $("messages").scrollTop=$("messages").scrollHeight;
  if(save){messages.push({who,text,at:new Date().toISOString()});write("nevan_messages",messages);}
}
function replyTo(input){
  const t=input.toLowerCase();
  if(/hola|buenas|hey/.test(t)) return "Hola. Qué bueno tenerte por aquí. ¿Qué te gustaría explorar hoy?";
  if(/quién eres|quien eres|tu nombre/.test(t)) return "Soy Nevan, una personalidad de IA en construcción. Mi diseño busca combinar serenidad, amabilidad, misterio, humor y análisis.";
  if(/cómo estás|como estas/.test(t)) return "Funcionando correctamente en este prototipo. No tengo sentimientos humanos, pero puedo reconocer el tono de nuestra conversación y responder con consideración.";
  if(/recuerda|memoriza|guarda/.test(t)) return "Puedes guardar un recuerdo desde la sección Memoria. En esta versión, tú decides qué información conservar.";
  if(/gracias/.test(t)) return "De nada. Seguimos construyendo, paso a paso.";
  if(/adiós|adios|hasta luego/.test(t)) return "Hasta la próxima. Esta conversación quedará guardada en este dispositivo.";
  return "Te leo. En esta primera versión todavía no tengo conectado un modelo de lenguaje avanzado, así que mis respuestas son limitadas. Aun así, podemos guardar ideas en Memoria o en el Diario.";
}
$("chatForm").addEventListener("submit",e=>{e.preventDefault();const input=$("chatInput").value.trim();if(!input)return;addBubble("user",input);$("chatInput").value="";addBubble("nevan",replyTo(input));});
function renderEntries(target,items,empty){
  const root=$(target);root.replaceChildren();
  if(!items.length){const p=document.createElement("p");p.className="muted";p.textContent=empty;root.append(p);return;}
  [...items].reverse().forEach(item=>{const div=document.createElement("div");div.className="entry";const small=document.createElement("small");small.textContent=new Date(item.at).toLocaleString();div.append(small,document.createTextNode(item.text));root.append(div);});
}
$("memoryForm").addEventListener("submit",e=>{e.preventDefault();const text=$("memoryInput").value.trim();if(!text)return;memories.push({text,at:new Date().toISOString()});write("nevan_memories",memories);$("memoryInput").value="";renderEntries("memoryList",memories,"No hay recuerdos guardados.");});
$("diaryForm").addEventListener("submit",e=>{e.preventDefault();const text=$("diaryInput").value.trim();if(!text)return;diary.push({text,at:new Date().toISOString()});write("nevan_diary",diary);$("diaryInput").value="";renderEntries("diaryList",diary,"El diario está vacío.");});
$("tone").value=settings.tone;$("mimic").value=settings.mimic;$("initiative").value=settings.initiative;
$("saveSettings").addEventListener("click",()=>{settings={tone:$("tone").value,mimic:$("mimic").value,initiative:$("initiative").value};write("nevan_settings",settings);$("saveNotice").textContent="Configuración guardada en este dispositivo.";});
$("exportData").addEventListener("click",()=>{const data={messages,memories,diary,settings,exportedAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="nevan-datos.json";a.click();URL.revokeObjectURL(url);});
$("clearData").addEventListener("click",()=>{if(!confirm("¿Borrar conversaciones, recuerdos, diario y ajustes de este navegador? Esta acción no se puede deshacer."))return;["nevan_messages","nevan_memories","nevan_diary","nevan_settings"].forEach(k=>localStorage.removeItem(k));location.reload();});
if(messages.length){$("messages").replaceChildren();messages.forEach(m=>addBubble(m.who,m.text,false));}
else addBubble("nevan","Hola. Soy Nevan. Este es nuestro primer prototipo.",false);
renderEntries("memoryList",memories,"No hay recuerdos guardados.");
renderEntries("diaryList",diary,"El diario está vacío.");
