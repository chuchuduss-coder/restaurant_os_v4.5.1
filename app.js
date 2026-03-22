// ================= INIT =================
function initApp(){

// 🔥 fix stock
if(typeof migrateStockData === "function"){
migrateStockData()
}

// 🔥 apply role UI
applyRoleUI()

// 🔥 redirect หน้าเริ่มต้น
let role = localStorage.getItem("role")

if(role === "staff"){
showPage("expense")
}else{
showPage("dashboard")
}

}

// ================= ROLE UI =================
function applyRoleUI(){

let role = localStorage.getItem("role")

// 🔥 STAFF
if(role === "staff"){

// ซ่อนเมนู
let hideMenus = [
"menu_dashboard",
"menu_pos",
"menu_analytics",
"menu_kpi"
]

hideMenus.forEach(id=>{
let el = document.getElementById(id)
if(el) el.style.display = "none"
})

// แสดงเฉพาะ
let showMenus = [
"menu_expense",
"menu_stock",
"menu_attendance"
]

showMenus.forEach(id=>{
let el = document.getElementById(id)
if(el) el.style.display = "block"
})

}

// 🔥 ADMIN
if(role === "admin"){

document.querySelectorAll("#sidebar button").forEach(btn=>{
btn.style.display = "block"
})

}

}

// ================= NAVIGATION =================
function showPage(page){

document.querySelectorAll(".page").forEach(p=>{
p.style.display = "none"
})

let target = document.getElementById("page_" + page)

if(target){
target.style.display = "block"
}

// 🔥 SAFE CALL (กัน error)
if(page === "pos" && typeof drawPOSPage==="function") drawPOSPage()
if(page === "expense" && typeof drawExpensePage==="function") drawExpensePage()
if(page === "stock" && typeof drawStockPage==="function") drawStockPage()
if(page === "dashboard" && typeof drawDashboard==="function") drawDashboard()
if(page === "analytics" && typeof drawAnalytics==="function") drawAnalytics()
if(page === "kpi" && typeof drawKPI==="function") drawKPI()
if(page === "attendance" && typeof drawAttendance==="function") drawAttendance()

}

// ================= REFRESH =================
function refreshAll(){
if(typeof refreshDashboard==="function"){
refreshDashboard()
}
}

function initApp(){

let role = localStorage.getItem("role")

document.getElementById("app").style.display = "block"
document.getElementById("loginPage").style.display = "none"

// 🔥 เพิ่มตรงนี้
applyRoleUI()

if(role === "staff"){
showPage("expense")
}else{
showPage("dashboard")
}

}