// Routes for displaying resources in JSON format
const express = require("express");
const router = express.Router();
const assert = require('assert');
const moment = require('moment');
const now = moment();
const formattedDatetime = now.format('YYYY-MM-DD HH:mm:ss'); // Example: "2023-08-22 10:30:00"

/////*****  GET REQUESTS ******//////////// */

// Priority Table
router.get("/priority", (req, res, next) => {
  console.log("Getting task priorities...");
  global.db.all("SELECT * FROM TaskPriority", function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      console.log(rows);
      // res.json(rows[1].title);
      res.json(rows);
    }
  });
});

router.get("/tasktypes", (req, res, next) => {
  console.log("Getting task types...");
  global.db.all("SELECT * FROM TaskCategory", function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      // res.json(rows[1].title);
      console.log(rows);
      res.json(rows);
    }
  });
});

router.get("/getProfileImage/:id", (req, res, next) => {
  console.log("Getting Profile Image for UserId: "+req.params.id);
  global.db.all(`SELECT image FROM UsersProfile where user_id = ?`, [req.params.id], function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      if (rows.length > 0) {
        console.log(rows[0].image); // Accessing the image property of the first element
        res.json(rows); // Send the entire rows array to the client
      } else {
        res.status(404).json({ error: "No image found for the user" });
      }
    }
  });
});

router.get("/getUserDetails/:id", (req, res, next) => {
  console.log("Getting User Details for ID: "+req.params.id);
  global.db.all(`SELECT name,email FROM Users where id = ?`, [req.params.id], function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      if (rows.length > 0) {
        console.log(rows[0].name); // Accessing the image property of the first element
        res.json(rows); // Send the entire rows array to the client
      } else {
        res.status(404).json({ error: "No user found" });
      }
    }
  });
});

router.get("/tasks/:id", (req, res, next) => {
  console.log("Getting tasks for user id: "+req.params.id);
  global.db.all( `SELECT * FROM Tasks WHERE id == ${req.params.id};`, function (err, rows) {
      
      if (err) {
      next(err); //send the error on to the error handler
      
      } else {
        console.log(rows);
      res.json(rows);
      }
  });

});

router.get('/getUserIdByEmail/:email', (req, res, next) => {
  const email = req.query.email;

  global.db.get(`SELECT id FROM Users WHERE email = '${req.params.email}';`, (err, row) => {
    if (err) {
      next(err);
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

router.get("/gettasks/:id", (req, res, next) => {

  global.db.all( `SELECT * FROM Tasks WHERE user_id == ${req.params.id};`, function (err, rows) {
      
      if (err) {
      next(err); //send the error on to the error handler
      
      } else {
      res.json(rows);
      }
  });

});

router.get("/getsharedtasks/:id", (req, res, next) => {
console.log("user id to find shared tasks: "+req.params.id);
  global.db.all( `SELECT t.* FROM Tasks t JOIN SharedTasks st ON st.task_id = t.id WHERE st.user_id_to == ${req.params.id};`, function (err, rows) {
      
      if (err) {
      next(err); //send the error on to the error handler
      
      } else {
        console.log("Shared tasks:"+rows);
      res.json(rows);
      }
  });

});


router.get("/getSharedUsers/:id", (req, res, next) => {

  global.db.all( `SELECT DISTINCT u.email FROM SharedTasks st JOIN Users u ON st.user_id_to = u.id WHERE st.user_id_from == ${req.params.id};`, function (err, rows) {
      
      if (err) {
      next(err); //send the error on to the error handler
      
      } else {
        console.log(rows);
      res.json(rows);
      }
  });

});

router.get("/getSharedUsersTasks/:id", (req, res, next) => {
  console.log
  global.db.all( `SELECT t.* 
     FROM SharedTasks st 
     JOIN Tasks t ON st.task_id = t.id 
     WHERE st.user_id_to = ${req.params.id} AND t.status = 'Pending'`, function (err, rows) {
      
      if (err) {
      next(err); //send the error on to the error handler
      
      } else {
        console.log(rows);
      res.json(rows);
      }
  });

});

router.get('/getUsers/:id', (req, res, next) => {
  console.log("Getting users for contacts...");
  global.db.all(`SELECT id, email, name FROM Users WHERE id <> ${req.params.id}`, (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.json(rows);
    }
  });
});

router.get('/suggestions/:id', (req, res, next) => {
  const emailQuery = req.query.email;
  global.db.all(
    `SELECT email FROM Users WHERE id <> ${req.params.id} and email LIKE ?`,
    [`%${emailQuery}%`],
    function (err, rows) {
      if (err) {
        next(err); // send the error on to the error handler
      } else {
        console.log("Suggestions Emails: "+rows.map(row=>row.email));
        res.json(rows.map(row => row.email));
      }
    }
  );
});

// Get all pending tasks
router.get('/getPendingTasks/:userId', (req, res, next) => {
  const { userId } = req.params;
  console.log("user id in getpendingtasks is: "+userId);
  global.db.all(
    `SELECT * FROM Tasks WHERE status = 'Pending' AND user_id = ?`,
    [req.params.userId],
    (err, rows) => {
      if (err) {
        return next(err);
      }else{
        console.log("Tasks rows:"+rows);
        res.json(rows);
      }
    }
  );
});

router.get('/getnotes/:userId', (req, res, next) => {
  const { userId } = req.params;
  global.db.all(
    `SELECT * FROM Notes WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        return next(err);
      }
      res.json(rows);
    }
  );
});

/////*****  POST ******//////////// */

router.post("/savetask", (req, res, next) => {
  console.log("Saving Task");
  const status = 'Pending';
  console.log(req.body);
  // Accessing data from req.body
  const taskData = req.body._j;

  // Extracting specific fields from taskData
  const { user_id, title, description, dueDate, priority, taskType, timeframe } = taskData;
  console.log('User id:', user_id);
  console.log('Title:', title);
  console.log('Description:', description);
  console.log('Due Date:', dueDate);
  console.log('Priority:', priority);
  console.log('Task Type:', taskType);
  console.log('Timeframe:',timeframe);
  global.db.run(
      "INSERT INTO tasks (user_id, type, status, priority, title, description, due_date, created_at, timeframe) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);",
      [user_id, taskType, status, priority, title, description, dueDate, formattedDatetime, timeframe],
      function (err) {
      if (err) {
          next(err); //send the error on to the error handler
      } else {
        //res.status(201).json({ message: "Data inserted successfully!" }); // Sending success response
          res.send(`New data inserted !`);
          next();
      }
      }
  );
});

router.post('/saveProfileImage', (req, res, next) => {
  console.log("here in backend save profile image!");
  const { imageName, userId } = req.body;
  console.log("imageName: "+imageName);
  console.log("userId: "+userId);
  // Check if the user already has an entry in UsersProfile
  db.get(`SELECT COUNT(*) AS count FROM UsersProfile WHERE user_id = ?`, [userId], (err, row) => {
    if (err) {
      return next(err);
    }

    const userExists = row.count > 0;
    console.log("Record Count: "+userExists);
    if (userExists) {
      // Update the existing record
      db.run(`UPDATE UsersProfile SET image = ? WHERE user_id = ?`, [imageName, userId], function(err) {
        if (err) {
          return next(err);
        }
        res.json({ message: 'Image name updated successfully' });
      });
    } else {
      // Insert a new record
      db.run(`INSERT INTO UsersProfile (user_id, image) VALUES (?, ?)`, [userId, imageName], function(err) {
        if (err) {
          return next(err);
        }
        res.json({ message: 'Image name inserted successfully' });
      });
    }
  });
});

router.post('/shareTask', async (req, res, next) => {
  const taskId = req.body.taskId;
  const userIdFrom = req.body.userIdFrom;
  const userIdTo = req.body.userIdTo;
  //const userId = req.user.id; // Assuming user is authenticated and userId is available

  try {
    global.db.all(`SELECT Count(*) AS count FROM SharedTasks where task_id = ? and user_id_to = ?`,[taskId, userIdTo], (err, rows) => {
      if (err) {
        next(err);
      }else{
        const sharedTaskExists = rows[0].count > 0;
        console.log("SharedTask:"+sharedTaskExists);
        if (rows[0].count > 0) {
          res.status(201).send('Task already shared!');
        }else{
          global.db.run(
            `INSERT INTO SharedTasks (task_id, user_id_from, user_id_to) VALUES (?, ?, ?)`,
            [taskId, userIdFrom, userIdTo],
            function (err) {
              if (err) {
                return next(err);
              }
              else {
                res.status(201).send('Task shared successfully!');
              }
            }
          );
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/notes', (req, res, next) => {
  const { user_id, note_text, attachment } = req.body;
  console.log("Attachment: "+attachment);
  if (!user_id || !note_text) {
    return res.status(400).send('Missing user_id or note_text');
  }
  global.db.run(
    `INSERT INTO Notes (user_id, note_text, attachment) VALUES (?, ?, ?)`,
    [user_id, note_text, attachment],
    function (err) {
      if (err) {
        return next(err);
      }
      res.status(201).json({ id: this.lastID, user_id, note_text, created_at: new Date() });
    }
  );
});

router.post('/updateUserProfile', (req, res, next) => {
  console.log("Updating user profile in backend!");
  const { userId, name, email } = req.body;
  console.log("UserId: " + userId);
  console.log("Name: " + name);
  console.log("Email: " + email);

  if (!userId || !name || !email) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Check if the user exists in the Users table
  db.get(`SELECT COUNT(*) AS count FROM Users WHERE id = ?`, [userId], (err, row) => {
    if (err) {
      return next(err);
    }

    const userExists = row.count > 0;
    console.log("User exists: " + userExists);

    if (userExists) {
      // Update the existing user profile
      db.run(`UPDATE Users SET name = ?, email = ? WHERE id = ?`, [name, email, userId], function(err) {
        if (err) {
          console.error('Error updating profile:', err);
          return next(err);
        }
        res.json({ success: true, message: 'Profile updated successfully' });
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  });
});

/**************************PUT*******************************/
// Edit Task Route
router.put("/updatetask/:id", (req, res, next) => {
  const taskId = req.params.id;
  const { title, description, priority } = req.body;

  global.db.run(
    `UPDATE Tasks SET title = ?, description = ?, priority = ? WHERE id = ?`,
    [title, description, priority, taskId],
    function (err) {
      if (err) {
        next(err); // Send the error to the error handler
      } else {
        res.json({ message: 'Task updated successfully!' });
      }
    }
  );
});

router.put('/completeTask/:taskId', (req, res, next) => {
  const { taskId } = req.params;
  global.db.run(
    `UPDATE Tasks SET status = 'Completed' WHERE id = ?`,
    [taskId],
    function (err) {
      if (err) {
        return next(err);
      }
      res.status(200).send('Task marked as completed');
    }
  );
});


router.put('/editnote/:id', (req, res, next) => {
  const { id } = req.params;
  const { note_text, attachment } = req.body;
  console.log("Note id to edit: "+id);
  global.db.run(
    `UPDATE notes SET note_text = ?, attachment = ? WHERE id = ?`,
    [note_text, attachment, id],
    function (err) {
      if (err) {
        return next(err);
      }
      res.status(200).json({ message: 'Note updated successfully', id });
    }
  );
});

/****************************DELETE ***************************/
// Delete Task Route
router.delete("/deletetask/:id", (req, res, next) => {
  const taskId = req.params.id;

  global.db.run(
    `DELETE FROM Tasks WHERE id = ?`,
    [taskId],
    function (err) {
      if (err) {
        next(err); // Send the error to the error handler
      } else {
        res.json({ message: 'Task deleted successfully!' });
      }
    }
  );
});

router.delete('/deletenote/:noteId', (req, res, next) => {
  const { noteId } = req.params;
  global.db.run(
    `DELETE FROM Notes WHERE id = ?`,
    [noteId],
    function (err) {
      if (err) {
        return next(err);
      }
      if (this.changes === 0) {
        return res.status(404).send('Note not found');
      }
      res.status(200).send('Note deleted successfully');
    }
  );
});

router.delete('/deletenote/:id', (req, res, next) => {
  const { id } = req.params;

  global.db.run(
    `DELETE FROM notes WHERE id = ?`,
    [id],
    function (err) {
      if (err) {
        return next(err);
      }
      if (this.changes === 0) {
        return res.status(404).send('Note not found');
      }
      res.status(200).send('Note deleted successfully');
    }
  );
});

module.exports = router;