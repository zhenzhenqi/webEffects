let bgImg;
let videos = [];
let currentVideoIndex = -1; // -1 means show the background
let videoPaused = false;

function preload() {
  // Load the background image
 bgImg = loadImage('/videos/background.jpg'); 
}

function setup() {
  createCanvas(1920, 1080);
  
 let videoFiles = [
  '/videos/book cover begining v1.mp4',
  '/videos/first flip v1.mp4',
  '/videos/1st page.mp4',
  '/videos/2nd flip v1.mp4',
  '/videos/2nd page v1.mp4',
  '/videos/3rd flip.mp4',
  '/videos/3rd page.mp4',
  '/videos/4th flip.mp4',
  '/videos/4th page.mp4',
  '/videos/5th flip-.mp4',
  '/videos/5th page.mp4'
];

  // Create video elements and set up event listeners
  for (let i = 0; i < videoFiles.length; i++) {
    let vid = createVideo(videoFiles[i]);
    vid.hide();
    vid.volume(0); // Mute the video

    // Handle the end of specific videos (pause after ending)
    if (i === 1 || i === 3) {
      vid.onended(() => {
        videoPaused = true;
        vid.pause(); // Pause the video when it ends
      });
    } else {
      vid.loop(); // Loop other videos
    }

    videos.push(vid);
  }
}

function draw() {
  // Draw the background or current video based on the current index
  if (currentVideoIndex === -1) {
    background(bgImg);
  } else {
    background(0); // Black background for video
    image(videos[currentVideoIndex], 0, 0, width, height);
  }
}

function mousePressed() {
  // Handle mouse press to move to the next video or control video state
  if (currentVideoIndex === 1 && videoPaused) {
    // Special case for the paused video (index 1)
    videoPaused = false;
    videos[currentVideoIndex].stop(); // Stop the current video
    currentVideoIndex++; // Move to the next video
  } else {
    // Otherwise, go to the next video
    currentVideoIndex++;
  }

  // Loop back to background if all videos have been played
  if (currentVideoIndex >= videos.length) {
    currentVideoIndex = -1;
  }

  // Play or loop the new video based on the index
  if (currentVideoIndex !== -1) {
    if (currentVideoIndex === 1) {
      videos[currentVideoIndex].play(); // Play the paused video
    } else {
      videos[currentVideoIndex].loop(); // Loop other videos
    }
  }
}
