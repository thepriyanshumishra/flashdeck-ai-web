import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Download, Copy, Check, RotateCw, X, ChevronLeft } from 'lucide-react';
import ExportMenu from './ExportMenu';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ReportViewer({ markdown, onRegenerate, onClose }) {
    const reportRef = React.useRef(null);
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!markdown) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FileText size={48} className="mb-4 opacity-20" />
                <p>No report generated yet.</p>
                {onRegenerate && (
                    <button
                        onClick={onRegenerate}
                        className="mt-4 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium rounded-xl transition-all"
                    >
                        Try generating again
                    </button>
                )}
            </div>
        );
    }

    const handleExport = (format) => {
        if (format === 'md') {
            const blob = new Blob([markdown], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-${Date.now()}.md`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (format === 'html') {
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head><title>Report</title></head>
                <body style="font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem;">
                    ${document.getElementById('report-content')?.innerHTML || markdown}
                </body>
                </html>
            `;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-${Date.now()}.html`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (format === 'pdf') {
            const input = document.getElementById('report-content');
            if (input) {
                html2canvas(input, { scale: 2 }).then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`report-${Date.now()}.pdf`);
                });
            }
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#0d0d0d] border-b border-white/5">
                <div className="flex items-center gap-3">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="mr-2 p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                            title="Back to Chat"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <FileText size={16} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Deep Research</span>
                        <span className="text-sm font-semibold text-white">Insight Report</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ExportMenu onExport={handleExport} type="report" />
                    {onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Regenerate"
                        >
                            <RotateCw size={16} />
                        </button>
                    )}
                    <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                        title="Copy Markdown"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                        <Download size={14} />
                        Export MD
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
                <div id="report-content" className="prose prose-invert prose-lg max-w-4xl mx-auto">
                    <ReactMarkdown>{markdown}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
