
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

app.get("/", (req, res) => {
  res.send("Voice Studio server is running");
});

app.post("/convert", upload.single("audio"), async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key is missing" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    const voiceId = "EXAVITQu4vr4xnSDxMaL";
    const form = new FormData();

    form.append(
      "audio",
      new Blob([req.file.buffer], { type: req.file.mimetype }),
      req.file.originalname
    );

    form.append("model_id", "eleven_multilingual_sts_v2");

    const response = await fetch(
      `https://api.elevenlabs.io/v1/speech-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: { "xi-api-key": apiKey },
        body: form
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).send(error);
    }

    const audio = Buffer.from(await response.arrayBuffer());

    res.set("Content-Type", "audio/mpeg");
    res.send(audio);

  } catch (error) {
    res.status(500).json({ error: "Conversion failed" });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
