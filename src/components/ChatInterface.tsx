import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DynamicAvatar } from './DynamicAvatar';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { VoiceAgent } from './VoiceAgent';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatInterface() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello ${profile?.full_name || 'there'}! I'm your AI agricultural consultant. I have access to your profile as a ${profile?.role} and can help you with personalized advice about soil health, crop planning, and best practices for your operation. What would you like to discuss today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    status,
    volume,
    isListening,
    startListening,
    stopListening,
    speak,
    transcript,
    error: voiceError,
  } = useVoiceChat();

  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    if (isListening) {
      stopListening();
    }

    setTimeout(() => {
      const responseText = `This is a placeholder response. In production, this would be connected to an AI service that has context about your ${profile?.role} operation, your uploaded documents, and our agricultural knowledge base. I would provide personalized advice based on your specific situation.`;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);

      speak(responseText);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-600 mt-2">
            Get personalized advice for your {profile?.role} operation
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowVoiceAgent(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Voice Call
          </button>
          <DynamicAvatar
            status={status}
            volume={volume}
            userAvatarUrl={profile?.avatar_url}
          />
        </div>
      </div>

      {voiceError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {voiceError}
        </div>
      )}

      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-green-100' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <button
              onClick={toggleVoiceInput}
              className={`p-3 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice input..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
          {isListening && (
            <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              Listening... Speak now
            </p>
          )}
          {status === 'speaking' && (
            <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              Speaking...
            </p>
          )}
        </div>
      </div>

      {showVoiceAgent && (
        <VoiceAgent onClose={() => setShowVoiceAgent(false)} />
      )}
    </div>
  );
}
