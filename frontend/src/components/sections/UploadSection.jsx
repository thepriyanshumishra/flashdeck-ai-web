import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Sparkles, X, Plus, Trash2, File, CheckCircle } from "lucide-react";
import Button from "../ui/Button";
import { cn } from "../../lib/utils";

export default function UploadSection({
    files,
    loading,
    handleFilesAdded,
    handleRemoveFile,
    handleClearAll,
    handleGenerate,
    uploadProgress,
}) {
    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Main Card */}
            <div className="bg-[#151515] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-medium text-white mb-2">Add sources</h2>
                        <p className="text-gray-400 text-sm">Upload documents to create your deck.</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <Upload size={20} className="text-gray-400" />
                    </div>
                </div>

                <div className="p-6 md:p-8 min-h-[400px] flex flex-col">

                    {/* File Drop / List Area */}
                    <div className="flex-1">
                        {files.length === 0 ? (
                            <div className="h-full border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 md:p-12 transition-colors hover:border-white/20 hover:bg-white/5 relative group">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    multiple
                                    onChange={handleFilesAdded}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onClick={(e) => { e.target.value = null; }}
                                />
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6 border border-white/5 group-hover:scale-105 transition-transform">
                                    <Plus size={32} className="text-gray-500" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">Upload Files</h3>
                                <p className="text-gray-500 text-sm text-center max-w-xs">
                                    Drag & drop PDF files here, or click to browse.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {files.map((file, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="group flex items-center gap-4 p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl hover:bg-[#202020] transition-colors"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                                                <FileText size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium truncate">{file.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500 uppercase">PDF</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                                    <span className="text-xs text-green-400 flex items-center gap-1">
                                                        <CheckCircle size={10} /> Ready
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFile(idx)}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Add More Button (Small) */}
                                <div className="relative mt-4">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        multiple
                                        onChange={handleFilesAdded}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onClick={(e) => { e.target.value = null; }}
                                    />
                                    <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-colors w-full justify-center border border-dashed border-white/10">
                                        <Plus size={16} />
                                        <span>Add more files</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar (Restored) */}
                    {files && files.length > 0 && uploadProgress < 100 && (
                        <div className="w-full mt-6 mb-2">
                            <div className="flex justify-between text-xs font-mono text-gray-400 mb-2">
                                <span>UPLOADING</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    className="bg-gradient-to-r from-orange-400 to-purple-500 h-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Footer / Actions */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                        <div className="text-xs text-gray-500 text-center md:text-left w-full md:w-auto">
                            {files.length > 0 ? `${files.length} file${files.length !== 1 ? 's' : ''} selected` : 'Supported: PDF (Max 200MB)'}
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
                            {files.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Clear all
                                </button>
                            )}

                            <Button
                                disabled={files.length === 0 || loading}
                                onClick={handleGenerate}
                                className={cn(
                                    "px-8 py-2.5 rounded-full text-sm font-medium transition-all w-full md:w-auto flex justify-center",
                                    files.length > 0
                                        ? "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                        : "bg-white/10 text-gray-500 cursor-not-allowed"
                                )}
                                isLoading={loading}
                            >
                                <span className="flex items-center gap-2">
                                    <Sparkles size={16} />
                                    Create Deck
                                </span>
                            </Button>
                        </div>
                    </div>

                </div>

                {/* Loading Container Blur Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin mb-4 mx-auto"></div>
                            <p className="text-white font-medium animate-pulse">Analyzing sources...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
