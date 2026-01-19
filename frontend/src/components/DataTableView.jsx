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
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Table size={16} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Data Analysis</span>
                        <span className="text-sm font-semibold text-white">Structured Data</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Search data..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#1a1a1a] border border-white/10 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all w-48"
                        />
                    </div>
                    <ExportMenu onExport={handleExport} type="table" />
                    {onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Regenerate"
                        >
                            <RotateCw size={16} />
                        </button>
                    )}

                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
                <div className="border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#1a1a1a] text-xs uppercase font-bold text-gray-300">
                            <tr>
                                {data.columns.map((col, idx) => (
                                    <th key={idx} className="px-6 py-4 border-b border-white/5 min-w-[150px]">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                    {data.columns.map((col, cIdx) => (
                                        <td key={cIdx} className="px-6 py-4">
                                            {row[col]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRows.length === 0 && (
                        <div className="p-12 text-center text-gray-600">
                            No matching records found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
