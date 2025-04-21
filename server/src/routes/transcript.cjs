// First install the AssemblyAI SDK:
// npm install assemblyai

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { AssemblyAI } = require('assemblyai');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Initialize AssemblyAI client with your API key
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_API_KEY, // Store your API key in environment variables
});

// POST route for transcribing audio
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const filePath = req.file.path;
    console.log('Uploaded file:', filePath);
    // Optional transcription parameters from request body
    const options = {
      audio: fs.readFileSync(filePath),
      // You can add additional parameters based on user input
      language_code: req.body.language || 'en_us',
      punctuate: req.body.punctuate !== false,
      format_text: req.body.formatText !== false,
    };

    // Additional optional parameters
    if (req.body.speakerDiarization) {
      options.speaker_labels = true;
    }

    if (req.body.sentimentAnalysis) {
      options.sentiment_analysis = true;
    }

    if (req.body.entityDetection) {
      options.entity_detection = true;
    }

    console.log('Starting transcription...');
    const transcript = await client.transcripts.transcribe(options);
    console.log(transcript);
    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Return the transcription results
    res.status(200).json({
      success: true,
      transcription: transcript
    });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to transcribe audio'
    });
  }
});

module.exports = router;
