let express = require('express'); 
let bodyParser = require('body-parser')
let app = express();              
let port = 5000;                  
let tollCalculationController = require('./controllers/tollCalculationController')
let Sequelize = require("sequelize");

app.use(bodyParser.json());

var sequelize = new Sequelize(
    "database",
    "admin",
    "admin",
    {
      host: "0.0.0.0",
      dialect: "sqlite",
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
        logging: true
      },
      storage: "/toll_calculation_assignment/db/data.sqlite"
    }
  );

  sequelize
  .authenticate()
  .then(function(err) {
    console.log("Connection established.");
    const user = sequelize.define("users", {
      numberPlate: {
        type: Sequelize.STRING
      }, 
      entryInterchange: {
        type: Sequelize.STRING
      }, 
      exitInterchange: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.NUMBER
      }, 
      discountPercentage: {
        type: Sequelize.NUMBER
      }, 
      distanceRate: {
        type: Sequelize.NUMBER
      }
    });
    tollCalculationController.setConnection(user)
  })
  .catch(function(err) {
    console.log("Unable to connect to database: ", err);
  });

  
app.post('/assignment/tollCalculation/entry',tollCalculationController.vehicleEntry);

app.post('/assignment/tollCalculation/exit',tollCalculationController.vehicleExit)

app.listen(port, () => {            
    console.log(`Now listening on port ${port}`); 
});

