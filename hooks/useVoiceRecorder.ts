/**
 * Voice Recorder Hook
 * Handles browser audio recording with MediaRecorder API
 */

import { useCallback, useRef, useState } from 'react';
import { transcribeAudio, TranscriptionOptions } from '../services/speechService';

export type RecordingState = 'idle' | 'recording' | 'processing';

interface UseVoiceRecorderOptions {
    onTranscription?: (text: string) => void;
    onError?: (error: string) => void;
    transcriptionOptions?: TranscriptionOptions;
    maxDuration?: number; // Max recording duration in ms (default: 60000 = 1 min)
}

interface UseVoiceRecorderReturn {
    state: RecordingState;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<string | null>;
    cancelRecording: () => void;
    duration: number; // Current recording duration in seconds
    isSupported: boolean;
}

export function useVoiceRecorder(options: UseVoiceRecorderOptions = {}): UseVoiceRecorderReturn {
    const {
        onTranscription,
        onError,
        transcriptionOptions,
        maxDuration = 60000,
    } = options;

    const [state, setState] = useState<RecordingState>('idle');
    const [duration, setDuration] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    // Check browser support
    const isSupported = typeof navigator !== 'undefined'
        && !!navigator.mediaDevices
        && !!navigator.mediaDevices.getUserMedia
        && typeof MediaRecorder !== 'undefined';

    const cleanup = useCallback(() => {
        // Stop timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Stop media recorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;

        // Stop all tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        chunksRef.current = [];
        setDuration(0);
    }, []);

    const startRecording = useCallback(async () => {
        if (!isSupported) {
            onError?.('Voice recording is not supported in this browser');
            return;
        }

        if (state !== 'idle') {
            return;
        }

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000, // Optimal for Whisper
                }
            });

            streamRef.current = stream;
            chunksRef.current = [];

            // Determine best supported format
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : MediaRecorder.isTypeSupported('audio/mp4')
                        ? 'audio/mp4'
                        : 'audio/wav';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onerror = (event) => {
                console.error('[VoiceRecorder] MediaRecorder error:', event);
                onError?.('Recording error occurred');
                cleanup();
                setState('idle');
            };

            // Start recording
            mediaRecorder.start(100); // Collect data every 100ms
            startTimeRef.current = Date.now();
            setState('recording');

            // Start duration timer
            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setDuration(elapsed);

                // Auto-stop at max duration
                if (elapsed * 1000 >= maxDuration) {
                    stopRecording();
                }
            }, 100);

        } catch (error) {
            console.error('[VoiceRecorder] Failed to start recording:', error);

            if (error instanceof DOMException) {
                if (error.name === 'NotAllowedError') {
                    onError?.('Microphone access denied. Please allow microphone access.');
                } else if (error.name === 'NotFoundError') {
                    onError?.('No microphone found. Please connect a microphone.');
                } else {
                    onError?.(`Microphone error: ${error.message}`);
                }
            } else {
                onError?.('Failed to start recording');
            }

            cleanup();
            setState('idle');
        }
    }, [isSupported, state, maxDuration, onError, cleanup]);

    const stopRecording = useCallback(async (): Promise<string | null> => {
        if (state !== 'recording' || !mediaRecorderRef.current) {
            return null;
        }

        return new Promise((resolve) => {
            const mediaRecorder = mediaRecorderRef.current!;

            mediaRecorder.onstop = async () => {
                setState('processing');

                // Stop timer
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }

                // Stop stream tracks
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }

                // Create audio blob
                const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
                chunksRef.current = [];

                // Check minimum duration (Groq requires at least 0.01s)
                if (audioBlob.size < 1000) {
                    onError?.('Recording too short. Please speak for longer.');
                    setState('idle');
                    setDuration(0);
                    resolve(null);
                    return;
                }

                try {
                    // Transcribe audio
                    const result = await transcribeAudio(audioBlob, transcriptionOptions);

                    if (result.text) {
                        onTranscription?.(result.text);
                        resolve(result.text);
                    } else {
                        onError?.('No speech detected. Please try again.');
                        resolve(null);
                    }
                } catch (error) {
                    console.error('[VoiceRecorder] Transcription error:', error);
                    onError?.('Failed to transcribe audio. Please try again.');
                    resolve(null);
                } finally {
                    setState('idle');
                    setDuration(0);
                }
            };

            mediaRecorder.stop();
        });
    }, [state, transcriptionOptions, onTranscription, onError]);

    const cancelRecording = useCallback(() => {
        cleanup();
        setState('idle');
    }, [cleanup]);

    return {
        state,
        startRecording,
        stopRecording,
        cancelRecording,
        duration,
        isSupported,
    };
}
