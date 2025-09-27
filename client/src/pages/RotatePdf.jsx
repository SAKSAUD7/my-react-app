import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  DocumentArrowUpIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

export default function RotatePdf() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(90);
  const [pageRange, setPageRange] = useState('all');

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

  const handleRotate = async () => {
    if (!file) {
      toast.error('Please upload a PDF file first');
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('angle', rotationAngle.toString());
    formData.append('pages', pageRange);

    try {
      const response = await axios.post('/api/pdf/rotate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `rotated-${file.name}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('PDF rotated successfully!');
    } catch (error) {
      console.error('Error rotating PDF:', error);
      toast.error('Failed to rotate PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-lg">
              <ArrowPathIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Rotate PDF
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rotate your PDF pages the way you need them. Choose specific pages or rotate the entire document.
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
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                  }`}
              >
                <input {...getInputProps()} />
                <DocumentArrowUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-lg text-green-600 font-medium">Drop your PDF here</p>
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

            {/* Rotation Options */}
            {file && (
              <div className="border-t border-gray-100 p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Rotation Settings</h3>
                
                {/* Rotation Angle */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Rotation Angle</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[90, 180, 270, 360].map((angle) => (
                      <label key={angle} className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                        rotationAngle === angle ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="rotationAngle"
                          value={angle}
                          checked={rotationAngle === angle}
                          onChange={(e) => setRotationAngle(parseInt(e.target.value))}
                          className="sr-only"
                        />
                        <ArrowPathIcon className={`h-8 w-8 mx-auto mb-2 ${
                          rotationAngle === angle ? 'text-green-600' : 'text-gray-400'
                        }`} style={{ transform: `rotate(${angle}deg)` }} />
                        <span className="font-medium text-gray-900">{angle}°</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Page Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Pages to Rotate</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      pageRange === 'all' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="pageRange"
                        value="all"
                        checked={pageRange === 'all'}
                        onChange={(e) => setPageRange(e.target.value)}
                        className="sr-only"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">All Pages</h4>
                        <p className="text-sm text-gray-600">Rotate every page in the document</p>
                      </div>
                    </label>

                    <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      pageRange === 'custom' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="pageRange"
                        value="custom"
                        checked={pageRange === 'custom'}
                        onChange={(e) => setPageRange(e.target.value)}
                        className="sr-only"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Specific Pages</h4>
                        <p className="text-sm text-gray-600">Choose which pages to rotate</p>
                      </div>
                    </label>
                  </div>

                  {pageRange === 'custom' && (
                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="e.g., 1,3,5-7"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        onChange={(e) => setPageRange(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter page numbers separated by commas or use ranges (e.g., 1-5)</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleRotate}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Rotating PDF...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      Rotate PDF
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowPathIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Any Angle</h3>
              <p className="text-gray-600 text-sm">Rotate pages by 90°, 180°, 270°, or full 360°</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DocumentDuplicateIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Selective Rotation</h3>
              <p className="text-gray-600 text-sm">Choose specific pages or rotate the entire document</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowDownTrayIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Perfect Orientation</h3>
              <p className="text-gray-600 text-sm">Get your PDF pages in the perfect viewing angle</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 