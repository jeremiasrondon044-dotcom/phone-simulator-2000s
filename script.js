
function tick(){clock.textContent=new Date().toLocaleTimeString();}
setInterval(tick,1000);tick();

function openApp(app){
const el=document.getElementById('app');
if(app==='sms') el.innerHTML='<h3>SMS</h3><p>Bienvenido a 2004.</p>';
if(app==='calc') el.innerHTML='<input id=a><input id=b><button onclick="calc()">+</button><div id=r></div>';
if(app==='snake') el.innerHTML='<p>Snake listo para ampliar.</p>';
}
function calc(){
r.textContent=Number(a.value)+Number(b.value);
}
