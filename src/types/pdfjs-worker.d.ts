// pdf.js's worker module ships without types. Importing it registers globalThis.pdfjsWorker,
// which pdf.js then uses on the main thread (src/lib/pdf-text.ts).
declare module 'pdfjs-dist/build/pdf.worker.min.mjs'
