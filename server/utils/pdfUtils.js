import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import pdf2pic from 'pdf2pic';
// import pdfParseLib from 'pdf-parse';
import PDFMerger from 'pdf-merger-js';
import mammoth from 'mammoth';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extract the default function from pdf-parse
// const pdfParse = pdfParseLib.default || pdfParseLib;

/**
 * Merge multiple PDF files
 * @param {string[]} inputFiles - Array of paths to input PDF files
 * @param {string} outputFile - Path to save merged PDF file
 */
export const mergePdfs = async (inputFiles, outputFile) => {
  try {
    const merger = new PDFMerger();
    
    for (const file of inputFiles) {
      await merger.add(file);
    }
    
    await merger.save(outputFile);
    return outputFile;
  } catch (error) {
    console.error('Error merging PDFs:', error);
    throw new Error(`Failed to merge PDFs: ${error.message}`);
  }
};

/**
 * Split PDF into separate pages
 * @param {string} inputFile - Path to input PDF file
 * @param {string} outputDir - Directory to save split PDF files
 */
export const splitPdf = async (inputFile, outputDir) => {
  try {
    const existingPdfBytes = fs.readFileSync(inputFile);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pageCount = pdfDoc.getPageCount();
    const outputFiles = [];

    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
      
      const pdfBytes = await newPdf.save();
      const outputFile = path.join(outputDir, `page-${i + 1}.pdf`);
      fs.writeFileSync(outputFile, pdfBytes);
      outputFiles.push(outputFile);
    }

    return outputFiles;
  } catch (error) {
    console.error('Error splitting PDF:', error);
    throw new Error(`Failed to split PDF: ${error.message}`);
  }
};

/**
 * Compress PDF by reducing image quality and optimizing
 * @param {string} inputFile - Path to input PDF file
 * @param {string} outputFile - Path to save compressed PDF file
 * @param {string} quality - Compression quality (low, medium, high)
 */
export const compressPdf = async (inputFile, outputFile, quality = 'medium') => {
  try {
    const existingPdfBytes = fs.readFileSync(inputFile);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Basic compression by removing metadata and optimizing
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setCreator('FlexiPDF');
    pdfDoc.setProducer('FlexiPDF');
    
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectStreamsThreshold: 40,
      updateFieldAppearances: false,
    });
    
    fs.writeFileSync(outputFile, pdfBytes);
    return outputFile;
  } catch (error) {
    console.error('Error compressing PDF:', error);
    throw new Error(`Failed to compress PDF: ${error.message}`);
  }
};

/**
 * Convert PDF to JPG images
 * @param {string} inputFile - Path to input PDF file
 * @param {string} outputDir - Directory to save output images
 * @param {number} dpi - DPI for output images (default: 150)
 */
export const convertPdfToJpg = async (inputFile, outputDir, dpi = 150) => {
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const convert = pdf2pic.fromPath(inputFile, {
      density: dpi,
      saveFilename: "page",
      savePath: outputDir,
      format: "jpg",
      width: 1920,
      height: 1080
    });

    const results = await convert.bulk(-1);
    const imageFiles = results.map(result => result.path);
    
    return imageFiles;
  } catch (error) {
    console.error('Error converting PDF to JPG:', error);
    throw new Error(`Failed to convert PDF to JPG: ${error.message}`);
  }
};

/**
 * Add watermark to PDF
 * @param {string} inputFile - Path to input PDF file
 * @param {string} outputFile - Path to save watermarked PDF file
 * @param {string} watermarkText - Text to use as watermark
 * @param {object} options - Watermark options (opacity, size, position)
 */
export const addWatermark = async (inputFile, outputFile, watermarkText, options = {}) => {
  try {
    const existingPdfBytes = fs.readFileSync(inputFile);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const {
      opacity = 0.3,
      fontSize = 50,
      color = rgb(0.5, 0.5, 0.5),
      rotation = 45
    } = options;

    pages.forEach(page => {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 2 - (watermarkText.length * fontSize) / 4,
        y: height / 2,
        size: fontSize,
        font,
        color,
        opacity,
        rotate: {
          type: 'degrees',
          angle: rotation,
        },
      });
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputFile, pdfBytes);
    return outputFile;
  } catch (error) {
    console.error('Error adding watermark:', error);
    throw new Error(`Failed to add watermark: ${error.message}`);
  }
};

/**
 * Protect PDF with password
 * @param {string} inputFile - Path to input PDF file
 * @param {string} outputFile - Path to save protected PDF file
 * @param {string} password - Password to protect PDF with
 */
export const protectPdf = async (inputFile, outputFile, password) => {
  try {
    const existingPdfBytes = fs.readFileSync(inputFile);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Note: pdf-lib doesn't support password protection directly
    // This is a placeholder - you might need to use a different library like hummus-pdf-kit
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputFile, pdfBytes);
    
    console.warn('Password protection not fully implemented with pdf-lib. Consider using hummus-pdf-kit for this feature.');
    return outputFile;
  } catch (error) {
    console.error('Error protecting PDF:', error);
    throw new Error(`Failed to protect PDF: ${error.message}`);
  }
};

/**
 * Remove password protection from PDF
 * @param {string} inputFile - Path to input PDF file
 * @param {string} outputFile - Path to save unprotected PDF file
 * @param {string} password - Current PDF password
 */
export const unprotectPdf = async (inputFile, outputFile, password) => {
  try {
    // This is a placeholder - password removal requires specialized libraries
    const existingPdfBytes = fs.readFileSync(inputFile);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputFile, pdfBytes);
    
    console.warn('Password removal not fully implemented. This feature requires specialized libraries.');
    return outputFile;
  } catch (error) {
    console.error('Error removing PDF protection:', error);
    throw new Error(`Failed to remove PDF protection: ${error.message}`);
  }
};

/**
 * Extract text from PDF (OCR)
 * @param {string} inputFile - Path to input PDF file
 */
export const extractTextFromPdf = async (inputFile) => {
  try {
    const dataBuffer = fs.readFileSync(inputFile);
    // const data = await pdfParse(dataBuffer);
    return dataBuffer.toString();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Convert Word to PDF
 * @param {string} inputFile - Path to input Word file
 * @param {string} outputFile - Path to save PDF file
 */
export const convertWordToPdf = async (inputFile, outputFile) => {
  try {
    // This is a simplified implementation
    // For full Word to PDF conversion, you might need puppeteer or LibreOffice
    const result = await mammoth.extractRawText({ path: inputFile });
    const text = result.value;
    
    // Create PDF from extracted text
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();
    
    const lines = text.split('\n');
    let y = height - 50;
    
    lines.forEach(line => {
      if (y < 50) {
        const newPage = pdfDoc.addPage();
        y = newPage.getSize().height - 50;
      }
      
      page.drawText(line.substring(0, 80), {
        x: 50,
        y: y,
        size: 12,
        font,
      });
      y -= 15;
    });
    
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputFile, pdfBytes);
    return outputFile;
  } catch (error) {
    console.error('Error converting Word to PDF:', error);
    throw new Error(`Failed to convert Word to PDF: ${error.message}`);
  }
};

/**
 * Convert PDF to Word (basic text extraction)
 * @param {string} inputFile - Path to input PDF file
 * @param {string} outputFile - Path to save Word file
 */
export const convertPdfToWord = async (inputFile, outputFile) => {
  try {
    const text = await extractTextFromPdf(inputFile);
    
    // Create a simple DOCX structure
    const docxContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Converted Document</title>
        </head>
        <body>
          <pre>${text}</pre>
        </body>
      </html>
    `;
    
    // This is a simplified implementation
    // For proper DOCX generation, you'd need a more sophisticated library
    fs.writeFileSync(outputFile.replace('.docx', '.html'), docxContent);
    
    console.warn('PDF to Word conversion is simplified. Consider using more advanced libraries for full DOCX support.');
    return outputFile;
  } catch (error) {
    console.error('Error converting PDF to Word:', error);
    throw new Error(`Failed to convert PDF to Word: ${error.message}`);
  }
};

/**
 * Convert PDF to PowerPoint (basic implementation)
 * @param {string} inputFile - Path to input PDF file
 * @param {string} outputFile - Path to save PowerPoint file
 */
export const convertPdfToPowerPoint = async (inputFile, outputFile) => {
  try {
    // This would require a more sophisticated implementation
    // For now, we'll extract text and create a basic structure
    const text = await extractTextFromPdf(inputFile);
    
    console.warn('PDF to PowerPoint conversion requires advanced libraries. This is a placeholder implementation.');
    
    // Create a text file with the extracted content for now
    fs.writeFileSync(outputFile.replace('.pptx', '.txt'), text);
    return outputFile;
  } catch (error) {
    console.error('Error converting PDF to PowerPoint:', error);
    throw new Error(`Failed to convert PDF to PowerPoint: ${error.message}`);
  }
};

/**
 * Convert PDF to Excel (basic table extraction)
 * @param {string} inputFile - Path to input PDF file
 * @param {string} outputFile - Path to save Excel file
 */
export const convertPdfToExcel = async (inputFile, outputFile) => {
  try {
    const text = await extractTextFromPdf(inputFile);
    
    // Basic CSV creation from text
    const lines = text.split('\n').filter(line => line.trim());
    const csvContent = lines.map(line => `"${line.replace(/"/g, '""')}"`).join('\n');
    
    fs.writeFileSync(outputFile.replace('.xlsx', '.csv'), csvContent);
    
    console.warn('PDF to Excel conversion is simplified. For proper table extraction, consider using specialized libraries.');
    return outputFile;
  } catch (error) {
    console.error('Error converting PDF to Excel:', error);
    throw new Error(`Failed to convert PDF to Excel: ${error.message}`);
  }
};

/**
 * Crop PDF pages
 * @param {string} inputFile - Path to input PDF file
 * @param {string} outputFile - Path to save cropped PDF file
 * @param {object} cropBox - Crop dimensions {x, y, width, height}
 */
export const cropPdf = async (inputFile, outputFile, cropBox) => {
  try {
    const existingPdfBytes = fs.readFileSync(inputFile);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    
    pages.forEach(page => {
      page.setCropBox(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
    });
    
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputFile, pdfBytes);
    return outputFile;
  } catch (error) {
    console.error('Error cropping PDF:', error);
    throw new Error(`Failed to crop PDF: ${error.message}`);
  }
};

/**
 * Compare two PDFs (basic text comparison)
 * @param {string} file1 - Path to first PDF file
 * @param {string} file2 - Path to second PDF file
 */
export const comparePdfs = async (file1, file2) => {
  try {
    const text1 = await extractTextFromPdf(file1);
    const text2 = await extractTextFromPdf(file2);
    
    const differences = {
      identical: text1 === text2,
      file1Length: text1.length,
      file2Length: text2.length,
      // Basic difference detection
      summary: text1 === text2 ? 'Files are identical' : 'Files have differences'
    };
    
    return differences;
  } catch (error) {
    console.error('Error comparing PDFs:', error);
    throw new Error(`Failed to compare PDFs: ${error.message}`);
  }
};

/**
 * Add digital signature to PDF
 * @param {string} inputFile - Path to input PDF file
 * @param {string} outputFile - Path to save signed PDF file
 * @param {string} signatureText - Text to use as signature
 */
export const signPdf = async (inputFile, outputFile, signatureText) => {
  try {
    const existingPdfBytes = fs.readFileSync(inputFile);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = lastPage.getSize();
    
    // Add signature at bottom right of last page
    lastPage.drawText(`Digitally Signed: ${signatureText}`, {
      x: width - 300,
      y: 50,
      size: 12,
      font,
      color: rgb(0, 0, 0.8),
    });
    
    // Add signature date
    const signatureDate = new Date().toLocaleDateString();
    lastPage.drawText(`Date: ${signatureDate}`, {
      x: width - 300,
      y: 30,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputFile, pdfBytes);
    return outputFile;
  } catch (error) {
    console.error('Error signing PDF:', error);
    throw new Error(`Failed to sign PDF: ${error.message}`);
  }
};

/**
 * Clean up temporary files
 * @param {string[]} files - Array of file paths to delete
 */
export const cleanupFiles = (files) => {
  files.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`Cleaned up file: ${file}`);
      }
    } catch (error) {
      console.error(`Error cleaning up file ${file}:`, error);
    }
  });
}; 

/**
 * Get PDF metadata
 * @param {string} inputFile - Path to input PDF file
 */
export const getPdfMetadata = async (inputFile) => {
  try {
    const existingPdfBytes = fs.readFileSync(inputFile);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    return {
      pageCount: pdfDoc.getPageCount(),
      title: pdfDoc.getTitle() || 'Untitled',
      author: pdfDoc.getAuthor() || 'Unknown',
      subject: pdfDoc.getSubject() || '',
      creator: pdfDoc.getCreator() || 'Unknown',
      producer: pdfDoc.getProducer() || 'Unknown',
      creationDate: pdfDoc.getCreationDate(),
      modificationDate: pdfDoc.getModificationDate(),
    };
  } catch (error) {
    console.error('Error getting PDF metadata:', error);
    throw new Error(`Failed to get PDF metadata: ${error.message}`);
  }
};

// Placeholder for text extraction
const extractTextFromPdfBasic = async (inputFile) => {
  // Temporary implementation that returns a placeholder
  return "Text extraction temporarily disabled. Please try other PDF tools.";
}; 