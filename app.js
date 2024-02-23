const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' }); 

app.use(express.static('public')); 

app.post('/upload', upload.single('video'), (req, res) => {
  const tempPath = req.file.path;
  const outputPath = `processed/${Date.now()}_${req.file.originalname}`;

  ffmpeg(tempPath)
    .output(outputPath)
    .on('end', () => {
      console.log(`Processed video saved to ${outputPath}`);
      res.download(outputPath, (err) => {
        if (err) throw err;

       
        fs.unlinkSync(tempPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on('error', (err) => {
      console.error('Error processing video:', err.message);
      res.status(500).send('Error processing video');
    })
    .run();
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
