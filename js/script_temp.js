document.addEventListener('DOMContentLoaded', () => {
            // --- UI Navigation and View Management ---
            const homeView = document.getElementById('home-view');
            const views = {
                'compress-card': document.getElementById('compress-view'),
                'upscale-card': document.getElementById('upscale-view'),
                'convert-card': document.getElementById('convert-view'),
                'resize-card': document.getElementById('resize-view'),
                'rotate-card': document.getElementById('rotate-view'),
                'watermark-card': document.getElementById('watermark-view'),
                'bw-card': document.getElementById('bw-view'),
                'filter-card': document.getElementById('filter-view'),
                'info-card': document.getElementById('info-view'),
                'crop-card': document.getElementById('crop-view'),
                'blur-card': document.getElementById('blur-view'),
                'sharpen-card': document.getElementById('sharpen-view'),
                'merge-card': document.getElementById('merge-view'),
                'split-card': document.getElementById('split-view'),
                'collage-card': document.getElementById('collage-view'),
                'gif-card': document.getElementById('gif-view'),
            };
			let cropper = null; // Variable to hold the Cropper.js instance
            const backButton = document.getElementById('backButton');
            
            /**
             * Hides all views and shows the specified view.
             * @param {HTMLElement} viewToShow The view to display.
             */
            function showView(viewToShow) {
                Object.values(views).forEach(view => {
                    view.classList.add('hidden');
                });
                homeView.classList.add('hidden');
                viewToShow.classList.remove('hidden');

                if (viewToShow !== homeView) {
                    backButton.classList.remove('hidden');
                } else {
                    backButton.classList.add('hidden');
                }
            }
			
			   // Function to show the home view
            function showHome() {
                Object.values(views).forEach(view => {
                    view.classList.add('hidden');
                });
                homeView.classList.remove('hidden');
                backButton.classList.add('hidden');
                document.querySelector('.main-container').classList.remove('flex-grow');
            }

            
            // Event listeners for cards
            Object.keys(views).forEach(cardId => {
                const card = document.getElementById(cardId);
                if (card) {
                    card.addEventListener('click', () => showView(views[cardId]));
                }
            });

            // Back button functionality
            backButton.addEventListener('click', () => {
                showHome();
                // Clean up Cropper.js instance when going back to home
                if (cropper) {
                    cropper.destroy();
                    cropper = null;
                }
            });


            // --- Shared Components and Variables ---
            const photoContainer = document.getElementById('photo-container');
            let particles = [];
            const fixedSize = 80;
            const radius = fixedSize / 2;
            let currentImage = null; // A shared variable to hold the Image object

            // Helper function to format file sizes
            function formatBytes(bytes, decimals = 2) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const dm = decimals < 0 ? 0 : decimals;
                const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
            }

            // Function to generate and initialize the background photos
            function generateBackgroundPhotos() {
                const photoCount = 30;
                const minVelocity = 0.1;
                const maxVelocity = 0.2;
                const minRotationSpeed = 0.1;
                const maxRotationSpeed = 0.5;

                for (let i = 0; i < photoCount; i++) {
                    const photoDiv = document.createElement('div');
                    photoDiv.classList.add('bg-photo');
                    photoDiv.style.width = `${fixedSize}px`;
                    photoDiv.style.height = `${fixedSize}px`;

                    let x = Math.random() * (window.innerWidth - fixedSize);
                    let y = Math.random() * (window.innerHeight - fixedSize);
                    let vx = (Math.random() - 0.5) * (maxVelocity - minVelocity) + (Math.random() < 0.5 ? -minVelocity : minVelocity);
                    let vy = (Math.random() - 0.5) * (maxVelocity - minVelocity) + (Math.random() < 0.5 ? -minVelocity : minVelocity);
                    let rotationSpeed = (Math.random() * (maxRotationSpeed - minRotationSpeed) + minRotationSpeed) * (Math.random() < 0.5 ? 1 : -1);

                    const img = new Image();
                    const randomSeed = Math.floor(Math.random() * 1000);
                    img.src = `https://picsum.photos/seed/${randomSeed}/${fixedSize}/${fixedSize}`;

                    img.onload = () => {
                        photoDiv.style.backgroundImage = `url('${img.src}')`;
                        photoDiv.classList.add('loaded');
                    };
                    photoContainer.appendChild(photoDiv);

                    particles.push({
                        element: photoDiv,
                        x: x,
                        y: y,
                        vx: vx,
                        vy: vy,
                        rotation: 0,
                        rotationSpeed: rotationSpeed,
                    });
                }
                animateBackgroundPhotos();
            }

            // The main animation loop for the background photos
            function animateBackgroundPhotos() {
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;

                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.rotation += p.rotationSpeed;
                    p.element.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
                });

                particles.forEach(p => {
                    if (p.x + fixedSize > screenWidth || p.x < 0) {
                        p.vx *= -1;
                    }
                    if (p.y + fixedSize > screenHeight || p.y < 0) {
                        p.vy *= -1;
                    }
                });

                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const p1 = particles[i];
                        const p2 = particles[j];
                        const dx = (p1.x + radius) - (p2.x + radius);
                        const dy = (p1.y + radius) - (p2.y + radius);
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < fixedSize) {
                            [p1.vx, p2.vx] = [p2.vx, p1.vx];
                            [p1.vy, p2.vy] = [p2.vy, p1.vy];
                            [p1.rotationSpeed, p2.rotationSpeed] = [p2.rotationSpeed, p1.rotationSpeed];
                            const overlap = fixedSize - distance;
                            const separationX = (overlap / distance) * dx;
                            const separationY = (overlap / distance) * dy;
                            p1.x += separationX / 2;
                            p1.y += separationY / 2;
                            p2.x -= separationX / 2;
                            p2.y -= separationY / 2;
                        }
                    }
                }
                requestAnimationFrame(animateBackgroundPhotos);
            }

            // Function to handle image upload and setup for each tool
            function setupTool(uploadInput, originalCanvas, outputCanvas, processFunction) {
                uploadInput.addEventListener('change', (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const img = new Image();
                            img.onload = () => {
                                currentImage = img;
                                
                                // Set original canvas dimensions
                                originalCanvas.width = img.width;
                                originalCanvas.height = img.height;
                                originalCanvas.getContext('2d').drawImage(img, 0, 0);

                                // Process the image
                                processFunction();
                            };
                            img.src = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            // --- Image Compression Logic ---
            const compressImageUpload = document.getElementById('compress-image-upload');
            const qualitySlider = document.getElementById('quality-slider');
            const qualityValue = document.getElementById('quality-value');
            const outputCanvas = document.getElementById('output-canvas');
            const originalImageElement = document.getElementById('original-image');
            const compressButton = document.getElementById('compress-button');
            const compressDownloadButton = document.getElementById('compress-download-button');
            const statusMessage = document.getElementById('status-message');
            const loader = document.getElementById('loader');
            const outputSection = document.querySelector('#compress-view .output-section');
            const originalSizeValue = document.getElementById('original-size-value');
            const compressedSizeValue = document.getElementById('compressed-size-value');
            const compressionPercentValue = document.getElementById('compression-percent-value');
            const compressCtx = outputCanvas.getContext('2d');
            let originalCompressFile = null;

            function compressAndDisplayImage() {
                if (!currentImage) { return; }
                loader.classList.remove('hidden');
                statusMessage.textContent = 'Compressing image...';
                statusMessage.classList.remove('hidden');
                compressDownloadButton.classList.add('hidden');

                const quality = qualitySlider.value / 100;
                const originalWidth = currentImage.naturalWidth;
                const originalHeight = currentImage.naturalHeight;

                outputCanvas.width = originalWidth;
                outputCanvas.height = originalHeight;
                compressCtx.drawImage(currentImage, 0, 0, originalWidth, originalHeight);

                const compressedDataURL = outputCanvas.toDataURL('image/jpeg', quality);
                const compressedFileSize = (compressedDataURL.length * 0.75) - 1;

                originalSizeValue.textContent = formatBytes(originalCompressFile.size);
                compressedSizeValue.textContent = formatBytes(compressedFileSize);
                const compressionPercentage = ((originalCompressFile.size - compressedFileSize) / originalCompressFile.size * 100).toFixed(2);
                compressionPercentValue.textContent = `${compressionPercentage}%`;

                setTimeout(() => {
                    compressDownloadButton.classList.remove('hidden');
                }, 100);

                loader.classList.add('hidden');
                statusMessage.textContent = 'Compression complete!';
                outputSection.classList.remove('hidden');
            }

            qualitySlider.addEventListener('input', () => {
                qualityValue.textContent = `${qualitySlider.value}%`;
            });

            compressButton.addEventListener('click', () => {
                if (currentImage) {
                    compressAndDisplayImage();
                } else {
                    statusMessage.textContent = 'Please upload an image first!';
                    statusMessage.classList.remove('hidden');
                }
            });
            
            compressImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    originalCompressFile = file;
                    outputSection.classList.add('hidden');
                    compressButton.classList.remove('hidden');

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        currentImage = new Image();
                        currentImage.onload = () => {
                            originalImageElement.src = e.target.result;
                        };
                        currentImage.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                } else {
                    statusMessage.textContent = 'Please upload an image to begin.';
                    statusMessage.classList.remove('hidden');
                }
            });

            compressDownloadButton.addEventListener('click', () => {
                const dataURL = outputCanvas.toDataURL('image/jpeg', qualitySlider.value / 100);
                const a = document.createElement('a');
                a.href = dataURL;
                a.download = `compressed_image_${qualitySlider.value}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });

            // --- Image Upscaling Logic ---
            const upscaleImageUpload = document.getElementById('upscale-image-upload');
            const scaleFactorSlider = document.getElementById('scale-factor-slider');
            const scaleFactorValue = document.getElementById('scale-factor-value');
            const upscaleButton = document.getElementById('upscale-button');
            const upscaleDownloadButton = document.getElementById('upscale-download-button');
            const originalUpscaleCanvas = document.getElementById('original-upscale-canvas');
            const upscaledCanvas = document.getElementById('upscaled-canvas');
            const originalUpscaleCtx = originalUpscaleCanvas.getContext('2d');
            const upscaledCtx = upscaledCanvas.getContext('2d');
            const upscaleOutputSection = document.querySelector('#upscale-view .output-section');
            const originalResolutionSpan = document.getElementById('original-resolution');
            const upscaledResolutionSpan = document.getElementById('upscaled-resolution');

            function drawUpscaledImage() {
                if (!currentImage) return;
                const factor = parseFloat(scaleFactorSlider.value);
                const newWidth = currentImage.width * factor;
                const newHeight = currentImage.height * factor;
                upscaledCanvas.width = newWidth;
                upscaledCanvas.height = newHeight;
                upscaledCtx.imageSmoothingEnabled = true;
                upscaledCtx.imageSmoothingQuality = 'high';
                upscaledCtx.drawImage(currentImage, 0, 0, newWidth, newHeight);
                upscaledResolutionSpan.textContent = `${upscaledCanvas.width} x ${upscaledCanvas.height} pixels`;
            }

            upscaleImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        currentImage = new Image();
                        currentImage.onload = () => {
                            // Draw original on canvas to display
                            originalUpscaleCanvas.width = currentImage.width;
                            originalUpscaleCanvas.height = currentImage.height;
                            originalUpscaleCtx.drawImage(currentImage, 0, 0);
                            originalResolutionSpan.textContent = `${originalUpscaleCanvas.width} x ${originalUpscaleCanvas.height} pixels`;
                            
                            drawUpscaledImage();
                            upscaleDownloadButton.classList.remove('hidden');
                            upscaleOutputSection.classList.remove('hidden');
                        };
                        currentImage.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Add an event listener to the slider to dynamically update the image
            scaleFactorSlider.addEventListener('input', () => {
                scaleFactorValue.textContent = `${scaleFactorSlider.value}x`;
                if (currentImage) {
                    drawUpscaledImage();
                }
            });

            upscaleButton.addEventListener('click', () => {
                if (currentImage) {
                    drawUpscaledImage();
                    upscaleDownloadButton.classList.remove('hidden');
                    upscaleOutputSection.classList.remove('hidden');
                }
            });

            upscaleDownloadButton.addEventListener('click', () => {
                if (upscaledCanvas.width > 0 && upscaledCanvas.height > 0) {
                    const link = document.createElement('a');
                    link.download = 'upscaled_image.png';
                    link.href = upscaledCanvas.toDataURL('image/png');
                    link.click();
                }
            });

            // --- Convert to PDF Logic ---
            const convertImageUpload = document.getElementById('convert-image-upload');
            const convertButton = document.getElementById('convert-button');
            const convertOutputSection = document.querySelector('#convert-view .output-section');
            const convertDownloadButton = document.getElementById('convert-download-button');

            convertImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        currentImage = new Image();
                        currentImage.onload = () => {
                            convertButton.classList.remove('hidden');
                            convertOutputSection.classList.add('hidden');
                            convertDownloadButton.classList.add('hidden');
                        };
                        currentImage.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            convertButton.addEventListener('click', () => {
                if (!currentImage) return;

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                const imgWidth = currentImage.width;
                const imgHeight = currentImage.height;
                const docWidth = doc.internal.pageSize.getWidth();
                const docHeight = doc.internal.pageSize.getHeight();

                const ratio = Math.min(docWidth / imgWidth, docHeight / imgHeight);
                const finalWidth = imgWidth * ratio;
                const finalHeight = imgHeight * ratio;
                const x = (docWidth - finalWidth) / 2;
                const y = (docHeight - finalHeight) / 2;

                doc.addImage(currentImage, 'JPEG', x, y, finalWidth, finalHeight);
                
                convertDownloadButton.classList.remove('hidden');
                convertOutputSection.classList.remove('hidden');
                
                convertDownloadButton.addEventListener('click', () => {
                    doc.save('converted_image.pdf');
                });
            });


            // --- Resize Image Logic ---
            const resizeImageUpload = document.getElementById('resize-image-upload');
            const widthInput = document.getElementById('width-input');
            const heightInput = document.getElementById('height-input');
            const resizeButton = document.getElementById('resize-button');
            const originalResizeCanvas = document.getElementById('original-resize-canvas');
            const resizedCanvas = document.getElementById('resized-canvas');
            const resizeOutputSection = document.querySelector('#resize-view .output-section');
            const resizeDownloadButton = document.getElementById('resize-download-button');

            function resizeAndDisplayImage() {
                if (!currentImage) return;

                const newWidth = parseInt(widthInput.value) || currentImage.width;
                const newHeight = parseInt(heightInput.value) || currentImage.height;

                resizedCanvas.width = newWidth;
                resizedCanvas.height = newHeight;
                const ctx = resizedCanvas.getContext('2d');
                ctx.drawImage(currentImage, 0, 0, newWidth, newHeight);
                resizeDownloadButton.classList.remove('hidden');
                resizeOutputSection.classList.remove('hidden');
            }

            resizeImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        currentImage = new Image();
                        currentImage.onload = () => {
                            originalResizeCanvas.width = currentImage.width;
                            originalResizeCanvas.height = currentImage.height;
                            originalResizeCanvas.getContext('2d').drawImage(currentImage, 0, 0);
                            widthInput.value = currentImage.width;
                            heightInput.value = currentImage.height;
                        };
                        currentImage.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            resizeButton.addEventListener('click', resizeAndDisplayImage);
            resizeDownloadButton.addEventListener('click', () => {
                if (resizedCanvas.width > 0) {
                    const link = document.createElement('a');
                    link.download = `resized_image.png`;
                    link.href = resizedCanvas.toDataURL();
                    link.click();
                }
            });
			
			
			  // --- NEW ELEMENTS FOR CROP FUNCTIONALITY ---
            const cropCard = document.getElementById('crop-card');
            const cropView = document.getElementById('crop-view');
            const cropImageUpload = document.getElementById('crop-image-upload');
            const cropOutputSection = document.getElementById('crop-output-section');
            const cropTargetImage = document.getElementById('crop-target-image');
            const cropButton = document.getElementById('crop-button');
            const cropDownloadButton = document.getElementById('crop-download-button');
            const croppedPreviewContainer = document.getElementById('cropped-preview-container');
            const croppedPreviewImage = document.getElementById('cropped-preview-image');
            
           // --- NEW CROP LOGIC ---
            cropImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    // Reset the download button and preview section
                    cropOutputSection.classList.remove('hidden');
                    cropDownloadButton.classList.add('hidden');
                    croppedPreviewContainer.classList.add('hidden');

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        cropTargetImage.src = e.target.result;
                        
                        // Destroy any existing cropper instance to prevent duplicates
                        if (cropper) {
                            cropper.destroy();
                        }
                        
                        // Initialize Cropper.js on the uploaded image
                        cropper = new Cropper(cropTargetImage, {
                            aspectRatio: NaN, // Allow free aspect ratio
                            viewMode: 1, // Restrict the crop box to not exceed the canvas
                            autoCropArea: 0.8 // Set initial crop area to 80%
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Handle the crop button click
            cropButton.addEventListener('click', () => {
                if (cropper) {
                    // Get the cropped image data as a canvas
                    const croppedCanvas = cropper.getCroppedCanvas();
                    // Get the data URL from the canvas
                    const dataUrl = croppedCanvas.toDataURL('image/png');

                    // Display the cropped image in the preview
                    croppedPreviewImage.src = dataUrl;
                    croppedPreviewContainer.classList.remove('hidden');
                    cropDownloadButton.classList.remove('hidden');
                }
            });

            // Handle the download button click for the cropped image
            cropDownloadButton.addEventListener('click', () => {
                if (cropper) {
                    const croppedCanvas = cropper.getCroppedCanvas();
                    croppedCanvas.toBlob((blob) => {
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `cropped-${Date.now()}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }, 'image/png');
                }
            });


            // --- Rotate Image Logic ---
            const rotateImageUpload = document.getElementById('rotate-image-upload');
            const rotateLeftButton = document.getElementById('rotate-left-button');
            const rotateRightButton = document.getElementById('rotate-right-button');
            const originalRotateCanvas = document.getElementById('original-rotate-canvas');
            const rotatedCanvas = document.getElementById('rotated-canvas');
            const rotateOutputSection = document.querySelector('#rotate-view .output-section');
            const rotateDownloadButton = document.getElementById('rotate-download-button');
            let rotationAngle = 0;

            function rotateAndDisplayImage() {
                if (!currentImage) return;
                const newWidth = (rotationAngle % 180 === 0) ? currentImage.width : currentImage.height;
                const newHeight = (rotationAngle % 180 === 0) ? currentImage.height : currentImage.width;
                
                rotatedCanvas.width = newWidth;
                rotatedCanvas.height = newHeight;
                const ctx = rotatedCanvas.getContext('2d');
                
                ctx.save();
                ctx.clearRect(0, 0, newWidth, newHeight);
                ctx.translate(newWidth / 2, newHeight / 2);
                ctx.rotate(rotationAngle * Math.PI / 180);
                ctx.drawImage(currentImage, -currentImage.width / 2, -currentImage.height / 2);
                ctx.restore();
                
                rotateDownloadButton.classList.remove('hidden');
                rotateOutputSection.classList.remove('hidden');
            }

            rotateImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        currentImage = new Image();
                        currentImage.onload = () => {
                            originalRotateCanvas.width = currentImage.width;
                            originalRotateCanvas.height = currentImage.height;
                            originalRotateCanvas.getContext('2d').drawImage(currentImage, 0, 0);
                            rotationAngle = 0;
                            rotateAndDisplayImage();
                        };
                        currentImage.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            rotateRightButton.addEventListener('click', () => {
                rotationAngle += 90;
                rotateAndDisplayImage();
            });

            rotateLeftButton.addEventListener('click', () => {
                rotationAngle -= 90;
                rotateAndDisplayImage();
            });

            rotateDownloadButton.addEventListener('click', () => {
                if (rotatedCanvas.width > 0) {
                    const link = document.createElement('a');
                    link.download = `rotated_image.png`;
                    link.href = rotatedCanvas.toDataURL();
                    link.click();
                }
            });

            // --- Add Watermark Logic ---
            const watermarkImageUpload = document.getElementById('watermark-image-upload');
            const watermarkTextInput = document.getElementById('watermark-text-input');
            const watermarkButton = document.getElementById('watermark-button');
            const originalWatermarkCanvas = document.getElementById('original-watermark-canvas');
            const watermarkedCanvas = document.getElementById('watermarked-canvas');
            const watermarkOutputSection = document.querySelector('#watermark-view .output-section');
            const watermarkDownloadButton = document.getElementById('watermark-download-button');

            function addWatermark() {
                if (!currentImage) return;

                watermarkedCanvas.width = currentImage.width;
                watermarkedCanvas.height = currentImage.height;
                const ctx = watermarkedCanvas.getContext('2d');
                
                // Draw original image first
                ctx.drawImage(currentImage, 0, 0);

                // Now draw the watermark text
                const text = watermarkTextInput.value || "Meezu";
                ctx.font = `${currentImage.width / 20}px Arial`;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.textAlign = 'center';
                ctx.fillText(text, currentImage.width / 2, currentImage.height / 2);
                
                watermarkDownloadButton.classList.remove('hidden');
                watermarkOutputSection.classList.remove('hidden');
            }

            watermarkImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        currentImage = new Image();
                        currentImage.onload = () => {
                            originalWatermarkCanvas.width = currentImage.width;
                            originalWatermarkCanvas.height = currentImage.height;
                            originalWatermarkCanvas.getContext('2d').drawImage(currentImage, 0, 0);
                            addWatermark();
                        };
                        currentImage.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            watermarkButton.addEventListener('click', addWatermark);

            watermarkDownloadButton.addEventListener('click', () => {
                if (watermarkedCanvas.width > 0) {
                    const link = document.createElement('a');
                    link.download = `watermarked_image.png`;
                    link.href = watermarkedCanvas.toDataURL();
                    link.click();
                }
            });
			
			
			
            // === Blur Image Feature (NEW) ===
            const blurCard = document.getElementById('blur-card');
            const blurImageUpload = document.getElementById('blur-image-upload');
            const blurStrengthSlider = document.getElementById('blur-strength-slider');
            const blurStrengthValue = document.getElementById('blur-strength-value');
            const blurButton = document.getElementById('blur-button');
            const blurOriginalImage = document.getElementById('blur-original-image');
            const blurOutputCanvas = document.getElementById('blur-output-canvas');
            const blurDownloadButton = document.getElementById('blur-download-button');
            const blurStatusMessage = document.getElementById('blur-status-message');
            const blurLoader = document.getElementById('blur-loader');
            const blurOutputSection = document.querySelector('#blur-view .output-section');

            let blurImage = null;

            blurImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        blurImage = new Image();
                        blurImage.onload = () => {
                            blurOriginalImage.src = e.target.result;
                            blurButton.classList.remove('hidden');
                            blurOutputSection.classList.add('hidden');
                            blurStatusMessage.classList.add('hidden');
                        };
                        blurImage.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            blurStrengthSlider.addEventListener('input', () => {
                blurStrengthValue.textContent = `${blurStrengthSlider.value} px`;
            });

            blurButton.addEventListener('click', () => {
                if (!blurImage) {
                    blurStatusMessage.textContent = 'Please upload an image first.';
                    blurStatusMessage.classList.remove('hidden');
                    return;
                }

                blurLoader.classList.remove('hidden');
                blurOutputSection.classList.add('hidden');

                const blurStrength = parseInt(blurStrengthSlider.value, 10);
                const ctx = blurOutputCanvas.getContext('2d');
                
                blurOutputCanvas.width = blurImage.naturalWidth;
                blurOutputCanvas.height = blurImage.naturalHeight;
                
                // Draw the original image to the canvas
                ctx.drawImage(blurImage, 0, 0);

                // Apply blur filter
                // Note: The blur filter is a simple way to achieve the effect. For more advanced,
                // performant blurring, a custom algorithm (like Gaussian blur) would be needed.
                ctx.filter = `blur(${blurStrength}px)`;
                ctx.drawImage(blurImage, 0, 0, blurImage.naturalWidth, blurImage.naturalHeight);
                ctx.filter = 'none'; // Reset filter so future draws are not blurred

                setTimeout(() => {
                    blurLoader.classList.add('hidden');
                    blurOutputSection.classList.remove('hidden');
                    blurDownloadButton.href = blurOutputCanvas.toDataURL();
                    blurDownloadButton.download = 'blurred-image.png';
                    blurDownloadButton.classList.remove('hidden');
                }, 500);
            });
            // === END Blur Image Feature ===
			
			
			
			 // --- Sharpen Image Feature ---
            const sharpenImageUpload = document.getElementById('sharpen-image-upload');
            const sharpenStrengthSlider = document.getElementById('sharpen-strength-slider');
            const sharpenStrengthValue = document.getElementById('sharpen-strength-value');
            const originalSharpenCanvas = document.getElementById('original-sharpen-canvas');
            const sharpenOutputCanvas = document.getElementById('sharpen-output-canvas');
            const sharpenButton = document.getElementById('sharpen-button');
            const sharpenOutputSection = document.querySelector('#sharpen-view .output-section');
            const sharpenDownloadButton = document.getElementById('sharpen-download-button');
            
            function applySharpen(strength) {
                if (!currentImage) return;
                
                const ctx = sharpenOutputCanvas.getContext('2d');
                const {width, height} = currentImage;
                
                // Clear and redraw for new sharpening level
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(currentImage, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = width;
                tempCanvas.height = height;
                tempCtx.putImageData(imageData, 0, 0);
                
                const tempImageData = tempCtx.getImageData(0, 0, width, height);
                const tempData = tempImageData.data;
                
                const kernel = [0, -strength, 0, -strength, 4 * strength + 1, -strength, 0, -strength, 0];
                const kernelSum = 1; 
                
                for (let y = 1; y < height - 1; y++) {
                    for (let x = 1; x < width - 1; x++) {
                        let r = 0, g = 0, b = 0;
                        for (let ky = -1; ky <= 1; ky++) {
                            for (let kx = -1; kx <= 1; kx++) {
                                const index = (y + ky) * width * 4 + (x + kx) * 4;
                                const kernelIndex = (ky + 1) * 3 + (kx + 1);
                                const kernelValue = kernel[kernelIndex];
                                
                                r += tempData[index] * kernelValue;
                                g += tempData[index + 1] * kernelValue;
                                b += tempData[index + 2] * kernelValue;
                            }
                        }
                        
                        const outputIndex = y * width * 4 + x * 4;
                        data[outputIndex] = Math.min(255, Math.max(0, r / kernelSum));
                        data[outputIndex + 1] = Math.min(255, Math.max(0, g / kernelSum));
                        data[outputIndex + 2] = Math.min(255, Math.max(0, b / kernelSum));
                    }
                }
                
                ctx.putImageData(imageData, 0, 0);
                sharpenDownloadButton.classList.remove('hidden');
            }
            
            sharpenImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            currentImage = img;
                            // Set original canvas dimensions
                            originalSharpenCanvas.width = img.width;
                            originalSharpenCanvas.height = img.height;
                            originalSharpenCanvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
                            
                            // Set output canvas dimensions
                            sharpenOutputCanvas.width = img.width;
                            sharpenOutputCanvas.height = img.height;
                            
                            sharpenOutputSection.classList.remove('hidden');
                            sharpenButton.classList.remove('hidden');
                            
                            // Apply sharpening initially with default value
                            applySharpen(sharpenStrengthSlider.value / 100);
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            sharpenStrengthSlider.addEventListener('input', (e) => {
                sharpenStrengthValue.textContent = `${e.target.value}%`;
                if (currentImage) {
                    applySharpen(e.target.value / 100);
                }
            });
            
            sharpenDownloadButton.addEventListener('click', () => {
                const dataUrl = sharpenOutputCanvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'sharpened-image.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
			
			
			
            
            // --- Black & White Logic ---
            const bwImageUpload = document.getElementById('bw-image-upload');
            const bwButton = document.getElementById('bw-button');
            const originalBwCanvas = document.getElementById('original-bw-canvas');
            const bwCanvas = document.getElementById('bw-canvas');
            const bwOutputSection = document.querySelector('#bw-view .output-section');
            const bwDownloadButton = document.getElementById('bw-download-button');

            function applyBlackAndWhite() {
                if (!currentImage) return;

                bwCanvas.width = currentImage.width;
                bwCanvas.height = currentImage.height;
                const ctx = bwCanvas.getContext('2d');
                
                ctx.filter = 'grayscale(100%)';
                ctx.drawImage(currentImage, 0, 0);
                
                bwDownloadButton.classList.remove('hidden');
                bwOutputSection.classList.remove('hidden');
            }

            bwImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        currentImage = new Image();
                        currentImage.onload = () => {
                            originalBwCanvas.width = currentImage.width;
                            originalBwCanvas.height = currentImage.height;
                            originalBwCanvas.getContext('2d').drawImage(currentImage, 0, 0);
                            applyBlackAndWhite();
                        };
                        currentImage.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            bwButton.addEventListener('click', applyBlackAndWhite);

            bwDownloadButton.addEventListener('click', () => {
                if (bwCanvas.width > 0) {
                    const link = document.createElement('a');
                    link.download = `bw_image.png`;
                    link.href = bwCanvas.toDataURL();
                    link.click();
                }
            });
            
            // --- Apply Filters Logic ---
            const filterImageUpload = document.getElementById('filter-image-upload');
            const filterSelect = document.getElementById('filter-select');
            const filterButton = document.getElementById('filter-button');
            const originalFilterCanvas = document.getElementById('original-filter-canvas');
            const filteredCanvas = document.getElementById('filtered-canvas');
            const filterOutputSection = document.querySelector('#filter-view .output-section');
            const filterDownloadButton = document.getElementById('filter-download-button');

            function applyFilter() {
                if (!currentImage) return;

                filteredCanvas.width = currentImage.width;
                filteredCanvas.height = currentImage.height;
                const ctx = filteredCanvas.getContext('2d');
                
                const selectedFilter = filterSelect.value;
                ctx.filter = `${selectedFilter}(100%)`;
                if (selectedFilter === 'none') {
                    ctx.filter = 'none';
                } else if (selectedFilter === 'sepia') {
                    ctx.filter = 'sepia(100%)';
                } else if (selectedFilter === 'blur') {
                    ctx.filter = 'blur(5px)';
                } else if (selectedFilter === 'invert') {
                    ctx.filter = 'invert(100%)';
                }
                
                ctx.drawImage(currentImage, 0, 0);
                
                filterDownloadButton.classList.remove('hidden');
                filterOutputSection.classList.remove('hidden');
            }

            filterImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        currentImage = new Image();
                        currentImage.onload = () => {
                            originalFilterCanvas.width = currentImage.width;
                            originalFilterCanvas.height = currentImage.height;
                            originalFilterCanvas.getContext('2d').drawImage(currentImage, 0, 0);
                            applyFilter();
                        };
                        currentImage.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            filterSelect.addEventListener('change', applyFilter);
            filterButton.addEventListener('click', applyFilter);

            filterDownloadButton.addEventListener('click', () => {
                if (filteredCanvas.width > 0) {
                    const link = document.createElement('a');
                    link.download = `filtered_image.png`;
                    link.href = filteredCanvas.toDataURL();
                    link.click();
                }
            });
			
			
			 // Merge Images
            const mergeUpload = document.getElementById('merge-image-upload');
            const mergeButton = document.getElementById('merge-button');
            const mergeDownloadButton = document.getElementById('merge-download-button');
            const mergeOutputCanvas = document.getElementById('merge-output-canvas');
            const mergeLoader = document.getElementById('merge-loader');
            const mergeOutputSection = document.querySelector('#merge-view .output-section');

            mergeUpload.addEventListener('change', () => {
                if (mergeUpload.files.length >= 2) {
                    mergeButton.classList.remove('hidden');
                    mergeOutputSection.classList.add('hidden');
                } else {
                    mergeButton.classList.add('hidden');
                }
            });

            mergeButton.addEventListener('click', () => {
                const files = mergeUpload.files;
                if (files.length < 2) return;
                
                mergeLoader.classList.remove('hidden');
                mergeButton.classList.add('hidden');
                mergeOutputSection.classList.add('hidden');

                const images = [];
                let loadedCount = 0;
                
                for (let i = 0; i < files.length; i++) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            images.push(img);
                            loadedCount++;
                            if (loadedCount === files.length) {
                                // All images loaded, now merge
                                mergeAllImages(images);
                            }
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(files[i]);
                }
                
                function mergeAllImages(imgs) {
                    // Find the largest image dimensions
                    const maxWidth = Math.max(...imgs.map(img => img.width));
                    const totalHeight = imgs.reduce((sum, img) => sum + img.height, 0);

                    mergeOutputCanvas.width = maxWidth;
                    mergeOutputCanvas.height = totalHeight;
                    const ctx = mergeOutputCanvas.getContext('2d');
                    
                    let yOffset = 0;
                    imgs.forEach(img => {
                        ctx.drawImage(img, 0, yOffset, maxWidth, img.height);
                        yOffset += img.height;
                    });
                    
                    mergeDownloadButton.onclick = () => {
                        const link = document.createElement('a');
                        link.download = `merged-image.png`;
                        link.href = mergeOutputCanvas.toDataURL('image/png');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    };
                    
                    mergeLoader.classList.add('hidden');
                    mergeOutputSection.classList.remove('hidden');
                    mergeDownloadButton.classList.remove('hidden');
                }
            });
			
			
			    // Split Image
            const splitUpload = document.getElementById('split-image-upload');
            const splitButton = document.getElementById('split-button');
            const splitDownloadButton = document.getElementById('split-download-all-button');
            const splitRowsInput = document.getElementById('split-rows');
            const splitColsInput = document.getElementById('split-cols');
            const splitOutputContainer = document.getElementById('split-output-container');
            const splitLoader = document.getElementById('split-loader');
            const splitOutputSection = document.querySelector('#split-view .output-section');
            
            let originalSplitImage = null;

            splitUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.src = e.target.result;
                        img.onload = () => {
                            originalSplitImage = img;
                            splitButton.classList.remove('hidden');
                            splitOutputSection.classList.add('hidden');
                        };
                    };
                    reader.readAsDataURL(file);
                }
            });

            splitButton.addEventListener('click', () => {
                if (!originalSplitImage) return;

                splitLoader.classList.remove('hidden');
                splitButton.classList.add('hidden');
                splitOutputSection.classList.add('hidden');
                splitOutputContainer.innerHTML = '';
                
                const rows = parseInt(splitRowsInput.value) || 1;
                const cols = parseInt(splitColsInput.value) || 1;
                
                const pieceWidth = originalSplitImage.width / cols;
                const pieceHeight = originalSplitImage.height / rows;
                
                const canvases = [];
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        const canvas = document.createElement('canvas');
                        canvas.width = pieceWidth;
                        canvas.height = pieceHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(originalSplitImage, j * pieceWidth, i * pieceHeight, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);
                        
                        const container = document.createElement('div');
                        container.className = 'image-container glass-card p-2';
                        container.appendChild(canvas);
                        splitOutputContainer.appendChild(container);
                        canvases.push(canvas);
                    }
                }
                
                splitDownloadButton.onclick = async () => {
                    if (typeof JSZip === 'undefined' || typeof saveAs === 'undefined') {
                        // Dynamically load JSZip and FileSaver.js if they are not present
                        await Promise.all([
                            loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'),
                            loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js')
                        ]);
                    }

                    const zip = new JSZip();
                    canvases.forEach((canvas, index) => {
                        const imgData = canvas.toDataURL('image/png').split(',')[1];
                        zip.file(`piece-${index + 1}.png`, imgData, { base64: true });
                    });
                    
                    zip.generateAsync({ type: "blob" }).then((content) => {
                        saveAs(content, `split-images.zip`);
                    });
                };

                splitLoader.classList.add('hidden');
                splitOutputSection.classList.remove('hidden');
                splitDownloadButton.classList.remove('hidden');
            });

            function loadScript(src) {
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
			

            // --- Image Info Logic ---
            const infoImageUpload = document.getElementById('info-image-upload');
            const infoImage = document.getElementById('info-image');
            const infoOutputSection = document.querySelector('#info-view .output-section');
            const infoFilename = document.getElementById('info-filename');
            const infoType = document.getElementById('info-type');
            const infoSize = document.getElementById('info-size');
            const infoDimensions = document.getElementById('info-dimensions');

            function displayImageInfo(file) {
                if (!currentImage) return;
                
                infoFilename.textContent = file.name;
                infoType.textContent = file.type;
                infoSize.textContent = formatBytes(file.size);
                infoDimensions.textContent = `${currentImage.width} x ${currentImage.height} pixels`;
                
                infoOutputSection.classList.remove('hidden');
            }

            infoImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        currentImage = new Image();
                        currentImage.onload = () => {
                            infoImage.src = e.target.result;
                            displayImageInfo(file);
                        };
                        currentImage.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
			
			
			
            // Create Collage
            const collageUpload = document.getElementById('collage-image-upload');
            const collageButton = document.getElementById('collage-button');
            const collageDownloadButton = document.getElementById('collage-download-button');
            const collageOutputCanvas = document.getElementById('collage-output-canvas');
            const collageLoader = document.getElementById('collage-loader');
            const collageOutputSection = document.querySelector('#collage-view .output-section');

            collageUpload.addEventListener('change', () => {
                if (collageUpload.files.length >= 2) {
                    collageButton.classList.remove('hidden');
                    collageOutputSection.classList.add('hidden');
                } else {
                    collageButton.classList.add('hidden');
                }
            });

            collageButton.addEventListener('click', () => {
                const files = collageUpload.files;
                if (files.length < 2) return;

                collageLoader.classList.remove('hidden');
                collageButton.classList.add('hidden');
                collageOutputSection.classList.add('hidden');

                const images = [];
                let loadedCount = 0;

                for (let i = 0; i < files.length; i++) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            images.push(img);
                            loadedCount++;
                            if (loadedCount === files.length) {
                                createCollage(images);
                            }
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(files[i]);
                }

                function createCollage(imgs) {
                    const cols = Math.ceil(Math.sqrt(imgs.length));
                    const rows = Math.ceil(imgs.length / cols);
                    
                    const maxImgWidth = Math.max(...imgs.map(img => img.width));
                    const maxImgHeight = Math.max(...imgs.map(img => img.height));
                    
                    collageOutputCanvas.width = maxImgWidth * cols;
                    collageOutputCanvas.height = maxImgHeight * rows;
                    
                    const ctx = collageOutputCanvas.getContext('2d');
                    ctx.fillStyle = '#1f2937'; // Background color
                    ctx.fillRect(0, 0, collageOutputCanvas.width, collageOutputCanvas.height);

                    let xOffset = 0;
                    let yOffset = 0;
                    
                    imgs.forEach((img, index) => {
                        const currentX = (index % cols) * maxImgWidth;
                        const currentY = Math.floor(index / cols) * maxImgHeight;
                        
                        const imgX = currentX + (maxImgWidth - img.width) / 2;
                        const imgY = currentY + (maxImgHeight - img.height) / 2;
                        
                        ctx.drawImage(img, imgX, imgY);
                    });

                    collageDownloadButton.onclick = () => {
                        const link = document.createElement('a');
                        link.download = `collage.png`;
                        link.href = collageOutputCanvas.toDataURL('image/png');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    };

                    collageLoader.classList.add('hidden');
                    collageOutputSection.classList.remove('hidden');
                    collageDownloadButton.classList.remove('hidden');
                }
            });
            
            // GIF Maker
            const gifUpload = document.getElementById('gif-image-upload');
            const gifButton = document.getElementById('gif-button');
            const gifDownloadButton = document.getElementById('gif-download-button');
            const gifOutputImage = document.getElementById('gif-output-image');
            const gifDelayInput = document.getElementById('gif-delay');
            const gifLoader = document.getElementById('gif-loader');
            const gifOutputSection = document.querySelector('#gif-view .output-section');
            
            gifUpload.addEventListener('change', () => {
                if (gifUpload.files.length >= 2) {
                    gifButton.classList.remove('hidden');
                    gifOutputSection.classList.add('hidden');
                } else {
                    gifButton.classList.add('hidden');
                }
            });

            gifButton.addEventListener('click', async () => {
                const files = gifUpload.files;
                if (files.length < 2) return;

                gifLoader.classList.remove('hidden');
                gifButton.classList.add('hidden');
                gifOutputSection.classList.add('hidden');
                
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gif.js/1.0.1/gif.min.js');

                const images = [];
                let loadedCount = 0;

                for (let i = 0; i < files.length; i++) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            images.push(img);
                            loadedCount++;
                            if (loadedCount === files.length) {
                                createGif(images);
                            }
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(files[i]);
                }

                function createGif(imgs) {
                    const delay = parseInt(gifDelayInput.value);
                    const gif = new GIF({
                        workers: 2,
                        quality: 10,
                        workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/1.0.1/gif.worker.min.js'
                    });

                    imgs.forEach(img => {
                        gif.addFrame(img, { delay: delay });
                    });
                    
                    gif.on('finished', function(blob) {
                        gifOutputImage.src = URL.createObjectURL(blob);
                        
                        gifDownloadButton.onclick = () => {
                            const link = document.createElement('a');
                            link.download = `animated.gif`;
                            link.href = URL.createObjectURL(blob);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        };

                        gifLoader.classList.add('hidden');
                        gifOutputSection.classList.remove('hidden');
                        gifDownloadButton.classList.remove('hidden');
                    });
                    
                    gif.render();
                }
            });


            // Call the function to generate the background photos on page load
            generateBackgroundPhotos();
        });