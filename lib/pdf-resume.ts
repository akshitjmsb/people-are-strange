const MAX_RESUME_PDF_BYTES = 12 * 1024 * 1024;

export interface DrivePdfRevisionMetadata {
  md5Checksum?: string;
  modifiedTime?: string;
  size?: string;
}

export function masterPdfRevision(file: DrivePdfRevisionMetadata): string {
  if (file.md5Checksum) return `md5:${file.md5Checksum}`;
  if (file.modifiedTime) return `modified:${file.modifiedTime}:${file.size ?? 'unknown'}`;
  throw new Error('Google Drive did not return a stable PDF revision');
}

export function validateResumePdf(data: ArrayBuffer, declaredSize?: number): Uint8Array {
  const bytes = new Uint8Array(data);
  if (declaredSize && declaredSize > MAX_RESUME_PDF_BYTES) {
    throw new Error('Master resume PDF is larger than the supported 12 MB limit');
  }
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_RESUME_PDF_BYTES) {
    throw new Error('Master resume PDF size is invalid');
  }
  if (String.fromCharCode(...bytes.subarray(0, 5)) !== '%PDF-') {
    throw new Error('Master resume file is not a valid PDF');
  }
  return bytes;
}

export async function extractResumePdfText(data: Uint8Array): Promise<string> {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loadingTask = getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const document = await loadingTask.promise;
  try {
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let line = '';
      let previousY: number | undefined;
      for (const item of content.items) {
        if (!('str' in item) || !item.str) continue;
        const y = item.transform[5];
        if (previousY !== undefined && Math.abs(y - previousY) > 2) {
          if (line.trim()) lines.push(line.trim());
          line = item.str;
        } else {
          line += `${line ? ' ' : ''}${item.str}`;
        }
        previousY = y;
      }
      if (line.trim()) lines.push(line.trim());
      pages.push(lines.join('\n'));
    }
    const text = pages.join('\n');
    if (text.trim().length < 100) throw new Error('Master resume PDF did not contain enough readable text');
    return text;
  } finally {
    await document.destroy();
  }
}
