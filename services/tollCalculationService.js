const res = require('express/lib/response');
let config = require('../config/config.json')

function addData(user,data) {
    console.log("inside setup function", user)
  user.sync({ force: true }) 
    .then(function() {
        user.create(data);
    });
}

async function getRecords(user, number) {
    console.log("inside getRecords function", user)
    try{
      return await user.findOne({
        where: { numberPlate: number },
      })
    }
    catch (err) {
      console.log("error ", err)
  }
  }

function getDayName(dateStr, locale)
{
    var date = new Date(dateStr);
    return date.toLocaleDateString(locale, { weekday: 'long' });        
}

function oddOrEven (numberPlate)
{
  let array = numberPlate.split('-')
  let number = array[1]
  let rem = parseInt(number) % 2
  return rem
}

function isNationalHoliday (date)
 {
   let dateArray = date.split('')
   dateArray = dateArray.splice(5,10)
   dateArray = dateArray.join('')
   return config.holdays.includes(dateArray)
   
 }

 function calculateDistance (entry, exit, rate)
 {
   let totalDistance = config.distance[entry] + config.distance[exit]
   return totalDistance * rate
 }
module.exports = {
    vehicleEntry : async function (db, payload)  {
        try{
            console.log("tollCalculationService.vehicleEntry", payload)
            let distanceRate = 0.2
            let discountPercentage = 0
    
            let day = getDayName(payload.date, "en-us")
             
            if (day.toLowerCase() == 'saturday' || day.toLowerCase() == 'sunday')
             {
                distanceRate = 0.3
                console.log("distanceRate", distanceRate)
             }
    
             let isOddOrEven = oddOrEven(payload.numberPlate)
             if ( (day.toLowerCase() == 'monday' || day.toLowerCase() == 'wednesday') && isOddOrEven == 0 )
             {
                discountPercentage = 10
             }
    
             if ( (day.toLowerCase() == 'tuesday' || day.toLowerCase() == 'thursday') && isOddOrEven == 1 )
             {
                discountPercentage = 10
             }
    
             if(isNationalHoliday(payload.date))
             {
                discountPercentage = 50
             }
    
             let insertData = 
             {
                entryInterchange: payload.interchange,
                date: payload.date ,
                numberPlate: payload.numberPlate ,
                discountPercentage: discountPercentage , 
                distanceRate: distanceRate 
             }
            addData(db,insertData)
           
           return {
               success : true,
               message: "Data added successfully",
               data: insertData
           }
        }
        catch (err){
            return {success: false}
        }
        


    },

    vehicleExit : async function (db, payload)  {
        try{
            console.log("tollCalculationService.vehicleExit", payload)
            let baseRate = 20
            let resp = await getRecords(db,payload.numberPlate)
            let distanceCost = calculateDistance(resp.dataValues.entryInterchange, payload.interchange, resp.dataValues.distanceRate)
            let subTotal = distanceCost + baseRate
            let discountedAmount = (resp.dataValues.discountPercentage/100) * subTotal
            
            let toBeCharged = subTotal - discountedAmount
            
            let respData = {
                baseRate: baseRate,
                distanceCost: distanceCost,
                subTotal: subTotal,
                discountedAmount: discountedAmount,
                toBeCharged:toBeCharged
            }
           
           return {
               success : true,
               message: "Data added successfully",
               data: respData
           }
        }
        catch (err){
            return {success: false}
        }

    }


}