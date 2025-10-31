import { useState, useEffect, useRef, useCallback } from 'react';

type VoiceStatus = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'error';

interface UseVoiceChatReturn {
  status: VoiceStatus;
  volume: number;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  transcript: string;
  error: string | null;
}

export function useVoiceChat(): UseVoiceChatReturn {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [volume, setVolume] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setStatus('listening');
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;

        if (event.results[current].isFinal) {
          setTranscript(transcriptText);
          setStatus('processing');
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setStatus('error');
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (status === 'listening') {
          setStatus('idle');
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const analyzeVolume = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedVolume = Math.min(average / 128, 1);

    setVolume(normalizedVolume);

    animationFrameRef.current = requestAnimationFrame(analyzeVolume);
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    try {
      setStatus('connecting');
      setTranscript('');
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      analyzeVolume();

      recognitionRef.current.start();
    } catch (err) {
      setError('Microphone access denied');
      setStatus('error');
      console.error('Error accessing microphone:', err);
    }
  }, [analyzeVolume]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setVolume(0);
    setIsListening(false);
    setStatus('idle');
  }, [isListening]);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setError('Speech synthesis not supported');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesisRef.current = utterance;

    utterance.onstart = () => {
      setStatus('speaking');
      const simulateVolume = () => {
        if (window.speechSynthesis.speaking) {
          setVolume(Math.random() * 0.5 + 0.3);
          setTimeout(simulateVolume, 100);
        } else {
          setVolume(0);
        }
      };
      simulateVolume();
    };

    utterance.onend = () => {
      setStatus('idle');
      setVolume(0);
    };

    utterance.onerror = (event) => {
      setError(`Speech synthesis error: ${event.error}`);
      setStatus('error');
      setVolume(0);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  return {
    status,
    volume,
    isListening,
    startListening,
    stopListening,
    speak,
    transcript,
    error,
  };
}
