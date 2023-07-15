const express = require("express");
const router = express.Router();
const {
  inboundCall,
  recordVoicemail,
  recordingStatus,
  message,
  getRecording,
} = require("../controllers/twilio");

router.get("/", (req, res) => {
  res.send('App deployed on Heroku !!!);
});
router.post("/voice", inboundCall);
router.post("/record", recordVoicemail);
router.post("/recording-status", recordingStatus);
router.post("/incoming-message", message);
router.get("/latest-recording", getRecording);

module.exports = router;
