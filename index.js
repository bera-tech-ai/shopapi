const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
app.use(express.json())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>ShopAPI</title>
<style>body{font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1a1a2e;color:#eee}h1{color:#e94560}#display{font-size:4rem;font-weight:bold;color:#0f3460;background:#e94560;padding:20px 40px;border-radius:12px;margin:20px}button{padding:12px 30px;margin:8px;border:none;border-radius:8px;font-size:1rem;cursor:pointer;background:#0f3460;color:#fff}button:hover{background:#e94560}</style></head>
<body><h1>ShopAPI</h1><div id="display">00:00:00</div><div><button onclick="start()">Start</button><button onclick="pause()">Pause</button><button onclick="reset()">Reset</button></div>
<script>let t=0,running=false,interval;function fmt(n){return String(n).padStart(2,'0')}function tick(){t++;const h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60;document.getElementById('display').textContent=fmt(h)+':'+fmt(m)+':'+fmt(s)}function start(){if(!running){running=true;interval=setInterval(tick,1000)}}function pause(){running=false;clearInterval(interval)}function reset(){running=false;clearInterval(interval);t=0;document.getElementById('display').textContent='00:00:00'}</script></body></html>`)
})
app.listen(PORT, () => console.log(`ShopAPI running on port ${PORT}`))
