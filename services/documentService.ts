type PdfjsLib = typeof import('pdfjs-dist');

let pdfjsLibPromise: Promise<PdfjsLib> | null = null;
let mammothPromise: Promise<typeof import('mammoth')> | null = null;
let xlsxPromise: Promise<typeof import('xlsx')> | null = null;

const loadPdfjsLib = async (): Promise<PdfjsLib> => {
    if (!pdfjsLibPromise) {
        pdfjsLibPromise = import('pdfjs-dist').then((mod) => {
            // Initialize PDF.js worker (only when PDF parsing is actually requested)
            // Use local worker via Vite's URL handling
            mod.GlobalWorkerOptions.workerSrc = new URL(
                'pdfjs-dist/build/pdf.worker.min.mjs',
                import.meta.url
            ).toString();
            return mod;
        });
    }
    return pdfjsLibPromise;
};

const loadMammoth = async (): Promise<typeof import('mammoth')> => {
    if (!mammothPromise) {
        mammothPromise = import('mammoth');
    }
    return mammothPromise;
};

const loadXlsx = async (): Promise<typeof import('xlsx')> => {
    if (!xlsxPromise) {
        xlsxPromise = import('xlsx');
    }
    return xlsxPromise;
};

export const extractTextFromDocument = async (file: File): Promise<string> => {
    const fileType = file.type;

    try {
        if (fileType === 'application/pdf') {
            return await extractPdfText(file);
        } else if (
            fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileType === 'application/msword'
        ) {
            return await extractDocxText(file);
        } else if (
            fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            fileType === 'application/vnd.ms-excel'
        ) {
            return await extractExcelText(file);
        }
        return '';
    } catch (error) {
        console.error('Error extracting text from document:', error);
        throw new Error(`Failed to extract text from ${file.name}`);
    }
};

const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await loadPdfjsLib();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
        fullText += `[Page ${i}]\n${pageText}\n\n`;
    }
    return fullText.trim();
};

const extractDocxText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const mammothModule = await loadMammoth();
    const mammoth = (mammothModule as any).default ?? mammothModule;
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
};

const extractExcelText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const xlsxModule = await loadXlsx();
    const XLSX = (xlsxModule as any).default ?? xlsxModule;
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    let fullText = '';

    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        fullText += `[Sheet: ${sheetName}]\n${csv}\n\n`;
    });

    return fullText.trim();
};
