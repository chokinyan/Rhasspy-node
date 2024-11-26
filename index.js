/**
 * WebSocket client for handling intents and controlling a Matrix device.
 * 
 * @requires ws
 * @requires @matrix-io/matrix-lite
 * @requires http
 */

const WebSocket = require("ws");
const matrix = require("@matrix-io/matrix-lite");
const https = require("http");
const { hostname } = require("os");

const ws = new WebSocket("ws://localhost:12101/api/events/intent");

/**
 * Handles WebSocket connection open event.
 */
ws.on("open", function open() {
  console.log("\n**Connected**\n");
});

/**
 * Handles WebSocket connection close event.
 */
ws.on("close", function close() {
  console.log("\n**Disconnected**\n");
});

/**
 * Handles incoming WebSocket messages (intents).
 * 
 * @param {string} data - The incoming message data.
 */
ws.on("message", function incoming(data) {
  data = JSON.parse(data);

  console.log("**Captured New Intent**");
  console.log(data);

  if ("Allumer" === data.intent.name) {
    if (data.slots["couleur"] === "rouge") matrix.led.set('red');
    if (data.slots["couleur"] === "vert") matrix.led.set('green');
    if (data.slots["couleur"] === "bleu") matrix.led.set('blue');
    if (data.slots["couleur"] === "noir") matrix.led.set('black');
    say("Lumière allumée en : " + data.slots["couleur"]);
  }

  if ("Eteindre" === data.intent.name) {
    matrix.led.set('black');
    say("Lumière éteinte");
  }

  if ("LedOn" === data.intent.name) {
    matrix.gpio.setFunction(1, 'DIGITAL');
    matrix.gpio.setMode(1, 'output');
    matrix.gpio.setDigital(1, 'ON');
  }

  if ("LedOff" === data.intent.name) {
    matrix.gpio.setFunction(1, 'DIGITAL');
    matrix.gpio.setMode(1, 'output');
    matrix.gpio.setDigital(1, 'OFF');
  }

  if ("Mouvement" === data.intent.name) {
    mouvement(data.text); //
  };

  if("Humeur" === data.intent.name) {
    if(data.raw_text.includes("pas")) say("Je vais bien comparé a vous lul");
    else{
      say("Je vais bien merci, et vous ?");
    }
  }


  
});

/**
 * Sends a text-to-speech request.
 * 
 * @param {string} text - The text to be converted to speech.
 */
function say(text) {
  const options = {
    hostname: "localhost",
    port: 12101,
    path: "/api/text-to-speech",
    method: "POST"
  };

  const req = https.request(options);

  req.on("error", error => {
    console.error(error);
  });

  req.write(text);
  req.end();
}

/**
 * Sends a movement request.
 * 
 * @param {string} typeMovement - The type of movement to be performed.
 */
function mouvement(typeMovement) {
  const options = {
    hostname : "192.168.1.101",
    path : `/${typeMovement}`,
    methode : "GET"
  };

  const req = https.request(options);

  req.on("error", error => {
    console.error(error);
  });


  req.on("response", response => {
    console.log(response);
  });
  
  req.end();
}