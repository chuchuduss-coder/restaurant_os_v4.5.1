// ================= STATE =================
let dashTab = "daily"
let dashDate = new Date().toISOString().split("T")[0]
let dashStart = dashDate
let dashEnd = dashDate

// ================= DRAW =================
function drawDashboard(){

let container = document.getElementById("page_dashboard")
if(!container) return

container.innerHTML = `

<h2>Dashboard</h2>

<div style="display:flex;gap:10px;margin-bottom:10px;">
${["daily","weekly","monthly","custom"].map(t=>`
<button onclick="switchDashTab('${t}')"
style="
padding:8px 12px;
border:none;
border-radius:8px;
background:${dashTab===t?'#333':'#eee'};
color:${dashTab===t?'#fff':'#000'};
">
${t.toUpperCase()}
</button>
`).join("")}
</div>

<div id="dashFilter"></div>

<div id="dashSummary"></div>

<div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:20px;">
<div style="flex:1;min-width:300px;height:300px;">
<canvas id="barChart"></canvas>
</div>
<div style="flex:1;min-width:300px;height:300px;">
<canvas id="pieChart"></canvas>
</div>
</div>

`

renderDashFilter()
renderDashboardData()

}

// ================= TAB =================
function switchDashTab(tab){
dashTab = tab
drawDashboard()
}

// ================= FILTER =================
function renderDashFilter(){

let el = document.getElementById("dashFilter")
if(!el) return

if(dashTab==="daily"){
el.innerHTML = `
<input type="date" value="${dashDate}" onchange="dashDate=this.value;renderDashboardData()">
`
}

// ✅ monthly เลือกเดือนจริง
if(dashTab==="monthly"){
el.innerHTML = `
<input type="month" onchange="setMonth(this.value)">
`
}

if(dashTab==="custom"){
el.innerHTML = `
<input type="date" value="${dashStart}" onchange="dashStart=this.value">
<input type="date" value="${dashEnd}" onchange="dashEnd=this.value">
<button onclick="renderDashboardData()">Apply</button>
`
}

if(dashTab==="weekly"){
el.innerHTML = `<p>ย้อนหลัง 7 วัน (รวมวันนี้)</p>`
}

}

// ================= MONTH PICKER =================
function setMonth(val){

if(!val) return

let [y,m] = val.split("-")

let startD = new Date(y, m-1, 1)
let endD = new Date(y, m, 0)

dashStart = startD.toISOString().split("T")[0]
dashEnd = endD.toISOString().split("T")[0]

dashTab = "custom"

drawDashboard()

}

// ================= RANGE =================
function getRange(){

let start, end
let today = new Date()

// DAILY
if(dashTab==="daily"){
start = dashDate
end = dashDate
}

// WEEKLY (ย้อนหลัง 7 วัน)
if(dashTab==="weekly"){
let endD = new Date()
let startD = new Date()
startD.setDate(endD.getDate() - 6)

start = startD.toISOString().split("T")[0]
end = endD.toISOString().split("T")[0]
}

// MONTHLY (ย้อนหลัง 30 วัน)
if(dashTab==="monthly"){
let endD = new Date()
let startD = new Date()
startD.setDate(endD.getDate() - 29)

start = startD.toISOString().split("T")[0]
end = endD.toISOString().split("T")[0]
}

// CUSTOM
if(dashTab==="custom"){
start = dashStart
end = dashEnd
}

return {start,end}

}

// ================= MAIN =================
function renderDashboardData(){

let sales = getData("sales") || []
let expense = getData("expense_log") || []

let {start,end} = getRange()

// filter
let salesFiltered = sales.filter(s => s.date >= start && s.date <= end)
let expFiltered = expense.filter(e => e.date >= start && e.date <= end)

// ===== GROUP =====
let map = {}

function init(d){
if(!map[d]) map[d] = {income:0, expense:0}
}

// ✅ FIX รายรับ (รองรับหลาย field)
salesFiltered.forEach(s=>{
let d = s.date
init(d)

let incomeVal =
Number(s.total) ||
Number(s.amount) ||
Number(s.price) ||
Number(s.sum) || 0

map[d].income += incomeVal
})

// expense
expFiltered.forEach(e=>{
let d = e.date
init(d)
map[d].expense += Number(e.total || 0)
})

// ===== SORT =====
let dates = Object.keys(map).sort()

let incomeArr=[], expenseArr=[], profitArr=[]

dates.forEach(d=>{
let inc = map[d].income
let exp = map[d].expense

incomeArr.push(inc)
expenseArr.push(exp)
profitArr.push(inc-exp)
})

// ===== SUMMARY =====
let totalIncome = incomeArr.reduce((a,b)=>a+b,0)
let totalExpense = expenseArr.reduce((a,b)=>a+b,0)
let totalProfit = totalIncome - totalExpense

let sumEl = document.getElementById("dashSummary")

if(sumEl){
sumEl.innerHTML = `
<div style="display:flex;gap:10px;flex-wrap:wrap;">
${card("รายรับ", totalIncome, "#e3f2fd")}
${card("รายจ่าย", totalExpense, "#ffebee")}
${card("กำไร", totalProfit, "#e8f5e9")}
</div>
`
}

// ===== DRAW =====
drawBarChart(dates, incomeArr, expenseArr, profitArr)
drawPieChart(totalIncome, totalExpense)

}

// ================= CARD =================
function card(title,val,color){
return `
<div style="flex:1;min-width:120px;padding:10px;border-radius:10px;background:${color}">
<h4>${title}</h4>
<p>${val}</p>
</div>
`
}

// ================= BAR =================
function drawBarChart(labels, income, expense, profit){

let canvas = document.getElementById("barChart")
if(!canvas) return

let ctx = canvas.getContext("2d")

if(window.barChart && typeof window.barChart.destroy === "function"){
window.barChart.destroy()
}

window.barChart = new Chart(ctx, {
type: "bar",
data: {
labels: labels,
datasets: [
{ label:"รายรับ", data: income },
{ label:"รายจ่าย", data: expense },
{ label:"กำไร", data: profit }
]
},
options:{
responsive:true,
maintainAspectRatio:false
}
})

}

// ================= PIE =================
function drawPieChart(income, expense){

let canvas = document.getElementById("pieChart")
if(!canvas) return

let ctx = canvas.getContext("2d")

if(window.pieChart && typeof window.pieChart.destroy === "function"){
window.pieChart.destroy()
}

window.pieChart = new Chart(ctx, {
type: "doughnut",
data: {
labels:["รายรับ","รายจ่าย"],
datasets:[{
data:[income, expense]
}]
},
options:{
responsive:true,
maintainAspectRatio:false
}
})

}