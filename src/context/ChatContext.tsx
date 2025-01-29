import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { WhatsAppMessage } from '../types/WhatsAppTypes';

interface Chat {
    phoneNumber: string;
    name: string;
    messages: Message[];
    lastMessage?: Message;
}

interface Message {
    from: string;
    to?: string;
    body: string;
    timestamp: string;
    isGroup: boolean;
    sender?: string;
    fromMe: boolean;
}

interface ChatContextType {
    chats: { [key: string]: Chat };
    setChats: React.Dispatch<React.SetStateAction<{ [key: string]: Chat }>>;
    activeChat: string | null;
    setActiveChat: React.Dispatch<React.SetStateAction<string | null>>;
    loadChats: () => Promise<void>;
    qrCode: string;
    setQrCode: (code: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [chats, setChats] = useState<{ [key: string]: Chat }>({});
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string>('');

    const loadChats = async () => {
        try {
            const response = await axios.get('https://ws004-8xd9.onrender.com/chats');
            const loadedChats = response.data;
            setChats(loadedChats);
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    };

    useEffect(() => {
        loadChats();
    }, []);

    return (
        <ChatContext.Provider value={{ chats, setChats, activeChat, setActiveChat, loadChats, qrCode, setQrCode }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
