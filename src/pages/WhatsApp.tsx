import React, { useState } from 'react';
import WhatsAppConnect from '../components/WhatsAppConnect';
import WhatsAppQRCode from '../components/WhatsAppQRCode';
import { ChatProvider } from '../context/ChatContext';
import { MdQrCode2 } from 'react-icons/md';

const WhatsApp: React.FC = () => {
    const [showQRCode, setShowQRCode] = useState(false);

    return (
        <ChatProvider>
            <div className="h-screen bg-[#f0f2f5] relative">
                {/* Верхняя панель с иконкой QR-кода */}
                <div className="w-full bg-[#00a884] px-4 py-2 flex justify-end items-center">
                    <div 
                        className="cursor-pointer flex items-center gap-2 text-white"
                        onClick={() => setShowQRCode(true)}
                    >
                        <MdQrCode2 className="w-6 h-6" />
                        <span className="text-sm">Сканировать QR-код</span>
                    </div>
                </div>

                <WhatsAppConnect serverUrl="http://localhost:3000" />

                {/* Модальное окно с QR-кодом */}
                {showQRCode && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 relative">
                            <button 
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowQRCode(false)}
                            >
                                ✕
                            </button>
                            <WhatsAppQRCode />
                        </div>
                    </div>
                )}
            </div>
        </ChatProvider>
    );
};

export default WhatsApp;
