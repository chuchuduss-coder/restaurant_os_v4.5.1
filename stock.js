// ================= STATE =================
let stockTab = "add"

// ================= CATEGORY =================
function getStockCategories(){

let saved = localStorage.getItem("stock_cat")

if(!saved){
let def = ["วัตถุดิบ","เครื่องดื่ม","อุปกรณ์"]
localStorage.setItem("stock_cat", JSON.stringify(def))
return def
}

return JSON.parse(saved)

}

function saveStockCategories(data){
localStorage.setItem("stock_cat", JSON.stringify(data))
}

// ================= DRAW =================
function drawStockPage(){

let container = document.getElementById("page_stock")

container.innerHTML = `

<h2>Stock</h2>

<div style="display:flex;gap:10px;margin-bottom:10px;">
<button onclick="switchStockTab('add')">เพิ่มรายการ</button>
<button onclick="switchStockTab('summary')">สรุป</button>
<button onclick="switchStockTab('category')">หมวดหมู่</button>
</div>

<div id="stockContent"></div>

`

renderStock()

}

// ================= SWITCH =================
function switchStockTab(tab){
stockTab = tab
renderStock()
}

// ================= RENDER =================
function renderStock(){

let el = document.getElementById("stockContent")
if(!el) return

if(stockTab==="add") renderAdd(el)
if(stockTab==="summary") renderSummary(el)
if(stockTab==="category") renderCategory(el)

}

// ================= ADD =================
function renderAdd(el){

let cats = getStockCategories()

el.innerHTML = `

<div style="display:flex;gap:10px;flex-wrap:wrap;">

<input id="s_name" placeholder="รายการ">

<select id="s_cat">
${cats.map(c=>`<option value="${c}">${c}</option>`).join("")}
</select>

<input id="s_qty" type="number" placeholder="จำนวน">
<input id="s_min" type="number" placeholder="ขั้นต่ำ">

<button onclick="saveStock()">💾</button>

</div>

<hr>

<div id="stockTimeline"></div>

`

renderStockTimeline()

}

// ================= CATEGORY =================
function renderCategory(el){

let cats = getStockCategories()

el.innerHTML = `

<h3>หมวดหมู่</h3>

${cats.map((c,i)=>`
<div>
${c}
<button onclick="deleteStockCategory(${i})">🗑</button>
</div>
`).join("")}

<hr>

<input id="new_stock_cat" placeholder="เพิ่มหมวดหมู่">
<button onclick="addStockCategory()">💾</button>

`

}

function addStockCategory(){

let input = document.getElementById("new_stock_cat")
if(!input) return

let val = input.value.trim()
if(!val) return

let cats = getStockCategories()

if(cats.includes(val)){
alert("มีแล้ว")
return
}

cats.push(val)
saveStockCategories(cats)

input.value=""

renderCategory(document.getElementById("stockContent"))

}

function deleteStockCategory(i){

let cats = getStockCategories()
cats.splice(i,1)

saveStockCategories(cats)

renderCategory(document.getElementById("stockContent"))

}

// ================= SAVE =================
function saveStock(){

let nameEl = document.getElementById("s_name")
let catEl = document.getElementById("s_cat")
let qtyEl = document.getElementById("s_qty")
let minEl = document.getElementById("s_min")

if(!nameEl || !catEl || !qtyEl || !minEl){
alert("ข้อมูลไม่ครบ")
return
}

let name = nameEl.value || "-"
let cat = catEl.value || "-"
let qty = Number(qtyEl.value)||0
let min = Number(minEl.value)||0

let data = getData("stock") || []

let newItem = {
id: Date.now() + Math.random(),
name,
category: cat,
qty,
min,
updatedAt: Date.now()
}

data.push(newItem)

// 🔥 save + queue
saveAndQueue("stock","Stock",data,newItem)

// reset
nameEl.value=""
qtyEl.value=""
minEl.value=""

renderStockTimeline()

}

// ================= TIMELINE =================
function renderStockTimeline(){

let data = getData("stock") || []

let html=""

data.forEach(i=>{

let color = ""

if(i.qty < i.min) color = "#ffcdd2" // 🔴
else if(i.qty === i.min) color = "#fff9c4" // 🟡

html += `
<div style="padding:10px;margin:5px 0;border-radius:10px;background:${color};display:flex;justify-content:space-between;flex-wrap:wrap;">

<div>
${i.name} | ${i.category} | ${i.qty} / ${i.min}
</div>

<div>
<button onclick="editStock(${i.id})">✏️</button>
</div>

</div>
`

})

document.getElementById("stockTimeline").innerHTML = html

}

// ================= SUMMARY =================
function renderSummary(el){

let data = getData("stock") || []

// 🔥 sort: 🔴 → 🟡 → ปกติ
data.sort((a,b)=>{

let aLevel = a.qty < a.min ? 0 : (a.qty === a.min ? 1 : 2)
let bLevel = b.qty < b.min ? 0 : (b.qty === b.min ? 1 : 2)

return aLevel - bLevel

})

let html=""

data.forEach(i=>{

let color = ""

if(i.qty < i.min) color = "#ffcdd2"
else if(i.qty === i.min) color = "#fff9c4"

html += `
<div style="padding:10px;margin:5px 0;border-radius:10px;background:${color};">
${i.name} | ${i.category} | ${i.qty} / ${i.min}
</div>
`

})

el.innerHTML = html

}

// ================= EDIT =================
function editStock(id){

let data = getData("stock") || []

data = data.map(i=>{
if(i.id===id) i.edit=true
return i
})

saveData("stock",data)

let el = document.getElementById("stockTimeline")

let html=""

data.forEach(i=>{

if(!i.edit){

html += `
<div>
${i.name} | ${i.qty}
<button onclick="editStock(${i.id})">✏️</button>
</div>
`

}else{

html += `
<div>

<input id="n${i.id}" value="${i.name}">
<input id="q${i.id}" type="number" value="${i.qty}">
<input id="m${i.id}" type="number" value="${i.min}">

<button onclick="saveEditStock(${i.id})">💾</button>
<button onclick="deleteStock(${i.id})">🗑</button>

</div>
`

}

})

el.innerHTML = html

}

// ================= SAVE EDIT =================
function saveEditStock(id){

let data = getData("stock") || []

data = data.map(i=>{

if(i.id===id){

i.name = document.getElementById("n"+id)?.value || "-"
i.qty = Number(document.getElementById("q"+id)?.value)||0
i.min = Number(document.getElementById("m"+id)?.value)||0

i.updatedAt = Date.now()

// 🔥 queue
addToQueue("Stock", i)

i.edit=false

}

return i

})

saveData("stock",data)

renderStockTimeline()

}

// ================= DELETE =================
function deleteStock(id){

let data = getData("stock") || []

let deleted = data.find(i=>i.id===id)

data = data.filter(i=>i.id!==id)

saveData("stock",data)

if(deleted){
deleted.deleted = true
deleted.updatedAt = Date.now()
addToQueue("Stock", deleted)
}

renderStockTimeline()

}