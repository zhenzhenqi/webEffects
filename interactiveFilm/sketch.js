// --- Configuration ---
const VIDEO_FOLDER = 'footages/'; // Path to the video folder

// --- USE YOUR ACTUAL VIDEO FILENAMES HERE ---
const VIDEO_FILES = {
    start: '1.mp4',      // Video 1
    choiceA: '2.mp4',     // Video 2A
    choiceB: '3.mp4',     // Video 2B
    choiceC: '4.mp4',     // Video 3C
    choiceD: '1.mp4',     // Video 3D
    choiceE: '2.mp4',     // Video 4E
    choiceF: '4.mp4'      // Video 4F
    // Add more if your branching is more complex
};

const INTRO_TEXT = `Welcome to this interactive story. Your choices will shape the path you take. Click Start when you are ready to begin.`;
const END_TEXT = `You have reached the end of this path. Thank you for experiencing the story. Would you like to start over?`;

// --- State Variables ---
let currentState = 'intro'; // intro, playing_video, question, end
let currentVideoKey = null; // Key of the video that just played or is playing
let videoOrder = [];       // Keeps track of the videos played in sequence
let questionData = {};     // Holds data for the current question

// --- UI Elements (references to HTML/p5.dom elements) ---
let startButton;
let choiceButtonA;
let choiceButtonB;
let restartButton;
let textDisplayElement; // Reference to the <p> tag in HTML
let videoContainerElement; // Reference to the <div> container in HTML
let videoPlayerElement;   // Reference to the <video> tag in HTML (p5 element wrapper)
let htmlVideo;            // Reference to the raw HTML <video> DOM element

// --- p5.js Setup Function ---
function setup() {
    // Create canvas filling the window (optional, for background effects)
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container'); // Put canvas in its container
    canvas.style('z-index', '-1'); // Ensure canvas is behind everything

    textFont('Arial');

    // --- Get references to HTML elements ---
    videoContainerElement = select('#video-container');
    textDisplayElement = select('#text-display');
    videoPlayerElement = select('#html-video-player'); // p5 wrapper for <video>
    htmlVideo = videoPlayerElement.elt; // The actual HTML <video> element

    // --- Create p5.dom Buttons ---
    startButton = createButton('Start');
    choiceButtonA = createButton('Choice A'); // Placeholder text
    choiceButtonB = createButton('Choice B'); // Placeholder text
    restartButton = createButton('Restart');

    // Add buttons to a container or position absolutely (absolute positioning used here)
    // startButton.parent('button-container'); // Example if parenting
    // choiceButtonA.parent('button-container');
    // choiceButtonB.parent('button-container');
    // restartButton.parent('button-container');

    // Assign actions
    startButton.mousePressed(startStory);
    // Choice button actions are set dynamically later
    restartButton.mousePressed(restartStory);

    // Position buttons (initial rough positions)
    positionButtons();

    // --- Attach Video Event Listener ---
    htmlVideo.addEventListener('ended', handleVideoEnd);
    // Optional: Add error handling
    htmlVideo.addEventListener('error', handleVideoError);

    // --- Initialize ---
    setInitialState();
}

// --- p5.js Draw Function ---
function draw() {
    // Background color for the canvas (subtle)
    background(34, 42, 48);

    // Other canvas drawing can go here if needed
}

// --- Video Control ---

function playVideo(videoKey) {
    if (!videoKey || !VIDEO_FILES[videoKey]) {
        console.error(`Error: Invalid video key or missing filename for key: ${videoKey}`);
        setEndState();
        return false;
    }

    const filename = VIDEO_FILES[videoKey];
    const videoPath = VIDEO_FOLDER + filename;

    console.log(`Playing video: ${videoPath}`); // Debugging

    htmlVideo.src = videoPath;
    htmlVideo.load(); // Important: load the new source

    // Play returns a Promise - handle potential errors/autoplay issues
    const playPromise = htmlVideo.play();
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            // Autoplay started!
            videoContainerElement.show(); // Show container AFTER play starts
            currentState = 'playing_video';
        }).catch(error => {
            // Autoplay was prevented.
            console.error("Video autoplay failed:", error);
            // You might need to show a play button overlay here
            // For simplicity, we'll proceed assuming interaction allows play
            videoContainerElement.show(); // Show container anyway, user might click play manually if controls shown
            currentState = 'playing_video'; // Assume it will play eventually
            // Or transition to an error/retry state
            // setEndState(); // Fallback to end state
        });
    } else {
        // Legacy browsers might not return a promise
        videoContainerElement.show();
        currentState = 'playing_video';
    }
    return true; // Indicate attempt was made
}

function stopVideo() {
    htmlVideo.pause();
    htmlVideo.removeAttribute('src'); // Remove src
    htmlVideo.load(); // Reload to clear the player state
    videoContainerElement.hide();
}

// --- Event Handlers ---

function handleVideoEnd() {
    console.log(`Video ended: ${currentVideoKey}`);
    stopVideo(); // Hide container, pause just in case

    // Decide what happens next based on how many videos played
    if (videoOrder.length >= 4) {
        setupFinishButton(); // Setup the final step before the end screen
    } else {
        showQuestionUI(); // Show the next question/choices
    }
}

function handleVideoError() {
    console.error("Video Error:", htmlVideo.error);
    stopVideo();
    // Go to end state or show an error message
    paragraphElement.html("Sorry, there was an error loading the video.");
    paragraphElement.show();
    setEndState(); // Or a specific error state
}


// --- State Management & UI Flow ---

function setInitialState() {
    currentState = 'intro';
    videoOrder = [];
    currentVideoKey = null;

    hideAllElements(); // Hide everything first
    textDisplayElement.html(INTRO_TEXT); // Use innerHTML for the <p> tag
    textDisplayElement.show();
    startButton.show();
    positionButtons(); // Ensure correct positioning
}

function startStory() {
    hideAllElements();
    currentVideoKey = 'start'; // Set the key for the first video
    videoOrder.push(currentVideoKey);
    prepareQuestion(currentVideoKey); // Prepare data for question *after* video 1
    playVideo(currentVideoKey);
}

// Prepare question data based on the video that JUST FINISHED (or started)
function prepareQuestion(videoKeyPlayed) {
    // --- CUSTOMIZE THIS SECTION FOR YOUR STORY ---
    if (videoKeyPlayed === 'start') {
        questionData = {
            text: "The first part ends. Two paths diverge...",
            choices: { A: "Path A", B: "Path B" },
            nextVideoKeys: { A: 'choiceA', B: 'choiceB' }
        };
    } else if (videoKeyPlayed === 'choiceA' || videoKeyPlayed === 'choiceB') {
        questionData = {
            text: "An obstacle blocks your way.",
            choices: { A: "Confront It", B: "Avoid It" },
            nextVideoKeys: { A: 'choiceC', B: 'choiceD' }
        };
    } else if (videoKeyPlayed === 'choiceC' || videoKeyPlayed === 'choiceD') {
        questionData = {
            text: "A final, crucial choice.",
            choices: { A: "Choice E", B: "Choice F" },
            nextVideoKeys: { A: 'choiceE', B: 'choiceF' }
        };
    } else {
        // Should not happen if called after last video, handleVideoEnd manages that
        questionData = {};
        console.log("PrepareQuestion called after expected end:", videoKeyPlayed);
    }
    console.log("Prepared question data for after video:", videoKeyPlayed);
}

// Display the question and buttons AFTER a video ends
function showQuestionUI() {
    if (!questionData || !questionData.text) {
        console.error("No question data available to show.");
        // This might happen if prepareQuestion wasn't called correctly
        // Or if it's logically the end of the sequence
        if (videoOrder.length >= 4) {
            setupFinishButton();
        } else {
            setEndState(); // Fallback
        }
        return;
    }

    currentState = 'question';
    hideAllElements(); // Clear screen

    // Display question text
    textDisplayElement.html(questionData.text);
    textDisplayElement.show();

    // Configure and show choice buttons
    choiceButtonA.html(questionData.choices.A);
    choiceButtonA.mousePressed(() => handleChoice('A')); // Set action
    choiceButtonA.show();

    choiceButtonB.html(questionData.choices.B);
    choiceButtonB.mousePressed(() => handleChoice('B')); // Set action
    choiceButtonB.show();

    positionButtons(); // Reposition buttons
}

// Called when user clicks choice A or B
function handleChoice(choiceMade) {
    if (currentState !== 'question' || !questionData.nextVideoKeys) return;

    let nextKey = questionData.nextVideoKeys[choiceMade];

    if (!nextKey) {
        console.error(`No next video key defined for choice ${choiceMade}`);
        setEndState();
        return;
    }

    hideAllElements(); // Hide question UI
    currentVideoKey = nextKey; // Update key for the video to be played
    videoOrder.push(currentVideoKey);
    prepareQuestion(currentVideoKey); // Prepare for question *after* this next video
    playVideo(currentVideoKey);
}

// Shown after the very last video ends
function setupFinishButton() {
    currentState = 'ending'; // Intermediate state before final end screen
    hideAllElements();

    textDisplayElement.html("The story concludes..."); // Final message before restart prompt
    textDisplayElement.show();

    // Repurpose Choice A as the "Finish" button
    choiceButtonA.html("See Final Message");
    choiceButtonA.mousePressed(setEndState); // Go to the actual end state
    choiceButtonA.show();
    choiceButtonB.hide(); // Ensure B is hidden

    positionButtons();
}

function setEndState() {
    currentState = 'end';
    hideAllElements(); // Hide "Finish" button etc.

    textDisplayElement.html(END_TEXT);
    textDisplayElement.show();
    restartButton.show();
    positionButtons();
}

function restartStory() {
    setInitialState();
}

function hideAllElements() {
    startButton.hide();
    choiceButtonA.hide();
    choiceButtonB.hide();
    restartButton.hide();
    textDisplayElement.hide();
    // Stop video is separate as it might need to finish fade out etc.
    stopVideo(); // Ensure video player is hidden and stopped
}

// Helper function to position buttons based on state
function positionButtons() {
    const centerX = width / 2;
    const buttonYLine1 = height * 0.6; // Y position for single buttons (Start, Restart)
    const buttonYLine2 = height * 0.8; // Y position for choice buttons

    // Get button widths for centering (or use fixed offset)
    // Note: .width might not be accurate until element is visible and styled.
    // Using fixed offsets from center might be more reliable initially.
    const choiceOffset = 10; // Space between choice buttons and center
    const choiceWidth = 100; // Approximate width

    startButton.position(centerX, buttonYLine1);
    restartButton.position(centerX, buttonYLine1);

    // Position choice buttons relative to center
    choiceButtonA.position(centerX - choiceOffset - choiceWidth / 2, buttonYLine2);
    choiceButtonB.position(centerX + choiceOffset + choiceWidth / 2, buttonYLine2);

    // If only finish button is shown (reusing button A)
    if (currentState === 'ending') {
        choiceButtonA.position(centerX, buttonYLine2);
    }
}


// Adjust layout on window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // Recalculate button positions on resize
    positionButtons();
    // Video container is centered by CSS transform, should adjust automatically.
    // Text container is centered by CSS transform, should adjust automatically.
}