/**
 * Chat History Service - Manages chat sessions in localStorage
 */

import { Message } from '../types';

const STORAGE_KEY = 'zeta_chat_history';
const ACTIVE_CHAT_KEY = 'zeta_active_chat';

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: Date;
    messageCount: number;
}

interface StoredChatSession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: string;
    messageCount: number;
}

/**
 * Generate a title from the first user message
 */
export function generateChatTitle(messages: Message[]): string {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (!firstUserMessage) return 'New Chat';

    // Take first 50 chars of the message, trim at word boundary
    let title = firstUserMessage.content.slice(0, 50);
    if (firstUserMessage.content.length > 50) {
        const lastSpace = title.lastIndexOf(' ');
        if (lastSpace > 20) {
            title = title.slice(0, lastSpace);
        }
        title += '...';
    }
    return title || 'New Chat';
}

/**
 * Get all chat sessions from localStorage
 */
export function getAllChats(): ChatSession[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const parsed: StoredChatSession[] = JSON.parse(stored);
        return parsed.map(chat => ({
            ...chat,
            timestamp: new Date(chat.timestamp),
            messages: chat.messages.map(m => ({
                ...m,
                timestamp: new Date(m.timestamp)
            }))
        })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
        console.error('[ChatHistory] Failed to load chats:', error);
        return [];
    }
}

/**
 * Get a specific chat by ID
 */
export function getChatById(chatId: string): ChatSession | null {
    const chats = getAllChats();
    return chats.find(c => c.id === chatId) || null;
}

/**
 * Save a chat session
 */
export function saveChat(chat: ChatSession): void {
    try {
        const chats = getAllChats();
        const existingIndex = chats.findIndex(c => c.id === chat.id);

        const chatToSave: StoredChatSession = {
            ...chat,
            timestamp: chat.timestamp.toISOString(),
            messages: chat.messages.map(m => ({
                ...m,
                timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
            })) as any
        };

        if (existingIndex >= 0) {
            chats[existingIndex] = { ...chat, timestamp: new Date(chatToSave.timestamp) };
        } else {
            chats.unshift(chat);
        }

        // Store with ISO strings
        const toStore: StoredChatSession[] = chats.map(c => ({
            ...c,
            timestamp: c.timestamp instanceof Date ? c.timestamp.toISOString() : c.timestamp,
            messages: c.messages.map(m => ({
                ...m,
                timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
            })) as any
        }));

        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
        console.error('[ChatHistory] Failed to save chat:', error);
    }
}

/**
 * Delete a chat session
 */
export function deleteChat(chatId: string): void {
    try {
        const chats = getAllChats();
        const filtered = chats.filter(c => c.id !== chatId);

        const toStore: StoredChatSession[] = filtered.map(c => ({
            ...c,
            timestamp: c.timestamp instanceof Date ? c.timestamp.toISOString() : c.timestamp,
            messages: c.messages.map(m => ({
                ...m,
                timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
            })) as any
        }));

        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));

        // Clear active chat if it was deleted
        if (getActiveChatId() === chatId) {
            clearActiveChatId();
        }
    } catch (error) {
        console.error('[ChatHistory] Failed to delete chat:', error);
    }
}

/**
 * Create a new chat session
 */
export function createNewChat(): ChatSession {
    return {
        id: `chat_${Date.now()}`,
        title: 'New Chat',
        messages: [],
        timestamp: new Date(),
        messageCount: 0
    };
}

/**
 * Update chat title based on messages
 */
export function updateChatTitle(chatId: string, messages: Message[]): void {
    const chat = getChatById(chatId);
    if (!chat) return;

    const newTitle = generateChatTitle(messages);
    if (chat.title !== newTitle) {
        saveChat({
            ...chat,
            title: newTitle,
            messages,
            messageCount: messages.length,
            timestamp: new Date()
        });
    }
}

/**
 * Get active chat ID
 */
export function getActiveChatId(): string | null {
    return localStorage.getItem(ACTIVE_CHAT_KEY);
}

/**
 * Set active chat ID
 */
export function setActiveChatId(chatId: string): void {
    localStorage.setItem(ACTIVE_CHAT_KEY, chatId);
}

/**
 * Clear active chat ID
 */
export function clearActiveChatId(): void {
    localStorage.removeItem(ACTIVE_CHAT_KEY);
}
