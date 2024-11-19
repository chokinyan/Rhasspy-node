const WebSocket = require("ws");
const matrix = require("@matrix-io/matrix-lite");
const https = require("http");

const ws = new WebSocket("ws://localhost:12101/api/events/intent");
console.log("**Started Web Socket Client**");

ws.on("open", function open() {
  console.log("\n**Connected**\n");
});

ws.on("close", function close() {
  console.log("\n**Disconnected**\n");
});

// Intents are passed through here
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
    mouvement(data.raw_text);
  };

});

// Text to speech for string argument
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

function mouvement(typeMovement) {
  const options = {
    hostname : "",
    port : 0,
    path : "",
    methode : ""
  };

  const req = https.request(options);

  req.on("error", error => {
    console.error(error);
  });

  req.write();
  req.end();

}


/*




*/