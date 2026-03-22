// ================= STATE =================
let selectedDate = new Date().toISOString().split("T")[0]
let anaTab = "pos"
let currentChart = null

// ================= DRAW =================
function drawAnalytics(){

let container = document.getElementById("page_analytics")

container.innerHTML = `

<h2>Analytics</h2>

<div style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;align-items:center;">

<input type="date" id="ana_date" value="${selectedDate}" onchange="changeAnaDate()">

<button onclick="switchAnaTab('pos')" 
style="padding:8px 12px;border:none;border-radius:8px;
background:${anaTab==='pos'?'#333':'#eee'};
color:${anaTab==='pos'?'#fff':'#000'}">POS</button>

<button onclick="switchAnaTab('expense')" 
style="padding:8px 12px;border:none;border-radius:8px;
background:${anaTab==='expense'?'#333':'#eee'};
color:${anaTab==='expense'?'#fff':'#000'}">Expense</button>

<button onclick="switchAnaTab('stock')" 
style="padding:8px 12px;border:none;border-radius:8px;
background:${anaTab==='stock'?'#333':'#eee'};
color:${anaTab==='stock'?'#fff':'#000'}">Stock</button>

</div>

<!-- 🔥 FIX ขนาดกราฟ -->
<div style="width:100%;max-width:500px;height:300px;margin:auto;">
<canvas id="mainChart"></canvas>
</div>

`

setTimeout(()=>{
renderChart()
},200)

}

// ================= SWITCH =================
function switchAnaTab(tab){
anaTab = tab
drawAnalytics()
}

// ================= DATE =================
function changeAnaDate(){
selectedDate = document.getElementById("ana_date").value
drawAnalytics()
}

// ================= MAIN =================
function renderChart(){

// 🔥 กันกราฟซ้อน
if(currentChart){
currentChart.destroy()
}

if(anaTab==="pos") drawPOSChart()
if(anaTab==="expense") drawExpenseChart()
if(anaTab==="stock") drawStockChart()

}

// ================= POS =================
function drawPOSChart(){

let data = getData("sales") || []

let filtered = data.filter(s=> s.date?.startsWith(selectedDate))

let grab=0, lineman=0, shopee=0, cashier=0

filtered.forEach(s=>{
grab+=s.grab||0
lineman+=s.lineman||0
shopee+=s.shopee||0
cashier+=s.cashier||0
})

let ctx = document.getElementById("mainChart")

currentChart = new Chart(ctx,{
type:"bar",
data:{
labels:["GRAB","LINE MAN","SHOPEE","CASHEIR"],
datasets:[{
label:"รายได้",
data:[grab,lineman,shopee,cashier]
}]
},
options:{
responsive:true,
maintainAspectRatio:false
}
})

}

// ================= EXPENSE =================
function drawExpenseChart(){

let data = getData("expense") || []

let filtered = data.filter(e => e.date?.startsWith(selectedDate))

let map = {}

filtered.forEach(e => {

let source = e.data || e  // 🔥 รองรับทั้งโครงสร้างใหม่ + เก่า

for(let key in source){

if(key !== "date" && key !== "edit"){

let val = Number(source[key]) || 0

if(val > 0){
map[key] = (map[key] || 0) + val
}

}

}

})

// 🔥 ไม่มีข้อมูล
if(Object.keys(map).length === 0){

let ctx = document.getElementById("mainChart")

currentChart = new Chart(ctx,{
type:"doughnut",
data:{
labels:["ไม่มีข้อมูล"],
datasets:[{
data:[1]
}]
},
options:{
responsive:true,
maintainAspectRatio:false
}
})

return
}

// 🔥 DONUT CHART
let ctx = document.getElementById("mainChart")

currentChart = new Chart(ctx,{
type:"doughnut",
data:{
labels:Object.keys(map),
datasets:[{
data:Object.values(map)
}]
},
options:{
responsive:true,
maintainAspectRatio:false
}
})

}

// ================= STOCK =================
function drawStockChart(){

let data = getData("stock") || []

let map = {}

data.forEach(s=>{
let cat = s.category || "อื่นๆ"
map[cat] = (map[cat]||0) + (s.qty||0)
})

// 🔥 ไม่มีข้อมูล
if(Object.keys(map).length === 0){

let ctx = document.getElementById("mainChart")

currentChart = new Chart(ctx,{
type:"bar",
data:{
labels:["ไม่มีข้อมูล"],
datasets:[{
label:"Stock",
data:[0]
}]
},
options:{
responsive:true,
maintainAspectRatio:false
}
})

return
}

let ctx = document.getElementById("mainChart")

currentChart = new Chart(ctx,{
type:"doughnut",
data:{
labels:Object.keys(map),
datasets:[{
data:Object.values(map)
}]
},
options:{
responsive:true,
maintainAspectRatio:false
}
})

}