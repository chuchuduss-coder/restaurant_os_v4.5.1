let currentDate=new Date()

function updateCalendar(){

let d=currentDate.toISOString().split("T")[0]

currentDateSpan=currentDate

document.getElementById("currentDate").innerText=d

calendarPicker.value=d

}

function changeDate(offset){

currentDate.setDate(currentDate.getDate()+offset)

updateCalendar()

refreshAll()

}

function selectDate(){

currentDate=new Date(calendarPicker.value)

updateCalendar()

refreshAll()

}