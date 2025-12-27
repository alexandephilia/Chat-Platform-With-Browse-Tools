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

    // Get the cropped data from the canvas
    const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    );

    // Set canvas size to the final crop size
    // This allows us to draw the cropped data onto a clean canvas
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Clear canvas before putting data (though resizing usually clears it)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Put the cropped data at 0,0
    ctx.putImageData(data, 0, 0);

    // Output at reasonable quality and resolution
    // If the crop is huge, we might want to scale it down, but 'exact crop' implies full res
    // For avatars, 512x512 is plenty.
    
    // Check if we need to resize
    const MAX_SIZE = 512;
    let finalCanvas = canvas;
    
    if (pixelCrop.width > MAX_SIZE || pixelCrop.height > MAX_SIZE) {
        const resizeCanvas = document.createElement('canvas');
        resizeCanvas.width = MAX_SIZE;
        resizeCanvas.height = MAX_SIZE;
        const resizeCtx = resizeCanvas.getContext('2d');
        if (resizeCtx) {
             // High quality resize
            resizeCtx.drawImage(canvas, 0, 0, MAX_SIZE, MAX_SIZE);
            finalCanvas = resizeCanvas;
        }
    }

    // Return as Base64 JPEG
    return finalCanvas.toDataURL('image/jpeg', 0.92);
}
