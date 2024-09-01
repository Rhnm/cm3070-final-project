// Import necessary libraries
const tf = require('@tensorflow/tfjs'); // TensorFlow.js for model definition and training
const tfs = require('@tensorflow/tfjs-node'); // TensorFlow.js for Node.js
const xlsx = require('xlsx'); // Library to read Excel files
const fs = require('fs'); // Node.js file system module
const path = require('path'); // Node.js path module
const { WordTokenizer } = require('natural'); // Natural language processing library
const TfIdf = require('node-tfidf'); // Library for computing TF-IDF

// Function to preprocess text data (e.g., convert text to vector form)
function preprocessText(text, tfidf, terms) {
    const tokenizer = new WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());
    const tokenFreqs = {};
    tokens.forEach(token => tokenFreqs[token] = (tokenFreqs[token] || 0) + 1);
    const inputVector = terms.map(term => tokenFreqs[term] || 0);
    return inputVector;
}

// Function to convert timeframe to minutes
function convertTimeframeToMinutes(timeframe, timeunit) {
    const value = parseFloat(timeframe);
    switch (timeunit.toLowerCase()) {
        case 'hour':
            return value * 60; // Convert hours to minutes
        case 'min':
            return value; // Minutes remain the same
        case 'sec':
            return value / 60; // Convert seconds to minutes
        default:
            throw new Error(`Time unit '${timeunit}' is not recognized`);
    }
}

async function trainTimeframeModel() {
    // Read Excel data
    const workbook = xlsx.readFile('./excel_data/tf_tma_td.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Initialize TF-IDF and tokenizer
    const terms = [];
    const tfidf = new TfIdf();
    const tokenizer = new WordTokenizer();

    data.forEach((row) => {
        const tokens = tokenizer.tokenize(row.description.toLowerCase());
        tfidf.addDocument(tokens);
        terms.push(...tokens);
    });

    // Remove duplicate terms
    const uniqueTerms = [...new Set(terms)];
    console.log("Terms length: ", uniqueTerms.length);
    fs.writeFileSync('./tfidfTerms/tfidf_terms_timeframe.json', JSON.stringify(uniqueTerms));

    // Define the TensorFlow.js model
    const model = tfs.sequential();
    model.add(tfs.layers.dense({ units: 128, inputShape: [uniqueTerms.length], activation: 'relu' }));
    model.add(tfs.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tfs.layers.dense({ units: 1, activation: 'linear' }));

    model.compile({ optimizer: 'adam', loss: 'meanSquaredError', metrics: ['mae'] });

    // Preprocess the data
    const features = data.map(row => preprocessText(row.description, tfidf, uniqueTerms));
    //const labels = data.map(row => convertTimeframeToMinutes(row.timeframe, row.timeunits)); // Convert timeframe to minutes
    const labels = data.map(row => row.timeframe);

    // Normalize labels to be between 0 and 1
    const maxLabel = Math.max(...labels);
    const normalizedLabels = labels.map(label => label / maxLabel);
    
    // Ensure that features and labels are numeric tensors
    const X = tfs.tensor2d(features, [features.length, uniqueTerms.length]);
    //const y = tfs.tensor1d(labels);
    const y = tfs.tensor1d(normalizedLabels);

    const history = await model.fit(X, y, { epochs: 10, batchSize: 32, validationSplit: 0.2 });

    await model.save('file://./model_timeframe');
    console.log('Model training complete and saved to ./model_timeframe');

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
    const loss = evaluation[0].dataSync()[0]; // Extract loss from the evaluation result
    const mae = evaluation[1].dataSync()[0]; // Extract mean absolute error (MAE)

    // Print evaluation metrics
    console.log("==================Evaluation Metrics=========================");
    console.log(`Loss (MSE): ${loss}`);
    console.log(`Mean Absolute Error (MAE): ${mae}`);
    console.log("=============================================================");

    return history;
}

module.exports = trainTimeframeModel;
