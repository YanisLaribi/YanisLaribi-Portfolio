<template>
  <div class="ht">
    <div class="ht-inner">
      <div class="ht-line" v-for="(l, i) in visible" :key="i" :class="l.cls">
        <span class="ht-prompt" v-if="l.prompt">{{ l.prompt }}</span>
        <span class="ht-text">{{ l.text }}</span>
        <span v-if="i === visible.length - 1 && !done" class="ht-cursor">_</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const emit = defineEmits(['done'])

const visible = ref([])
const done = ref(false)

const script = [
  { text: 'YANIS LAB OS v2.4.1 — SECURE TERMINAL', cls: 'dim',    delay: 0    },
  { text: '',                                        cls: '',       delay: 120  },
  { text: 'Initializing secure channel...',          cls: 'dim',    delay: 200  },
  { text: 'Generating RSA-4096 keypair...',           cls: 'dim',    delay: 280  },
  { text: 'KEYPAIR GENERATED        [OK]',            cls: 'ok',     delay: 320  },
  { text: '',                                        cls: '',       delay: 80   },
  { text: '> ESTABLISHING CONNECTION to YANIS-LAB-NODE-01...', cls:'cmd', prompt:'$', delay:300 },
  { text: 'Routing through secure nodes...',         cls: 'dim',    delay: 400  },
  { text: '  node-1  [NY]    ........  12ms',        cls: 'trace',  delay: 200  },
  { text: '  node-2  [FR]    ........  38ms',        cls: 'trace',  delay: 180  },
  { text: '  node-3  [DEST]  ........  5ms',         cls: 'trace',  delay: 160  },
  { text: '',                                        cls: '',       delay: 80   },
  { text: 'CONNECTION ESTABLISHED   [OK]',           cls: 'ok',     delay: 200  },
  { text: '',                                        cls: '',       delay: 100  },
  { text: '> AUTH --user yanis --token ****',        cls: 'cmd',    prompt:'$', delay:300 },
  { text: 'Verifying identity...',                   cls: 'dim',    delay: 500  },
  { text: 'IDENTITY VERIFIED        [OK]',           cls: 'ok',     delay: 200  },
  { text: '',                                        cls: '',       delay: 80   },
  { text: '> DOWNLOAD portfolio.db --decrypt',       cls: 'cmd',    prompt:'$', delay:250 },
  { text: 'Decrypting payload...',                   cls: 'dim',    delay: 300  },
  { text: 'Downloading  [########          ]  42%',  cls: 'prog',   delay: 250  },
  { text: 'Downloading  [################  ]  88%',  cls: 'prog',   delay: 220  },
  { text: 'Downloading  [##################]  100%', cls: 'prog',   delay: 200  },
  { text: 'DOWNLOAD COMPLETE        [OK]',           cls: 'ok',     delay: 200  },
  { text: '',                                        cls: '',       delay: 80   },
  { text: 'Launching Yanis Lab OS...',               cls: 'bright', delay: 400  },
  { text: '',                                        cls: '',       delay: 600  },
]

onMounted(async () => {
  let cumulative = 0
  for (const line of script) {
    cumulative += line.delay
    await new Promise(r => setTimeout(r, line.delay))
    visible.value.push(line)
  }
  done.value = true
  await new Promise(r => setTimeout(r, 400))
  emit('done')
})
</script>

<style scoped>
.ht {
  position: fixed; inset: 0; z-index: 200;
  background: #000;
  display: flex; align-items: flex-start; justify-content: flex-start;
  padding: 2rem 2.5rem;
  font-family: 'Courier New', 'Consolas', monospace;
  overflow: hidden;
}
.ht::before {
  content: '';
  position: absolute; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,200,0,0.015) 2px, rgba(0,200,0,0.015) 4px);
  pointer-events: none;
}
.ht-inner { max-width: 780px; width: 100%; }
.ht-line { font-size: .75rem; line-height: 1.9; color: #00cc00; }
.ht-line.dim    { color: rgba(0, 200, 0, 0.45); }
.ht-line.ok     { color: #00ff88; font-weight: 700; text-shadow: 0 0 8px rgba(0,255,136,0.4); }
.ht-line.cmd    { color: #88ff88; font-weight: 600; }
.ht-line.trace  { color: rgba(0,200,0,0.5); font-size:.7rem; }
.ht-line.prog   { color: #00dd44; font-family:'Courier New',monospace; }
.ht-line.bright { color: #00ff00; font-size:.85rem; font-weight:700; text-shadow:0 0 12px rgba(0,255,0,0.6); }
.ht-prompt { color: #00ff88; margin-right: .4rem; font-weight: 700; }
.ht-cursor { display: inline-block; animation: blink .6s step-end infinite; margin-left:2px; }
@keyframes blink { 50% { opacity: 0 } }
</style>
