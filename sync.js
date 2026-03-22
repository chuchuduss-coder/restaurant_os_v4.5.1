// ================= UI =================
function showLoading(state){
let el = document.getElementById("loadingOverlay")
if(el) el.style.display = state ? "flex" : "none"
}

function setSyncStatus(text){
let el = document.getElementById("syncStatus")
if(el) el.innerText = text
}

const API_URL = "https://script.google.com/macros/s/AKfycbyGKRHdRAtNwta171BkSMoH0YtIYtR2kEhfah8yGiDXkrjG11dvztWwFuhoAJKsXGWAVg/exec"

// ================= NORMALIZE =================
function normalizeItem(i){

if(!i) return i

// 🔥 FIX DATE
if(i.date){
if(typeof i.date === "string"){
if(i.date.includes("T")) i.date = i.date.split("T")[0]
if(i.date.length > 10) i.date = i.date.substring(0,10)
}
}

// 🔥 FIX ID
if(i.id){
i.id = String(i.id)
}

return i
}

// ================= QUEUE =================
function getQueue(){
return JSON.parse(localStorage.getItem("sync_queue") || "[]")
}

function saveQueue(q){
localStorage.setItem("sync_queue", JSON.stringify(q))
}

// 🔥 กัน duplicate queue (สำคัญ)
function addToQueue(sheet,row){

if(!row || !row.id) return

row = normalizeItem(row)

let q = getQueue()

// ❗ ถ้ามี id นี้อยู่แล้ว → replace
q = q.filter(i => String(i.row.id) !== String(row.id))

q.push({sheet,row})

saveQueue(q)

}

function saveAndQueue(localKey, sheet, data, newRow){

// 🔥 normalize ทั้งชุด
data = data.map(normalizeItem)

saveData(localKey, data)

addToQueue(sheet, newRow)

}

// ================= SYNC =================
async function syncToCloud(){

let q = getQueue()

if(q.length === 0){
setSyncStatus("☁️ ข้อมูลล่าสุด")
return
}

setSyncStatus("🔄 กำลัง Sync...")

let failed = []

for(let i=0;i<q.length;i++){

try{

await fetch(API_URL,{
method:"POST",
body: JSON.stringify(q[i])
})

}catch(e){

console.log("❌ sync fail", e)
failed.push(q[i])

}

}

saveQueue(failed)

if(failed.length === 0){
setSyncStatus("✅ Sync สำเร็จ")
showToast("Sync สำเร็จ","#4caf50")
}else{
setSyncStatus("⚠️ Sync ไม่ครบ")
retrySync()
}

}

// ================= PULL =================
async function pullFromCloud(){

showLoading(true)
setSyncStatus("📥 กำลังโหลด...")

try{

await pullSheet("sales","POS")
await pullSheet("expense_log","Expense")
await pullSheet("stock","Stock")
await pullSheet("attendance","Attendance")

setSyncStatus("✅ โหลดสำเร็จ")

}catch(e){

console.log("❌ pull error", e)
setSyncStatus("❌ โหลดล้มเหลว")

}

showLoading(false)

}

async function pullSheet(localKey, sheetName){

let res = await fetch(API_URL + "?sheet=" + sheetName)
let cloudData = await res.json()

let localData = getData(localKey) || []

// 🔥 normalize ทั้งสองฝั่ง
localData = localData.map(normalizeItem)
cloudData = cloudData.map(normalizeItem)

let merged = mergeData(localData, cloudData)

saveData(localKey, merged)

}

// ================= MERGE =================
function mergeData(localData, cloudData){

let map = {}

// local
localData.forEach(i=>{
map[i.id] = i
})

// cloud
cloudData.forEach(c=>{

let l = map[c.id]

if(!l){
map[c.id] = c
}else{

if((c.updatedAt||0) > (l.updatedAt||0)){
map[c.id] = c
}

}

})

return Object.values(map).filter(i=>!i.deleted)

}

// ================= AUTO SYNC =================
setInterval(()=>{

if(navigator.onLine){
syncToCloud()
}else{
setSyncStatus("📴 Offline")
}

},30000)

// ================= RETRY =================
function retrySync(){
setTimeout(()=>{
if(navigator.onLine){
syncToCloud()
}
},5000)
}

// ================= TOAST =================
function showToast(msg,color="#333"){

let t = document.createElement("div")

t.innerText = msg
t.style.position="fixed"
t.style.bottom="60px"
t.style.right="10px"
t.style.background=color
t.style.color="#fff"
t.style.padding="10px 15px"
t.style.borderRadius="8px"
t.style.zIndex="9999"

document.body.appendChild(t)

setTimeout(()=>t.remove(),2000)

}

// ================= PREVENT EXIT =================
window.addEventListener("beforeunload", function (e) {

let q = getQueue()

if(q.length > 0){
e.preventDefault()
e.returnValue = "ยังมีข้อมูลที่ยังไม่ได้ Sync"
}

})