import React, { useState } from 'react';
import { Table, Download, Search, Filter, RotateCw, X, ChevronLeft } from 'lucide-react';
import ExportMenu from './ExportMenu';

export default function DataTableView({ data, onRegenerate, onClose }) {
    const [searchTerm, setSearchTerm] = useState("");

    if (!data || !data.rows || !data.columns) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Table size={48} className="mb-4 opacity-20" />
                <p>No data table generated yet.</p>
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

    const filteredRows = data.rows.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleDownloadCSV = () => {
        const headers = data.columns.join(",");
        const rows = data.rows.map(row =>
            data.columns.map(col => `"${row[col] || ''}"`).join(",")
        ).join("\n");
        const csv = `${headers}\n${rows}`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `table-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDownloadPDF = async () => {
        const jsPDF = (await import('jspdf')).default;
        const html2canvas = (await import('html2canvas')).default;

        const doc = new jsPDF('p', 'mm', 'a4');
        const brandColor = [16, 185, 129]; // Emerald-500

        // Header
        doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text("FLASHDECK AI - DATA ANALYSIS", 15, 15);
        doc.setFontSize(8);
        doc.text("STRUCTURED DATA SYNTHESIS • PRO REPORT", 15, 20);

        // Footer
        const addFooter = () => {
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFont("helvetica", "italic");
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`FlashDeck AI Pro - Data Table | Page ${i}`, 105, 285, { align: 'center' });
            }
        };

        const tableElement = document.querySelector('table');
        if (!tableElement) return;

        const canvas = await html2canvas(tableElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = 180;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        doc.addImage(imgData, 'PNG', 15, 35, pdfWidth, pdfHeight);

        addFooter();
        doc.save(`FlashDeck-Data-${Date.now()}.pdf`);
    };

    const handleExport = (format) => {
        if (format === 'csv') {
            handleDownloadCSV();
        } else if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `table-data-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (format === 'pdf') {
            handleDownloadPDF();
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 bg-[#0d0d0d]/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-4">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="mr-2 p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all transform hover:scale-110"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10 shadow-inner">
                        <Table size={24} />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] block leading-none mb-1">Data Synthesis</span>
                        <span className="text-lg font-bold text-white font-heading tracking-tight">Structured Analysis</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group hidden md:block">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter dataset..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#1a1a1a] border border-white/10 rounded-2xl py-2.5 pl-11 pr-5 text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all w-64 font-medium"
                        />
                    </div>
                    <ExportMenu onExport={handleExport} type="table" />
                    {onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all border border-white/5"
                            title="Regenerate"
                        >
                            <RotateCw size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto custom-scrollbar p-10 bg-dots">
                <div className="border border-white/5 rounded-[32px] overflow-hidden bg-[#0d0d0d]/50 backdrop-blur-sm shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-[#1a1a1a]/80 backdrop-blur-md text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em]">
                                <tr>
                                    {data.columns.map((col, idx) => (
                                        <th key={idx} className="px-8 py-6 border-b border-white/5 min-w-[200px] font-heading">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredRows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-emerald-500/5 transition-all group">
                                        {data.columns.map((col, cIdx) => (
                                            <td key={cIdx} className="px-8 py-6 font-medium group-hover:text-emerald-400 transition-colors">
                                                {row[col]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredRows.length === 0 && (
                        <div className="p-20 text-center flex flex-col items-center justify-center gap-4 opacity-20">
                            <Search size={48} />
                            <p className="text-xl font-bold font-heading uppercase tracking-widest">No matching data</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-white/5 bg-[#0a0a0a]/50 flex items-center justify-between opacity-50">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Tabular Intelligence • FlashDeck Pro</div>
                <div className="text-[10px] font-mono text-gray-500">{filteredRows.length} Rows Retrieved</div>
            </div>
        </div>
    );
}
