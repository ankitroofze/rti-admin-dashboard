// moduleFactory.jsx aur digital_newspaper.jsx is path se import karte hain.
// Asli code PDFExporter.jsx me hai — yahan se sirf re-export hota hai.
export {
  buildBaseSections,
  downloadElementAsPdf,
  elementToEPaperFiles,
  downloadSavedEPaper,
} from "./PDFExporter.jsx";