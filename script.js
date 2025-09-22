document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const videoPlayer = document.getElementById('video-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playPauseIcon = document.getElementById('play-pause-icon');
    const progressBar = document.getElementById('progress-bar');
    const timeDisplay = document.getElementById('time-display');
    const fileNameDisplay = document.getElementById('file-name');
    const rewindBtn = document.getElementById('rewind-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const speedBtn = document.getElementById('speed-btn');
    const rotationBtn = document.getElementById('rotation-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.getElementById('volume-icon');
    const muteBtn = document.getElementById('mute-btn');
    const loopBtn = document.getElementById('loop-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const speedMenu = document.getElementById('speed-menu');
    const playerContainer = document.querySelector('.player-container');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    let currentSpeed = 1;
    const speeds = [0.5, 1, 1.5, 2];
    // Keep speed icon as material symbol. Mark selected option in menu for visual feedback.
    const markSelectedSpeed = (s) => {
        const opts = speedMenu.querySelectorAll('.speed-option');
        opts.forEach(o => o.classList.toggle('selected', parseFloat(o.dataset.speed) === s));
    };
    markSelectedSpeed(currentSpeed);

// File selection and loading
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileURL = URL.createObjectURL(file);
            videoPlayer.src = fileURL;
            videoPlayer.load();
            // attempt to play; browsers may block autoplay with sound
            const playPromise = videoPlayer.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.catch(() => {
                    // Autoplay was prevented; update icon only
                    updatePlayPauseIcon(false);
                }).then(() => updatePlayPauseIcon(true));
            } else {
                updatePlayPauseIcon(true);
            }
            fileNameDisplay.textContent = file.name;
        }
    });

// Play/Pause functionality
playPauseBtn.addEventListener('click', () => {
    if (videoPlayer.paused) {
        videoPlayer.play();
        updatePlayPauseIcon(true);
    } else {
        videoPlayer.pause();
        updatePlayPauseIcon(false);
    }
});

// Update play/pause icon
function updatePlayPauseIcon(isPlaying) {
    playPauseIcon.textContent = isPlaying ? 'pause' : 'play_arrow';
}

// Rewind and Forward
rewindBtn.addEventListener('click', () => {
    videoPlayer.currentTime -= 10;
});

forwardBtn.addEventListener('click', () => {
    videoPlayer.currentTime += 10;
});

// Time and progress bar update
    videoPlayer.addEventListener('timeupdate', () => {
        const currentTime = videoPlayer.currentTime;
        const duration = videoPlayer.duration;
        if (!isNaN(duration) && duration > 0) {
            // progressBar uses 0-100 range
            progressBar.value = (currentTime / duration) * 100;
            timeDisplay.textContent = formatTime(currentTime) + ' / ' + formatTime(duration);
        }
    });

// Seek video when progress bar is changed
    progressBar.addEventListener('input', () => {
        const newTime = (progressBar.value / 100) * videoPlayer.duration;
        if (!isNaN(newTime)) videoPlayer.currentTime = newTime;
    });

// Fullscreen functionality
fullscreenBtn.addEventListener('click', () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        videoPlayer.requestFullscreen();
    }
});

// Playback Speed control
    // Toggle speed menu
    speedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speedMenu.classList.toggle('active');
    });

    // Handle selecting speed option
    speedMenu.addEventListener('click', (e) => {
        const btn = e.target.closest('.speed-option');
        if (!btn) return;
        const s = parseFloat(btn.dataset.speed);
        if (!isNaN(s)) {
            currentSpeed = s;
            videoPlayer.playbackRate = currentSpeed;
            markSelectedSpeed(currentSpeed);
        }
        // close drawer
        speedMenu.classList.remove('active');
    });

    // Close speed menu when clicking outside
    document.addEventListener('click', () => {
        speedMenu.classList.remove('active');
    });

    // Screen rotation: rotate the player container in 90deg steps
    let rotationStep = 0; // 0 = 0deg, 1 = 90deg, 2 = 180deg, 3 = 270deg
    rotationBtn.addEventListener('click', () => {
        rotationStep = (rotationStep + 1) % 4;
        const deg = rotationStep * 90;
        // apply CSS transform to container for visual rotation
        playerContainer.style.transform = `rotate(${deg}deg)`;
        playerContainer.style.transition = 'transform 0.3s ease';
    });

    // Shuffle (placeholder): simple feedback toggle
    let shuffleOn = false;
    shuffleBtn.addEventListener('click', () => {
        shuffleOn = !shuffleOn;
        shuffleBtn.classList.toggle('active', shuffleOn);
        // No playlist implemented: show quick feedback
        try { alert('Shuffle ' + (shuffleOn ? 'enabled' : 'disabled')); } catch (e) {}
    });

    // Loop toggle
    loopBtn.addEventListener('click', () => {
        videoPlayer.loop = !videoPlayer.loop;
        loopBtn.classList.toggle('active', videoPlayer.loop);
    });

    // Mute toggle
    muteBtn.addEventListener('click', () => {
        if (videoPlayer.muted) {
            videoPlayer.muted = false;
            volumeSlider.value = videoPlayer.volume;
        } else {
            videoPlayer.muted = true;
            volumeSlider.value = 0;
        }
        updateVolumeIcon(videoPlayer.muted ? 0 : videoPlayer.volume);
    });

    // Fullscreen: make the player container fullscreen (so overlays remain)
    fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            if (playerContainer.requestFullscreen) {
                playerContainer.requestFullscreen();
            } else if (playerContainer.webkitRequestFullscreen) {
                playerContainer.webkitRequestFullscreen();
            } else {
                // Fallback: request fullscreen on the video element
                videoPlayer.requestFullscreen();
            }
        }
    });

    // Volume control
    volumeSlider.addEventListener('input', () => {
        const v = parseFloat(volumeSlider.value);
        videoPlayer.volume = isNaN(v) ? 1 : v;
        if (videoPlayer.volume > 0) videoPlayer.muted = false;
        updateVolumeIcon(videoPlayer.muted ? 0 : videoPlayer.volume);
    });

// Volume icon toggle
volumeIcon.addEventListener('click', () => {
    if (videoPlayer.volume === 0) {
        videoPlayer.volume = 1;
        volumeSlider.value = 1;
        updateVolumeIcon(1);
    } else {
        videoPlayer.volume = 0;
        volumeSlider.value = 0;
        updateVolumeIcon(0);
    }
});

function updateVolumeIcon(volume) {
    if (volume === 0) {
        volumeIcon.textContent = 'volume_off';
    } else if (volume > 0 && volume <= 0.5) {
        volumeIcon.textContent = 'volume_down';
    } else {
        volumeIcon.textContent = 'volume_up';
    }
}

// Format time to MM:SS
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds === Infinity) return '00:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return String(minutes).padStart(2, '0') + ':' + String(remainingSeconds).padStart(2, '0');
    }

// Hide controls when mouse is not moving
let controlsTimeout;
const controlsOverlay = document.querySelector('.controls-overlay');

videoPlayer.addEventListener('mousemove', showControls);
controlsOverlay.addEventListener('mousemove', showControls);

function showControls() {
    controlsOverlay.style.opacity = '1';
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
        if (!videoPlayer.paused) {
            controlsOverlay.style.opacity = '0';
        }
    }, 3000); // Hide controls after 3 seconds of inactivity
}

    videoPlayer.addEventListener('play', () => {
        showControls();
    });

    videoPlayer.addEventListener('pause', () => {
        clearTimeout(controlsTimeout);
        controlsOverlay.style.opacity = '1';
    });

    // Initial volume setup
    videoPlayer.volume = parseFloat(volumeSlider.value) || 1;
    updateVolumeIcon(videoPlayer.volume);
});