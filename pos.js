// ================= DATE HELPER =================
function formatDate(d){

if(!d) return ""

if(typeof d === "string"){
if(d.includes("T")) return d.split("T")[0]
return d.substring(0,10)
}

return new Date(d).toISOString().split("T")[0]

}

// ================= MIGRATION =================
function migrateSales(){

let data = getData("sales") || []
let changed = false

data = data.map(s=>{

// 🔥 FIX ID → string
if(!s.id){
s.id = String(Date.now() + Math.random())
changed = true
}else{
s.id = String(s.id)
}

// 🔥 FIX DATE
let newDate = formatDate(s.date)
if(newDate !== s.date){
s.date = newDate
changed = true
}

// 🔥 FIX TOTAL
if(s.total === undefined){
s.total =
(Number(s.grab)||0) +
(Number(s.lineman)||0) +
(Number(s.shopee)||0) +
(Number(s.cashier)||0)
changed = true
}

// 🔥 FIX updatedAt
if(!s.updatedAt){
s.updatedAt = Date.now()
changed = true
}

return s

})

if(changed){
saveData("sales", data)
}

}

// ================= DRAW =================
function drawPOSPage(){

migrateSales()

let container=document.getElementById("page_pos")

container.innerHTML=`

<h2>POS</h2>

<div style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">

<input id="pos_date" type="date">
<input id="grab" type="number" placeholder="GRAB">
<input id="lineman" type="number" placeholder="LINE MAN">
<input id="shopee" type="number" placeholder="SHOPEE FOOD">
<input id="cashier" type="number" placeholder="CASHIER">

<button onclick="addSale()">บันทึก</button>

</div>

<div id="posTimeline"></div>

`

let today = new Date().toISOString().split("T")[0]
document.getElementById("pos_date").value = today

renderPOS()

}

// ================= ADD =================
function addSale(){

let data=getData("sales")||[]

let selectedDate = document.getElementById("pos_date").value

if(!selectedDate){
alert("กรุณาเลือกวันที่")
return
}

selectedDate = formatDate(selectedDate)

let grabVal = Number(document.getElementById("grab").value)||0
let linemanVal = Number(document.getElementById("lineman").value)||0
let shopeeVal = Number(document.getElementById("shopee").value)||0
let cashierVal = Number(document.getElementById("cashier").value)||0

let total = grabVal + linemanVal + shopeeVal + cashierVal

let newItem = {

id: String(Date.now() + Math.random()), // 🔥 FIX
date: selectedDate,
grab: grabVal,
lineman: linemanVal,
shopee: shopeeVal,
cashier: cashierVal,
total: total,
updatedAt: Date.now(),
edit:false

}

data.push(newItem)

// 🔥 save + queue
saveAndQueue("sales","POS",data,newItem)

// reset
document.getElementById("grab").value=""
document.getElementById("lineman").value=""
document.getElementById("shopee").value=""
document.getElementById("cashier").value=""

renderPOS()

}

// ================= RENDER =================
function renderPOS(){

let data=getData("sales")||[]

// 🔥 FIX id + date
data = data.map(s=>{
s.id = String(s.id)
s.date = formatDate(s.date)
return s
})

// 🔥 SORT
data.sort((a,b)=> b.date.localeCompare(a.date))

// 🔥 GROUP
let grouped={}

data.forEach(s=>{
let d = s.date
if(!grouped[d]) grouped[d]=[]
grouped[d].push(s)
})

let html=""

for(let date in grouped){

let list=grouped[date]

let total=0
list.forEach(s=> total += Number(s.total)||0)

html+=`
<div style="margin-bottom:15px;padding:12px;border:1px solid #ccc;border-radius:10px;">
<h3>${date} | Total: ${total}</h3>
`

list.forEach(s=>{

if(!s.edit){

html+=`
<div style="display:flex;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;">

<div>
GRAB: ${s.grab} | LINE: ${s.lineman} | SHOPEE: ${s.shopee} | CASH: ${s.cashier}
<br><b>Total: ${s.total}</b>
</div>

<div>
<button onclick="toggleEdit('${s.id}',true)">✏️</button>
</div>

</div>
`

}else{

html+=`
<div style="display:flex;gap:5px;flex-wrap:wrap;">

<input type="date" id="d${s.id}" value="${s.date}">
<input id="g${s.id}" type="number" value="${s.grab}">
<input id="l${s.id}" type="number" value="${s.lineman}">
<input id="s${s.id}" type="number" value="${s.shopee}">
<input id="c${s.id}" type="number" value="${s.cashier}">

<button onclick="saveEdit('${s.id}')">💾</button>
<button onclick="deleteSale('${s.id}')">🗑</button>

</div>
`

}

})

html+=`</div>`
}

document.getElementById("posTimeline").innerHTML=html

}

// ================= EDIT =================
function toggleEdit(id,state){

id = String(id)

let data=getData("sales")||[]

data = data.map(s=>{
if(String(s.id) === id) s.edit = state
return s
})

saveData("sales",data)
renderPOS()

}

// ================= SAVE EDIT =================
function saveEdit(id){

id = String(id)

let data=getData("sales")||[]

data = data.map(s=>{

if(String(s.id) === id){

let g = Number(document.getElementById("g"+id)?.value)||0
let l = Number(document.getElementById("l"+id)?.value)||0
let sh = Number(document.getElementById("s"+id)?.value)||0
let c = Number(document.getElementById("c"+id)?.value)||0

s.date = formatDate(document.getElementById("d"+id)?.value)

s.grab = g
s.lineman = l
s.shopee = sh
s.cashier = c
s.total = g+l+sh+c

s.updatedAt = Date.now()
s.edit = false

// 🔥 queue
addToQueue("POS", s)

}

return s

})

saveData("sales",data)
renderPOS()

}

// ================= DELETE =================
function deleteSale(id){

id = String(id)

let data=getData("sales")||[]

let deleted = data.find(s=>String(s.id)===id)

data = data.filter(s=>String(s.id)!==id)

saveData("sales",data)

// 🔥 sync delete
if(deleted){
deleted.deleted = true
deleted.updatedAt = Date.now()
addToQueue("POS", deleted)
}

renderPOS()

}

// ================= EXPORT (สำคัญมาก) =================
window.drawPOSPage = drawPOSPage
window.addSale = addSale
window.toggleEdit = toggleEdit
window.saveEdit = saveEdit
window.deleteSale = deleteSale