const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/upload', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]), (req, res) => {
  const audioPath = req.files.audio[0].path;
  const imagePath = req.files.image[0].path;
  const outputPath = `processed/podcast_video.mp4`;

  ffmpeg()
    .addInput(imagePath)
    .loop()
    .inputFPS(1)
    .addInput(audioPath)
    .audioCodec('copy')
    .videoCodec('libx264')
    .outputOptions('-shortest')
    .output(outputPath)
    .on('end', () => res.download(outputPath))
    .run();
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
