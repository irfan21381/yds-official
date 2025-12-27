import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { CustomError } from './errorHandler';

export const extractTextFromFile = async (filePath: string, fileType: string): Promise<string> => {
  try {
    if (fileType === 'application/pdf') {
      const dataBuffer = await import('fs').then(fs => fs.readFileSync(filePath));
      const data = await pdf(dataBuffer);
      return data.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // .docx
      const { value } = await mammoth.extractRawText({ path: filePath });
      return value;
    } else if (fileType === 'text/plain') {
      const text = await import('fs').then(fs => fs.readFileSync(filePath, 'utf-8'));
      return text;
    }
    // Add more file types (e.g., .ppt, .pptx) as needed. PPTX parsing is more complex and might require external libraries or services.
    throw new CustomError(`Unsupported file type: ${fileType}`, 400);
  } catch (error: any) {
    console.error('Error extracting text from file:', error);
    throw new CustomError(`Failed to extract text from file: ${error.message}`, 500);
  }
};

export const chunkText = (text: string, chunkSize: number = 1000, overlap: number = 200): string[] => {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    let chunk = text.substring(i, end);

    // If it's not the last chunk, try to end at a sentence boundary
    if (end < text.length) {
      const lastSentenceEnd = chunk.lastIndexOf('.');
      if (lastSentenceEnd > chunk.length - overlap) { // If a sentence ends near the end of the chunk
        chunk = chunk.substring(0, lastSentenceEnd + 1);
      }
    }
    chunks.push(chunk.trim());
    i += chunkSize - overlap;
  }
  return chunks.filter(chunk => chunk.length > 0);
};