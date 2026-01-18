import { Download, FileText, Image as ImageIcon } from "lucide-react";
import Button from "../ui/Button";

export default function ExportSection({ cards, downloadPDF, downloadImage }) {
    return (
        <div className="pb-20 relative">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />

            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-3 block">Export Your Deck</h2>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                    Save your generated cards in your preferred format. All files are optimized for quality.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">

                {/* Anki */}
                <div className="glass-panel p-8 rounded-2xl group relative transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                    <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        <Download size={28} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Anki Package</h3>
                    <p className="text-sm text-gray-500 mb-8 min-h-[40px] leading-relaxed">
                        Native support. Import directly into Anki for spaced repetition.
                    </p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                        Download .apkg
                    </Button>
                </div>

                {/* PDF */}
                <div className="glass-panel p-8 rounded-2xl group relative transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                    <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0)] group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                        <FileText size={28} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Printable PDF</h3>
                    <p className="text-sm text-gray-500 mb-8 min-h-[40px] leading-relaxed">
                        High-fidelity vector PDF for printing or visual studying.
                    </p>
                    <Button
                        onClick={downloadPDF}
                        disabled={cards.length === 0}
                        className="w-full bg-white/5 border-white/5 hover:bg-white/10 text-white"
                        variant="secondary"
                    >
                        Download PDF
                    </Button>
                </div>

                {/* Image */}
                <div className="glass-panel p-8 rounded-2xl group relative transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                    <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                    <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        <ImageIcon size={28} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Image Grid</h3>
                    <p className="text-sm text-gray-500 mb-8 min-h-[40px] leading-relaxed">
                        Exports the entire deck as a high-res PNG grid.
                    </p>
                    <Button
                        onClick={() => downloadImage('png')}
                        disabled={cards.length === 0}
                        className="w-full bg-white/5 border-white/5 hover:bg-white/10 text-white"
                        variant="secondary"
                    >
                        Download PNG
                    </Button>
                </div>

            </div>
        </div>
    );
}
