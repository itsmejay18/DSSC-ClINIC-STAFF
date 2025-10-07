class BarcodeScanner {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.context = null;
        this.stream = null;
        this.isScanning = false;
        this.scanCallback = null;
    }

    async init(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.context = this.canvas.getContext('2d');

        try {
            // Request camera permission
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera if available
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            this.video.srcObject = this.stream;
            this.video.play();
            return true;
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showCameraError();
            return false;
        }
    }

    startScanning(callback) {
        if (!this.video || !this.stream) {
            console.error('Scanner not initialized');
            return false;
        }

        this.scanCallback = callback;
        this.isScanning = true;
        this.scanFrame();
        return true;
    }

    scanFrame() {
        if (!this.isScanning) return;

        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

            // Simulate barcode detection (in real implementation, you'd use a barcode detection library)
            // For demo purposes, we'll use a simple pattern detection
            const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const detectedBarcode = this.simulateBarcodeDetection(imageData);

            if (detectedBarcode && this.scanCallback) {
                this.isScanning = false;
                this.scanCallback(detectedBarcode);
                return;
            }
        }

        // Continue scanning
        requestAnimationFrame(() => this.scanFrame());
    }

    simulateBarcodeDetection(imageData) {
        // This is a simulation. In real implementation, you'd use libraries like:
        // - ZXing-js
        // - QuaggaJS
        // - BarcodeDetector API (if available)
        
        // For demo, we'll return null (no barcode detected)
        // The actual scanning will be triggered by the "Simulate Scan" button
        return null;
    }

    stopScanning() {
        this.isScanning = false;
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
    }

    showCameraError() {
        const videoContainer = document.querySelector('.barcode-scanner');
        if (videoContainer) {
            videoContainer.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--gray-dark);">
                    <i class="fas fa-camera-slash" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Camera access denied or not available</p>
                    <p style="font-size: 0.9rem;">Please allow camera access or use the "Simulate Scan" button</p>
                </div>
            `;
        }
    }

    // Simulate a barcode scan for demo purposes
    simulateScan() {
        const sampleBarcodes = Object.keys(DRUG_DATABASE);
        const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
        
        if (this.scanCallback) {
            this.scanCallback(randomBarcode);
        }
    }
}

// Global barcode scanner instance
let barcodeScanner = null;