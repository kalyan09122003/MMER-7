// EmotiAI Frontend JavaScript
// Handles all interactions for text, audio, image, and video

// API Configuration - Always use the same origin as the frontend
const API_BASE_URL = window.location.origin;

// Global variables
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let videoStream = null;
let isVideoAnalyzing = false;
let videoAnalysisInterval = null;
let emotionHistory = []; // For temporal smoothing
let maxHistoryLength = 5;

const EMOTION_THEME_PALETTES = {
  neutral: {
    '--page-bg': '#FBFCFD',
    '--text-color': '#17202A',
    '--muted-text': '#5A6A72',
    '--heading-color': '#17202A',
    '--primary-accent': '#8E9AAF',
    '--secondary-accent': '#6F83A8',
    '--header-bg': 'rgba(255,255,255,0.95)',
    '--card-border': 'rgba(20,32,42,0.06)',
    '--card-bg': '#FFFFFF',
    '--hero-gradient-start': '#8E9AAF',
    '--hero-gradient-end': '#6F83A8',
    '--hero-icon-shadow': 'rgba(111,131,168,0.25)',
    '--button-bg': '#6F83A8',
    '--button-hover-bg': '#596B8A',
    '--button-shadow-color': 'rgba(95,115,145,0.28)',
    '--feature-badge-bg': 'rgba(111,131,168,0.08)',
    '--feature-badge-border': 'rgba(111,131,168,0.18)',
    '--upload-border': 'rgba(111,131,168,0.18)',
    '--upload-highlight': 'rgba(111,131,168,0.04)',
    '--progress-track': 'rgba(0,0,0,0.06)',

    /* NEW: UI-specific variables */
    '--progress-fill': '#6F83A8',
    '--dominant-bg': '#f1f4f8',
    '--dominant-text': '#17202A',
    '--label-color': '#5A6A72',
    '--bar-bg': 'rgba(0,0,0,0.06)',

    '--footer-bg': '#6F83A8',
    '--footer-link-color': 'rgba(255,255,255,0.9)'
  },

  angry: {
    '--page-bg': '#fff5f5',
    '--text-color': '#4a1513',
    '--muted-text': '#6b2a28',
    '--primary-accent': '#E94F3D',
    '--secondary-accent': '#D93F30',
    '--header-bg': 'rgba(255,245,244,0.95)',
    '--card-border': 'rgba(233,79,61,0.12)',
    '--card-bg': '#FFFFFF',
    '--hero-gradient-start': '#E94F3D',
    '--hero-gradient-end': '#D93F30',
    '--hero-icon-shadow': 'rgba(233,79,61,0.20)',
    '--button-bg': '#E94F3D',
    '--button-hover-bg': '#C63C2B',
    '--button-shadow-color': 'rgba(198,60,43,0.28)',
    '--feature-badge-bg': 'rgba(233,79,61,0.08)',
    '--feature-badge-border': 'rgba(233,79,61,0.18)',
    '--upload-border': 'rgba(233,79,61,0.20)',
    '--upload-highlight': 'rgba(233,79,61,0.04)',
    '--progress-track': 'rgba(0,0,0,0.06)',

    /* NEW: UI-specific variables */
    '--progress-fill': '#E94F3D',
    '--dominant-bg': '#ffe6e3',
    '--dominant-text': '#4a1513',
    '--label-color': '#6b2a28',
    '--bar-bg': 'rgba(233,79,61,0.12)',

    '--footer-bg': '#C63C2B',
    '--footer-link-color': 'rgba(255,255,255,0.92)'
  },

  disgust: {
    '--page-bg': '#fff7f0',
    '--text-color': '#5b2f1f',
    '--muted-text': '#7a4b36',
    '--primary-accent': '#F1A66B',
    '--secondary-accent': '#EE9A5A',
    '--header-bg': 'rgba(255,250,248,0.95)',
    '--card-border': 'rgba(241,166,107,0.12)',
    '--card-bg': '#FFFFFF',
    '--hero-gradient-start': '#F1A66B',
    '--hero-gradient-end': '#EE9A5A',
    '--hero-icon-shadow': 'rgba(241,166,107,0.18)',
    '--button-bg': '#F1A66B',
    '--button-hover-bg': '#D98E4F',
    '--button-shadow-color': 'rgba(217,142,79,0.22)',
    '--feature-badge-bg': 'rgba(241,166,107,0.08)',
    '--feature-badge-border': 'rgba(241,166,107,0.16)',
    '--upload-border': 'rgba(241,166,107,0.18)',
    '--upload-highlight': 'rgba(241,166,107,0.04)',
    '--progress-track': 'rgba(0,0,0,0.06)',

    /* NEW */
    '--progress-fill': '#F1A66B',
    '--dominant-bg': '#fff0e6',
    '--dominant-text': '#5b2f1f',
    '--label-color': '#7a4b36',
    '--bar-bg': 'rgba(241,166,107,0.12)',

    '--footer-bg': '#D98E4F',
    '--footer-link-color': 'rgba(255,255,255,0.92)'
  },

  joy: {
    '--page-bg': '#fffaf0',
    '--text-color': '#3a2c10',
    '--muted-text': '#6b5d3e',
    '--primary-accent': '#FFD166',
    '--secondary-accent': '#F6C84A',
    '--header-bg': 'rgba(255,250,236,0.95)',
    '--card-border': 'rgba(255,209,102,0.12)',
    '--card-bg': '#FFFFFF',
    '--hero-gradient-start': '#FFD166',
    '--hero-gradient-end': '#F6C84A',
    '--hero-icon-shadow': 'rgba(255,209,102,0.18)',
    '--button-bg': '#FFCB3D',
    '--button-hover-bg': '#E6B831',
    '--button-shadow-color': 'rgba(230,184,49,0.22)',
    '--feature-badge-bg': 'rgba(255,209,102,0.08)',
    '--feature-badge-border': 'rgba(255,209,102,0.16)',
    '--upload-border': 'rgba(255,209,102,0.18)',
    '--upload-highlight': 'rgba(255,209,102,0.04)',
    '--progress-track': 'rgba(0,0,0,0.06)',

    /* NEW */
    '--progress-fill': '#FFD166',
    '--dominant-bg': '#fff7e0',
    '--dominant-text': '#3a2c10',
    '--label-color': '#6b5d3e',
    '--bar-bg': 'rgba(255,209,102,0.12)',

    '--footer-bg': '#E6B831',
    '--footer-link-color': 'rgba(255,255,255,0.92)'
  },

  surprise: {
    '--page-bg': '#f6fff4',
    '--text-color': '#1a3b1a',
    '--muted-text': '#415a41',
    '--primary-accent': '#7CC36A',
    '--secondary-accent': '#66B457',
    '--header-bg': 'rgba(250,255,250,0.95)',
    '--card-border': 'rgba(124,195,106,0.12)',
    '--card-bg': '#FFFFFF',
    '--hero-gradient-start': '#7CC36A',
    '--hero-gradient-end': '#66B457',
    '--hero-icon-shadow': 'rgba(124,195,106,0.18)',
    '--button-bg': '#66B457',
    '--button-hover-bg': '#548E44',
    '--button-shadow-color': 'rgba(84,142,68,0.22)',
    '--feature-badge-bg': 'rgba(124,195,106,0.08)',
    '--feature-badge-border': 'rgba(124,195,106,0.16)',
    '--upload-border': 'rgba(124,195,106,0.18)',
    '--upload-highlight': 'rgba(124,195,106,0.04)',
    '--progress-track': 'rgba(0,0,0,0.06)',

    /* NEW */
    '--progress-fill': '#7CC36A',
    '--dominant-bg': '#eef9ec',
    '--dominant-text': '#1a3b1a',
    '--label-color': '#415a41',
    '--bar-bg': 'rgba(124,195,106,0.12)',

    '--footer-bg': '#548E44',
    '--footer-link-color': 'rgba(255,255,255,0.92)'
  },

  sadness: {
    '--page-bg': '#f3fbfb',
    '--text-color': '#123b3f',
    '--muted-text': '#476d70',
    '--primary-accent': '#5BC0BE',
    '--secondary-accent': '#3FA7A4',
    '--header-bg': 'rgba(249,255,255,0.95)',
    '--card-border': 'rgba(91,192,190,0.12)',
    '--card-bg': '#FFFFFF',
    '--hero-gradient-start': '#5BC0BE',
    '--hero-gradient-end': '#3FA7A4',
    '--hero-icon-shadow': 'rgba(91,192,190,0.18)',
    '--button-bg': '#3FA7A4',
    '--button-hover-bg': '#348A87',
    '--button-shadow-color': 'rgba(52,138,135,0.22)',
    '--feature-badge-bg': 'rgba(91,192,190,0.08)',
    '--feature-badge-border': 'rgba(91,192,190,0.16)',
    '--upload-border': 'rgba(91,192,190,0.18)',
    '--upload-highlight': 'rgba(91,192,190,0.04)',
    '--progress-track': 'rgba(0,0,0,0.06)',

    /* NEW */
    '--progress-fill': '#5BC0BE',
    '--dominant-bg': '#eaf7f6',
    '--dominant-text': '#123b3f',
    '--label-color': '#476d70',
    '--bar-bg': 'rgba(91,192,190,0.12)',

    '--footer-bg': '#348A87',
    '--footer-link-color': 'rgba(255,255,255,0.92)'
  },

  fear: {
    '--page-bg': '#f0f6ff',
    '--text-color': '#08304b',
    '--muted-text': '#335a7a',
    '--primary-accent': '#4DA6FF',
    '--secondary-accent': '#2E90FF',
    '--header-bg': 'rgba(248,252,255,0.95)',
    '--card-border': 'rgba(77,166,255,0.12)',
    '--card-bg': '#FFFFFF',
    '--hero-gradient-start': '#4DA6FF',
    '--hero-gradient-end': '#2E90FF',
    '--hero-icon-shadow': 'rgba(77,166,255,0.18)',
    '--button-bg': '#2E90FF',
    '--button-hover-bg': '#246FCC',
    '--button-shadow-color': 'rgba(36,111,204,0.22)',
    '--feature-badge-bg': 'rgba(77,166,255,0.08)',
    '--feature-badge-border': 'rgba(77,166,255,0.16)',
    '--upload-border': 'rgba(77,166,255,0.18)',
    '--upload-highlight': 'rgba(77,166,255,0.04)',
    '--progress-track': 'rgba(0,0,0,0.06)',

    /* NEW */
    '--progress-fill': '#4DA6FF',
    '--dominant-bg': '#eaf3ff',
    '--dominant-text': '#08304b',
    '--label-color': '#335a7a',
    '--bar-bg': 'rgba(77,166,255,0.12)',

    '--footer-bg': '#246FCC',
    '--footer-link-color': 'rgba(255,255,255,0.92)'
  }
};


const EMOTION_NORMALIZATION = {
    happy: 'joy',
    excited: 'joy'
};

function normalizeEmotionLabel(label) {
    if (!label) return 'neutral';
    const lower = label.toLowerCase();
    return EMOTION_NORMALIZATION[lower] || lower;
}

function applyEmotionTheme(emotion) {
    const palette = EMOTION_THEME_PALETTES[emotion] || EMOTION_THEME_PALETTES.neutral;
    const root = document.documentElement;
    Object.entries(palette).forEach(([prop, value]) => {
        root.style.setProperty(prop, value);
    });
}


// Utility Functions
function showElement(element) {
    if (element) {
        element.style.display = 'block';
        element.classList.remove('hidden');
    }
}

function hideElement(element) {
    if (element) {
        element.style.display = 'none';
        element.classList.add('hidden');
    }
}

function updateProgressBar(emotion, percentage) {
    const progressElement = document.getElementById(`${emotion}Progress`);
    const percentageElement = document.getElementById(`${emotion}Percentage`);
    
    if (progressElement && percentageElement) {
        progressElement.style.width = `${percentage}%`;
        percentageElement.textContent = `${Math.round(percentage)}%`;
    }
    
    // Debug logging
    console.log(`Updating ${emotion}: ${percentage}%`, {
        progressElement: !!progressElement,
        percentageElement: !!percentageElement
    });
}

function displayEmotionResults(data, pageType = 'general') {
    console.log('Displaying emotion results:', data, 'Page type:', pageType);
    
    const resultsPlaceholder = document.getElementById('resultsPlaceholder');
    const emotionResults = document.getElementById('emotionResults');
    const dominantEmotion = document.getElementById('dominantEmotion');
    const confidenceScore = document.getElementById('confidenceScore');
    
    console.log('Elements found:', {
        resultsPlaceholder: !!resultsPlaceholder,
        emotionResults: !!emotionResults,
        dominantEmotion: !!dominantEmotion,
        confidenceScore: !!confidenceScore
    });
    
    if (resultsPlaceholder) {
        hideElement(resultsPlaceholder);
        console.log('Hiding results placeholder');
    }
    if (emotionResults) {
        showElement(emotionResults);
        console.log('Showing emotion results section');
    } else {
        console.error('emotionResults element not found!');
    }
    
    let normalizedEmotion = 'neutral';
    if (dominantEmotion && data.label) {
        const formattedLabel = data.label.charAt(0).toUpperCase() + data.label.slice(1);
        dominantEmotion.textContent = formattedLabel;
        normalizedEmotion = normalizeEmotionLabel(data.label);
    }
    
    applyEmotionTheme(normalizedEmotion);
    
    // Calculate confidence (highest probability)
    let maxProb = 0;
    if (data.probabilities) {
        maxProb = Math.max(...Object.values(data.probabilities)) * 100;
    }
    
    if (confidenceScore) {
        confidenceScore.textContent = `Confidence: ${Math.round(maxProb)}%`;
    }
    
    // Update progress bars based on page type
    if (data.probabilities) {
        if (pageType === 'image' || pageType === 'video') {
            // Image/Video uses FER emotions
            const emotions = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'];
            emotions.forEach(emotion => {
                const prob = (data.probabilities[emotion] || 0) * 100;
                updateProgressBar(emotion, prob);
            });
        } else {
            // Text/Audio uses text-based emotions
            const emotions = ['joy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'];
            emotions.forEach(emotion => {
                const prob = (data.probabilities[emotion] || 0) * 100;
                updateProgressBar(emotion, prob);
            });
        }
    }
    
    // Update faces count for image/video
    if (pageType === 'image' || pageType === 'video') {
        const facesCount = document.getElementById('facesCount');
        // Use data.faces if available, otherwise fallback to 1 if probabilities exist
        if (facesCount) {
            if (data.faces !== undefined) {
                facesCount.textContent = data.faces;
            } else if (data.probabilities) {
                facesCount.textContent = 1;
            } else {
                facesCount.textContent = 0;
            }
        }
    }
}

// Temporal smoothing function for video analysis
function temporalSmoothing(currentEmotion, alpha = 0.7) {
    if (emotionHistory.length === 0) {
        emotionHistory.push(currentEmotion);
        return currentEmotion;
    }
    
    const lastEmotion = emotionHistory[emotionHistory.length - 1];
    const smoothedEmotion = {};
    
    // Smooth each emotion probability
    for (const emotion in currentEmotion) {
        if (lastEmotion[emotion] !== undefined) {
            smoothedEmotion[emotion] = alpha * currentEmotion[emotion] + (1 - alpha) * lastEmotion[emotion];
        } else {
            smoothedEmotion[emotion] = currentEmotion[emotion];
        }
    }
    
    // Add to history and maintain max length
    emotionHistory.push(smoothedEmotion);
    if (emotionHistory.length > maxHistoryLength) {
        emotionHistory.shift();
    }
    
    return smoothedEmotion;
}

// Confidence-based display filtering
function shouldDisplayResult(data, minConfidence = 0.4) {
    if (data.confidence !== undefined) {
        return data.confidence >= minConfidence;
    }
    
    // For text/audio, check if dominant emotion probability is high enough
    if (data.probabilities) {
        const maxProb = Math.max(...Object.values(data.probabilities));
        return maxProb >= minConfidence;
    }
    
    return true; // Default to showing result
}

function showError(message) {
    alert(`Error: ${message}`);
    console.error('EmotiAI Error:', message);
}

// Text Analysis Functions
function initTextAnalysis() {
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const sampleItems = document.querySelectorAll('.sample-item');
    
    if (!textInput) return; // Not on text page
    
    // Character counter
    textInput.addEventListener('input', () => {
        if (charCount) {
            charCount.textContent = textInput.value.length;
        }
    });
    
    // Analyze button
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeText);
    }
    
    // Sample text items
    sampleItems.forEach(item => {
        item.addEventListener('click', () => {
            const sampleText = item.getAttribute('data-text');
            if (sampleText && textInput) {
                textInput.value = sampleText;
                if (charCount) {
                    charCount.textContent = sampleText.length;
                }
            }
        });
    });
}

// Text analysis using the real API
async function analyzeTextWithAPI(text) {
    if (!API_BASE_URL) {
        throw new Error('API base URL is not configured');
    }
    
    const response = await fetch(`${API_BASE_URL}/predict_text`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

async function analyzeText() {
    const textInput = document.getElementById('textInput');
    const analyzeText = document.getElementById('analyzeText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    if (!textInput || !textInput.value.trim()) {
        showError('Please enter some text to analyze');
        return;
    }
    
    // Show loading state
    if (analyzeText) hideElement(analyzeText);
    if (loadingSpinner) showElement(loadingSpinner);
    
    try {
        const data = await analyzeTextWithAPI(textInput.value.trim());
        console.log('Analysis data:', data);
        displayEmotionResults(data, 'text');
    } catch (error) {
        console.error('Error analyzing text:', error);
        showError(`Failed to analyze text: ${error.message}`);
    } finally {
        // Hide loading state
        if (loadingSpinner) hideElement(loadingSpinner);
        if (analyzeText) showElement(analyzeText);
    }
}

// Audio Analysis Functions
function initAudioAnalysis() {
    const micButton = document.getElementById('micButton');
    
    if (!micButton) return; // Not on audio page
    
    micButton.addEventListener('click', toggleRecording);
    
    // Initialize audio visualizer
    initAudioVisualizer();
}

function initAudioVisualizer() {
    const canvas = document.getElementById('audioVisualizer');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Draw static visualizer when not recording
    function drawStaticVisualizer() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(79, 195, 247, 0.3)';
        
        for (let i = 0; i < 20; i++) {
            const barHeight = Math.random() * 30 + 10;
            const x = (i * width) / 20;
            ctx.fillRect(x, height - barHeight, width / 25, barHeight);
        }
    }
    
    drawStaticVisualizer();
}

async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        await startRecording();
    }
}

async function startRecording() {
    const micButton = document.getElementById('micButton');
    const micIcon = document.getElementById('micIcon');
    const recordingStatus = document.getElementById('recordingStatus');
    const recordingInstruction = document.getElementById('recordingInstruction');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await analyzeAudio(audioBlob);
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        // Update UI
        if (micButton) micButton.classList.add('recording');
        if (micIcon) micIcon.textContent = '⏹️';
        if (recordingStatus) recordingStatus.textContent = 'Recording...';
        if (recordingInstruction) recordingInstruction.textContent = 'Click to stop recording';
        
    } catch (error) {
        showError(`Failed to access microphone: ${error.message}`);
    }
}

function stopRecording() {
    const micButton = document.getElementById('micButton');
    const micIcon = document.getElementById('micIcon');
    const recordingStatus = document.getElementById('recordingStatus');
    const recordingInstruction = document.getElementById('recordingInstruction');
    
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        isRecording = false;
        
        // Update UI
        if (micButton) micButton.classList.remove('recording');
        if (micIcon) micIcon.textContent = '🎤';
        if (recordingStatus) recordingStatus.textContent = 'Processing...';
        if (recordingInstruction) recordingInstruction.textContent = 'Analyzing audio...';
    }
}

async function analyzeAudio(audioBlob) {
    const recordingStatus = document.getElementById('recordingStatus');
    const recordingInstruction = document.getElementById('recordingInstruction');
    const transcriptionSection = document.getElementById('transcriptionSection');
    const transcriptionText = document.getElementById('transcriptionText');
    
    try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        
        const response = await fetch(`${API_BASE_URL}/predict_audio`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Display transcription
        if (transcriptionSection && transcriptionText && data.text) {
            transcriptionText.textContent = data.text || 'No speech detected';
            showElement(transcriptionSection);
        }
        
        // Display emotion results
        displayEmotionResults(data, 'audio');
        
        // Update UI
        if (recordingStatus) recordingStatus.textContent = 'Analysis Complete';
        if (recordingInstruction) recordingInstruction.textContent = 'Click the microphone to record again';
        
    } catch (error) {
        showError(`Failed to analyze audio: ${error.message}`);
        if (recordingStatus) recordingStatus.textContent = 'Analysis Failed';
        if (recordingInstruction) recordingInstruction.textContent = 'Click the microphone to try again';
    }
}

// Image Analysis Functions
function initImageAnalysis() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const analyzeImageBtn = document.getElementById('analyzeImageBtn');
    
    if (!uploadArea) return; // Not on image page
    
    // Upload area click
    uploadArea.addEventListener('click', () => {
        if (imageInput) imageInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });
    
    // File input change
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleImageFile(e.target.files[0]);
            }
        });
    }
    
    // Analyze button
    if (analyzeImageBtn) {
        analyzeImageBtn.addEventListener('click', analyzeCurrentImage);
    }
}

function handleImageFile(file) {
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showError('Image file too large. Please select a file under 10MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        if (previewImg) {
            previewImg.src = e.target.result;
            previewImg.dataset.file = file.name;
        }
        if (imagePreview) {
            showElement(imagePreview);
        }
    };
    reader.readAsDataURL(file);
    
    // Store file for analysis
    window.currentImageFile = file;
}

async function analyzeCurrentImage() {
    const analyzeImageText = document.getElementById('analyzeImageText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    if (!window.currentImageFile) {
        showError('Please select an image first');
        return;
    }
    
    // Show loading state
    if (analyzeImageText) hideElement(analyzeImageText);
    if (loadingSpinner) showElement(loadingSpinner);
    
    try {
        const formData = new FormData();
        formData.append('image', window.currentImageFile);
        
        const response = await fetch(`${API_BASE_URL}/predict_image`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayEmotionResults(data, 'image');
        
    } catch (error) {
        showError(`Failed to analyze image: ${error.message}`);
    } finally {
        // Hide loading state
        if (loadingSpinner) hideElement(loadingSpinner);
        if (analyzeImageText) showElement(analyzeImageText);
    }
}

// Video Analysis Functions
function initVideoAnalysis() {
    const startCameraBtn = document.getElementById('startCameraBtn');
    const stopCameraBtn = document.getElementById('stopCameraBtn');
    
    if (!startCameraBtn) return; // Not on video page
    
    startCameraBtn.addEventListener('click', startCamera);
    if (stopCameraBtn) {
        stopCameraBtn.addEventListener('click', stopCamera);
    }
}

async function startCamera() {
    const videoFeed = document.getElementById('videoFeed');
    const videoPlaceholder = document.getElementById('videoPlaceholder');
    const liveIndicator = document.getElementById('liveIndicator');
    const startCameraBtn = document.getElementById('startCameraBtn');
    const stopCameraBtn = document.getElementById('stopCameraBtn');
    const analysisStatus = document.getElementById('analysisStatus');
    const analysisInsights = document.getElementById('analysisInsights');
    
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        
        if (videoFeed) {
            videoFeed.srcObject = videoStream;
            showElement(videoFeed);
        }
        if (videoPlaceholder) hideElement(videoPlaceholder);
        if (liveIndicator) showElement(liveIndicator);
        if (startCameraBtn) hideElement(startCameraBtn);
        if (stopCameraBtn) showElement(stopCameraBtn);
        if (analysisStatus) {
            analysisStatus.textContent = 'Active';
            analysisStatus.style.color = '#4fc3f7';
        }
        if (analysisInsights) {
            analysisInsights.textContent = 'Camera started. Real-time analysis beginning...';
        }
        
        // Start video analysis
        startVideoAnalysis();
        
    } catch (error) {
        showError(`Failed to access camera: ${error.message}`);
    }
}

function stopCamera() {
    const videoFeed = document.getElementById('videoFeed');
    const videoPlaceholder = document.getElementById('videoPlaceholder');
    const liveIndicator = document.getElementById('liveIndicator');
    const startCameraBtn = document.getElementById('startCameraBtn');
    const stopCameraBtn = document.getElementById('stopCameraBtn');
    const analysisStatus = document.getElementById('analysisStatus');
    const analysisInsights = document.getElementById('analysisInsights');
    
    // Stop video stream
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    
    // Stop analysis
    if (videoAnalysisInterval) {
        clearInterval(videoAnalysisInterval);
        videoAnalysisInterval = null;
    }
    isVideoAnalyzing = false;
    
    // Update UI
    if (videoFeed) {
        hideElement(videoFeed);
        videoFeed.srcObject = null;
    }
    if (videoPlaceholder) showElement(videoPlaceholder);
    if (liveIndicator) hideElement(liveIndicator);
    if (startCameraBtn) showElement(startCameraBtn);
    if (stopCameraBtn) hideElement(stopCameraBtn);
    if (analysisStatus) {
        analysisStatus.textContent = 'Inactive';
        analysisStatus.style.color = '#666';
    }
    if (analysisInsights) {
        analysisInsights.textContent = 'Camera stopped. Click "Start Camera" to begin analysis.';
    }
}

function startVideoAnalysis() {
    const videoFeed = document.getElementById('videoFeed');
    if (!videoFeed) return;
    
    isVideoAnalyzing = true;
    
    // Capture and analyze frames every 2 seconds
    videoAnalysisInterval = setInterval(async () => {
        if (!isVideoAnalyzing || !videoFeed.srcObject) return;
        
        try {
            // Capture frame from video
            const canvas = document.createElement('canvas');
            canvas.width = videoFeed.videoWidth || 640;
            canvas.height = videoFeed.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);
            
            // Convert to blob
            canvas.toBlob(async (blob) => {
                if (blob && isVideoAnalyzing) {
                    await analyzeVideoFrame(blob);
                }
            }, 'image/jpeg', 0.8);
            
        } catch (error) {
            console.error('Frame capture error:', error);
        }
    }, 2000);
}

async function analyzeVideoFrame(frameBlob) {
    const analysisInsights = document.getElementById('analysisInsights');
    
    try {
        const formData = new FormData();
        formData.append('image', frameBlob, 'frame.jpg');
        
        const response = await fetch(`${API_BASE_URL}/predict_image`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) return; // Silently fail for video frames
        
        const data = await response.json();
        
        // Apply temporal smoothing for video analysis
        if (data.probabilities && Object.keys(data.probabilities).length > 0) {
            const smoothedProbabilities = temporalSmoothing(data.probabilities);
            const smoothedLabel = Object.keys(smoothedProbabilities).reduce((a, b) => 
                smoothedProbabilities[a] > smoothedProbabilities[b] ? a : b
            );
            
            // Create smoothed data object
            const smoothedData = {
                ...data,
                probabilities: smoothedProbabilities,
                label: smoothedLabel
            };
            
            // Only display if confidence is sufficient
            if (shouldDisplayResult(smoothedData, 0.3)) {
                displayEmotionResults(smoothedData, 'video');
            }
        } else {
            displayEmotionResults(data, 'video');
        }
        
        // Update insights
        if (analysisInsights) {
            const timestamp = new Date().toLocaleTimeString();
            if (data.faces > 0) {
                const confidenceText = data.confidence ? ` (${Math.round(data.confidence * 100)}% confidence)` : '';
                analysisInsights.textContent = `${timestamp}: Detected ${data.faces} face(s). Dominant emotion: ${data.label}${confidenceText}`;
            } else {
                analysisInsights.textContent = `${timestamp}: No faces detected in current frame.`;
            }
        }
        
    } catch (error) {
        // Silently handle errors for video analysis
        console.error('Video frame analysis error:', error);
    }
}

// Mobile Menu Toggle
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container') && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
        
        // Close menu when clicking a nav link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize based on which page we're on
    initTextAnalysis();
    initAudioAnalysis();
    initImageAnalysis();
    initVideoAnalysis();
    
    console.log('EmotiAI Frontend Initialized');
});
