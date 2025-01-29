import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import { WhatsAppMessage } from '../types/WhatsAppTypes';
import { useChat } from '../context/ChatContext';

interface Props {
    serverUrl: string;
}

interface Chat {
    id: string;
    name: string;
    lastMessage?: {
        body: string;
        timestamp: number;
    };
}

const WhatsAppConnect: React.FC<Props> = ({ serverUrl }) => {
    const [status, setStatus] = useState<string>('Отключено');
    const [isQrScanned, setIsQrScanned] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const { setQrCode, activeChat, chats, setChats } = useChat();

    const addMessageToChat = (message: WhatsAppMessage) => {
        const chatId = message.fromMe ? message.to : message.from;
        
        setChats(prevChats => ({
            ...prevChats,
            [chatId]: {
                ...prevChats[chatId],
                lastMessage: {
                    body: message.body,
                    timestamp: message.timestamp
                }
            }
        }));
    };

    const socket = useMemo(() => {
        return io(serverUrl, {
            withCredentials: true
        });
    }, [serverUrl]);

    useEffect(() => {
        socket.on('connect', () => {
            setStatus('Подключено к серверу');
        });

        socket.on('qr', (qrData: string) => {
            console.log('Получен QR-код, длина:', qrData.length);
            try {
                setQrCode(qrData);
                setStatus('Ожидание сканирования QR-кода');
            } catch (error) {
                console.error('Ошибка обработки QR-кода:', error);
                setStatus('Ошибка получения QR-кода');
            }
        });

        socket.on('ready', () => {
            console.log('WhatsApp готов');
            setStatus('WhatsApp подключен');
            setIsQrScanned(true);
            setQrCode('');
        });

        socket.on('whatsapp-message', (message: WhatsAppMessage) => {
            console.log('Получено новое сообщение:', message);
            addMessageToChat(message);
        });

        socket.on('chats-updated', (updatedChats: Chat[]) => {
            console.log('Получено обновление чатов:', updatedChats);
            setChats(updatedChats);
        });

        socket.on('disconnect', () => {
            console.log('Отключено от сервера');
            setStatus('Отключено от сервера');
        });

        // Загружаем историю чатов при подключении
        fetch(`${serverUrl}/chats`, {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                console.log('Загружены чаты:', data);
                setChats(data);
            })
            .catch(error => {
                console.error('Ошибка загрузки чатов:', error);
            });

        return () => {
            socket.close();
        };
    }, [serverUrl, setQrCode, setChats]);

    const handleSendMessage = async () => {
        if (!activeChat || !message) return;

        try {
            const response = await fetch(`${serverUrl}/send-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    chatId: activeChat,
                    message: message
                })
            });

            if (response.ok) {
                setMessage('');
                socket.emit('send-message', {
                    to: activeChat,
                    message: message
                });
            } else {
                console.error('Ошибка отправки сообщения');
            }
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
        }
    };

    return (
        <div className="whatsapp-connect">
            <div className="status-bar">
                <span>Статус: {status}</span>
            </div>
            {activeChat && (
                <div className="message-input">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Введите сообщение..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage}>Отправить</button>
                </div>
            )}
        </div>
    );
};

export default WhatsAppConnect;
