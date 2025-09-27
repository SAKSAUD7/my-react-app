import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { ArrowLeftIcon, DocumentArrowUpIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { uploadFile } from '../utils/api';
import { downloadBlob } from '../utils/fileUtils';
import toast from 'react-hot-toast';

export default function ExtractPages() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pages, setPages] = useState('');
  const [pagesError, setPagesError] = useState('');
  const navigate = useNavigate();

  const handleFileSelect = (selectedFiles) => {
    setFiles(selectedFiles);
  };

  const handleRemoveFile = () => {
    setFiles([]);
  };

  const validatePages = (pageString) => {
    if (!pageString.trim()) {
      setPagesError('Please specify pages to extract');
      return false;
    }

    // Check for valid format: numbers, commas, and hyphens only
    const validFormat = /^[\d,\s-]+$/.test(pageString.trim());
    if (!validFormat) {
      setPagesError('Use format: 1,3,5-7,10');
      return false;
    }

    setPagesError('');
    return true;
  };

  const handlePagesChange = (value) => {
    setPages(value);
    if (value.trim()) {
      validatePages(value);
    } else {
      setPagesError('');
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      toast.error('Please select a PDF file');
      return;
    }

    if (!validatePages(pages)) {
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Extracting pages...');

    try {
      const response = await uploadFile('/api/pdf/extract-pages', files[0], {
        pages: pages.trim()
      });
      
      downloadBlob(response, files[0].name.replace('.pdf', '_extracted.pdf'));
      toast.success('Pages extracted successfully!', { id: loadingToast });
      setFiles([]);
      setPages('');
    } catch (error) {
      console.error('Error extracting pages:', error);
      toast.error(error.message || 'Failed to extract pages. Please try again.', { id: loadingToast });
    } finally {
      setIsProcessing(false);
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
              Extract Pages
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Extract specific pages from your PDF to create a new document with only the pages you need.
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
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-base font-semibold text-gray-900">
                  {isDragActive ? 'Drop your PDF here' : 'Drag and drop PDF here'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  or click to browse files
                </p>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                PDF files up to 10MB
              </p>
            </div>

            {/* Selected File and Options */}
            {files.length > 0 && (
              <div className="mt-6 space-y-6">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{files[0].name}</p>
                        <p className="text-sm text-gray-500">
                          {(files[0].size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Page Selection */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Pages to Extract</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Numbers
                      </label>
                      <input
                        type="text"
                        value={pages}
                        onChange={(e) => handlePagesChange(e.target.value)}
                        placeholder="e.g., 1,3,5-7,10"
                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          pagesError ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {pagesError && (
                        <p className="mt-1 text-sm text-red-600">{pagesError}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        Specify individual pages (1,3,5) or ranges (5-7). Separate with commas.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Examples:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• <code>1,3,5</code> - Extract pages 1, 3, and 5</li>
                        <li>• <code>1-5</code> - Extract pages 1 through 5</li>
                        <li>• <code>1,3,7-10,15</code> - Extract pages 1, 3, 7-10, and 15</li>
                      </ul>
                    </div>

                    <button
                      onClick={handleProcess}
                      disabled={isProcessing || !pages.trim() || !!pagesError}
                      className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isProcessing ? 'Extracting Pages...' : 'Extract Pages'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">Flexible Selection</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Extract individual pages or page ranges using simple notation.
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">Quality Preserved</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Original page quality and formatting are maintained.
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">Quick Process</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Fast extraction process with instant download.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 