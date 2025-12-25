/**
 * useChatHistory - Hook for managing chat history with localStorage persistence
 */

import { useCallback, useEffect, useState } from 'react';
import { ChatHistoryItem } from '../components/organisms/Sidebar';
import {
    ChatSession,
    createNewChat,
    deleteChat as deleteChatFromStorage,
    generateChatTitle,
    getActiveChatId,
    getAllChats,
    getChatById,
    saveChat,
    setActiveChatId
} from '../services/chatHistoryService';
import { Message } from '../types';

export function useChatHistory() {
    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
    const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
    const [currentChat, setCurrentChat] = useState<ChatSession | null>(null);
    // Track the ID of the newest chat with a completed response (for notification indicator)
    const [newestChatId, setNewestChatId] = useState<string | null>(null);

    // Load chat history on mount
    useEffect(() => {
        const chats = getAllChats();
        setChatHistory(chats.map(c => ({
            id: c.id,
            title: c.title,
            timestamp: c.timestamp,
            messageCount: c.messageCount,
            isNew: false
        })));

        // Restore active chat
        const activeId = getActiveChatId();
        if (activeId) {
            const chat = getChatById(activeId);
            if (chat) {
                setActiveChatIdState(activeId);
                setCurrentChat(chat);
            }
        }
    }, []);

    /**
     * Create a new chat
     */
    const createChat = useCallback(() => {
        const newChat = createNewChat();
        setCurrentChat(newChat);
        setActiveChatIdState(newChat.id);
        setActiveChatId(newChat.id);
        return newChat;
    }, []);

    /**
     * Select an existing chat
     */
    const selectChat = useCallback((chatId: string) => {
        const chat = getChatById(chatId);
        if (chat) {
            setCurrentChat(chat);
            setActiveChatIdState(chatId);
            setActiveChatId(chatId);
            // Clear "new" status when user selects the chat
            if (newestChatId === chatId) {
                setNewestChatId(null);
                setChatHistory(prev => prev.map(c =>
                    c.id === chatId ? { ...c, isNew: false } : c
                ));
            }
        }
    }, [newestChatId]);

    /**
     * Update current chat messages and save
     * @param messages - The messages to save
     * @param isStreamingComplete - Set to true when AI response is complete (marks chat as "new")
     */
    const updateMessages = useCallback((messages: Message[], isStreamingComplete: boolean = false) => {
        if (!currentChat) return;

        const title = messages.length > 0 ? generateChatTitle(messages) : 'New Chat';
        const updatedChat: ChatSession = {
            ...currentChat,
            messages,
            title,
            messageCount: messages.length,
            timestamp: new Date()
        };

        setCurrentChat(updatedChat);
        saveChat(updatedChat);

        // Mark as "new" if streaming just completed and this isn't the active view
        const shouldMarkNew = isStreamingComplete && messages.length > 0;

        // Update history list
        setChatHistory(prev => {
            const existing = prev.findIndex(c => c.id === updatedChat.id);
            const newItem: ChatHistoryItem = {
                id: updatedChat.id,
                title: updatedChat.title,
                timestamp: updatedChat.timestamp,
                messageCount: updatedChat.messageCount,
                isNew: shouldMarkNew
            };

            // Clear isNew from other chats when a new one becomes "new"
            let updated = prev.map(c => ({ ...c, isNew: false }));

            if (existing >= 0) {
                updated[existing] = newItem;
            } else {
                updated = [newItem, ...updated];
            }

            return updated.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        });

        if (shouldMarkNew) {
            setNewestChatId(updatedChat.id);
        }
    }, [currentChat]);

    /**
     * Delete a chat
     */
    const deleteChat = useCallback((chatId: string) => {
        deleteChatFromStorage(chatId);
        setChatHistory(prev => prev.filter(c => c.id !== chatId));

        // Clear newest if deleting it
        if (newestChatId === chatId) {
            setNewestChatId(null);
        }

        // If deleting current chat, create a new one
        if (activeChatId === chatId) {
            const newChat = createNewChat();
            setCurrentChat(newChat);
            setActiveChatIdState(newChat.id);
            setActiveChatId(newChat.id);
        }
    }, [activeChatId, newestChatId]);

    /**
     * Start a new chat (clear current and create fresh)
     */
    const startNewChat = useCallback(() => {
        // Save current chat if it has messages
        if (currentChat && currentChat.messages.length > 0) {
            saveChat(currentChat);
        }

        const newChat = createNewChat();
        setCurrentChat(newChat);
        setActiveChatIdState(newChat.id);
        setActiveChatId(newChat.id);
        return newChat;
    }, [currentChat]);

    /**
     * Get messages for current chat
     */
    const getCurrentMessages = useCallback((): Message[] => {
        return currentChat?.messages || [];
    }, [currentChat]);

    /**
     * Clear the "new" indicator for a specific chat
     */
    const clearNewIndicator = useCallback((chatId: string) => {
        if (newestChatId === chatId) {
            setNewestChatId(null);
        }
        setChatHistory(prev => prev.map(c =>
            c.id === chatId ? { ...c, isNew: false } : c
        ));
    }, [newestChatId]);

    return {
        chatHistory,
        activeChatId,
        currentChat,
        createChat,
        selectChat,
        updateMessages,
        deleteChat,
        startNewChat,
        getCurrentMessages,
        clearNewIndicator
    };
}
