import { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';
import { DynamicAvatar } from './DynamicAvatar';

interface VoiceAgentProps {
  onClose?: () => void;
}

export function VoiceAgent({ onClose }: VoiceAgentProps) {
  const apiKey = import.meta.env.VITE_VOICE_AGENT_API_KEY;
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
  const [volume, setVolume] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
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
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;

        if (event.results[current].isFinal) {
          setTranscript(transcriptText);
          handleProcessTranscript(transcriptText);
        }
      };

      recognitionRef.current.onerror = () => {
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

  const analyzeVolume = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedVolume = Math.min(average / 128, 1);

    setVolume(normalizedVolume);
    animationFrameRef.current = requestAnimationFrame(analyzeVolume);
  };

  const startListening = async () => {
    if (!recognitionRef.current) return;

    try {
      setStatus('connecting');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      analyzeVolume();
      recognitionRef.current.start();
    } catch (err) {
      setStatus('error');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopListening = () => {
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
  };

  const handleProcessTranscript = async (text: string) => {
    setStatus('processing');

    const responseText = `I heard you say: "${text}". This is a demo response. With your API key configured, this would connect to a real AI voice agent service to provide intelligent responses about soil health, agriculture, and farming practices.`;

    setTimeout(() => {
      setResponse(responseText);
      speak(responseText);
    }, 1000);
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window) || isMuted) {
      setStatus('idle');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

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
      if (isListening) {
        startListening();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    startListening();

    return () => {
      stopListening();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Voice Agent</h2>
          <p className="text-gray-600 mb-8 text-center">
            Speak naturally and I'll help you with agricultural advice
          </p>

          <div className="mb-8">
            <DynamicAvatar status={status} volume={volume} />
          </div>

          <div className="w-full space-y-4">
            {status === 'connecting' && (
              <div className="text-center">
                <p className="text-gray-600">Connecting to microphone...</p>
              </div>
            )}

            {status === 'listening' && (
              <div className="text-center">
                <p className="text-green-600 font-medium flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                  Listening... Speak now
                </p>
              </div>
            )}

            {status === 'processing' && (
              <div className="text-center">
                <p className="text-blue-600 font-medium">Processing your request...</p>
              </div>
            )}

            {status === 'speaking' && (
              <div className="text-center">
                <p className="text-purple-600 font-medium flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                  Speaking...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <p className="text-red-600 font-medium">
                  Error: Unable to access microphone. Please check permissions.
                </p>
              </div>
            )}

            {transcript && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">You said:</p>
                <p className="text-gray-900">{transcript}</p>
              </div>
            )}

            {response && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-700 mb-1">Response:</p>
                <p className="text-gray-900">{response}</p>
              </div>
            )}

            {!apiKey && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> API key not configured. Using demo mode with simulated responses.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isMuted
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>

            {isListening ? (
              <button
                onClick={stopListening}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Listening
              </button>
            ) : (
              <button
                onClick={startListening}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Listening
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
