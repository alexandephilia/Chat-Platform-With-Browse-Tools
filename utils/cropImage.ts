export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

export function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation);

    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

/**
 * Validates and retrieves the cropped image.
 * Ensures the canvas is properly sized and the crop pixels are respected.
 */
export default async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation = 0,
    flip = { horizontal: false, vertical: false }
): Promise<string> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return '';
    }

    const rotRad = getRadianAngle(rotation);

    // Calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    );

    // Set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Translate canvas context to center for rotation/flipping
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Draw original image
    ctx.drawImage(image, 0, 0);

    // Create a new canvas for the cropped result
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) {
        return '';
    }

    // Set the cropped canvas to the exact crop dimensions
    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    // Draw the cropped portion from the rotated canvas to the new canvas
    // This approach is more accurate than getImageData/putImageData
    croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // Output at reasonable quality and resolution
    // For avatars, 512x512 is plenty.
    const MAX_SIZE = 512;
    let finalCanvas = croppedCanvas;

    if (pixelCrop.width > MAX_SIZE || pixelCrop.height > MAX_SIZE) {
        const resizeCanvas = document.createElement('canvas');
        resizeCanvas.width = MAX_SIZE;
        resizeCanvas.height = MAX_SIZE;
        const resizeCtx = resizeCanvas.getContext('2d');
        if (resizeCtx) {
            // Enable high quality image smoothing for resize
            resizeCtx.imageSmoothingEnabled = true;
            resizeCtx.imageSmoothingQuality = 'high';
            resizeCtx.drawImage(croppedCanvas, 0, 0, MAX_SIZE, MAX_SIZE);
            finalCanvas = resizeCanvas;
        }
    }

    // Return as Base64 JPEG
    return finalCanvas.toDataURL('image/jpeg', 0.92);
}
