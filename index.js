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
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const ws = require('ws');


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

  if("jojo" === data.intent.name){
    playSound(path.join(__dirname, "awaken.wav"));
  };

  if("rick" === data.intent.name){
    say("D'accord je vais vous chanté ma chanson préféré").then(() => {
      playSound(path.join(__dirname, "rick.wav"));
    })
    .catch(error => {
      console.error(error);
    });
  };

  if("pays" === data.intent.name){
    switch(data.text){
      case "France":
        say("La France est un pays d'Europe de l'Ouest");
        break;
      case "chinois":
        say("L'Italie est un pays d'Europe du Sud");
        break;
      case "état Unis":
        playSound(path.join(__dirname, "AMERICA.wav"));
        break;
      case "Allemagne":
        say("L'Allemagne est un pays d'Europe centrale");
        break;
      case "Angleterre":
        say("L'Angleterre est un pays d'Europe du Nord-Ouest");
        break;
      case "Russie":
        say("La Russie est un pays d'Europe de l'Est");
        break;
      case "Chine":
        playSound(path.join(__dirname, "chintoc.wav"));
        break;
      case "japon":
        playSound(path.join(__dirname,"arigato.wav"));
        break;
      case "Inde":
        say("L'Inde est un pays d'Asie du Sud");
        break;
      case "Australie":
        say("L'Australie est un pays d'Océanie");
        break;
      case "Canada":
        say("Le Canada est un pays d'Amérique du Nord");
        break;
      case "Brésil":
        say("Le Brésil est un pays d'Amérique du Sud");
        break;
      case "États-Unis":
        say("Les États-Unis sont un pays d'Amérique du Nord");
        break;
      default:
        say("Je ne connais pas ce pays");
    }
  }
  
  if("youtubeur" == data.intent.name){
    switch(data.text){
      case "normann":
        playSound(path.join(__dirname, "police.wav"));
        break;
      case "ze kaille ri":
        playSound(path.join(__dirname, "police.wav"));
        break;
      case "scouizi":
        playSound(path.join(__dirname, "squizzi.wav"));
        break;
    }
  }
  
});

/**
 * Sends a text-to-speech request.
 * 
 * @param {string} text - The text to be converted to speech.
 */

function say(text) {
  return new Promise((resolve, rejects) => {
    const options = {
      hostname: "localhost",
      port: 12101,
      path: "/api/text-to-speech",
      method: "POST"
    };

    const req = https.request(options);

    req.on("error", error => {
      rejects(error);
    });

    req.write(text);
    req.end();
    resolve();
  });
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
    method : "GET"
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

function playSound(sound) {
  exec(`curl -X POST "localhost:12101/api/play-wav" -H "Content-Type: audio/wav" --data-binary @"${sound}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(`Stdout: ${stdout}`);
  });
}