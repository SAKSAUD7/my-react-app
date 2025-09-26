import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { uploadFile } from '../utils/api';
import { downloadBlob } from '../utils/fileUtils';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';
import GoogleAd from '../components/GoogleAd';

export default function PdfToWord() {
  const [files, setFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (selectedFiles) => {
    setFiles(selectedFiles);
  };

  const handleRemoveFile = () => {
    setFiles([]);
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast.error('Please select a PDF file to convert');
      return;
    }

    setIsConverting(true);
    const loadingToast = toast.loading('Converting your PDF...');

    try {
      const response = await uploadFile('/api/pdf/convert-to-word', files[0]);
      downloadBlob(response, files[0].name.replace('.pdf', '.docx'));
      toast.success('File converted successfully!', { id: loadingToast });
      setFiles([]);
    } catch (error) {
      console.error('Error converting file:', error);
      toast.error(error.message || 'Failed to convert file. Please try again.', { id: loadingToast });
    } finally {
      setIsConverting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      handleFileSelect(acceptedFiles);
    },
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </button>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              PDF to Word Converter
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Convert your PDF documents to editable Word files while preserving formatting and layout.
            </p>
          </div>

          {/* Upload Area */}
          <div className="mt-8">
            <div
              {...getRootProps()}
              className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-base font-semibold text-gray-900">
                  {isDragActive ? 'Drop your PDF here' : 'Drag and drop your PDF here'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  or click to browse files
                </p>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                PDF files up to 10MB
              </p>
            </div>

            {/* Selected File */}
            {files.length > 0 && (
              <div className="mt-6">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-8 w-8 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{files[0].name}</p>
                        <p className="text-sm text-gray-500">
                          {(files[0].size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleRemoveFile}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleConvert}
                        disabled={isConverting}
                        className="rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {isConverting ? 'Converting...' : 'Convert to Word'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">Preserve Formatting</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Maintain your document's layout, fonts, and formatting during conversion.
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">Fast Conversion</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Get your converted Word document in seconds, no matter the file size.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 