import React, { useRef, useState } from 'react';
import { useDeck } from '../context/DeckContext';
import { Download, RotateCw, Sparkles, Image as ImageIcon, FileText, Presentation, FileType } from 'lucide-react';
import ReviewSection from './sections/ReviewSection';
import ExportMenu from './ExportMenu';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

export default function FlashcardViewer() {
    const { cards, deckName, deckId, triggerGeneration } = useDeck();
    const [selectedCard, setSelectedCard] = useState(null);
    const cardsRef = useRef(null);

    const handleRegenerate = () => {
        triggerGeneration('cards', deckId);
    };

    const downloadPDF = async () => {
        const doc = new jsPDF();
        const brandColor = [99, 102, 241];

        const addFooter = (pageNum, totalPages) => {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`FlashDeck AI Pro - Study Guide | Page ${pageNum} of ${totalPages}`, 105, 285, { align: 'center' });
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, 200, 285, { align: 'right' });
        };

        // Cover Page
        doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
        doc.rect(0, 0, 210, 297, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(40);
        doc.text(deckName || "FlashCards", 105, 140, { align: 'center' });
        doc.setFontSize(16);
        doc.text("FLASHDECK AI PRO", 105, 155, { align: 'center' });
        doc.setFontSize(10);
        doc.text("KNOWLEDGE BANK • STUDY GUIDE", 105, 165, { align: 'center' });

        doc.addPage();

        let yPos = 20;
        const margin = 15;
        const cardWidth = 180;

        cards.forEach((card, idx) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            const qLines = doc.splitTextToSize(`Q: ${card.q}`, cardWidth - 10);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const aLines = doc.splitTextToSize(`A: ${card.a}`, cardWidth - 10);

            const cardHeight = (qLines.length * 7) + (aLines.length * 6) + 20;

            if (yPos + cardHeight > 280) {
                doc.addPage();
                yPos = 20;
            }

            // Draw Card
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, 'FD');

            // Accent
            doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
            doc.setLineWidth(1);
            doc.line(margin, yPos, margin, yPos + cardHeight);

            // Text
            doc.setTextColor(30, 41, 59);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(qLines, margin + 5, yPos + 8);

            doc.setTextColor(71, 85, 105);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(aLines, margin + 5, yPos + 10 + (qLines.length * 7));

            yPos += cardHeight + 5;
        });

        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 2; i <= totalPages; i++) {
            doc.setPage(i);
            addFooter(i - 1, totalPages - 1);
        }

        doc.save(`FlashDeck-Pro-Cards-${Date.now()}.pdf`);
    };

    const downloadPPTX = async () => {
        const PptxGenJS = (await import('pptxgenjs')).default;
        const pres = new PptxGenJS();

        // Title Slide
        const slide = pres.addSlide();
        slide.background = { color: '0f172a' };
        slide.addText(deckName || "FlashDeck AI", { x: 1, y: '40%', w: '80%', fontSize: 44, color: 'ffffff', bold: true, align: 'center' });
        slide.addText("FlashDeck AI Pro Export", { x: 1, y: '55%', w: '80%', fontSize: 14, color: '6366f1', align: 'center' });

        // Cards
        cards.forEach(card => {
            const s = pres.addSlide();
            s.background = { color: 'f8fafc' };
            // Header
            s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.8, fill: { color: '6366f1' } });
            s.addText(deckName || "FlashCard", { x: 0.5, y: 0.2, w: 9, fontSize: 18, color: 'ffffff', bold: true });

            // Q
            s.addText("Q", { x: 0.5, y: 1.2, fontSize: 24, color: '6366f1', bold: true });
            s.addText(card.q, { x: 1.2, y: 1.25, w: 8, fontSize: 18, color: '1e293b' });

            // A
            s.addShape(pres.ShapeType.line, { x: 1, y: 3, w: 8, h: 0, line: { color: 'e2e8f0', width: 2 } });
            s.addText("A", { x: 0.5, y: 3.5, fontSize: 24, color: '10b981', bold: true });
            s.addText(card.a, { x: 1.2, y: 3.55, w: 8, fontSize: 16, color: '475569' });

            // Footer
            s.addText("FlashDeck AI Pro", { x: 0.5, y: 5.2, fontSize: 10, color: '94a3b8' });
        });

        pres.writeFile({ fileName: `FlashDeck-Pro-${Date.now()}.pptx` });
    };

    const downloadImage = async () => {
        const html2canvas = (await import('html2canvas')).default;

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '1200px';
        container.style.backgroundColor = '#0f172a';
        container.style.padding = '40px';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(3, 1fr)';
        container.style.gap = '20px';

        if (!cardsRef.current) return;

        const originalNode = cardsRef.current;
        const clone = originalNode.cloneNode(true);

        clone.style.width = '1400px';
        clone.style.height = 'auto';
        clone.style.display = 'grid';
        clone.style.gridTemplateColumns = 'repeat(3, 1fr)';
        clone.style.gap = '24px';
        clone.style.padding = '40px';
        clone.style.background = '#0f172a';

        container.appendChild(clone);
        document.body.appendChild(container);

        try {
            const canvas = await html2canvas(container, {
                backgroundColor: '#0f172a',
                scale: 2,
                useCORS: true,
                clean: true
            });

            canvas.toBlob((blob) => {
                saveAs(blob, `FlashDeck-Image-${Date.now()}.png`);
            });
        } finally {
            document.body.removeChild(container);
        }
    };

    const downloadAnki = async () => {
        try {
            // Dynamically import the library since it might not be SSR friendly or large
            // Note: Package name is 'anki-apkg-export'
            const module = await import('anki-apkg-export');
            const Package = module.default || module.Package;
            const apkg = new Package();

            cards.forEach(card => {
                apkg.addCard(card.q, card.a);
            });

            const blob = await apkg.save();
            saveAs(blob, `${deckName || 'FlashDeck'}.apkg`);
        } catch (error) {
            console.error("Anki export failed, falling back to CSV", error);
            // Fallback to CSV
            let csvContent = "";
            cards.forEach(card => {
                const q = `"${card.q.replace(/"/g, '""')}"`;
                const a = `"${card.a.replace(/"/g, '""')}"`;
                csvContent += `${q},${a}\n`;
            });
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `${deckName || 'FlashDeck'}-Import.csv`);
        }
    };

    const handleExport = (format) => {
        if (format === 'pdf') downloadPDF();
        else if (format === 'pptx') downloadPPTX();
        else if (format === 'png') downloadImage();
        else if (format === 'anki') downloadAnki();
    };

    const exportOptions = [
        { label: 'Printable PDF (.pdf)', format: 'pdf', icon: FileText },
        { label: 'PowerPoint (.pptx)', format: 'pptx', icon: Presentation },
        { label: 'Image Grid (.png)', format: 'png', icon: ImageIcon },
        { label: 'Anki Deck (.apkg)', format: 'anki', icon: FileType }
    ];

    if (!cards) return null;

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-dots opacity-[0.2] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 bg-[#0d0d0d]/80 backdrop-blur-md border-b border-white/5 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10 shadow-inner">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] block leading-none mb-1">Knowledge Bank</span>
                        <h2 className="text-lg font-bold text-white font-heading tracking-tight">Flashcards</h2>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ExportMenu type="custom" options={exportOptions} onExport={handleExport} />
                    <button
                        onClick={handleRegenerate}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all border border-white/5"
                        title="Regenerate Deck"
                    >
                        <RotateCw size={18} />
                    </button>
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-transparent relative z-0">
                <ReviewSection cards={cards} cardsRef={cardsRef} setSelectedCard={setSelectedCard} />
            </div>
        </div>
    );
}
