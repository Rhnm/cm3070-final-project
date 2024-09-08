/**
 * Console logs specifically retained to evaluate the AI training data
 */
const tf = require('@tensorflow/tfjs-node');
const { natural, WordTokenizer } = require('natural');
const TfIdf = require('node-tfidf');
const fs = require('fs');

function preprocessText(text, tfidf, terms) {
    const tokenizer = new WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());
    const tokenFreqs = {};
    tokens.forEach(token => tokenFreqs[token] = (tokenFreqs[token] || 0) + 1);
    const inputVector = terms.map(term => tokenFreqs[term] || 0);
    return inputVector;
}

async function predictTaskTimeframe(description) {
    const model = await tf.loadLayersModel('file://./model_timeframe/model.json');
    const terms = JSON.parse(fs.readFileSync('./tfidfTerms/tfidf_terms_timeframe.json'));
    const tfidf = new TfIdf();
    tfidf.addDocument(description);
    const inputVector = preprocessText(description, tfidf, terms);
    const maxLength = terms.length;

    let paddedInputVector = inputVector.length < maxLength ? 
        [...inputVector, ...Array(maxLength - inputVector.length).fill(0)] :
        inputVector.slice(0, maxLength);

    const input = tf.tensor2d([paddedInputVector]);
    const prediction = model.predict(input);
    const normalizedPredictedValue = (await prediction.array())[0][0];

    // Denormalize prediction
    const maxLabel = 180; // Assuming 180 minutes as the max duration for normalization
    const predictedValue = normalizedPredictedValue * maxLabel;
    
    console.log("Predicted timeframe:", predictedValue);


    return predictedValue;
}

module.exports = predictTaskTimeframe;
