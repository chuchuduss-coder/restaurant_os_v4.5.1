// ================= STATE =================
let kpiDate = new Date().toISOString().split("T")[0]

// ================= DRAW =================
function drawKPI(){

let container = document.getElementById("page_kpi")
if(!container) return

container.innerHTML = `

<h2>KPI</h2>

<div style="margin-bottom:15px;">
<input type="date" id="kpi_date" value="${kpiDate}" onchange="changeKPIDate()">
</div>

<div id="kpiSummary"></div>

<hr>

<h3>Timeline KPI</h3>
<div id="kpiTimeline"></div>

`

renderKPISummary()
renderKPITimeline()

}

// ================= CHANGE DATE =================
function changeKPIDate(){
kpiDate = document.getElementById("kpi_date").value
renderKPISummary()
}

// ================= SUMMARY =================
function renderKPISummary(){

let sales = getData("sales") || []
let expense = getData("expense_log") || [] // ✅ แก้ตรงนี้
let stock = getData("stock") || []

let posOK = sales.some(s => s.date?.startsWith(kpiDate))

let expOK = expense.some(e => e.date === kpiDate) // ✅ แม่นขึ้น

let stockBad = stock.filter(i => (i.qty ?? 0) < (i.min ?? 0))
let stockOK = stockBad.length === 0

let el = document.getElementById("kpiSummary")

el.innerHTML = `
<div style="display:flex;gap:10px;flex-wrap:wrap;">
${buildCard("POS", posOK)}
${buildCard("Expense", expOK)}
${buildCard("Stock", stockOK)}
</div>
`
}

// ================= CARD =================
function buildCard(title, ok){

return `
<div style="
flex:1;
min-width:120px;
padding:15px;
border-radius:12px;
background:${ok ? "#e8f5e9" : "#ffebee"};
text-align:center;
">
<h3>${title}</h3>
<p style="font-size:20px;">
${ok ? "✅ OK" : "❌ Missing"}
</p>
</div>
`

}

// ================= TIMELINE =================
function renderKPITimeline(){

let sales = getData("sales") || []
let expense = getData("expense_log") || [] // ✅ แก้ตรงนี้
let stock = getData("stock") || []

let dates = new Set()

sales.forEach(s=>{
if(s.date) dates.add(s.date.split("T")[0])
})

expense.forEach(e=>{
if(e.date) dates.add(e.date)
})

let sorted = Array.from(dates).sort((a,b)=>a.localeCompare(b))

let html = ""

sorted.forEach(d=>{

let posOK = sales.some(s => s.date?.startsWith(d))
let expOK = expense.some(e => e.date === d) // ✅ แก้ตรงนี้

let stockBad = stock.filter(i => (i.qty ?? 0) < (i.min ?? 0))
let stockOK = stockBad.length === 0

html += `
<div style="border:1px solid #ccc;padding:10px;margin:10px 0;border-radius:10px;">
<h4>${d}</h4>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
${mini("POS", posOK)}
${mini("EXP", expOK)}
${mini("STOCK", stockOK)}
</div>
</div>
`
})

document.getElementById("kpiTimeline").innerHTML = html

}

// ================= MINI =================
function mini(title, ok){

return `
<div style="
padding:5px 10px;
border-radius:8px;
background:${ok ? "#c8e6c9" : "#ffcdd2"};
font-size:12px;
">
${title} ${ok ? "✅" : "❌"}
</div>
`

}