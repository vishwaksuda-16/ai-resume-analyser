export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

// Lazy load pdfjs only on client side
let pdfjsLib: any = null;

async function loadPdfJs() {
    if (pdfjsLib) return pdfjsLib;

    if (typeof window === 'undefined') {
        throw new Error('PDF.js can only be loaded in the browser');
    }

    // @ts-ignore
    const lib = await import('pdfjs-dist');

    // Use the worker from node_modules via Vite
    // Vite will bundle this correctly
    lib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
    ).toString();

    console.log(`PDF.js version: ${lib.version}`);
    console.log(`Worker source: ${lib.GlobalWorkerOptions.workerSrc}`);

    pdfjsLib = lib;
    return lib;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        console.log("Loading PDF.js library...");
        const pdfjsLib = await loadPdfJs();

        console.log("Reading PDF file...");
        const arrayBuffer = await file.arrayBuffer();

        console.log("Loading PDF document...");
        // @ts-ignore - pdfjs types
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);

        console.log("Getting first page...");
        const page = await pdf.getPage(1);

        console.log("Creating viewport...");
        const viewport = page.getViewport({ scale: 4 });

        console.log("Creating canvas...");
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Failed to get 2D context from canvas");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        console.log("Rendering page to canvas...");
        await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
        }).promise;

        console.log("Page rendered successfully");

        return new Promise((resolve) => {
            console.log("Converting canvas to blob...");
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        console.log("Blob created successfully");
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        console.log("Image file created:", imageFile.name, imageFile.size);

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        console.error("Failed to create blob from canvas");
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob",
                        });
                    }
                },
                "image/png",
                1.0
            );
        });
    } catch (err) {
        console.error("PDF conversion error:", err);
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err instanceof Error ? err.message : String(err)}`,
        };
    }
}

// Alternative function with lower scale for faster processing
export async function convertPdfToImageFast(
    file: File
): Promise<PdfConversionResult> {
    try {
        const pdfjsLib = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();
        // @ts-ignore
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Failed to get 2D context from canvas");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
        }).promise;

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob",
                        });
                    }
                },
                "image/png",
                0.95
            );
        });
    } catch (err) {
        console.error("PDF conversion error:", err);
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err instanceof Error ? err.message : String(err)}`,
        };
    }
}