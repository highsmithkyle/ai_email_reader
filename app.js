const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/upload', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No audio file uploaded.');
    }

    // Include a timestamp in the output filename to ensure uniqueness
    const timestamp = Date.now();
    const audioPath = req.file.path;
    const imagePath = 'public/images/audioplayer.png';
    const gifPath = 'public/images/sound_transparent.gif';
    const outputPath = `processed/audio_with_image_${timestamp}.mp4`;

    const ffmpegCommand = `ffmpeg -loop 1 -i "${imagePath}" -ignore_loop 0 -i "${gifPath}" -i "${audioPath}" -filter_complex "[1:v]scale=40:40[gif];[0:v][gif]overlay=350:30" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${outputPath}"`;

    exec(ffmpegCommand, (error) => {
        if (error) {
           
            console.error(`Exec Error: ${error}`);
            return res.status(500).send('Error processing audio.');
        }
        res.download(outputPath, (err) => {
            if (err) {
                console.error('Download Error:', err);
                return res.status(500).send('Error sending file.');
            }
        });
    });
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
