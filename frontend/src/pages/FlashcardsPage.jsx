import { useRef, useState } from 'react';
import { useDeck } from '../context/DeckContext';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ReviewSection from '../components/sections/ReviewSection';
import ExportModal from '../components/sections/ExportModal';
import { Download } from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function FlashcardsPage() {
    const { cards, deckName, selectedCard, setSelectedCard } = useDeck();
    const navigate = useNavigate();
    const cardsRef = useRef(null);
    const [showExportModal, setShowExportModal] = useState(false);

    // Reusing export logic (ideally could be utility, but keeping here for simplicity)
    // Enhanced PDF Export Logic
    const downloadPDF = async () => {
        if (cards.length === 0) {
            alert("No cards to export!");
            return;
        }

        const doc = new jsPDF();
        const brandColor = [99, 102, 241]; // Indigo-500

        // Helper for footer
        const addFooter = (pageNum, totalPages) => {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`FlashDeck AI Pro - Study Guide | Page ${pageNum} of ${totalPages}`, 105, 285, { align: 'center' });
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, 200, 285, { align: 'right' });
        };

        // Header for the first page
        doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.setTextColor(255, 255, 255);
        doc.text(deckName?.toUpperCase() || "AI FLASHDECK", 15, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("KNOWLEDGE BANK • FLASHCARDS COLLECTION", 15, 33);

        let yPos = 55;
        const margin = 15;
        const cardWidth = 180;

        cards.forEach((card) => {
            // Check if we need a new page
            if (yPos > 240) {
                doc.addPage();
                yPos = 20;

                // Subheader for new pages
                doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
                doc.rect(0, 0, 210, 15, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.text(`${deckName || 'Study Guide'} - Continued`, 15, 10);
                yPos = 30;
            }

            // Card Container
            doc.setDrawColor(240, 240, 240);
            doc.setFillColor(252, 252, 252);

            // Calculate height for question and answer
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            const qLines = doc.splitTextToSize(`Q: ${card.q}`, cardWidth - 10);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const aLines = doc.splitTextToSize(`A: ${card.a}`, cardWidth - 10);

            const cardHeight = (qLines.length * 7) + (aLines.length * 6) + 15;

            // Draw card block
            doc.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, 'F');
            doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
            doc.line(margin, yPos, margin, yPos + cardHeight); // Left accent line

            // Render Text
            doc.setTextColor(40, 40, 40);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(qLines, margin + 5, yPos + 8);

            doc.setTextColor(80, 80, 80);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(aLines, margin + 5, yPos + 8 + (qLines.length * 7) + 2);

            yPos += cardHeight + 8;
        });

        // Add page numbers
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            addFooter(i, totalPages);
        }

        doc.save(`FlashDeck-Pro-${deckName || 'Study-Guide'}.pdf`);
    };

    const downloadPPTX = async () => {
        if (cards.length === 0) {
            alert("No cards to export!");
            return;
        }

        const PptxGenJS = (await import('pptxgenjs')).default;
        const pres = new PptxGenJS();
        const brandColor = '6366f1'; // Indigo-500

        // Title Slide
        const titleSlide = pres.addSlide();
        titleSlide.background = { color: '0f172a' };

        titleSlide.addText(deckName || "AI Flashcards", {
            x: 1, y: 1.5, w: 8, h: 1.5,
            fontSize: 44, color: 'ffffff', fontFace: 'Verdana',
            bold: true, align: 'center'
        });

        titleSlide.addText("FLASHDECK AI PRO • KNOWLEDGE REVISION", {
            x: 1, y: 3, w: 8, h: 0.5,
            fontSize: 14, color: '6366f1', fontFace: 'Arial',
            align: 'center', italic: true
        });

        titleSlide.addShape(pres.ShapeType.rect, {
            x: 0, y: '95%', w: '100%', h: '5%', fill: { color: brandColor }
        });

        // Content Slides
        cards.forEach((card, idx) => {
            const slide = pres.addSlide();
            slide.background = { color: 'f8fafc' };

            // Header bar
            slide.addShape(pres.ShapeType.rect, {
                x: 0, y: 0, w: '100%', h: 0.8, fill: { color: '0f172a' }
            });
            slide.addText(`CARD ${idx + 1}/${cards.length}`, {
                x: 0.5, y: 0.25, w: 2, h: 0.3,
                fontSize: 10, color: 'ffffff', fontFace: 'Arial', bold: true
            });
            slide.addText(deckName || "FlashDeck Pro", {
                x: 7.5, y: 0.25, w: 2, h: 0.3,
                fontSize: 10, color: '6366f1', fontFace: 'Arial', align: 'right'
            });

            // Question Box
            slide.addShape(pres.ShapeType.rect, {
                x: 0.5, y: 1.2, w: 9, h: 1.8,
                fill: { color: 'ffffff' },
                line: { color: brandColor, width: 2 }
            });
            slide.addText("QUESTION", {
                x: 0.7, y: 1.3, w: 2, h: 0.3,
                fontSize: 9, color: brandColor, fontFace: 'Arial', bold: true
            });
            slide.addText(card.q, {
                x: 0.8, y: 1.7, w: 8.4, h: 1,
                fontSize: 22, color: '1e293b', fontFace: 'Verdana', bold: true, align: 'center'
            });

            // Answer Box
            slide.addShape(pres.ShapeType.rect, {
                x: 0.5, y: 3.2, w: 9, h: 1.8,
                fill: { color: 'f1f5f9' },
                line: { color: 'e2e8f0', width: 1 }
            });
            slide.addText("ANSWER", {
                x: 0.7, y: 3.3, w: 2, h: 0.3,
                fontSize: 9, color: '64748b', fontFace: 'Arial', bold: true
            });
            slide.addText(card.a, {
                x: 0.8, y: 3.7, w: 8.4, h: 1,
                fontSize: 18, color: '334155', fontFace: 'Arial', align: 'center'
            });

            // Footer
            slide.addText("Generated by FlashDeck AI Pro", {
                x: '75%', y: '92%', w: '23%', h: 0.3,
                fontSize: 8, color: '94a3b8', fontFace: 'Arial', italic: true, align: 'right'
            });
        });

        pres.writeFile({ fileName: `FlashDeck-Pro-${deckName || 'Cards'}.pptx` });
    };

    const downloadImage = async (format = 'png') => {
        if (!cardsRef.current || cards.length === 0) {
            alert("No cards to export!");
            return;
        }

        try {
            const canvas = await html2canvas(cardsRef.current, {
                backgroundColor: '#0f172a',
                scale: 3,
                useCORS: true,
                logging: false,
                windowWidth: 1400 // Ensure wide enough layout for screenshot
            });

            const link = document.createElement('a');
            link.download = `FlashDeck-Pro-${deckName || 'Cards'}.${format}`;
            link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`);
            link.click();
        } catch (err) {
            console.error(err);
            alert("Export failed");
        }
    }


    return (
        <Layout>
            <div className="pt-20 px-4 max-w-7xl mx-auto pb-20 min-h-screen relative">
                {/* Background Decor */}
                <div className="fixed inset-0 bg-dots opacity-[0.15] pointer-events-none -z-10" />
                <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
                <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <button
                        onClick={() => navigate('/deck')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group px-4 py-2 rounded-xl hover:bg-white/5"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Deck</span>
                    </button>

                    <Button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 shadow-xl shadow-black/20"
                    >
                        <Download size={18} />
                        Export Deck
                    </Button>
                </div>

                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-white mb-2 font-heading tracking-tight">Flashcards</h1>
                    <p className="text-gray-400 text-sm">Review your generated cards and export them for offline study.</p>
                </div>

                {/* Review Section */}
                <ReviewSection
                    cards={cards}
                    cardsRef={cardsRef}
                    setSelectedCard={setSelectedCard}
                />

                {/* Export Section (Fixed at bottom or just appended) */}
                {/* Export Modal */}
                <ExportModal
                    isOpen={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    cards={cards}
                    downloadPDF={downloadPDF}
                    downloadImage={downloadImage}
                    downloadPPTX={downloadPPTX}
                />
            </div>

            {/* MODAL OVERLAY */}
            <Modal
                isOpen={!!selectedCard}
                onClose={() => setSelectedCard(null)}
                title="Flashcard View"
            >
                {selectedCard && (
                    <div className="p-10">
                        <div className="mb-10">
                            <span className="text-xs font-mono text-primary mb-3 block tracking-widest uppercase">Question</span>
                            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{selectedCard.q}</h2>
                        </div>

                        <div className="bg-[#252525] p-8 rounded-xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                            <span className="text-xs font-mono text-gray-500 mb-3 block tracking-widest uppercase">Answer</span>
                            <p className="text-lg text-gray-300 leading-relaxed font-light">{selectedCard.a}</p>
                        </div>
                    </div>
                )}
            </Modal>

        </Layout>
    );
}
