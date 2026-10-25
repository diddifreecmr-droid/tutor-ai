declare module 'pdf-parse' {
  type PdfData = { numpages: number; text: string };
  const parse: (buffer: Buffer) => Promise<PdfData>;
  export default parse;
}
