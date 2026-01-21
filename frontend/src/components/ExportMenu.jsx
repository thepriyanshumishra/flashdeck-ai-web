import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Image, Table as TableIcon, X } from 'lucide-react';

export default function ExportMenu({ onExport, type }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const options = {
        'slides': [
            { label: 'PowerPoint (.pptx)', format: 'pptx', icon: PresentationIcon },
            { label: 'PDF Document (.pdf)', format: 'pdf', icon: FileText },
            { label: 'JSON Data (.json)', format: 'json', icon: FileText },
        ],
        'report': [
            { label: 'Markdown (.md)', format: 'md', icon: FileText },
            { label: 'PDF Document (.pdf)', format: 'pdf', icon: FileText },
            { label: 'HTML File (.html)', format: 'html', icon: FileText },
        ],
        'table': [
            { label: 'Excel (.csv)', format: 'csv', icon: TableIcon },
            { label: 'PDF Document (.pdf)', format: 'pdf', icon: FileText },
            { label: 'JSON Data (.json)', format: 'json', icon: FileText },
        ]
    };

    const currentOptions = options[type] || [];

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all border border-white/10 flex items-center gap-2"
            >
                <Download size={14} />
                Export
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-white/5 bg-white/5">
                        <span className="text-xs font-bold text-gray-400 px-2 uppercase tracking-wider">Export As</span>
                    </div>
                    <div className="p-1">
                        {currentOptions.map((opt) => (
                            <button
                                key={opt.format}
                                onClick={() => {
                                    onExport(opt.format);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                            >
                                {opt.icon && <opt.icon size={14} className="opacity-70" />}
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function PresentationIcon({ size, className }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M2 3h20" />
            <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
            <path d="m7 21 5-5 5 5" />
        </svg>
    )
}
