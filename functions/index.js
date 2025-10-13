const functions = require("firebase-functions");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const cors = require("cors")({origin: true});

// --- Twilio Configuration ---
const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const fromNumber = functions.config().twilio.from_number;
const toNumber = functions.config().twilio.to_number;

const client = twilio(accountSid, authToken);

// --- Nodemailer (Gmail) Configuration ---
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

exports.handleContactForm = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const {name, email, message} = req.body;

    if (!name || !email || !message) {
      return res.status(400).send("Missing form data.");
    }

    const smsBody = `New Portfolio Message!\n` +
                    `From: ${name}\n` +
                    `Email: ${email}\n` +
                    `Message: ${message}`;

    const smsPromise = client.messages.create({
      body: smsBody,
      from: fromNumber,
      to: toNumber,
    });

    const mailOptions = {
      from: `"${name}" <${gmailEmail}>`,
      to: gmailEmail,
      replyTo: email,
      subject: `New Portfolio Message from ${name}`,
      html: `
        <p>You received a new message from your portfolio form:</p>
        <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
        </ul>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };
    const emailPromise = mailTransport.sendMail(mailOptions);

    Promise.all([smsPromise, emailPromise])
        .then(() => {
          console.log("Successfully sent SMS and Email.");
          return res.status(200).send({
            success: true,
            message: "Message sent!",
          });
        })
        .catch((error) => {
          console.error("Error sending notification:", error);
          return res.status(500)
              .send({success: false, message: "Failed to send."});
        });
  });
});

