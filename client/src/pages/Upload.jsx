import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
      setResults(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(response.data);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload and process image');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResults(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none pb-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Scan Receipt <Sparkles className="text-indigo-500 dark:text-indigo-400 fill-indigo-500/10" size={22} />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated transcription and extraction using computer vision and AI models</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 select-none"
      >
        {!file ? (
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
              isDragActive ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-900/10 scale-101' : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-14 h-14 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-105 shadow-inner">
              <UploadCloud className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1.5 tracking-tight">
              {isDragActive ? 'Drop image anywhere' : 'Select a transaction receipt'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed mb-6">Drop a screenshot of GPay, PhonePe, Paytm, or direct digital banking receipts here</p>
            <span className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-slate-50/80">
              Browse Files
            </span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/40 dark:hover:bg-slate-800/40 border border-slate-200/40 dark:border-slate-800/40 rounded-xl transition-all duration-200 group select-none">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold transition-all duration-300 group-hover:scale-105 shrink-0 select-none">
                  <File size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white text-sm tracking-wide truncate max-w-[180px] sm:max-w-xs">{file.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              {!isUploading && !results && (
                <button onClick={clearFile} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors duration-200 rounded-xl select-none">
                  <X size={18} />
                </button>
              )}
            </div>

            {!results ? (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 select-none hover:scale-101 duration-200"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Extracting data using AI...
                  </>
                ) : (
                  <>
                    <UploadCloud size={18} />
                    Process with SpendSense
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-6 select-none animate-fadeIn">
                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100/50 dark:border-emerald-900/40 rounded-xl flex items-start gap-3.5 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" size={20} />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-200 tracking-tight">Transcription Complete</h4>
                    <p className="text-xs text-emerald-600/90 dark:text-emerald-400/90 mt-0.5 leading-relaxed">Successfully derived and ingested {results.count} expense transaction record(s) from your invoice image.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Extracted Ingestion Summary</h4>
                  {results.transactions?.map((tx, idx) => (
                    <div key={idx} className="p-4 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/40 dark:hover:bg-slate-800/20 rounded-xl flex justify-between items-center transition-all duration-200 group">
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">{tx.merchantName}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                      <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm tracking-tight">₹{tx.amount?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={clearFile}
                  className="w-full py-3 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 hover:scale-102 select-none"
                >
                  Upload New Screenshot
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Upload;

