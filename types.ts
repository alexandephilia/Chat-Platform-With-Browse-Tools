import React from 'react';

// Tool call states for dynamic UI
export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'error';

export interface ToolCall {
    id: string;
    name: string;
    args: Record<string, any>;
    status: ToolCallStatus;
    result?: any;
    error?: string;
    startedAt?: Date;
    completedAt?: Date;
}

export interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
    attachments?: Attachment[];
    modelId?: string; // The model used for AI responses
    toolCalls?: ToolCall[]; // Tool calls made during this message
    thinking?: string; // Model's reasoning/thought process (for thinking models)
    isThinking?: boolean; // Whether the model is currently thinking
    planningText?: string; // Planning text from model before tool calls (e.g., "I'll search for...")
    urlsDetected?: string[]; // URLs detected in user message
    urlsFetching?: boolean; // Whether URL content is being fetched
    isError?: boolean; // Whether this message is an error response
}

export interface Attachment {
    dataUrl: boolean;
    id: string;
    type: 'image' | 'file';
    url: string;
    name: string;
    file?: File;
    content?: string; // Extracted text content for documents
}

export interface NavItem {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    notificationCount?: number;
}

export interface SuggestionCard {
    title: string;
    description: string;
    prompt: string;
}
