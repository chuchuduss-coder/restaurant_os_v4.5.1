// ================= STATE =================
if(typeof cameraStream === "undefined"){
var cameraStream = null
}
let attendanceTab = "checkin"

// ================= DRAW =================
// ================= DRAW =================
function drawAttendance(){

let el = document.getElementById("page_attendance")

if(!el) return

el.innerHTML = `
<h2>Check-in</h2>
<p>Attendance system loading...</p>
`

}

// 🔥 export ให้เรียกได้จาก app.js + HTML
window.drawAttendance = drawAttendance

// ================= SWITCH =================
function switchAttendanceTab(tab){

attendanceTab = tab

// 🔥 เปลี่ยนแท็บ → ปิดกล้องก่อน
stopCamera()

renderAttendance()

}

// ================= RENDER =================
function renderAttendance(){

let el = document.getElementById("attendanceContent")
if(!el) return

// ===== CHECK-IN =====
if(attendanceTab==="checkin"){

el.innerHTML = `

<select id="staffSelect"></select>

<br><br>

<video id="video" width="220" autoplay playsinline style="border-radius:10px;"></video>
<canvas id="canvas" style="display:none;"></canvas>

<br><br>

<button onclick="capture('checkin')">Check-in</button>
<button onclick="capture('checkout')">Check-out</button>

<div id="timeline"></div>

`

setTimeout(()=>{
startCamera()
loadStaff()
renderTimeline()
},300)

}

// ===== STAFF =====
if(attendanceTab==="staff"){

el.innerHTML = `

<input id="staffName" placeholder="ชื่อพนักงาน">
<button onclick="addStaff()">เพิ่ม</button>

<hr>

<div id="staffList"></div>

`

renderStaffList()

}

}

// ================= CAMERA =================
async function startCamera(){

// 🔥 ป้องกันเปิดซ้ำ
if(cameraStream) return

let video = document.getElementById("video")
if(!video) return

try{

cameraStream = await navigator.mediaDevices.getUserMedia({ video: true })

video.srcObject = cameraStream
video.setAttribute("playsinline", true)
video.muted = true

await video.play()

console.log("CAMERA START")

}catch(e){
console.log(e)
alert("เปิดกล้องไม่ได้")
}

}

// ================= STOP CAMERA =================
function stopCamera(){

if(cameraStream){
cameraStream.getTracks().forEach(track => track.stop())
cameraStream = null
}

let video = document.getElementById("video")
if(video){
video.pause()
video.srcObject = null
}

console.log("CAMERA STOP")

}

// ================= RESTART =================
function restartCamera(){

stopCamera()

setTimeout(()=>{
startCamera()
},300)

}

// ================= CAPTURE =================
function capture(type){

let name = document.getElementById("staffSelect")?.value
let video = document.getElementById("video")
let canvas = document.getElementById("canvas")

if(!name){
alert("เลือกพนักงาน")
return
}

if(!video || video.videoWidth===0){
alert("กล้องยังไม่พร้อม")
return
}

let ctx = canvas.getContext("2d")

let w = 200
let h = video.videoHeight * (200 / video.videoWidth)

canvas.width = w
canvas.height = h

ctx.drawImage(video,0,0,w,h)

// timestamp
let now = new Date()
ctx.fillStyle="red"
ctx.font="12px Arial"
ctx.fillText(now.toLocaleString(),5,15)

// 🔥 บีบภาพเล็กสุด
let image = canvas.toDataURL("image/jpeg",0.25)

let newItem = {
id: Date.now() + Math.random(),
name,
type,
time: now.toLocaleTimeString(),
date: now.toISOString().split("T")[0],
image,
updatedAt: Date.now()
}

// ================= SAVE =================
let data = getData("attendance") || []
data.push(newItem)

// 🔥 save + queue
saveAndQueue("attendance","Attendance",data,newItem)

renderTimeline()

// 🔥 แก้ค้าง
restartCamera()

}

// ================= TIMELINE =================
function renderTimeline(){

let el = document.getElementById("timeline")
if(!el) return

let data = getData("attendance") || []

data.sort((a,b)=>b.date.localeCompare(a.date))

let html=""

data.forEach(i=>{

html+=`
<div style="border:1px solid #ccc;margin:10px;padding:10px;border-radius:10px;">

<b>${i.name}</b> | ${i.type} | ${i.date} ${i.time}

<br>

<img src="${i.image}" width="70">

</div>
`

})

el.innerHTML = html

}

// ================= STAFF =================
function addStaff(){

let input = document.getElementById("staffName")
if(!input) return

let name = input.value.trim()
if(!name) return

let data = getData("staff") || []

data.push({name})

saveData("staff",data)

input.value=""

renderStaffList()

}

// ================= LIST =================
function renderStaffList(){

let el = document.getElementById("staffList")
if(!el) return

let data = getData("staff") || []

el.innerHTML = data.map((s,i)=>`
<div>
${s.name}
<button onclick="deleteStaff(${i})">🗑</button>
</div>
`).join("")

}

// ================= DELETE =================
function deleteStaff(i){

let data = getData("staff") || []

data.splice(i,1)

saveData("staff",data)

renderStaffList()

}

// ================= LOAD =================
function loadStaff(){

let select = document.getElementById("staffSelect")
if(!select) return

let data = getData("staff") || []

select.innerHTML = data.map(s=>`
<option value="${s.name}">${s.name}</option>
`).join("")

}