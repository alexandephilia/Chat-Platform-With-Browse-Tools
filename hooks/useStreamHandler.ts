/**
 * useStreamHandler - Unified stream processing for all AI providers
 * Handles text streaming, tool calls, and thinking/reasoning
 */

import { useCallback } from 'react';
import { Message, ToolCall } from '../types';

export type StreamEvent =
    | { type: 'text'; content: string }
    | { type: 'thinking'; content: string }
    | { type: 'thinking_done' }
    | { type: 'tool_call_start'; toolCall: ToolCall }
    | { type: 'tool_call_update'; id: string; status: ToolCall['status']; result?: any; error?: string }
    | { type: 'done' };

interface StreamState {
    fullContent: string;
    thinkingText: string;
    hasToolCallStarted: boolean;
    currentToolCalls: ToolCall[];
}

interface UseStreamHandlerOptions {
    messageId: string;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    useThinkingForPreToolText?: boolean; // When true, pre-tool text goes to thinking block
}

/**
 * Creates a stream handler that processes events and updates messages
 */
export function createStreamHandler(options: UseStreamHandlerOptions) {
    const { messageId, setMessages, useThinkingForPreToolText = false } = options;

    const state: StreamState = {
        fullContent: '',
        thinkingText: '',
        hasToolCallStarted: false,
        currentToolCalls: [],
    };

    const updateMessage = (updates: Partial<Message>) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
        ));
    };

    const updateToolCall = (id: string, updates: Partial<ToolCall>) => {
        state.currentToolCalls = state.currentToolCalls.map(tc =>
            tc.id === id ? { ...tc, ...updates } : tc
        );
        updateMessage({ toolCalls: state.currentToolCalls });
    };

    return {
        handleEvent(event: StreamEvent) {
            switch (event.type) {
                case 'thinking':
                    state.thinkingText += event.content;
                    updateMessage({ thinking: state.thinkingText, isThinking: true });
                    break;

                case 'thinking_done':
                    updateMessage({ isThinking: false });
                    break;

                case 'text':
                    if (useThinkingForPreToolText && !state.hasToolCallStarted) {
                        // Before tool calls - accumulate as thinking
                        state.thinkingText += event.content;
                        updateMessage({ thinking: state.thinkingText, isThinking: true });
                    } else {
                        // After tool calls or normal mode - show as content
                        state.fullContent += event.content;
                        updateMessage({ content: state.fullContent, isThinking: false });
                    }
                    break;

                case 'tool_call_start':
                    state.hasToolCallStarted = true;
                    state.currentToolCalls = [...state.currentToolCalls, event.toolCall];
                    updateMessage({
                        isThinking: false,
                        toolCalls: state.currentToolCalls
                    });
                    break;

                case 'tool_call_update':
                    updateToolCall(event.id, {
                        status: event.status,
                        result: event.result,
                        error: event.error,
                        completedAt: event.status === 'completed' || event.status === 'error'
                            ? new Date()
                            : undefined
                    });
                    break;

                case 'done':
                    // Final cleanup if needed
                    break;
            }
        },

        getState: () => ({ ...state }),
    };
}

/**
 * Hook version for use in components
 */
export function useStreamHandler() {
    const processStream = useCallback(async <T extends StreamEvent>(
        stream: AsyncGenerator<T, void, unknown>,
        options: UseStreamHandlerOptions
    ) => {
        const handler = createStreamHandler(options);

        for await (const event of stream) {
            handler.handleEvent(event as StreamEvent);
        }

        return handler.getState();
    }, []);

    return { processStream };
}
