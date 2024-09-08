// Routes for displaying resources in JSON format
const express = require("express");
const router = express.Router();
const assert = require('assert');
const moment = require('moment');
const now = moment();
const formattedDatetime = now.format('YYYY-MM-DD HH:mm:ss'); // Example Date Time Format: "2023-08-22 10:30:00"

/////*****  GET REQUESTS ******//////////// */

// Priority Table
router.get("/priority", (req, res, next) => {
  global.db.all("SELECT * FROM TaskPriority", function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      res.json(rows);
    }
  });
});

router.get("/tasktypes", (req, res, next) => {
  global.db.all("SELECT * FROM TaskCategory", function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      res.json(rows);
    }
  });
});

router.get("/getProfileImage/:id", (req, res, next) => {
  global.db.all(`SELECT image FROM UsersProfile where user_id = ?`, [req.params.id], function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      if (rows.length > 0) {
        res.json(rows); // Send the entire rows array to the client
      } else {
        res.status(404).json({ error: "No image found for the user" });
      }
    }
  });
});

router.get("/getUserDetails/:id", (req, res, next) => {
  global.db.all(`SELECT name,email FROM Users where id = ?`, [req.params.id], function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      if (rows.length > 0) {
        res.json(rows); // Send the entire rows array to the client
      } else {
        res.status(404).json({ error: "No user found" });
      }
    }
  });
});

router.get("/tasks/:id", (req, res, next) => {
  global.db.all( `SELECT * FROM Tasks WHERE id == ${req.params.id};`, function (err, rows) {
      
      if (err) {
      next(err); //send the error on to the error handler
      
      } else {
      res.json(rows);
      }
  });

});

router.get('/getUserIdByEmail/:email', (req, res, next) => {
  const email = req.params.email;
  global.db.get(`SELECT id FROM Users WHERE email = '${req.params.email}';`, (err, row) => {
    if (err) {
      next(err);
    } else if (row) {
      res.json(row.id);
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

router.get("/getNotesByTask/:id", (req, res, next) => {
  global.db.all( `SELECT * FROM Notes WHERE task_id == ${req.params.id};`, function (err, rows) {
      
      if (err) {
      next(err); //send the error on to the error handler
      
      } else {
      res.json(rows);
      }
  });

});


router.get("/getsharedtasks/:id", (req, res, next) => {
  global.db.all( `SELECT t.* FROM Tasks t JOIN SharedTasks st ON st.task_id = t.id WHERE st.user_id_to == ${req.params.id};`, function (err, rows) {
      
      if (err) {
      next(err); //send the error on to the error handler
      
      } else {
      res.json(rows);
      }
  });

});


router.get("/getSharedUsers/:id", (req, res, next) => {

  global.db.all( `SELECT DISTINCT u.id,u.email, u.name, up.image
                  FROM 
                      SharedTasks st
                  JOIN 
                      Users u ON st.user_id_to = u.id
                  JOIN 
                      UsersProfile up ON u.id = up.user_id
                  WHERE 
                      st.user_id_from = ${req.params.id}`, function (err, rows) {
      
      if (err) {
      next(err); //send the error on to the error handler
      
      } else {
      res.json(rows);
      }
  });

});

router.get("/getSharedUsersTasks/:id", (req, res, next) => {
  global.db.all( `SELECT t.* 
     FROM SharedTasks st 
     JOIN Tasks t ON st.task_id = t.id 
     WHERE st.user_id_to = ${req.params.id} AND t.status = 'Pending'`, function (err, rows) {
      
      if (err) {
      next(err); //send the error on to the error handler
      
      } else {
      res.json(rows);
      }
  });

});

router.get('/getUsers/:id', (req, res, next) => {
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
  const userId = req.params.id;
  global.db.all(
    `SELECT u.id,u.email,u.name,up.image FROM Users u JOIN UsersProfile up on up.user_id = u.id WHERE u.id <> ? and u.email LIKE ?`,
    [userId,`%${emailQuery}%`],
    function (err, rows) {
      if (err) {
        next(err); // send the error on to the error handler
      } else {
        res.json(rows);
      }
    }
  );
});

// Get all pending tasks
router.get('/getPendingTasks/:userId', (req, res, next) => {
  const { userId } = req.params;
  global.db.all(
    `SELECT * FROM Tasks WHERE status = 'Pending' AND user_id = ?`,
    [req.params.userId],
    (err, rows) => {
      if (err) {
        return next(err);
      }else{
        res.json(rows);
      }
    }
  );
});

// Get all pending tasks
router.get('/getCompletedTasks/:userId', (req, res, next) => {
  const { userId } = req.params;
  global.db.all(
    `SELECT * FROM Tasks WHERE status = 'Completed' AND user_id = ?`,
    [req.params.userId],
    (err, rows) => {
      if (err) {
        return next(err);
      }else{
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


router.get('/sharedpersonslist', (req, res) => {
  try {
      global.db.all(
        `SELECT 
                SharedTasks.task_id AS task_id,
                Tasks.title AS task_title,
                GROUP_CONCAT(SharedTasks.user_id_to) AS user_to_ids,
                GROUP_CONCAT(DISTINCT UsersFrom.name) AS user_from_names,
                GROUP_CONCAT(DISTINCT UsersTo.name) AS user_to_names,
                GROUP_CONCAT(DISTINCT SharedTasks.shared_at) AS shared_ats
            FROM 
                SharedTasks
            JOIN 
                Tasks ON SharedTasks.task_id = Tasks.id
            JOIN 
                Users AS UsersFrom ON SharedTasks.user_id_from = UsersFrom.id
            JOIN 
                Users AS UsersTo ON SharedTasks.user_id_to = UsersTo.id
            GROUP BY 
                SharedTasks.task_id, Tasks.title
            ORDER BY 
                MIN(SharedTasks.shared_at) DESC`,
      (err, rows) => {
        if (err) {
          return next(err);
        }
        res.json(rows);
      }
    );
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch shared tasks' });
  }
});


/////*****  POST ******//////////// */

router.post("/savetask", (req, res, next) => {
  const status = 'Pending';
  // Accessing data from req.body
  const taskData = req.body._j;

  // Extracting specific fields from taskData
  const { user_id, title, description, dueDate, priority, taskType, timeframe } = taskData;
  global.db.run(
      "INSERT INTO tasks (user_id, type, status, priority, title, description, due_date, created_at, timeframe) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);",
      [user_id, taskType, status, priority, title, description, dueDate, formattedDatetime, timeframe],
      function (err) {
      if (err) {
          next(err); //send the error on to the error handler
      } else {
          res.json({ message: "Data inserted successfully!", taskId: this.lastID });
          next();
      }
      }
  );
});

router.post('/saveProfileImage', (req, res, next) => {
  const { imageName, userId } = req.body;
  // Check if the user already has an entry in UsersProfile
  db.get(`SELECT COUNT(*) AS count FROM UsersProfile WHERE user_id = ?`, [userId], (err, row) => {
    if (err) {
      return next(err);
    }

    const userExists = row.count > 0;
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
  const selectedIds = req.body.selectedIds;

  // Validate input
  if (!taskId || !userIdFrom || !selectedIds || !Array.isArray(selectedIds)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    // Check for existing shares
    global.db.all(
      `SELECT user_id_to FROM SharedTasks
       WHERE task_id = ? AND user_id_from = ? AND user_id_to IN (${selectedIds.map(() => '?').join(', ')})`,
      [taskId, userIdFrom, ...selectedIds],
      (err, rows) => {
        if (err) {
          return next(err); // Send the error to the error handler
        }

        const existingUserIds = rows.map(row => row.user_id_to);
        const newShares = selectedIds.filter(userIdTo => !existingUserIds.includes(userIdTo));

        if (newShares.length === 0) {
          return res.json({ message: "Task already shared with all selected users." });
        }

        // Insert new shares directly
        newShares.forEach(userIdTo => {
          global.db.run(
            `INSERT INTO SharedTasks (task_id, user_id_from, user_id_to, shared_at)
             VALUES (?, ?, ?, ?)`,
            [taskId, userIdFrom, userIdTo, new Date().toISOString()],
            function (err) {
              if (err) {
                return next(err); // Send the error to the error handler
              }
            }
          );
        });
        res.json({ message: "Task shared successfully!" });
      }
    );
  } catch (error) {
    next(error);
  }
});


router.post('/shareTasks', async (req, res, next) => {
  const taskId = req.body.taskId;
  const userIdFrom = req.body.userIdFrom;
  const selectedIds = req.body.getUserId;

  // Validate input
  if (!taskId || !userIdFrom || !selectedIds) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    // Check for existing shares
    global.db.all(
      `SELECT id FROM SharedTasks
       WHERE task_id = ? AND user_id_from = ? AND user_id_to = ?`,
      [taskId, userIdFrom, selectedIds],
      (err, rows) => {
        if (err) {
          return next(err); // Send the error to the error handler
        }
        const existingUserIds = rows.map(row => row.id);

        if (existingUserIds.length >  0) {
          return res.json({ message: "Task already shared with selected user." });
        }

        // Insert new share directly
          global.db.run(
            `INSERT INTO SharedTasks (task_id, user_id_from, user_id_to, shared_at)
             VALUES (?, ?, ?, ?)`,
            [taskId, userIdFrom, selectedIds, new Date().toISOString()],
            function (err) {
              if (err) {
                return next(err); // Send the error to the error handler
              }
              else{
                res.json({ message: "Task shared successfully!" });
              }
            }
          );
        
        
      }
    );
  } catch (error) {
    next(error);
  }
});


router.post('/notes', (req, res, next) => {
  const { user_id, note_text, attachment,task_id } = req.body;
  if (!user_id || !note_text) {
    return res.status(400).send('Missing user_id or note_text');
  }
  global.db.run(
    `INSERT INTO Notes (user_id, note_text, attachment, task_id) VALUES (?, ?, ?, ?)`,
    [user_id, note_text, attachment, task_id],
    function (err) {
      if (err) {
        return next(err);
      }
      res.status(201).json({ id: this.lastID, user_id, note_text, created_at: new Date() });
    }
  );
});

router.post('/updateUserProfile', (req, res, next) => {
  const { userId, name, email } = req.body;
  if (!userId || !name || !email) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Check if the user exists in the Users table
  db.get(`SELECT COUNT(*) AS count FROM Users WHERE id = ?`, [userId], (err, row) => {
    if (err) {
      return next(err);
    }

    const userExists = row.count > 0;

    if (userExists) {
      // Update the existing user profile
      db.run(`UPDATE Users SET name = ?, email = ? WHERE id = ?`, [name, email, userId], function(err) {
        if (err) {
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
  const { title, description, priority, timeframe, type, dueDate } = req.body;

  global.db.run(
    `UPDATE Tasks SET title = ?, description = ?, priority = ?, timeframe = ?, type = ?, due_date = ? WHERE id = ?`,
    [title, description, priority, timeframe, type, dueDate, taskId],
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
  const { note_text, attachment, task_id } = req.body;
  global.db.run(
    `UPDATE notes SET note_text = ?, attachment = ?, task_id = ? WHERE id = ?`,
    [note_text, attachment, task_id, id],
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

router.delete('/sharedtasks/:taskId/:userIdTo', (req, res, next) => {
  const { taskId, userIdTo } = req.params;

  global.db.run(
    `DELETE FROM SharedTasks WHERE task_id = ? AND user_id_to = ?`,
    [taskId, userIdTo],
    function (err) {
      if (err) {
        return next(err); // Pass the error to the next middleware
      }
      if (this.changes === 0) {
        return res.status(404).send('Task or user not found');
      }
      res.status(200).send('User removed from task successfully');
    }
  );
});


module.exports = router;