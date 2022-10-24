const winston = require('winston');    //Setting up 'winston' logger here and exporting the logger

const logger = winston.createLogger({
   transports: [  //Our logger has 2 transports
      new winston.transports.Console(),
      new winston.transports.File({    //Seperate transport for logging messages in file
         filename: 'logs/logfile.log',
         format: winston.format.combine(
            winston.format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
            winston.format.colorize(),
            winston.format.align(),
            // winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
            winston.format.json() // Convert logs to a json format
         )
      })
   ]
});


module.exports = logger;

//////////////////////ALTERNATE CODE ///////////////////////////////

// const winston = require('winston');

//module.exports =  function() {
//    return winston.createLogger({
//       transports: [  //Our logger has 2 transports
//          new winston.transports.Console(),
//          new winston.transports.File({    //Seperate transport for logging messages in file
//             filename: 'logs/logfile.log',
//             format: winston.format.combine(
//                winston.format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
//                winston.format.align(),
//                // winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
//                winston.format.json() // Convert logs to a json format
//             )
//          })
//       ]
//    });
// }
