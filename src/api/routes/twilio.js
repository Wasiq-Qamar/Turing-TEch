const express = require("express");
const router = express.Router();
const {
  inboundCall,
  recordVoicemail,
  recordingStatus,
} = require("../controllers/twilio");

router.post("/voice", inboundCall);
router.post("/record", recordVoicemail);
router.post("/recording-status", recordingStatus);

module.exports = router;
