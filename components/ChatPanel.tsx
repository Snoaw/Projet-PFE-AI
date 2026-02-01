import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Chat } from '@google/genai';
import { updateLatexCode } from '../services/gemini';
import Button from './Button';

interface ChatPanelProps {
  chatSession: React.MutableRefObject<Chat | null>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currentCode: string;
  onCodeUpdate: (newCode: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  chatSession, 
  messages, 
  setMessages, 
  currentCode, 
  onCodeUpdate 
}) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus textarea when component mounts or becomes active
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !chatSession.current) return;
    
    // Si pas de code généré, on empêche l'édition
    if (!currentCode) {
      alert("Veuillez d'abord générer le rapport avant de le modifier.");
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const result = await updateLatexCode(chatSession.current, currentCode, input);
      
      onCodeUpdate(result.code);

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.summary,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Failed to send message", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Désolé, une erreur est survenue lors de la modification du code. Veuillez réessayer.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 px-6">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <p className="text-sm font-medium">Commencez la conversation par la génération du projet.</p>
            <p className="text-xs mt-1 text-gray-400">Configurez et générez votre rapport dans l'onglet Configuration pour activer l'assistant.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#1e3a8a] text-white rounded-br-none' 
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className="text-[10px] opacity-70 mt-1 text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-900 focus:border-transparent rounded-lg outline-none text-sm transition-shadow resize-none custom-scrollbar"
            placeholder="Ex: Ajoute une section sur l'état de l'art..."
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending || !currentCode}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Shift + Entrée pour sauter une ligne</span>
            <Button 
              variant="primary" 
              className="rounded-md px-6 py-1.5 h-9 text-sm" 
              onClick={handleSend}
              disabled={isSending || !input.trim() || !currentCode}
            >
              {isSending ? (
                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Envoyer <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;