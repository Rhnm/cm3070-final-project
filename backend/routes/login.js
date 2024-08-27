/**
 * These are example routes for user management
 * This shows how to correctly structure your routes for the project
 */

const express = require("express");
const router = express.Router();
const assert = require('assert');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
//const { default: App } = require("../../frontend/src/App");
const expectedPassword = '0000';



// Middleware to parse the form data
router.use(bodyParser.urlencoded({ extended: true }));


function requireLogin(req, res, next) {
    if (req.session.isLoggedIn) {
      res.redirect('/')
    } else {
      res.redirect('/login');
    }
  }



router.get('/login', (req, res) => {
    res.render('login',{ errorMessage: '' });
    
  });

router.post('/register', async(req, res) => {
  console.log("Here in register");
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  
  // Generate a salt to use for hashing
  const saltRounds = 10; // You can adjust this value according to your security needs
  const salt = await bcrypt.genSalt(saltRounds);

  // Hash the plain password with the generated salt
  const hashedPassword = await bcrypt.hash(password, salt);

  // Check if the username already exists
  const usernameQuery = 'SELECT * FROM Users WHERE username = ?';
  db.get(usernameQuery, [username], (err, row) => {
    if (err) {
      console.error('Error checking username:', err);
      res.status(500).send('Error checking username');
      return;
    }

    if (row) {
      // Username already exists
      res.status(400).send('Username already exists');
      return;
    }

    // Insert user data into the users table if doesnt exist
    const insertQuery = 'INSERT INTO Users (name,username,email,password_hash) VALUES (?, ?, ?,?)';
    // Execute the INSERT query
    db.run(insertQuery, [name,username, email, hashedPassword], (err) => {
      if (err) {
        console.error('Error inserting user data:', err);
        res.status(500).send('Error inserting user data');
      } else {
        res.status(200).send('User registered sucessfully');
      }
    });
  });
});
  
router.post('/login', async(req, res) => {
  const password = req.body.password;
  const username = req.body.username;

  const usernameQuery = 'SELECT * FROM Users WHERE username = ?';

  db.get(usernameQuery, [username], (err, row) => {
    if (err) {
      console.error('Error checking username:', err);
      //res.status(500).send('Error checking username');
      res.send("Incorrect");
      return;
    }
    if (!row) {
      res.send("Incorrect");
      return;
    }

    if (row) {
      // Username already exists
      bcrypt.compare(password, row.password_hash, function(err, result) {
        if (err) {
          // Handle error
          console.error(err);
          return;
        }
      
        if (result) {
          // Passwords match, user is authenticated
          req.session.username = username;
          req.session.isLoggedIn = true;
          req.session.uid = row.id;
          
          res.json({'Login':req.session.isLoggedIn,'uid':req.session.uid});
          
          return; 
        } else {
          // Passwords do not match, authentication failed
          res.send('Incorrect'); 
          return; 
        }
      });
    }
  });
});


router.get('/get-session', (req, res) => {
  
  req.session.name = Math.round(10*Math.random());
  
  const sessionData = Math.round(10*Math.random()); // Adjust this based on your session structure
  
  res.json(sessionData);
});

// Protected route that requires login
router.get('/', requireLogin, (req, res) => {
res.send('Welcome to the main page!'); 
});

module.exports = router;