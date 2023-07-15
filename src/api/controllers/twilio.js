const twilio = require("twilio");
const fs = require('fs');
const {
  twilioSid,
  twilioTokken,
  forwaddingNumber,
  ivrNumber,
} = require("../../config");

const client = twilio(twilioSid, twilioTokken);

const gather = (twiml) => {
  const gatherNode = twiml.gather({ numDigits: 1 });
  gatherNode.say(
    "To talk to a sales representative, press 1. To leave a message, press 2."
  );

  twiml.redirect("/voice");
};

const inboundCall = async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  if (req.body.Digits) {
    switch (req.body.Digits) {
      case "1":
        twiml.say("You call is being redirected. Please wait!");
        client.calls
        .create({
           twiml: '<Response><Say>Ahoy there!</Say></Response>',
           to: forwaddingNumber,
           from: ivrNumber
         })
        .then(call => console.log(call.sid));
        break;
      case "2":
        twiml.say("Leave a message at the beep! Press # to end.");
        twiml.record({
          action: "/record",
          method: "POST",
          timeout: 10,
          transcribe: true,
          playBeep: true,
          finishOnKey: "#",
          recordingStatusCallback: "/recording-status",
          recordingStatusCallbackMethod: "POST",
        });

        break;
      default:
        twiml.say("Please select a valid option.");
        twiml.pause();
        gather(twiml);
        break;
    }
  } else {
    // If no input was sent, use the <Gather> verb to collect user input
    gather(twiml);
  }

  // Render the response as XML in reply to the webhook request
  res.type("text/xml");
  res.send(twiml.toString());
};

const recordVoicemail = (req, res) => {
  const { RecordingUrl, From, To, RecordingDuration } = req.body;
  const data = {
    RecordingUrl, From, To, RecordingDuration
  }

  const jsonData = JSON.stringify(data);
  fs.writeFile('recordings.json', jsonData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return;
    }
    
    console.log('Data written to file successfully.');
  });

  res.send({ RecordingUrl, From, To, RecordingDuration });
};

const recordingStatus = (req, res) => {
  const recordingStatus = req.body.RecordingStatus;
  const recordingUrl = req.body.RecordingUrl;
//   console.log(req.body)

  res.send({ recordingUrl, recordingStatus });
};

const message = (req, res) => {
  const incomingMessage = req.body.Body;
  const senderPhoneNumber = req.body.From;

  console.log(`Received message from ${senderPhoneNumber}: ${incomingMessage}`);

  res.status(200).end();
};

const getRecording = (req, res) => {
  fs.readFile("recordings.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading file");
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      res.status(500).send("Error parsing JSON");
    }
  });
};

module.exports = {
  inboundCall,
  recordVoicemail,
  recordingStatus,
  message,
  getRecording
};
