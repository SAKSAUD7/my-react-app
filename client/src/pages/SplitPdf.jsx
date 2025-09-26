import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  DocumentArrowUpIcon,
  ArrowDownTrayIcon,
  ScissorsIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

export default function SplitPdf() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitMode, setSplitMode] = useState('pages'); // 'pages', 'ranges', 'size'
  const [splitValue, setSplitValue] = useState('1');

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      toast.success('PDF uploaded successfully!');
    } else {
      toast.error('Please upload a valid PDF file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleSplit = async () => {
    if (!file) {
      toast.error('Please upload a PDF file first');
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', splitMode);
    formData.append('value', splitValue);

    try {
      const response = await axios.post('/api/pdf/split', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/zip' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `split-${file.name.replace('.pdf', '')}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('PDF split successfully!');
    } catch (error) {
      console.error('Error splitting PDF:', error);
      toast.error('Failed to split PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <ScissorsIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Split PDF
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Separate one page or a whole set for easy conversion into independent PDF files.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Upload Section */}
            <div className="p-8">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer
                  ${isDragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
              >
                <input {...getInputProps()} />
                <DocumentArrowUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-lg text-blue-600 font-medium">Drop your PDF here</p>
                ) : (
                  <div>
                    <p className="text-lg text-gray-600 mb-2">
                      Drag and drop your PDF here, or click to select
                    </p>
                    <p className="text-sm text-gray-500">
                      Maximum file size: 100MB
                    </p>
                  </div>
                )}
              </div>

              {file && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <DocumentDuplicateIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-800">{file.name}</p>
                      <p className="text-sm text-green-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Split Options */}
            {file && (
              <div className="border-t border-gray-100 p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Split Options</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    splitMode === 'pages' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="splitMode"
                      value="pages"
                      checked={splitMode === 'pages'}
                      onChange={(e) => setSplitMode(e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <h4 className="font-medium text-gray-900 mb-2">Extract Pages</h4>
                      <p className="text-sm text-gray-600">Split by specific page numbers</p>
                    </div>
                  </label>

                  <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    splitMode === 'ranges' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="splitMode"
                      value="ranges"
                      checked={splitMode === 'ranges'}
                      onChange={(e) => setSplitMode(e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <h4 className="font-medium text-gray-900 mb-2">Page Ranges</h4>
                      <p className="text-sm text-gray-600">Split by page ranges</p>
                    </div>
                  </label>

                  <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    splitMode === 'size' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="splitMode"
                      value="size"
                      checked={splitMode === 'size'}
                      onChange={(e) => setSplitMode(e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <h4 className="font-medium text-gray-900 mb-2">Fixed Size</h4>
                      <p className="text-sm text-gray-600">Split into equal parts</p>
                    </div>
                  </label>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {splitMode === 'pages' && 'Page numbers (e.g., 1,3,5 or 1-3,5-7)'}
                    {splitMode === 'ranges' && 'Page ranges (e.g., 1-5,6-10)'}
                    {splitMode === 'size' && 'Pages per file'}
                  </label>
                  <input
                    type="text"
                    value={splitValue}
                    onChange={(e) => setSplitValue(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      splitMode === 'pages' ? '1,3,5' :
                      splitMode === 'ranges' ? '1-5,6-10' : '1'
                    }
                  />
                </div>

                <button
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Splitting PDF...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      Split PDF
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ScissorsIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Precise Splitting</h3>
              <p className="text-gray-600 text-sm">Extract specific pages or split by ranges with precision</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DocumentDuplicateIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multiple Formats</h3>
              <p className="text-gray-600 text-sm">Download individual PDFs or as a convenient ZIP file</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowDownTrayIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Download</h3>
              <p className="text-gray-600 text-sm">Get your split PDFs ready for download in seconds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 