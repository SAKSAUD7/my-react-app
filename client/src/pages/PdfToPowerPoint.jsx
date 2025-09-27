import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import FileUpload from '../components/FileUpload';
import { uploadFile } from '../utils/api';
import { downloadBlob } from '../utils/fileUtils';
import toast from 'react-hot-toast';

export default function PdfToPowerPoint() {
  const [files, setFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (selectedFiles) => {
    setFiles(selectedFiles);
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast.error('Please select a PDF file to convert');
      return;
    }

    setIsConverting(true);
    const loadingToast = toast.loading('Converting your PDF...');

    try {
      const response = await uploadFile('/api/pdf/convert-to-powerpoint', files[0]);
      downloadBlob(response, files[0].name.replace('.pdf', '.pptx'));
      toast.success('File converted successfully!', { id: loadingToast });
      setFiles([]);
    } catch (error) {
      console.error('Error converting file:', error);
      toast.error(error.message || 'Failed to convert file. Please try again.', { id: loadingToast });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to tools
            </button>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-semibold text-gray-900">Convert PDF to PowerPoint</h1>
              <p className="mt-2 text-sm text-gray-500">
                Convert your PDF documents to editable PowerPoint presentations while maintaining the original formatting.
              </p>

              <div className="mt-6">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept={{
                    'application/pdf': ['.pdf']
                  }}
                  multiple={false}
                />
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={files.length === 0 || isConverting}
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${
                    files.length === 0 || isConverting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-500'
                  }`}
                >
                  {isConverting ? 'Converting...' : 'Convert to PowerPoint'}
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">How to convert PDF to PowerPoint:</h3>
                <ol className="mt-2 list-decimal list-inside text-sm text-gray-500 space-y-2">
                  <li>Upload your PDF file by dragging and dropping or clicking the upload area</li>
                  <li>Click the "Convert to PowerPoint" button</li>
                  <li>Wait for the conversion to complete</li>
                  <li>Your PowerPoint presentation will be downloaded automatically</li>
                </ol>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Features:</h3>
                <ul className="mt-2 list-disc list-inside text-sm text-gray-500 space-y-2">
                  <li>Maintains original formatting and layout</li>
                  <li>Preserves images, charts, and tables</li>
                  <li>Creates editable slides</li>
                  <li>Fast and secure conversion</li>
                  <li>No registration required</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 