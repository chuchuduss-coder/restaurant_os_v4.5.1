// ================= BASIC STORAGE =================
function getData(key){

let data = localStorage.getItem(key)

if(!data) return []

try{
return JSON.parse(data)
}catch(e){
console.log("parse error", key)
return []
}

}

function saveData(key,data){
localStorage.setItem(key, JSON.stringify(data))
}

// ================= SYNC QUEUE =================
function getQueue(){
return JSON.parse(localStorage.getItem("sync_queue") || "[]")
}

function saveQueue(q){
localStorage.setItem("sync_queue", JSON.stringify(q))
}

// 🔥 เพิ่มเข้า queue
function addToQueue(type, data){

let queue = getQueue()

queue.push({
type: type,       // POS / Expense / Stock / Attendance
data: data,
timestamp: Date.now()
})

saveQueue(queue)

// debug
console.log("ADD QUEUE:", type, data.id)

}

// ================= SMART SAVE =================
// ใช้แทน saveData ในอนาคต
function saveAndQueue(storageKey, queueType, dataArray, newItem){

// 1. save local
saveData(storageKey, dataArray)

// 2. add queue (เฉพาะรายการใหม่/ที่แก้)
if(newItem){
addToQueue(queueType, newItem)
}

}