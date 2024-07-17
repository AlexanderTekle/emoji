import React, { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import WebcamCapture from './WebcamCapture';

const HandGestureRecognition = () => {
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const classLabels = ['Thumbs Up', 'Open palm', 'Closed fist', 'Peace sign', 'Pointing finger']; // Replace with your actual class labels

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadGraphModel(process.env.PUBLIC_URL + '/tensorflow2/model.json');
        setModel(loadedModel);
      } catch (error) {
        console.error('Failed to load model:', error);
        console.error('Error details:', error.message);
      }
    };
    loadModel();
  }, []);

  const preprocessImage = (imageTensor) => {
    return tf.tidy(() => {
      // Resize
      const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
      
      // Scale from 0-255 to 0-1
      const scaled = resized.div(255);
      
      // Normalize
      const mean = tf.tensor([0.485, 0.456, 0.406]);
      const std = tf.tensor([0.229, 0.224, 0.225]);
      const normalized = scaled.sub(mean).div(std);
      
      // Ensure the tensor is in the format [batch, height, width, channels]
      return normalized.expandDims(0);
    });
  };

  const handleCapture = useCallback(async (imageSrc) => {
    if (model) {
      setIsCapturing(true);
      try {
        const img = new Image();
        img.src = imageSrc;
        await img.decode();

        const tensor = tf.tidy(() => {
          const imgTensor = tf.browser.fromPixels(img);
          return preprocessImage(imgTensor);
        });

        const result = await model.predict(tensor);
        const [label, bbox] = processPrediction(result);
        setPrediction({ label, bbox });
        tensor.dispose();
        Array.isArray(result) ? result.forEach(t => t.dispose()) : result.dispose();
      } catch (error) {
        console.error('Prediction failed:', error);
      } finally {
        setIsCapturing(false);
      }
    }
  }, [model]);

  const processPrediction = (result) => {
    const [classTensor, bboxTensor] = result;
    
    // Process class prediction
    const classProbs = classTensor.dataSync();
    const classIndex = classProbs.indexOf(Math.max(...classProbs));
    console.log(classProbs)
    console.log(classIndex)
    const label = classLabels[classIndex];

    // Process bounding box
    const bboxCoords = bboxTensor.dataSync();
    const bbox = Array.from(bboxCoords).map(coord => coord.toFixed(2));

    return [label, bbox];
  };

  return (
    <div className="hand-gesture-recognition">
      <WebcamCapture onCapture={handleCapture} />
      {isCapturing && <p>Processing...</p>}
      {prediction && (
        <div className="prediction-result">
          <h2>Prediction Result:</h2>
          <p>Gesture: {prediction.label}</p>
          <p>Bounding Box: [x, y, width, height]</p>
          <p>{JSON.stringify(prediction.bbox)}</p>
        </div>
      )}
    </div>
  );
};

export default HandGestureRecognition;