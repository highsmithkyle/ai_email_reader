const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'uploads/' }); 

app.use(express.static('public'));

app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const tempPath = req.file.path;
  const outputPath = `processed/${Date.now()}_${req.file.originalname}`;

  ffmpeg(tempPath)
    .output(outputPath)
    .on('end', () => {
      console.log(`Processed video saved to: ${outputPath}`);
      res.download(outputPath, (err) => {
        if (err) {
          console.error('Download Error:', err);
          return res.status(500).send('Error sending file.');
        }

       
        fs.unlink(outputPath, (err) => {
          if (err) console.error('Error deleting processed file:', err);
        });
      });
    })
    .on('error', (err) => {
      console.error('FFmpeg Error:', err);
      
      fs.unlink(tempPath, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
      return res.status(500).send('Error processing video.');
    })
    .run();
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));