/**
 * UserMessageBubble - Renders a user message with attachments and edit functionality
 */

import { AnimatePresence, motion } from "framer-motion";
import { FileText } from "lucide-react";
import React, { memo, useEffect, useRef } from "react";
import { Attachment, Message } from "../../types";
import { EditLinear } from "../atoms/Icons";
import { LazyImage } from "../atoms/LazyImage";

interface UserMessageBubbleProps {
    message: Message;
    isLoading: boolean;
    onStartEdit: (id: string) => void;
    onCancelEdit: () => void;
    onSubmitEdit: (id: string, content: string) => void;
    editingMessageId: string | null;
    editingContent: string;
    setEditingContent: (content: string) => void;
}

export const UserMessageBubble: React.FC<UserMessageBubbleProps> = memo(
    ({
        message,
        isLoading,
        onStartEdit,
        onCancelEdit,
        onSubmitEdit,
        editingMessageId,
        editingContent,
        setEditingContent,
    }) => {
        const bubbleRef = useRef<HTMLDivElement>(null);
        const contentRef = useRef<HTMLDivElement>(null);
        const editableRef = useRef<HTMLDivElement>(null);

        const isEditing = editingMessageId === message.id;
        const hasAttachments =
            message.attachments && message.attachments.length > 0;

        const handleStartEdit = () => {
            onStartEdit(message.id);
        };

        const handleCancelEdit = () => {
            onCancelEdit();
        };

        const handleSubmitEdit = () => {
            onSubmitEdit(message.id, editingContent);
        };

        // Focus and set cursor at end when entering edit mode
        useEffect(() => {
            if (isEditing && editableRef.current) {
                const el = editableRef.current;
                el.focus();
                // Move cursor to end
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(el);
                range.collapse(false);
                sel?.removeAllRanges();
                sel?.addRange(range);
            }
        }, [isEditing]);

        return (
            <div className="flex flex-col items-end">
                {/* Attachment Header */}
                {hasAttachments && !isEditing && (
                    <div className="relative flex flex-row flex-wrap justify-end gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/60 border-b-0 rounded-t-xl overflow-hidden">
                        {message.attachments!.map((att: Attachment) => (
                            <div
                                key={att.id}
                                className="flex items-center gap-1.5 relative z-10"
                            >
                                {att.type === "image" ? (
                                    <LazyImage
                                        src={att.url}
                                        alt={att.name}
                                        className="h-4 w-4 object-cover rounded shrink-0 bg-slate-200"
                                        width={16}
                                        height={16}
                                    />
                                ) : (
                                    <div className="h-4 w-4 flex items-center justify-center rounded bg-blue-100 text-blue-500 shrink-0">
                                        <FileText className="w-2.5 h-2.5" />
                                    </div>
                                )}
                                <span className="text-[9px] font-medium text-slate-600 truncate max-w-[80px]">
                                    {att.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Chat Bubble */}
                <motion.div
                    ref={bubbleRef}
                    initial={false}
                    animate={{
                        scale: isEditing ? 1.01 : 1,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                    }}
                    className={`relative p-[1.5px] bg-gradient-to-br from-white/80 via-slate-200/60 to-slate-300/80 shadow-sm overflow-hidden ${hasAttachments
                        ? "rounded-2xl rounded-tr-none"
                        : "rounded-2xl rounded-tr-sm"
                        }`}
                    style={{
                        maxWidth: "65ch",
                    }}
                >
                    <div
                        className={`relative bg-white flex flex-col w-full ${hasAttachments
                            ? "rounded-2xl rounded-tr-none"
                            : "rounded-2xl rounded-tr-sm"
                            }`}
                    >
                        {isEditing ? (
                            <motion.div
                                key="edit-input"
                                initial={{ opacity: 0, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, filter: 'blur(4px)' }}
                                transition={{ duration: 0.2 }}
                                className="py-3 px-4"
                            >
                                <div
                                    ref={editableRef}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onInput={(e) => {
                                        setEditingContent(e.currentTarget.textContent || '');
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (editingContent.trim()) {
                                                handleSubmitEdit();
                                            }
                                        }
                                        if (e.key === 'Escape') {
                                            handleCancelEdit();
                                        }
                                    }}
                                    className="outline-none text-slate-700 whitespace-pre-wrap break-words bg-slate-50/50 -mx-1 px-1 rounded"
                                    style={{
                                        fontSize: "var(--text-chat)",
                                        lineHeight: "var(--text-chat-line-height)",
                                        fontFamily: "inherit",
                                        minWidth: "1ch",
                                    }}
                                >
                                    {message.content}
                                </div>
                            </motion.div>
                        ) : (
                            message.content && (
                                <motion.div
                                    key="message-content"
                                    initial={{ opacity: 0, filter: 'blur(4px)' }}
                                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.2 }}
                                    ref={contentRef}
                                    className="py-3 px-4 text-slate-700 break-words chat-message-user"
                                    style={{
                                        fontSize: "var(--text-chat)",
                                        lineHeight: "var(--text-chat-line-height)",
                                    }}
                                >
                                    <p className="whitespace-pre-wrap font-normal m-0">
                                        {message.content}
                                    </p>
                                </motion.div>
                            )
                        )}
                    </div>
                </motion.div>

                {/* Edit Actions & Edit Button - Fixed height container to prevent layout shift */}
                <div className="h-8 flex items-center justify-end mt-3">
                    <AnimatePresence mode="wait" initial={false}>
                        {isEditing ? (
                            <motion.div
                                key="edit-actions"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex justify-end gap-2"
                            >
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 text-[11px] font-semibold text-slate-500 bg-white border border-slate-200/60 rounded-lg hover:bg-slate-50 active:scale-95 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitEdit}
                                    disabled={!editingContent.trim()}
                                    className="px-3 py-1 text-[11px] font-bold text-white bg-gradient-to-b from-blue-400 to-blue-500 rounded-lg disabled:opacity-50 active:scale-95 transition-colors"
                                >
                                    Save & Resend
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="view-actions"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center justify-end gap-1"
                            >
                                {message.urlsDetected && message.urlsDetected.length > 0 && (
                                    <div
                                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${message.urlsFetching
                                            ? "bg-blue-50 text-blue-600"
                                            : "bg-slate-100 text-slate-500"
                                            }`}
                                        title={`${message.urlsDetected.length} URL(s) detected`}
                                    >
                                        <svg
                                            className={`w-3 h-3 ${message.urlsFetching ? "animate-pulse" : ""
                                                }`}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <span>
                                            {message.urlsFetching
                                                ? "Reading..."
                                                : `${message.urlsDetected.length} link${message.urlsDetected.length > 1 ? "s" : ""
                                                }`}
                                        </span>
                                    </div>
                                )}
                                {!isLoading && (
                                    <button
                                        onClick={handleStartEdit}
                                        className="p-1.5 rounded-md text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                        title="Edit message"
                                    >
                                        <EditLinear className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.message.id === nextProps.message.id &&
            prevProps.message.content === nextProps.message.content &&
            prevProps.message.urlsFetching === nextProps.message.urlsFetching &&
            prevProps.isLoading === nextProps.isLoading &&
            prevProps.editingMessageId === nextProps.editingMessageId &&
            prevProps.editingContent === nextProps.editingContent
        );
    }
);

export default UserMessageBubble;
