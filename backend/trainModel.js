// trainModel.js
//const tf = require('@tensorflow/tfjs');
const tf = require('@tensorflow/tfjs-node');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

async function trainModel() {
    // Read Excel data
    const workbook = xlsx.readFile('./tma_td.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Preprocess the data
    const features = data.map(row => [
        row.priority === 'High' ? 1 : (row.priority === 'Medium' ? 0.5 : 0),
        // Add preprocessing for other features
    ]);

    const labels = data.map(row => row.status === 'Completed' ? 1 : 0);

    // Convert features and labels to TensorFlow tensors
    const X = tf.tensor2d(features);
    const y = tf.tensor1d(labels);

    // Define and train the TensorFlow.js model
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [features[0].length] }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

    //return model.fit(X, y, { epochs: 10, batchSize: 32, validationSplit: 0.2 });
    // Train the model
    const history = await model.fit(X, y, { epochs: 10, batchSize: 32, validationSplit: 0.2 });

    //await model.save('file://./model');

    return history;
}

module.exports = trainModel;
