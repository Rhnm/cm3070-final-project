/**
 * Console logs specifically retained to evaluate the AI training data
 */
// Import necessary libraries
const tf = require('@tensorflow/tfjs'); // TensorFlow.js for model definition and training
const tfs = require('@tensorflow/tfjs-node'); // TensorFlow.js for Node.js
const xlsx = require('xlsx'); // Library to read Excel files
const fs = require('fs'); // Node.js file system module
const path = require('path'); // Node.js path module
const { natural, WordTokenizer } = require('natural'); // Natural language processing library
const TfIdf = require('node-tfidf'); // Library for computing TF-IDF

// Function to preprocess text data (e.g., convert text to vector form)
function preprocessText(text, tfidf, terms) {
    // Initialize the tokenizer and tokenize the text (convert to lowercase)
    const tokenizer = new WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());

    // Create an object to hold token frequencies
    const tokenFreqs = {};
    tokens.forEach(token => tokenFreqs[token] = (tokenFreqs[token] || 0) + 1);

    // Create a vector based on the frequency of each term in the terms list
    const inputVector = terms.map(term => tokenFreqs[term] || 0);
    return inputVector;
}

async function trainModel() {
    // Read Excel data
    const workbook = xlsx.readFile('./excel_data/tma_td.xlsx'); // Load the workbook
    const sheetName = workbook.SheetNames[0]; // Get the first sheet name
    const worksheet = workbook.Sheets[sheetName]; // Get the worksheet
    const data = xlsx.utils.sheet_to_json(worksheet); // Convert the worksheet to JSON

    // Initialize TF-IDF and tokenizer
    const terms = [];
    const tfidf = new TfIdf();
    const tokenizer = new WordTokenizer();

    // Process each row in the data
    data.forEach((row, index) => {
        const tokens = tokenizer.tokenize(row.description.toLowerCase()); // Tokenize the description
        tfidf.addDocument(tokens); // Add tokens to TF-IDF
        terms.push(...tokens); // Add tokens to terms list
    });

    console.log("terms length: ", terms.length);

    // Save terms to a JSON file for future use
    fs.writeFileSync('./tfidfTerms/tfidf_terms.json', JSON.stringify(terms));

    // Define the TensorFlow.js model
    const model = tfs.sequential();
    model.add(tfs.layers.dense({ units: 128, inputShape: [terms.length], activation: 'relu' })); // Input layer
    model.add(tfs.layers.dense({ units: 64, activation: 'relu' })); // Hidden layer
    model.add(tfs.layers.dense({ units: 1, activation: 'sigmoid' })); // Output layer

    // Compile the model with optimizer, loss function, and metrics
    model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

    // Preprocess the data
    const features = data.map(row => preprocessText(row.description, tfidf, terms));
    const labels = data.map(row => row.priority === 'High' ? 1 : (row.priority === 'Medium' ? 0.5 : 0));

    // Convert features and labels to TensorFlow tensors
    const X = tfs.tensor2d(features);
    const y = tfs.tensor1d(labels);

    // Train the model
    const history = await model.fit(X, y, { epochs: 10, batchSize: 32, validationSplit: 0.2 });

    // Save the trained model to the file system
    await model.save('file://./model');
    console.log('Model training complete and saved to ./model');

    // Split the dataset into training and testing sets
    const splitIndex = Math.floor(0.8 * features.length);
    const trainFeatures = features.slice(0, splitIndex);
    const trainLabels = labels.slice(0, splitIndex);
    const testFeatures = features.slice(splitIndex);
    const testLabels = labels.slice(splitIndex);

    // Convert training and testing data to tensors
    const X_train = tfs.tensor2d(trainFeatures);
    const y_train = tfs.tensor1d(trainLabels);
    const X_test = tfs.tensor2d(testFeatures);
    const y_test = tfs.tensor1d(testLabels);

    // Evaluate the model
    const evaluation = model.evaluate(X_test, y_test, { batchSize: 32 });
    const accuracy = evaluation[1].dataSync()[0]; // Extract accuracy from the evaluation result

    // Make predictions and calculate precision, recall, and F1 score
    const predictions = model.predict(X_test).round();
    const precision = tf.metrics.precision(y_test, predictions).dataSync()[0];
    const recall = tfs.metrics.recall(y_test, predictions).dataSync()[0];
    const f1Score = 2 * (precision * recall) / (precision + recall);

    // Print evaluation metrics
    console.log("==================Evaluation Metrics=========================");
    console.log(`Accuracy: ${accuracy}`);
    console.log(`Precision: ${precision}`);
    console.log(`Recall: ${recall}`);
    console.log(`F1 Score: ${f1Score}`);
    console.log("=============================================================")

    return history; // Return the training history
}

// Export the trainModel function as a module
module.exports = trainModel;
