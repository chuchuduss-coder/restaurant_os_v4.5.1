// ================= SAFE UI (กัน error) =================
function safeShowLoading(state){
if(typeof showLoading === "function"){
showLoading(state)
}
}

function safeSetStatus(msg){
if(typeof setSyncStatus === "function"){
setSyncStatus(msg)
}
}

// ================= ANALYTICS (กัน error) =================
function drawAnalytics(){
let el = document.getElementById("page_analytics")
if(el){
el.innerHTML = "<h2>Analytics</h2><p>Coming soon</p>"
}
}

// ================= LOGIN =================
function login(){

// 🔒 กันกดซ้ำ
if(window.isLoggingIn) return
window.isLoggingIn = true

let user = document.getElementById("username")?.value
let pass = document.getElementById("password")?.value

if(user==="admin" && pass==="1234"){
localStorage.setItem("role","admin")
initAfterLogin()
}
else if(user==="staff" && pass==="1234"){
localStorage.setItem("role","staff")
initAfterLogin()
}
else{
alert("ชื่อผู้ใช้หรือรหัสผ่านผิด")
window.isLoggingIn = false
}

}

// ================= AFTER LOGIN =================
async function initAfterLogin(){

safeShowLoading(true)

try{

// 📥 โหลดก่อน
if(typeof pullFromCloud === "function"){
await pullFromCloud()
}

// 📤 push ค้าง
if(typeof syncToCloud === "function"){
await syncToCloud()
}

}catch(e){
console.log("❌ sync error:", e)
}

safeShowLoading(false)

// 🔥 เข้า app
if(typeof initApp === "function"){
initApp()
}

// 🔥 redirect หน้า
let role = localStorage.getItem("role")

if(role === "staff"){
if(typeof showPage === "function") showPage("expense")
}else{
if(typeof showPage === "function") showPage("dashboard")
}

window.isLoggingIn = false

}

// ================= LOGOUT =================
async function logout(){

// 🔒 กันกดซ้ำ
if(window.isLoggingOut) return
window.isLoggingOut = true

safeShowLoading(true)
safeSetStatus("📤 กำลังบันทึกข้อมูลก่อนออก...")

try{

let retry = 0

while(true){

// 🔥 sync
if(typeof syncToCloud === "function"){
await syncToCloud()
}

// 🔍 check queue
let q = typeof getQueue === "function" ? getQueue() : []

if(q.length === 0){
break // ✅ เสร็จ
}

// 🔁 retry max 5
retry++
if(retry >= 5){

alert("ยังมีข้อมูลที่ Sync ไม่สำเร็จ กรุณาลองใหม่")

window.isLoggingOut = false
safeShowLoading(false)
return

}

// wait 1 sec
await new Promise(r=>setTimeout(r,1000))

}

}catch(e){

console.log("❌ logout sync error", e)

alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล")

window.isLoggingOut = false
safeShowLoading(false)
return

}

// ✅ success
safeSetStatus("✅ บันทึกข้อมูลสำเร็จ")

// 🔥 clear session
localStorage.removeItem("role")

setTimeout(()=>{
location.reload()
},500)

}

// ================= AUTO LOGIN =================
window.addEventListener("load", ()=>{

let role = localStorage.getItem("role")

// 🔥 ถ้ามี session → เข้า app ทันที
if(role){

initAfterLogin()

}else{

// 🔥 แสดง login
let loginPage = document.getElementById("loginPage")
let app = document.getElementById("app")

if(loginPage) loginPage.style.display = "block"
if(app) app.style.display = "none"

}

})

// ================= EXPORT GLOBAL =================
window.login = login
window.logout = logout