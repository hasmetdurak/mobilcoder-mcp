import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

interface QRScannerProps {
    onScan: (data: string | null) => void;
    onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isScanning = useRef(false);

    useEffect(() => {
        const startScanner = async () => {
            if (isScanning.current) return;

            try {
                const scanner = new Html5Qrcode("qr-reader");
                scannerRef.current = scanner;
                isScanning.current = true;

                await scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText) => {
                        onScan(decodedText);
                        stopScanner();
                    },
                    (errorMessage) => {
                        // Ignore scanning errors (no QR found)
                    }
                );
            } catch (err: any) {
                setError(err?.message || 'Camera access denied');
                isScanning.current = false;
            }
        };

        const stopScanner = () => {
            if (scannerRef.current && isScanning.current) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current?.clear();
                    isScanning.current = false;
                }).catch(() => {
                    isScanning.current = false;
                });
            }
        };

        startScanner();

        return () => {
            stopScanner();
        };
    }, [onScan]);

    const handleClose = () => {
        if (scannerRef.current && isScanning.current) {
            scannerRef.current.stop().then(() => {
                scannerRef.current?.clear();
                onClose();
            });
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 z-10">
                <button onClick={handleClose} className="p-2 bg-black/50 rounded-full text-white">
                    <X size={32} />
                </button>
            </div>

            <div className="w-full max-w-md aspect-square relative overflow-hidden rounded-lg border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                <div id="qr-reader" className="w-full h-full"></div>

                {/* Scanning Overlay */}
                <div className="absolute inset-0 border-2 border-transparent pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
                </div>
            </div>

            <p className="mt-8 text-white text-center px-4">
                Masaüstünüzdeki QR kodu kameranıza tutun<br />
                <span className="text-gray-400 text-sm">anında bağlanmak için</span>
            </p>

            {error && (
                <p className="mt-4 text-red-500 text-sm bg-red-500/10 px-4 py-2 rounded">
                    {error}
                </p>
            )}
        </div>
    );
};

export default QRScanner;
