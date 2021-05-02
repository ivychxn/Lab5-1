// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

// get the canvas
const canvas = document.getElementById('user-image');
// get context
const ctx = canvas.getContext('2d');
// get img input
const img_input = document.querySelector('image-input');
// get form
const form = document.getElementById('generate-meme');
// generate button
const genB = form.querySelectorAll('button')[0];
// clear button
const clearB = document.querySelectorAll('button-group')[0];
// read text button
const readB = document.querySelectorAll('button-group')[1];
// voice choice thing
const voiceSelect = document.getElementById('voice-selection');
// for populating voices
var voices = [];
var synth = window.speechSynthesis;
// volume stuff
const volumeGroup = document.getElementById('volume-group');
const volumeSlide = volumeGroup.querySelectorAll('input')[0];
const volumeLev = volumeGroup.querySelectorAll('img')[0];

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // clear the canvas context
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // toggle the relevant buttons by disabling or enabling them as needed
  genB.disabled = true;
  clearB.disabled = false;
  readB.disabled = false;

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // - Clear the form when a new image is selected
  form.reset();

  // - If you draw the image to canvas here, it will update as soon as a new image is selected
  const dim = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, dim.startX, dim.startY, dim.width, dim.height);
});

// input: image-input on change
img_input.addEventListener('change', () => {
  // load in the selected image into the Image object (img) src attribute
  let files = img_input.files[0];

  let objectURL = URL.createObjectURL(files);
  img.src = objectURL;

  // set the image alt attribute by extracting the image file name from the file path
  img.alt = files.name;
});

// form: submit on submit
form.addEventListener('submit', (e) => {
  // generate your meme by grabbing the text in the two inputs with ids text-top and text-bottom
  e.preventDefault();

  // get top text
  let textTop = document.getElementById('text-top').value;
  // get bottom text
  let textBottom = document.getElementById('text-bottom').value;

  // and adding the relevant text to the canvas (note: you should still be able to add text to the canvas without an image uploaded)
  ctx.font = '48px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.fillText(textTop, canvas.width/2, 25);
  ctx.fillText(textBottom, canvas.width/2, canvas.height - 25);
  genB.disabled = true;
  clearB.disabled = false;
  readB.disabled = false;
  voiceSelection.disabled = false;
  populateVoiceList();
});

// button: clear on click
clearB.addEventListener('click', () => {
  // clear the image and/or text present
  context.clearRect(0, 0, canvas.width, canvas.height);
  form.reset();

  // toggle relevant buttons
  genB.disabled = false;
  clearB.disabled = true;
  readB.disabled = true;
});

// button: read text on click
readB.addEventListener('click', () => {
  // have the browser speak the text in the two inputs with ids text-top and text-bottom out loud
  let topVoice = new SpeechSynthesisUtterance(document.getElementById('text-top').value);
  let bottomVoice = new SpeechSynthesisUtterance(document.getElementById('text-bottom').value);
  
  var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      topVoice.voice = voices[i];
      bottomVoice.voice = voices[i];
    }
  }
  // volume stuff
  topVoice.volume = volumeSlide.value / 100;
  bottomVoice.volume = volumeSlide.value / 100;

  // speaky speak
  synth.speak(topVoice);
  synth.speak(bottomVoice);
});

function populateVoiceList() {
  voices = synth.getVoices();

  for(var i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
}

// div: volume-group (volume slider)
// update the volume value to inc or dec the volume
volumeGroup.addEventListener('input', () => {
  if(volumeSlide.value >= 67 && volumeSlide.value <= 100) {
    volumeLev.src = 'icons/volume-level-3.svg';
    volumeLev.alt = 'Level 3';
  }
  else if(volumeSlide.value >= 34 && volumeSlide.value <= 66) {
    volumeLev.src = 'icons/volume-level-2.svg';
    volumeLev.alt = 'Level 2';
  }
  else if(volumeSlide.value >= 1 && volumeSlide.value <= 33) {
    volumeLev.src = 'icons/volume-level-1.svg';
    volumeLev.alt = 'Level 1';
  }
  else if(volumeSlide.value == 0) {
    volumeLev.src = 'icons/volume-level-0.svg';
    volumeLev.alt = 'Level 0';
  }
});



/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
