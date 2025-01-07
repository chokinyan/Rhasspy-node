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

const erws = new WebSocket("ws://192.168.1.48:8100");
const ws = new WebSocket("ws://localhost:12101/api/events/intent");

/**
 * Handles WebSocket connection open event.
 */
ws.on("open", function open() {
  console.log("\n**Connected**\n");
});

erws.on("open",()=>{
  console.log("\n**Connecter a monsieur Chaban**\n");
});

erws.on("close",()=>{
  console.log("\n**Déconnecter de monsieur Chaban**\n");
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

  if("Saber" === data.intent.name){
    if(data.raw_text.includes("heure")){
      let date = new Date();
      say(`Il est actuellement ${date.getHours()}:${date.getMinutes()} et ${date.getSeconds()} seconde et ${date.getMilliseconds()} miliSeconde et on est en l'an ${date.getFullYear()} du mois ${date.getMonth()} et enfin du jour ${date.getDay()} meme si on pourrait dire qu'on est a ${date.getTime()} de plus par rapport au premier janvié 1990`);
    }
    else{
      say("on parle du bts je sais ce que je dois faire");
    }
    visage("Saber");
  }

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

  if("joueur" === data.intent.name) {
    
    if(data.raw_text.includes("pas")) say("Je vais bien comparé a vous lul");
    else{
      say("Je vais bien merci, et vous ?");
    }

    visage("Joueur.gif");
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
        visage("Bienvenue.png");
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

  if("Amoureux" === data.intent.name){
    switch(data.text){
      case "Tu aimes qui":
        say("J'aime personne fuck you");
        break;
      case "Qui est ton proffesseur préféré":
        say("Monsieur Buxeron biensur");
        break;
      case "Qui aimes tu":
        say("toi");
        break;
    }
  }
  
  if("Annoyed" === data.intent.name){
    say("C'est privé je dis pas");
    visage("Annoyed.gif");
  }

  if("sad" === data.intent.name){
    say("C'est pas gentil");
  }

  if("mad" === data.intent.name){
    say("Un nanar, une soupe interstellaire. Je n'ai jamais vu une telle bouillie philosophique et scientifique de pacotille. De la pâté pour chat. Je me suis empressé de revoir 2001 du coup. Toujours aussi hypnotique, intelligent, bouleversant. Rien à voir avec l'indigence du film de Nolan, qui est je le répète un fourre-tout indigeste de bout en bout, un navet boursouflé dégoulinant de bon sentiments");
    visage("Mad");
  }

  if("Malaise" === data.intent.name){
    switch(data.text){
      case "Fortnite":
        break;
      case "skibidi":
        break;
    }
  }

  if("Mario" === data.intent.name){
    say("itz a mii spaguaiti");
    visage("mario.gif");
  }

  if("Neutre"=== data.intent.name){
    switch(data.text){
      case "Quelle est la capitale de la France":
        say("Je sais pas");
        break;
      case "Dans quelle école sommes nous":
        say("Je sais pas");
        break;
      case "Je cherche un film":
        say("Je sais pas");

        break;
      case "Je cherche un film [à regarder]":
      say("Je sais pas");

      break;
      case "Je cherche un film [à regarder] [tu as des suggestions]":
        say("Je sais pas");

        break;
      case "Quel est ton genre":
        say("rarararar")
        break;
    }
    visage("Neutre");   
  }


  if("Rire" === data.intent.name){
    say("Qui est gay Adem AAAAAAAAAAAAAAAAA");
    visage("Rire");
  }

  if("vide" === data.intent.name){
    say("Je prefere regarde 50 nuance de gris");
    visage("Vide");
  }

  if("WhatTheSigma" === data.intent.name){
    say("Ligmaballs");
    visage("WhatTheSigma")
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


function visage(emotion){
  switch(emotion){
    case "image":
      erws.send('{"type":"image", "content":"Eteinte.gif"}');
      break;
    case "Allumee.gif":
      erws.send('{ "type":"image", "content":"Allumee.gif"}');
      break;
    case "emoji.gif":
      erws.send('{ "type":"image", "content":"emoji.gif"}');
      break;
    case "mario.gif":
      erws.send('{ "type":"image", "content":"mario.gif"}');
      break;
    case "Amoureux.gif":
      erws.send('{ "type":"image", "content":"Amoureux.gif"}');
      break;
    case "Annoyed.gif":
      erws.send('{ "type":"image", "content":"Annoyed.gif"}');
      break;
    case "Bienvenue.png":
      erws.send('{ "type":"image", "content":"Bienvenue.png"}');
      break;
    case "Cool.gif":
      erws.send('{ "type":"image", "content":"Cool.gif"}');
      break;
    case "Cry.gif":
      erws.send('{ "type":"image", "content":"Cry.gif"}');
      break;
    case "Joueur.gif":
      erws.send('{ "type":"image", "content":"Joueur.gif"}');
      break;
    case "Saber":
      erws.send('{ "type":"image", "content":"Saber.gif"}');
      break;
    case "Mad":
      erws.send('{ "type":"image", "content":"Mad.gif"}');
      break;
    case "Neutre":
        erws.send('{ "type":"image", "content":"Neutre.gif"}');
        break;
    case "Rire":
        erws.send('{ "type":"image", "content":"Rire.gif"}');
        break;
    case "Vide":
      erws.send('{ "type":"image", "content":"Vide.gif"}');
      break;
    case "WhatTheSigma":
      erws.send('{ "type":"image", "content":"WhatTheSigma.gif"}');
      break;
  }
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