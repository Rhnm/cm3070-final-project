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
const predictTaskPriority = require('./predict');

const trainTimeframeModel = require('./trainTimeframeModel');
const predictTaskTimeframe = require('./Predicttimeframe');

// Allow requests from the frontend (replace with your frontend's URL)
const corsOptions = {
  origin: ['http://192.168.1.10:8081','exp://192.168.1.10:8081', 'http://192.168.0.5:8081','exp://192.168.0.5:8081'],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

trainModel()
    .then(history => {
        console.log(history.history);
    })
    .catch(err => {
        console.error(err);
    });

trainTimeframeModel()
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
const schema = fs.readFileSync('./database/schema.sql', 'utf8');
db.exec(schema, err => {
  if (err) {
    console.error('Error executing schema:', err);
    return;
  }
  
});

//To run the schema uncomment the code
/* const insert = fs.readFileSync('./database/insert.sql', 'utf8');
db.exec(insert, err => {
  if (err) {
    console.error('Error executing insert:', err);
    return;
  }
  
}); */

// Prediction endpoint
// Define a POST route to handle predictions
app.post('/predict', async (req, res) => {
  
  // Extract the description from the request body
  const { description } = req.body;
  console.log("Task description: " + description); // Log the received task description

  // Check if the description is provided in the request body
  if (!description) {
    // If not, respond with a 400 Bad Request status and an error message
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    // Call the predictTaskPriority function to get the priority prediction
    const priority = await predictTaskPriority(description);
    console.log("Prediction result:", priority); // Log the prediction result

    // Respond with the prediction result in JSON format
    res.json({ priority });
  } catch (error) {
    // Catch any errors that occur during the prediction process
    console.error("Error in prediction:", error); // Log the error for debugging

    // Respond with a 500 Internal Server Error status and an error message
    res.status(500).json({ error: 'Failed to predict task priority' });
  }
});

app.post('/predictTimeframe', async (req, res) => {
  const { description } = req.body;
  if (!description) {
      return res.status(400).json({ error: 'Description is required' });
  }

  try {
      const timeframe = await predictTaskTimeframe(description);
      console.log("Timeframe result:", timeframe);
      res.json({ timeframe });
  } catch (error) {
      console.error("Error in prediction:", error);
      res.status(500).json({ error: 'Failed to predict task timeframe' });
  }
});


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
  console.log(`Server running on port ${port}`);
})