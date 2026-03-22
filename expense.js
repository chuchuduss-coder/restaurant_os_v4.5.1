// ================= STATE =================
let expenseTab = "daily"
let expenseDate = new Date().toISOString().split("T")[0]

// ================= DATE SAFE =================
function safeDate(d){
if(!d) return ""

if(typeof d === "string"){

// ISO → YYYY-MM-DD
if(d.includes("T")){
return d.split("T")[0]
}

// กัน format ยาว
return d.substring(0,10)

}

return new Date(d).toISOString().split("T")[0]
}

// ================= CATEGORY =================
function getExpenseCategories(){

let saved = localStorage.getItem("expense_cat")

if(!saved){
let def = ["วัตถุดิบ","น้ำแข็ง","แพ็กเกจ","ค่าน้ำมัน","อื่นๆ"]
localStorage.setItem("expense_cat", JSON.stringify(def))
return def
}

return JSON.parse(saved)
}

// ================= DRAW =================
function drawExpensePage(){

let container = document.getElementById("page_expense")

container.innerHTML = `
<h2>Expense</h2>

<div style="display:flex;gap:10px;margin-bottom:10px;">
<button onclick="switchExpenseTab('daily')">Daily</button>
<button onclick="switchExpenseTab('monthly')">Monthly</button>
<button onclick="switchExpenseTab('category')">Category</button>
</div>

<div id="expenseContent"></div>
`

migrateExpense()
renderExpense()

}

// ================= SWITCH =================
function switchExpenseTab(tab){
expenseTab = tab
renderExpense()
}

// ================= RENDER =================
function renderExpense(){

let el = document.getElementById("expenseContent")
if(!el) return

if(expenseTab==="daily") renderDaily(el)
if(expenseTab==="monthly") renderMonthly(el)
if(expenseTab==="category") renderCategory(el)

}

// ================= DAILY =================
function renderDaily(el){

let cats = getExpenseCategories()

el.innerHTML = `

<input type="date" id="exp_date" value="${expenseDate}" 
onchange="expenseDate=this.value">

<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">

<input id="exp_name" placeholder="รายการ">

<select id="exp_cat">
${cats.map(c=>`<option value="${c}">${c}</option>`).join("")}
</select>

<input id="exp_qty" type="number" placeholder="จำนวน">
<input id="exp_price" type="number" placeholder="ราคาต่อหน่วย">
<input id="exp_total" placeholder="รวม" readonly>

<button onclick="saveExpense()">💾</button>

</div>

<hr>

<div id="expenseTimeline"></div>
`

renderExpenseTimeline()

}

// ================= SAVE =================
function saveExpense(){

let name = document.getElementById("exp_name")?.value || ""
let cat = document.getElementById("exp_cat")?.value || ""
let qty = Number(document.getElementById("exp_qty")?.value)||0
let price = Number(document.getElementById("exp_price")?.value)||0
let total = qty * price

let data = getData("expense_log") || []

let newItem = {

id: String(Date.now() + Math.random()), // ✅ FIX สำคัญ
date: safeDate(expenseDate), // ✅ FIX สำคัญ
name,
category: cat,
qty,
price,
total,
updatedAt: Date.now(),
edit:false

}

data.push(newItem)

// save + queue
saveAndQueue("expense_log","Expense",data,newItem)

// reset
document.getElementById("exp_name").value=""
document.getElementById("exp_qty").value=""
document.getElementById("exp_price").value=""
document.getElementById("exp_total").value=""

renderExpenseTimeline()

}

// ================= TIMELINE =================
function renderExpenseTimeline(){

let data = getData("expense_log") || []

// 🔥 normalize ทุกตัว + FIX id/date
data = data.map(i=>{
i.id = String(i.id)
i.date = safeDate(i.date)
return i
})

// 🔥 dedupe ด้วย id เท่านั้น (สำคัญมาก)
let map = {}
data.forEach(i=> map[i.id]=i)
data = Object.values(map)

// 🔥 save กลับ (กันเพี้ยนซ้ำ)
saveData("expense_log", data)

// sort
data.sort((a,b)=> b.date.localeCompare(a.date))

let grouped = {}

data.forEach(i=>{
if(!grouped[i.date]) grouped[i.date]=[]
grouped[i.date].push(i)
})

let html=""

for(let date in grouped){

let list = grouped[date]

let sum = 0
list.forEach(i=> sum += Number(i.total)||0)

html += `
<div style="border:1px solid #ccc;padding:10px;margin:10px 0;border-radius:10px;">
<h3>${date} | Total: ${sum}</h3>
`

list.forEach(i=>{

if(!i.edit){

html += `
<div style="display:flex;justify-content:space-between;flex-wrap:wrap;">

<div>
${i.name} | ${i.category} | ${i.qty} x ${i.price} = ${i.total}
</div>

<div>
<button onclick="editExpense('${i.id}')">✏️</button>
</div>

</div>
`

}else{

html += `
<div style="display:flex;gap:5px;flex-wrap:wrap;">

<input id="n${i.id}" value="${i.name}">
<input id="c${i.id}" value="${i.category}">
<input id="q${i.id}" type="number" value="${i.qty}">
<input id="p${i.id}" type="number" value="${i.price}">

<button onclick="saveEditExpense('${i.id}')">💾</button>
<button onclick="deleteExpense('${i.id}')">🗑</button>

</div>
`

}

})

html += `</div>`
}

document.getElementById("expenseTimeline").innerHTML = html

}

// ================= EDIT =================
function editExpense(id){

let data = getData("expense_log") || []

data = data.map(i=>{
if(i.id===id) i.edit=true
return i
})

saveData("expense_log",data)
renderExpenseTimeline()

}

// ================= SAVE EDIT =================
function saveEditExpense(id){

let data = getData("expense_log") || []

data = data.map(i=>{

if(i.id===id){

i.name = document.getElementById("n"+id)?.value || ""
i.category = document.getElementById("c"+id)?.value || ""
i.qty = Number(document.getElementById("q"+id)?.value)||0
i.price = Number(document.getElementById("p"+id)?.value)||0
i.total = i.qty * i.price

i.date = safeDate(i.date) // ✅ FIX

i.updatedAt = Date.now()
i.edit=false

addToQueue("Expense", i)

}

return i

})

saveData("expense_log",data)
renderExpenseTimeline()

}

// ================= DELETE =================
function deleteExpense(id){

let data = getData("expense_log") || []

let deleted = data.find(i=>i.id===id)

data = data.filter(i=>i.id!==id)

saveData("expense_log",data)

if(deleted){
deleted.deleted = true
deleted.updatedAt = Date.now()
addToQueue("Expense", deleted)
}

renderExpenseTimeline()

}

// ================= MIGRATE =================
function migrateExpense(){

let data = getData("expense_log") || []
let changed = false

data = data.map(i=>{

if(!i.id){
i.id = String(Date.now() + Math.random())
changed = true
}

// 🔥 FIX DATE 100%
let fixed = safeDate(i.date)
if(i.date !== fixed){
i.date = fixed
changed = true
}

return i

})

if(changed){
saveData("expense_log", data)
}

}

// ================= EXPORT (สำคัญมาก) =================
window.saveExpense = saveExpense
window.editExpense = editExpense
window.saveEditExpense = saveEditExpense
window.deleteExpense = deleteExpense