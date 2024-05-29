// Routes for displaying resources in JSON format
const express = require("express");
const router = express.Router();
const assert = require('assert');
const moment = require('moment');
const now = moment();
const formattedDatetime = now.format('YYYY-MM-DD HH:mm:ss'); // Example: "2023-08-22 10:30:00"

/////*****  GET REQUESTS ******//////////// */

  // Products Table
router.get("/products", (req, res, next) => {

  global.db.all("SELECT * FROM Products", function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      // res.json(rows[1].title);
      res.json(rows);
    }
  });
  
});

router.get("/products/:id", (req, res, next) => {

  global.db.all( `SELECT * FROM Products WHERE product_id == ${req.params.id};`, function (err, rows) {
      
      if (err) {
      next(err); //send the error on to the error handler
      
      } else {
      // res.json(rows[1].title);
      res.json(rows);
      }
  });

});

// Categories table

router.get("/categories", (req, res, next) => {

  global.db.all("SELECT * FROM Category", function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      // res.json(rows[1].title);
      res.json(rows);
    }
  });
  
});

router.get("/categories/:id", (req, res, next) => {

    global.db.all( `SELECT * FROM Category WHERE category_id == ${req.params.id};`, function (err, rows) {
        
        if (err) {
        next(err); //send the error on to the error handler
        
        } else {
        // res.json(rows[1].title);
        res.json(rows);
        }
    });

});

// Users table

router.get("/users", (req, res, next) => {

  global.db.all("SELECT * FROM Users", function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      // res.json(rows[1].title);
      res.json(rows);
    }
  });
  
});

router.get("/users/:id", (req, res, next) => {

    global.db.all( `SELECT * FROM Users WHERE user_id == ${req.params.id};`, function (err, rows) {
        
        if (err) {
        next(err); //send the error on to the error handler
        
        } else {
        // res.json(rows[1].title);
        res.json(rows);
        }
    });

});


// Orders table

router.get("/orders", (req, res, next) => {

  global.db.all("SELECT * FROM Orders", function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      // res.json(rows[1].title);
      res.json(rows);
    }
  });
  
});

router.get("/orders/:id", (req, res, next) => {

    global.db.all( `SELECT * FROM Orders WHERE order_id == ${req.params.id};`, function (err, rows) {
        
        if (err) {
        next(err); //send the error on to the error handler
        
        } else {
        // res.json(rows[1].title);
        res.json(rows);
        }
    });

});

// Orders table

router.get("/payments", (req, res, next) => {

  global.db.all("SELECT * FROM Payments", function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      // res.json(rows[1].title);
      res.json(rows);
    }
  });
  
});

router.get("/payments/:id", (req, res, next) => {

    global.db.all( `SELECT * FROM Payments WHERE payment_id == ${req.params.id};`, function (err, rows) {
        
        if (err) {
        next(err); //send the error on to the error handler
        
        } else {
        // res.json(rows[1].title);
        res.json(rows);
        }
    });

});

// JOINT TABLES

router.get("/order-product", (req, res, next) => {

  global.db.all("SELECT * FROM Order_Product", function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      // res.json(rows[1].title);
      res.json(rows);
    }
  });
  
});

router.get("/order-user", (req, res, next) => {

  global.db.all("SELECT * FROM Order_User", function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      // res.json(rows[1].title);
      res.json(rows);
    }
  });
  
});



router.get("/order-payment", (req, res, next) => {

  global.db.all("SELECT * FROM Order_Payment", function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      // res.json(rows[1].title);
      res.json(rows);
    }
  });
  
});


router.get("/cart/:id", (req, res, next) => {
  global.db.all(`SELECT Orders.order_id, Products.product_id, Products.title, Products.price FROM Orders INNER JOIN Order_User ON Orders.order_id = Order_User.order_id INNER JOIN Order_Product ON Orders.order_id = Order_Product.order_id INNER JOIN Products ON Order_Product.product_id = Products.product_id  WHERE Orders.status ='INCART' and Order_User.user_id = ${req.params.id};`, function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      // res.json(rows[1].title);
      res.json(rows);
      next();
    }
  });
  
});

router.get("/clearorder/:id", (req, res, next) => {
  const userid = req.params.id;
  global.db.all("SELECT count(order_id) FROM Order_User where user_id = ?;", [req.params.id],function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      // Check if the rows array has at least one result
      if (rows.length > 0) {
        const countValue = rows[0]['count(order_id)']; // Get the value of 'count' from the first row
        
        for(var i = 0; i<countValue;i++){
    
          global.db.run(
            "UPDATE Orders SET status = 'BOUGHT' WHERE order_id IN (SELECT o.order_id FROM Orders o INNER JOIN Order_User ou ON o.order_id = ou.order_id WHERE ou.user_id = ? AND o.status = 'INCART');",
            [req.params.id],
            function (err) {
            if (err) {
                next(err); //send the error on to the error handler
            } else {
                //
                //
                //res.send(`Modification done in  ${userid}!`);
                //next();
            }
            }
          );
        }
        //res.json({ count: countValue }); // Send the value in the response
      } else {
        //
        //res.json({ count: 0 }); // If no result found, send a default value

      }
      res.send(`Modification done in  ${userid}!`);
      next();
    }
  });
 
  
  
  
});





/////*****  POST ******//////////// */

// Inserting an order

  // Step 1 insert the price


router.post("/contact", (req, res, next) => {

  global.db.run(
      "INSERT INTO contact (name, email, sub, msg, created_on) VALUES(?, ?, ?, ?, ?);",
      [req.body.name, req.body.email, req.body.sub, req.body.msg, formattedDatetime],
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

router.post("/orders", (req, res, next) => {
    const status = "INCART";

    global.db.run(
        "INSERT INTO Orders (description, likes, status) VALUES(?, ?, ?);",
        [req.body.product_title, 0 , status],
        function (err) {
          if (err) {
              next(err); //send the error on to the error handler
          } else {
              //res.send(`New data inserted !`);
              //next();
              
          }
        }
    );
    var last_order_id = "";
      global.db.get("SELECT order_id AS lastId FROM Orders ORDER BY order_id DESC LIMIT 1", function (err, rows) {
        //
        if (err) {
          next(err); //send the error on to the error handler
          //
        } else {
          // res.json(rows[1].title);
          //res.json(rows);
          last_order_id = rows.lastId;
          //
          global.db.run(
            "INSERT INTO Order_Product (order_id, product_id) VALUES(?, ?);",
            [last_order_id, req.body.product_id],
            function (err) {
            if (err) {
                next(err); //send the error on to the error handler
            } else {
                //res.send(`New data inserted !`);
                //
                global.db.run(
                  "INSERT INTO Order_User (order_id, user_id) VALUES(?, ?);",
                  [last_order_id, req.body.user_id],
                  function (err) {
                  if (err) {
                      next(err); //send the error on to the error handler
                  } else {
                      //res.send(`New data inserted !`);
                      //
                      res.send("New order Id with product Id inserted");
                      //next();
                  }
                  }
                );
                //next();
                //res.send("New order Id with product Id inserted");
            }
            }
          );
          
        }
      });
    
    
});

 // Step 2 specify the product to which the order applies

 router.post("/orders-product", (req, res, next) => {

  global.db.run(
      "INSERT INTO Order_Product (order_id, product_id) VALUES(?, ?);",
      [req.body.order_id, req.body.product_id],
      function (err) {
      if (err) {
          next(err); //send the error on to the error handler
      } else {
          res.send(`New data inserted !`);
          next();
      }
      }
  );
});

// Specify the user that does the order

router.post("/orders-user", (req, res, next) => {

  global.db.run(
      "INSERT INTO Order_User (order_id, user_id) VALUES(?, ?);",
      [req.body.order_id, req.body.user_id],
      function (err) {
      if (err) {
          next(err); //send the error on to the error handler
      } else {
          res.send(`New data inserted !`);
          next();
      }
      }
  );
});



// Inserting a payment

 // step 1 insert payment value

 router.post("/payments", (req, res, next) => {
  var userid = req.body.user_id;
  var price = req.body.price;
  var status = "PROCESSING";
  global.db.run(
      "INSERT INTO Payments (value, status) VALUES (?, ?);",
      [price, status],
      function (err) {
        if (err) {
            next(err); //send the error on to the error handler
        } else {
            
            //res.send("New Payment data inserted");
            //next();
        }
      }
  );
  var last_payment_id = "";
  global.db.get("SELECT payment_id AS lastpId FROM Payments ORDER BY payment_id DESC LIMIT 1", function (err, rows) {
    //
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
        // res.json(rows[1].title);
        //res.json(rows);
        last_payment_id = rows.lastpId;
        //
        
        global.db.run(
          "INSERT INTO cart (payment_id, user_id) VALUES (?, ?);",
          [last_payment_id,userid],
          function (err) {
            if (err) {
                next(err); //send the error on to the error handler
            } else {
                //
                res.send("New Order_payment data inserted !");
                //next();
            }
          }
        );
        //next();
      }
      
  });
      
});


router.post("/search", (req, res, next) => {
  var text = req.body.search;
  global.db.all(`SELECT * FROM Products WHERE title like ? or genres like ? or publishers like ? or console like ?`,[`%${text}%`,`%${text}%`,`%${text}%`,`%${text}%`], function (err, rows) {
    
    if (err) {
      next(err); //send the error on to the error handler
      
    } else {
      res.send(rows);
      next();
    }
  });
  
});


router.delete("/ordersdelete", (req, res, next) => {
  var order_id = req.body.order_id;
  
  global.db.run(
    "DELETE FROM Orders WHERE order_id=?;",
    [order_id],
    function (err) {
      if (err) {
          next(err); //send the error on to the error handler
      } else {
        
        global.db.run(
          "DELETE FROM Order_Product WHERE order_id=?;",
          [order_id],
          function (err) {
            if (err) {
                next(err); //send the error on to the error handler
            } else {
              
              global.db.run(
                "DELETE FROM Order_User WHERE order_id=?;",
                [order_id],
                function (err) {
                if (err) {
                    next(err); //send the error on to the error handler
                } else {
                    res.send("Deleted Orders User table");
                    next();
                }
                }
              );
            }
          }
        );
      }
    }
  );
});

  // step 2 specify corresponding order

  router.post("/payment-order", (req, res, next) => {

    global.db.run(
        "INSERT INTO Order_payment (order_id, payment_id) VALUES (1, 1)",
        [req.body.value, req.body.status],
        function (err) {
        if (err) {
            next(err); //send the error on to the error handler
        } else {
            res.send(`New data inserted !`);
            next();
        }
        }
    );
  });




// change an order
  
router.put("/orders/:id", (req, res, next) => {

    global.db.run(
        "UPDATE orders SET description=?, likes=?, status=? WHERE articles_id=?;",
        [req.body.description, req.body.likes, req.body.status],
        function (err) {
        if (err) {
            next(err); //send the error on to the error handler
        } else {
            res.send(`Modification done in  ${req.params.id}!`);
            next();
        }
        }
    );
});


// delete order
router.delete("/orders/:id", (req, res, next) => {
    global.db.run(
        "DELETE FROM Articles WHERE orders_id=?;",
        [req.params.id],
        function (err) {
        if (err) {
            next(err); //send the error on to the error handler
        } else {
            res.send(`New data inserted @ id ${req.params.id}!`);
            next();
        }
        }
    );
});

// delete order



///////////////////////////////////////////// HELPERS ///////////////////////////////////////////

/**
 * @desc A helper function to generate a random string
 * @returns a random lorem ipsum string
 */
function generateRandomData(numWords = 5) {
    const str =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";
  
    const words = str.split(" ");
  
    let output = "";
  
    for (let i = 0; i < numWords; i++) {
      output += choose(words);
      if (i < numWords - 1) {
        output += " ";
      }
    }
  
    return output;
  }
  
  /**
   * @desc choose and return an item from an array
   * @returns the item
   */
  function choose(array) {
    assert(Array.isArray(array), "Not an array");
    const i = Math.floor(Math.random() * array.length);
    return array[i];
  }
  

  module.exports = router;