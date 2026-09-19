export async function extractDocumentText(fileName: string) {
  return {
    text: `Document uploaded: ${fileName}\nOCR processing in development mode. Original source remains available for physician review.`,
    confidence: 0.94,
  }
}
