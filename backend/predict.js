const tf = require('@tensorflow/tfjs-node'); // Import TensorFlow.js for Node.js
const { natural, WordTokenizer } = require('natural'); // Import natural language processing library
const TfIdf = require('node-tfidf'); // Import TF-IDF library
const fs = require('fs'); // Import file system module

// Function to preprocess text data (e.g., convert text to vector form)
function preprocessText(text, tfidf, terms) {
    const tokenizer = new WordTokenizer(); // Initialize the tokenizer
    const tokens = tokenizer.tokenize(text.toLowerCase()); // Tokenize the text and convert to lowercase
    const tokenFreqs = {}; // Initialize an object to hold token frequencies

    // Count the frequency of each token
    tokens.forEach(token => tokenFreqs[token] = (tokenFreqs[token] || 0) + 1);

    // Create a vector based on the frequency of each term in the terms list
    const inputVector = terms.map(term => tokenFreqs[term] || 0);
    return inputVector;
}

// Function to predict task priority based on a description
async function predictTaskPriority(description) {
    const model = await tf.loadLayersModel('file://./model/model.json'); // Load the pre-trained model

    console.log("Model Summary: ");
    model.summary(); // Print the model summary for debugging

    // Print out the model's input shape for debugging
    console.log("Model Input Shape:", model.inputs[0].shape);

    const terms = JSON.parse(fs.readFileSync('./tfidf_terms.json')); // Read the terms from a JSON file
    const tfidf = new TfIdf(); // Initialize the TF-IDF object
    tfidf.addDocument(description); // Add the document to the TF-IDF object
    const inputVector = preprocessText(description, tfidf, terms); // Preprocess the text to get the input vector
    const maxLength = terms.length; // Get the input shape from the model

    // Print input vector and model input length for debugging
    console.log("Input Vector Length:", inputVector.length);
    console.log("Max Length from Model:", maxLength);

    // Pad the input vector to match the model's input length
    let paddedInputVector = inputVector.length < maxLength ? 
        [...inputVector, ...Array(maxLength - inputVector.length).fill(0)] :
        inputVector.slice(0, maxLength);

    const input = tf.tensor2d([paddedInputVector]); // Convert the input vector to a 2D tensor
    const prediction = model.predict(input); // Make a prediction using the model
    const predictedValue = (await prediction.array())[0][0]; // Extract the predicted value
    console.log("predicted value: ", predictedValue);

    // Determine the task priority based on the predicted value
    return predictedValue >= 0.55 ? 'High' : (predictedValue >= 0.5 ? 'Medium' : 'Low');
}

module.exports = predictTaskPriority; // Export the predictTaskPriority function
