import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import PdfToWord from './pages/PdfToWord';
import MergePdf from './pages/MergePdf';
import CompressPdf from './pages/CompressPdf';
import WordToPdf from './pages/WordToPdf';
import PdfToJpg from './pages/PdfToJpg';
import JpgToPdf from './pages/JpgToPdf';
import SplitPdf from './pages/SplitPdf';
import ExcelToPdf from './pages/ExcelToPdf';
import PdfToExcel from './pages/PdfToExcel';
import PowerPointToPdf from './pages/PowerPointToPdf';
import PdfToPowerPoint from './pages/PdfToPowerPoint';
import EditPdf from './pages/EditPdf';
import AddWatermark from './pages/AddWatermark';
import SignPdf from './pages/SignPdf';
import RotatePdf from './pages/RotatePdf';
import ExtractPages from './pages/ExtractPages';
import ProtectPdf from './pages/ProtectPdf';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow pt-16">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/word-to-pdf" element={<WordToPdf />} />
          <Route path="/excel-to-pdf" element={<ExcelToPdf />} />
          <Route path="/powerpoint-to-pdf" element={<PowerPointToPdf />} />
          <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
          <Route path="/pdf-to-word" element={<PdfToWord />} />
          <Route path="/pdf-to-excel" element={<PdfToExcel />} />
          <Route path="/pdf-to-powerpoint" element={<PdfToPowerPoint />} />
          <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
          <Route path="/merge-pdf" element={<MergePdf />} />
          <Route path="/split-pdf" element={<SplitPdf />} />
          <Route path="/rotate-pdf" element={<RotatePdf />} />
          <Route path="/extract-pages" element={<ExtractPages />} />
          <Route path="/edit-pdf" element={<EditPdf />} />
          <Route path="/add-watermark" element={<AddWatermark />} />
          <Route path="/sign-pdf" element={<SignPdf />} />
          <Route path="/compress-pdf" element={<CompressPdf />} />
          <Route path="/protect-pdf" element={<ProtectPdf />} />
        </Routes>
      </main>
      <Footer />
      <MobileNav />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderRadius: '0.5rem',
            padding: '1rem',
          },
          success: {
            iconTheme: {
              primary: '#0284c7',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;