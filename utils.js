// ======================
// DATE UTILS
// ======================

function formatDate(d){

return new Date(d).toISOString().split("T")[0]

}


// ======================
// SUM TODAY
// ======================

function sumToday(list){

let today=formatDate(currentDate)

let total=0

list.forEach(x=>{

let d=formatDate(x.date)

if(d===today){

total+=Number(x.amount)||0

}

})

return total

}


// ======================
// SUM BY DAY
// ======================

function sumDay(list,date){

let target=formatDate(date)

let total=0

list.forEach(x=>{

let d=formatDate(x.date)

if(d===target){

total+=Number(x.amount)||0

}

})

return total

}


// ======================
// SUM RANGE
// ======================

function sumRange(list,start,end){

let s=new Date(start)
let e=new Date(end)

let total=0

list.forEach(x=>{

let d=new Date(x.date)

if(d>=s && d<=e){

total+=Number(x.amount)||0

}

})

return total

}