const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const fs = require('fs');
const cors = require('cors');
const port = 3001;
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const trainModel = require('./trainModel');


// Allow requests from the frontend (replace with your frontend's URL)
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

trainModel()
    .then(history => {
        console.log(history.history);
    })
    .catch(err => {
        console.error(err);
    });

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: 'secret', 
    resave: false,
    saveUninitialized: false,
    cookie:{
      secure:false,
      maxAge: 1000 * 60 * 60 * 24
    }
  }));
app.use(cors(corsOptions)); // This is important to allow sending cookies}));

// middleware password

const expectedPassword = '0000'; // Replace with your actual password



//items in the global namespace are accessible throught out the node application
global.db = new sqlite3.Database('./database/database.db',function(err){
  if(err){
    console.error(err);
    process.exit(1); //Bail out we can't connect to the DB
  }else{
    
    global.db.run("PRAGMA foreign_keys=ON"); //This tells SQLite to pay attention to foreign key constraints
  }
});

//To run the schema uncomment the code
/* const schema = fs.readFileSync('./database/schema_definition.sql', 'utf8');
db.exec(schema, err => {
  if (err) {
    console.error('Error executing schema:', err);
    return;
  }
  
}); */


const rootRoutes = require('./routes/root.js')
const resourceRoutes = require('./routes/resources.js')
const loginRoutes = require('./routes/login.js');
const { randomBytes } = require('crypto');


//set the app to use ejs for rendering
app.set('view engine', 'ejs');

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// });

//this adds all the userRoutes to the app under the path /user
app.use('/', rootRoutes);
app.use('/resources', resourceRoutes);
app.use('/main', loginRoutes);





app.listen(port, () => {
  
})