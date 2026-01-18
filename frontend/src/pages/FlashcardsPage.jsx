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
    const downloadPDF = async () => {
        if (!cardsRef.current || cards.length === 0) {
            alert("No cards to export!");
            return;
        }

        try {
            const canvas = await html2canvas(cardsRef.current, {
                backgroundColor: '#191919',
                scale: 4,
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            if (pdfHeight > 297) {
                pdf.deletePage(1);
                pdf.addPage([pdfWidth, pdfHeight + 20], 'p');
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            }

            pdf.save(`flashdeck-${deckName || 'cards'}.pdf`);
        } catch (e) {
            console.error(e);
            alert("Export failed.");
        }
    }

    const downloadImage = async (format = 'png') => {
        if (!cardsRef.current || cards.length === 0) {
            alert("No cards to export!");
            return;
        }

        try {
            const canvas = await html2canvas(cardsRef.current, {
                backgroundColor: '#191919',
                scale: 3,
            });

            const link = document.createElement('a');
            link.download = `flashdeck-${deckName || 'cards'}.${format}`;
            link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`);
            link.click();
        } catch (e) {
            alert("Export failed");
        }
    }


    return (
        <Layout>
            <div className="pt-20 px-4 max-w-7xl mx-auto pb-20">

                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/notebook')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Notebook</span>
                    </button>

                    <Button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center gap-2 bg-white text-black hover:bg-gray-200"
                    >
                        <Download size={18} />
                        Export
                    </Button>
                </div>

                <h1 className="text-3xl font-bold text-white mb-8">Flashcards</h1>

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
