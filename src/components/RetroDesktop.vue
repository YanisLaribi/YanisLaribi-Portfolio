<template>
  <div class="w98">
    <div v-if="booting" class="w98-boot">
      <div class="w98-logo">Yanis<span>Lab</span></div>
      <div class="w98-bar"><div class="w98-fill" :style="{width:bootPct+'%'}"></div></div>
      <div class="w98-bootlbl">Starting Yanis Lab OS...</div>
    </div>

    <div v-show="!booting" class="desk" @click="onDeskClick" @contextmenu.prevent="onCtx">

      <div class="desk-icons">
        <div v-for="s in sections" :key="s.id" class="dicon" :class="{sel:selIcon===s.id}"
          @click.stop="selIcon=s.id" @dblclick.stop="openWin(s.id)">
          <div class="dicon-pic" :style="{background:s.color}">{{ s.sym }}</div>
          <div class="dicon-lbl">{{ s.label }}</div>
        </div>
        <div class="dicon" @dblclick.stop="$emit('exit-computer')">
          <div class="dicon-pic" style="background:#cc2200">EXIT</div>
          <div class="dicon-lbl">Exit Room</div>
        </div>
      </div>

      <div v-for="win in wins" :key="win.id" class="win" v-show="!win.min"
        :class="{active:focId===win.id}" :style="ws(win)"
        @mousedown.stop="focus(win.id)">
        <div class="win-tb" @mousedown.prevent="drag($event,win)" @dblclick="toggleMax(win)">
          <span class="win-ico">{{ win.g }}</span>
          <span class="win-title">{{ win.title }}</span>
          <div class="win-btns">
            <button class="wbtn" @mousedown.stop @click.stop="win.min=!win.min" title="Minimize">_</button>
            <button class="wbtn" @mousedown.stop @click.stop="toggleMax(win)" title="Maximize">[ ]</button>
            <button class="wbtn wclose" @mousedown.stop @click.stop="close(win.id)" title="Close">X</button>
          </div>
        </div>
        <div class="win-menu"><span>File</span><span>Edit</span><span>View</span><span>Help</span></div>
        <div v-show="!win.min" class="win-body">
          <template v-if="win.id==='projects'">
            <div class="wtool"><input v-model="search" class="wsearch" placeholder="Search..."/></div>
            <div class="wscroll">
              <div v-for="p in fp" :key="p.title" class="row">
                <div class="row-h"><b>{{ p.title }}</b><span v-if="p.badge" class="badge">{{ p.badge }}</span></div>
                <div class="row-d">{{ p.desc }}</div>
                <div class="row-tags"><span v-for="t in p.tags" :key="t" class="tag">{{ t }}</span></div>
              </div>
              <div v-if="!fp.length" class="empty">No results for "{{ search }}"</div>
            </div>
          </template>
          <template v-else-if="win.id==='about'">
            <div class="wscroll">
              <div class="kv"><b>Name</b><span>Yanis Laribi</span></div>
              <div class="kv"><b>Role</b><span>Software Engineering Student</span></div>
              <div class="kv"><b>School</b><span>Universite Laval</span></div>
              <div class="kv"><b>Location</b><span>Quebec City, QC</span></div>
              <div class="slbl">Interests</div>
              <ul><li>Web development &amp; 3D graphics</li><li>Machine learning &amp; data science</li><li>Interactive design &amp; animation</li><li>Cybersecurity research</li></ul>
            </div>
          </template>
          <template v-else-if="win.id==='skills'">
            <div class="wscroll">
              <div v-for="cat in skillCats" :key="cat.name">
                <div class="slbl">{{ cat.name }}</div>
                <div v-for="s in cat.skills" :key="s[0]" class="sk">
                  <span class="sk-n">{{ s[0] }}</span>
                  <div class="sk-t"><div class="sk-f" :style="{width:s[1]+'%'}"></div></div>
                  <span class="sk-p">{{ s[1] }}%</span>
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="win.id==='education'">
            <div class="wscroll">
              <div class="slbl">Academic</div>
              <div class="tl"><b>Bachelor of Software Engineering</b><br>Universite Laval — GPA 3.5/4.3</div>
              <div class="tl"><b>Student Exchange</b><br>Brock University, ON</div>
              <div class="slbl">Internship</div>
              <div class="tl"><b>Data Science Intern — Anomaly Detection</b><br>Federal Government of Canada — ECCC (May–Aug 2026)</div>
              <div class="slbl">Research</div>
              <div class="tl"><b>SGD Beyond — ML Club (2025–2026)</b></div>
              <div class="tl"><b>CANLock — Vehicle Cybersecurity, Thales (2025)</b></div>
            </div>
          </template>
          <template v-else-if="win.id==='contact'">
            <div class="wscroll">
              <div class="kv"><b>Email</b><span>yanis.laribi.1@ulaval.ca</span></div>
              <div class="kv"><b>Phone</b><span>418-264-7838</span></div>
              <div class="kv"><b>LinkedIn</b><span>linkedin.com/in/yanislaribi</span></div>
              <div class="kv"><b>GitHub</b><span>github.com/YanisLaribi</span></div>
            </div>
          </template>
          <template v-else-if="win.id==='cv'">
            <div class="wscroll">
              <div class="cv-n">Yanis Laribi</div>
              <div class="cv-r">Software Engineering Student</div>
              <div class="slbl">Profile</div>
              <p>3rd year Software Engineering at Universite Laval. Full-stack, ML, 3D, cybersecurity.</p>
              <div class="slbl">Experience</div>
              <p>Data Science Intern — Govt of Canada, ECCC (May–Aug 2026)</p>
              <div class="slbl">Technologies</div>
              <p>Java / Python / C++ / JavaScript / SQL / Vue.js / Three.js / Flask / PyTorch / Docker / Git</p>
            </div>
          </template>
        </div>
        <div v-show="!win.min" class="win-stat">{{ win.title }} — Ready</div>
        <div class="win-resize" @mousedown.prevent.stop="startRes($event,win)"></div>
      </div>

      <div v-if="ctxOpen" class="ctx" :style="{left:ctxX+'px',top:ctxY+'px'}" @click.stop>
        <div class="ctx-i" v-for="s in sections" :key="s.id" @click="openWin(s.id);ctxOpen=false">Open {{ s.label }}</div>
        <div class="ctx-sep"></div>
        <div class="ctx-i" @click="$emit('exit-computer');ctxOpen=false">Exit to Room</div>
      </div>

      <div class="taskbar">
        <button class="start" :class="{active:startOpen}" @click.stop="startOpen=!startOpen">
          <span class="start-logo">Y</span> Start
        </button>
        <div class="tb-wins">
          <button v-for="w in wins" :key="w.id" class="tb-btn" :class="{active:focId===w.id&&!w.min}"
            @click.stop="tbClick(w)">{{ w.title }}</button>
        </div>
        <div class="tb-r">
          <span class="tb-time">{{ time }}</span>
        </div>
      </div>

      <transition name="start-slide">
        <div v-if="startOpen" class="start-menu" @click.stop>
          <div class="sm-brand"><span>Yanis</span><span class="sm-98">Lab</span></div>
          <div class="sm-items">
            <div v-for="s in sections" :key="s.id" class="sm-item" @click="openWin(s.id);startOpen=false">
              <span class="sm-g">{{ s.g }}</span><span>{{ s.label }}</span>
            </div>
            <div class="sm-sep"></div>
            <div class="sm-item sm-exit" @click="$emit('exit-computer');startOpen=false">
              <span class="sm-g">[&lt;]</span><span>Shut Down</span>
            </div>
          </div>
        </div>
      </transition>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
const emit = defineEmits(['exit-computer'])

const booting=ref(true),bootPct=ref(0),time=ref('')
const selIcon=ref(null),focId=ref(null)
const startOpen=ref(false),ctxOpen=ref(false),ctxX=ref(0),ctxY=ref(0)
const search=ref(''),wins=ref([])
let nz=10,ci=null

const sections=[
  {id:'projects',  g:'[P]', sym:'💾', color:'#c8a020', label:'Projects' },
  {id:'about',     g:'[A]', sym:'🖥️', color:'#2060b0', label:'About Me'  },
  {id:'skills',    g:'[S]', sym:'📊', color:'#208040', label:'Skills'    },
  {id:'education', g:'[E]', sym:'🎓', color:'#802080', label:'Education' },
  {id:'contact',   g:'[C]', sym:'📬', color:'#208080', label:'Contact'   },
  {id:'cv',        g:'[R]', sym:'📄', color:'#804020', label:'Resume'    },
]
const projects=[
  {title:'BatiBloc',badge:'AWARD WINNER',desc:'Construction simulation with 2D/3D visualization, PDF import, cost estimation. Winner of the Yves-Roy Award.',tags:['Java','JavaFX','PDFBox']},
  {title:'Medical Case Simulator',desc:'3-tier web app for clinical simulations. WCAG AA, REST API, secure MySQL.',tags:['Python','Flask','MySQL']},
  {title:'3D Portfolio',desc:'This portfolio — immersive 3D experience with retro OS interface.',tags:['Vue.js','Three.js']},
  {title:'CANLock',desc:'AI anomaly detection on CAN bus vehicular networks. Thales partnership.',tags:['Python','AI','Cybersec']},
  {title:'Web Automation Agent',desc:'Autonomous agent bypassing anti-bot mechanisms. ConUHacks 2026.',tags:['Python','Selenium']},
  {title:'Banking System',desc:'OOP banking with secure transactions and exception handling.',tags:['C++','Qt','OOP']},
]
const skillCats=[
  {name:'Languages',skills:[['Java',90],['Python',88],['JavaScript',85],['C/C++',75],['SQL',80]]},
  {name:'Web/Backend',skills:[['Vue.js',80],['Flask',78],['REST APIs',82],['Three.js',72]]},
  {name:'AI/Data',skills:[['PyTorch',70],['scikit-learn',75],['Pandas',80]]},
  {name:'Tools',skills:[['Git',90],['Docker',65],['Linux',75]]},
]
const fp=computed(()=>projects.filter(p=>!search.value||p.title.toLowerCase().includes(search.value.toLowerCase())||p.tags.some(t=>t.toLowerCase().includes(search.value.toLowerCase()))))

function ws(w){
  if(w.max) return{position:'fixed',inset:'0 0 28px 0',width:'100%',zIndex:w.z}
  return{left:w.x+'px',top:w.y+'px',width:w.w+'px',height:w.h+'px',zIndex:w.z}
}
function openWin(id){
  selIcon.value=null;startOpen.value=false
  const ex=wins.value.find(w=>w.id===id)
  if(ex){ex.min=false;focus(id);return}
  const s=sections.find(s=>s.id===id)
  const off=wins.value.length*24
  wins.value.push({id,title:s.label,g:s.g,x:80+off,y:30+off,w:620,h:460,z:nz++,min:false,max:false})
  focus(id)
}
function close(id){wins.value=wins.value.filter(w=>w.id!==id);if(focId.value===id)focId.value=null}
function focus(id){const w=wins.value.find(w=>w.id===id);if(w){w.z=nz++;focId.value=id}}
function toggleMax(w){w.max=!w.max;w.min=false;focus(w.id)}
function tbClick(w){if(w.min||focId.value!==w.id){w.min=false;focus(w.id)}else{w.min=true}}
function onDeskClick(){selIcon.value=null;startOpen.value=false;ctxOpen.value=false}
function onCtx(e){ctxOpen.value=true;ctxX.value=e.clientX;ctxY.value=e.clientY}

let dW=null,dOx=0,dOy=0
function drag(e,w){
  if(w.max)return;dW=w;dOx=e.clientX-w.x;dOy=e.clientY-w.y
  window.addEventListener('mousemove',onDrag);window.addEventListener('mouseup',endDrag)
}
function onDrag(e){if(!dW)return;dW.x=Math.max(0,e.clientX-dOx);dW.y=Math.max(0,e.clientY-dOy)}
function endDrag(){dW=null;window.removeEventListener('mousemove',onDrag);window.removeEventListener('mouseup',endDrag)}

let rW=null,rOx=0,rOy=0,rWi=0,rHi=0
function startRes(e,w){rW=w;rOx=e.clientX;rOy=e.clientY;rWi=w.w;rHi=w.h;window.addEventListener('mousemove',onRes);window.addEventListener('mouseup',endRes)}
function onRes(e){if(!rW)return;rW.w=Math.max(380,rWi+(e.clientX-rOx));rW.h=Math.max(280,rHi+(e.clientY-rOy))}
function endRes(){rW=null;window.removeEventListener('mousemove',onRes);window.removeEventListener('mouseup',endRes)}

function onKey(e){
  const n=parseInt(e.key);if(n>=1&&n<=6){openWin(sections[n-1].id);return}
  if(e.key==='Escape'){if(ctxOpen.value){ctxOpen.value=false;return}if(startOpen.value){startOpen.value=false;return}if(focId.value){close(focId.value);return}emit('exit-computer')}
}
function tick(){const n=new Date();time.value=n.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})}
async function runBoot(){
  await new Promise(r=>setTimeout(r,300))
  const s=performance.now(),d=1200
  function f(t){bootPct.value=Math.min(100,(t-s)/d*100);if(t-s<d)requestAnimationFrame(f);else setTimeout(()=>{booting.value=false},200)}
  requestAnimationFrame(f)
}
onMounted(()=>{tick();ci=setInterval(tick,1000);window.addEventListener('keydown',onKey);runBoot()})
onBeforeUnmount(()=>{clearInterval(ci);window.removeEventListener('keydown',onKey);window.removeEventListener('mousemove',onDrag);window.removeEventListener('mouseup',endDrag);window.removeEventListener('mousemove',onRes);window.removeEventListener('mouseup',endRes)})
</script>

<style scoped>
*{box-sizing:border-box;}
.w98{position:fixed;inset:0;z-index:100;font-family:'Tahoma','Arial',sans-serif;font-size:11px;}
.w98-boot{position:absolute;inset:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;}
.w98-logo{color:#fff;font-size:28px;font-weight:700;letter-spacing:2px;}
.w98-logo span{color:#ff8c00;}
.w98-bar{width:200px;height:14px;border:2px solid #555;background:#000;}
.w98-fill{height:100%;background:linear-gradient(to right,#000080,#1084d0);transition:width 80ms;}
.w98-bootlbl{color:#888;font-size:11px;}
.desk{position:absolute;inset:0;background:#008080;overflow:hidden;}
.desk-icons{position:absolute;top:8px;left:8px;display:flex;flex-direction:column;gap:4px;}
.dicon{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px;cursor:pointer;width:68px;border:1px solid transparent;}
.dicon:hover,.dicon.sel{background:rgba(0,0,128,.4);border-color:rgba(255,255,255,.5);}
.dicon-pic{width:40px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;border:1px solid rgba(255,255,255,.3);text-shadow:0 1px 2px rgba(0,0,0,.5);}
.dicon-lbl{font-size:10px;color:#fff;text-shadow:1px 1px 2px #000;text-align:center;word-break:break-word;}
.dicon.sel .dicon-lbl{background:#000080;color:#fff;}
/* Windows */
.win{position:absolute;display:flex;flex-direction:column;border:2px solid;border-color:#fff #808080 #808080 #fff;box-shadow:1px 1px 0 #000;min-width:320px;min-height:200px;}
.win-tb{height:22px;padding:2px 4px;display:flex;align-items:center;gap:4px;cursor:default;user-select:none;background:linear-gradient(to right,#808080,#b0b0b0);}
.win.active .win-tb{background:linear-gradient(to right,#000080,#1084d0);}
.win-ico{font-size:10px;font-weight:700;color:#fff;}
.win-title{flex:1;font-size:11px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.win-btns{display:flex;gap:2px;}
.wbtn{width:16px;height:14px;border:2px solid;border-color:#fff #808080 #808080 #fff;background:#c0c0c0;font-size:9px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;color:#000;}
.wbtn:active{border-color:#808080 #fff #fff #808080;}
.wclose{background:#c0c0c0;}
.wclose:hover{background:#ee0000;color:#fff;}
.win-menu{height:18px;background:#c0c0c0;border-bottom:1px solid #808080;display:flex;align-items:center;padding:0 4px;gap:0;}
.win-menu span{padding:0 8px;height:18px;display:flex;align-items:center;cursor:pointer;font-size:11px;}
.win-menu span:hover{background:#000080;color:#fff;}
.win-body{flex:1;display:flex;flex-direction:column;background:#c0c0c0;overflow:hidden;}
.win-stat{height:18px;border-top:1px solid #808080;background:#c0c0c0;padding:0 6px;display:flex;align-items:center;font-size:10px;border-top:2px solid;border-top-color:#808080;}
.win-resize{position:absolute;right:0;bottom:0;width:14px;height:14px;cursor:se-resize;background:linear-gradient(135deg,transparent 40%,#808080 40%,#808080 50%,transparent 50%,transparent 65%,#808080 65%,#808080 75%,transparent 75%);}
/* window inner */
.wtool{padding:4px 6px;background:#c0c0c0;border-bottom:1px solid #808080;display:flex;align-items:center;}
.wsearch{height:20px;border:2px solid;border-color:#808080 #fff #fff #808080;padding:0 4px;font-family:inherit;font-size:11px;background:#fff;width:180px;}
.wscroll{flex:1;overflow-y:auto;padding:8px;background:#fff;}
/* Content */
.slbl{font-weight:700;font-size:11px;margin:8px 0 3px;color:#000080;border-bottom:1px solid #000080;padding-bottom:1px;}
.kv{display:grid;grid-template-columns:90px 1fr;gap:2px 6px;margin-bottom:2px;}
.kv b{color:#333;}
.row{margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #ddd;}
.row-h{display:flex;align-items:center;gap:6px;margin-bottom:2px;}
.badge{font-size:9px;border:1px solid #006600;color:#006600;padding:0 3px;background:#e8ffe8;}
.row-d{color:#444;font-size:11px;}
.row-tags{display:flex;gap:3px;flex-wrap:wrap;margin-top:3px;}
.tag{font-size:10px;border:1px solid #aaa;padding:0 4px;background:#f0f0f0;}
.empty{color:#888;font-style:italic;padding:20px;text-align:center;}
.sk{display:flex;align-items:center;gap:6px;margin-bottom:4px;}
.sk-n{width:80px;flex-shrink:0;font-size:11px;}
.sk-t{flex:1;height:10px;border:2px solid;border-color:#808080 #fff #fff #808080;background:#fff;overflow:hidden;}
.sk-f{height:100%;background:linear-gradient(to right,#000080,#1084d0);}
.sk-p{width:28px;text-align:right;font-size:10px;color:#555;}
.tl{margin-bottom:5px;padding:4px 6px;background:#f0f0f0;border-left:3px solid #000080;font-size:11px;}
.cv-n{font-size:16px;font-weight:700;margin-bottom:2px;}
.cv-r{font-size:11px;color:#555;margin-bottom:6px;}
p{margin-bottom:4px;font-size:11px;line-height:1.5;}
ul{margin:4px 0 6px 16px;font-size:11px;}
li{margin-bottom:2px;}
/* Context menu */
.ctx{position:absolute;z-index:9000;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;box-shadow:2px 2px 0 #000;min-width:180px;}
.ctx-i{padding:4px 16px;cursor:pointer;font-size:11px;}
.ctx-i:hover{background:#000080;color:#fff;}
.ctx-sep{height:1px;background:#808080;margin:2px 4px;}
/* Taskbar */
.taskbar{position:absolute;bottom:0;left:0;right:0;height:28px;background:#c0c0c0;border-top:2px solid;border-top-color:#fff;display:flex;align-items:center;gap:4px;padding:2px 4px;z-index:5000;}
.start{height:22px;padding:0 8px;border:2px solid;border-color:#fff #808080 #808080 #fff;background:#c0c0c0;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;}
.start:hover,.start.active{background:#b0b0b0;}
.start:active{border-color:#808080 #fff #fff #808080;}
.start-logo{font-size:14px;}
.tb-wins{flex:1;display:flex;gap:2px;overflow:hidden;}
.tb-btn{height:22px;padding:0 8px;border:2px solid;border-color:#fff #808080 #808080 #fff;background:#c0c0c0;font-family:inherit;font-size:11px;cursor:pointer;white-space:nowrap;max-width:140px;overflow:hidden;text-overflow:ellipsis;}
.tb-btn.active{border-color:#808080 #fff #fff #808080;background:#b0b0b0;}
.tb-btn:hover{background:#d0d0d0;}
.tb-r{border:2px solid;border-color:#808080 #fff #fff #808080;padding:0 8px;height:22px;display:flex;align-items:center;}
.tb-time{font-size:11px;}
/* Start menu */
.start-menu{position:absolute;bottom:28px;left:0;width:200px;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;box-shadow:2px 2px 0 #000;z-index:6000;display:flex;}
.sm-brand{writing-mode:vertical-rl;transform:rotate(180deg);background:linear-gradient(to top,#000080,#1084d0);color:#fff;font-size:14px;font-weight:700;padding:8px 6px;letter-spacing:2px;display:flex;align-items:center;gap:4px;flex-shrink:0;}
.sm-98{color:#ff8c00;}
.sm-items{flex:1;display:flex;flex-direction:column;padding:2px 0;}
.sm-item{display:flex;align-items:center;gap:8px;padding:5px 8px;cursor:pointer;font-size:11px;}
.sm-item:hover{background:#000080;color:#fff;}
.sm-g{font-size:10px;font-weight:700;width:24px;}
.sm-sep{height:1px;background:#808080;margin:2px 0;}
.sm-exit{color:#880000;}
.sm-exit:hover{background:#880000;color:#fff;}
.start-slide-enter-active,.start-slide-leave-active{transition:opacity .1s,transform .1s;}
.start-slide-enter-from,.start-slide-leave-to{opacity:0;transform:translateY(8px);}
/* Scrollbar */
.wscroll::-webkit-scrollbar{width:14px;}
.wscroll::-webkit-scrollbar-track{background:#c0c0c0;border:2px solid;border-color:#808080 #fff #fff #808080;}
.wscroll::-webkit-scrollbar-thumb{background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;}
.wscroll::-webkit-scrollbar-button{background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;height:14px;}
</style>
