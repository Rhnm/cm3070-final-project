/**
 * These are example routes for user management
 * This shows how to correctly structure your routes for the project
 */

const express = require("express");
const router = express.Router();
const assert = require('assert');

router.get("/", (req, res, next) => {
  res.render('index');
})


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