let bgImg; // The initial background image
let endImg; // The image to display at the end
let videos = [];
let currentVideoIndex = -1; // -1 means show the initial background
let isVideoFinished = false; // Flag to track if the current video (if not the last) has finished

function preload() {
  // Load the JPEG images before setup()
  // Paths assume 'videos' folder is in the root directory
  bgImg = loadImage('/videos/background.jpg');
  endImg = loadImage('/videos/theend.jpg'); // Load the end screen image
}

function setup() {
  // Create canvas to fill the window initially
  createCanvas(windowWidth, windowHeight);

  // List of video file names
  let videoFiles = [
    'book cover begining v1.mp4',
    'first flip v1.mp4',
    '1st page.mp4',
    '2nd flip v1.mp4',
    '2nd page v1.mp4',
    '3rd flip.mp4',
    '3rd page.mp4',
    '4th flip.mp4',
    '4th page.mp4',
    '5th flip-.mp4',
    '5th page.mp4'
  ];

  for (let i = 0; i < videoFiles.length; i++) {
    // Prepend the '/videos/' folder path to each filename
    let videoPath = '/videos/' + videoFiles[i];
    let vid = createVideo(videoPath); // Create video element with the correct path

    vid.hide(); // Hide the default HTML video element
    vid.volume(0); // Mute the video

    // **Modification:** Add onended callback with index awareness
    // Use a closure to capture the correct index 'i' for each video.
    let videoIndex = i; // Capture the current index

    vid.onended(() => {
      if (videoIndex === videos.length - 1) { // Check if this is the LAST video
        currentVideoIndex = videos.length; // Automatically transition to the end screen state
        isVideoFinished = false; // Reset this flag as we are now on the end screen, not waiting for video click
        // The draw function will pick up the new state and display the endImg
      } else {
        isVideoFinished = true; // For all other videos, just mark as finished and wait for click
      }
      // The video automatically stops at the last frame when it ends
    });

    videos.push(vid); // Add the video object to the array
  }

  // Optional: Prevent right-click context menu if you don't need it
  // document.addEventListener('contextmenu', event => event.preventDefault());
}

function draw() {
  // Display the correct state: background, video, or end screen
  if (currentVideoIndex === -1) {
    // Show initial background image
    image(bgImg, 0, 0, width, height);
  } else if (currentVideoIndex < videos.length) {
    // Show a video if the index is within the videos array bounds
    if (videos[currentVideoIndex]) {
      image(videos[currentVideoIndex], 0, 0, width, height);
    }
  } else { // currentVideoIndex must be equal to videos.length, showing the end screen
    // Show the end screen image
    image(endImg, 0, 0, width, height);
  }
}

// This function is called whenever the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // The draw function will automatically use the new width and height
}


function mousePressed() {
  // Handle clicks for navigation

  // If currently on the end screen, ignore clicks.
  if (currentVideoIndex === videos.length) {
    return;
  }

  // **Modification:** Only allow interaction if showing background
  // OR if a video *other than the last one* has finished.
  // The transition from the last video is handled by its onended callback.
  if (currentVideoIndex === -1 || (isVideoFinished && currentVideoIndex < videos.length - 1)) {

    // Stop the previous video if one was playing and finished
    // Ensure we only stop if the previous state was a video index
    // This logic is still needed for transitions between non-last videos.
    if (currentVideoIndex !== -1 && currentVideoIndex < videos.length) {
      if (videos[currentVideoIndex]) { // Add safety check
        videos[currentVideoIndex].stop(); // Stop and reset the finished video
      }
    }

    // Advance to the next state
    // This will advance from -1 to 0, or from video N to N+1 (where N is not the last video)
    currentVideoIndex++;

    // **Simplified Transition Logic:**
    // The onended of the last video handles the transition to videos.length.
    // This mousePressed only handles transitions that lead to a video index.
    if (currentVideoIndex < videos.length) { // Check if the new index is a video index
      isVideoFinished = false; // Reset the finished flag before starting the new video
      if (videos[currentVideoIndex]) { // Add safety check
        videos[currentVideoIndex].play(); // Play the new video (it will stop onended)
      }
    }
    // If currentVideoIndex is -1 (initial background), no video is started.
    // If currentVideoIndex becomes videos.length (due to last video's onended),
    // this mousePressed block is skipped after the initial check,
    // and the click is effectively ignored during that automatic transition moment.

  }
  // If a video is currently playing (currentVideoIndex is a valid video index and isVideoFinished is false,
  // AND it's not the last video that just finished), this mousePressed function does nothing.
  // If it *is* the last video playing, clicks are also ignored because the onended will trigger the state change.
}