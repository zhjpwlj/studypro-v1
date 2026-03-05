
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Send, BrainCircuit, Loader2, CheckCircle, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Project } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { Chat, GenerateContentResponse, FunctionCall } from "@google/genai";
import { LanguageContext } from '../contexts/LanguageContext';

interface ChatViewProps {
  t: (key: keyof typeof import('../utils/translations')['translations']['en']) => string;
  onAiAction: (functionName:string, args: Record<string, unknown>) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ t, onAiAction }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: t('chatWelcome')
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: responseId, role: 'model', text: '', isThinking: true }]);
      const stream = await sendMessageStream(chatSessionRef.current, userMessage.text);
      
      let fullText = '';
      let functionCall: FunctionCall | null = null;

      for await (const chunk of stream) {
        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          functionCall = chunk.functionCalls[0];
          break; // Stop processing this stream, wait for confirmation
        }
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullText += chunkText;
          setMessages(prev => prev.map(msg => msg.id === responseId ? { ...msg, text: fullText, isThinking: false } : msg));
        }
      }

      if (functionCall) {
        setMessages(prev => prev.map(msg => msg.id === responseId ? { 
            ...msg, 
            isThinking: false, 
            isAwaitingConfirmation: true,
            functionCall: {
                id: functionCall.id || 'unknown',
                name: functionCall.name || 'unknown',
                args: functionCall.args || {}
            }
        } : msg));
      }

    } catch (error) {
      console.error("Failed to send message", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: t('chatError') }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirmAction = async (messageId: string, funcCall: FunctionCall) => {
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isAwaitingConfirmation: false, isConfirmed: true } : msg));
    onAiAction(funcCall.name || 'unknown', funcCall.args || {});

    setIsLoading(true);
    if (chatSessionRef.current) {
        try {
            const response = await chatSessionRef.current.sendMessage({
                message: [{
                    functionResponse: {
                        id: funcCall.id || 'unknown',
                        name: funcCall.name || 'unknown',
                        response: { result: "OK. Action performed successfully." }
                    }
                }]
            });
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response.text || t('actionConfirmed') }]);
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: t('actionConfirmError') }]);
        } finally {
            setIsLoading(false);
        }
    }
  };

  const handleCancelAction = async (messageId: string, funcCall: FunctionCall) => {
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isAwaitingConfirmation: false, isCancelled: true } : msg));

    setIsLoading(true);
     if (chatSessionRef.current) {
        try {
            const response = await chatSessionRef.current.sendMessage({
                message: [{
                    functionResponse: {
                        id: funcCall.id || 'unknown',
                        name: funcCall.name || 'unknown',
                        response: { result: "User cancelled the action." }
                    }
                }]
            });
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response.text || t('actionCancelled') }]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }
  };
  
  const renderConfirmation = (msg: ChatMessage) => {
    const { name, args } = msg.functionCall!;
    let description = `${t('runActionPrompt')} ${name}?`;
    
    if (name === 'addTask') {
      description = `${t('addTaskPrompt')} "${args.title}"?`;
      if (args.projectName) description = t('addToProjectPrompt').replace('{title}', args.title as string).replace('{project}', args.projectName as string);
      if (args.deadline) description = t('addWithDeadlinePrompt').replace('{title}', args.title as string).replace('{deadline}', args.deadline as string);
    } else if (name === 'addEvent') {
      description = t('scheduleEventPrompt').replace('{title}', args.title as string).replace('{date}', args.date as string);
      if (args.startTime) description += ` ${t('atTime').replace('{time}', args.startTime as string)}`;
    } else if (name === 'addNote') {
      description = `${t('createNotePrompt')} "${args.title}"?`;
    } else if (name === 'addGoal') {
      description = `${t('trackHabitPrompt')} "${args.title}"?`;
    } else if (name === 'addFlashcard') {
      description = t('addFlashcardPrompt').replace('{deck}', args.deckTitle as string);
    }

    return (
      <div className="bg-white dark:bg-slate-700/80 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-slate-600">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{description}</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => handleCancelAction(msg.id, msg.functionCall!)} className="px-3 py-1 text-sm rounded-lg bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 font-medium">{t('cancel')}</button>
            <button onClick={() => handleConfirmAction(msg.id, msg.functionCall!)} className="px-3 py-1 text-sm rounded-lg bg-accent text-white hover:bg-accent-hover font-bold">{t('confirm')}</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-end gap-2'}`}>
            {msg.role === 'model' && <div className="w-6 h-6 flex-shrink-0 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold">F</div>}
            <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm text-sm leading-relaxed ${msg.role === 'user' ? 'bg-accent text-white rounded-br-none' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none border border-gray-100 dark:border-slate-600'}`}>
              {msg.isAwaitingConfirmation && msg.functionCall ? (
                renderConfirmation(msg)
              ) : msg.isConfirmed ? (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium"> <CheckCircle size={16}/> {t('actionConfirmed')} </div>
              ) : msg.isCancelled ? (
                <div className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400 font-medium"> <XCircle size={16}/> {t('actionCancelled')} </div>
              ) : msg.isThinking && !msg.text ? (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <BrainCircuit size={16} className="animate-pulse text-accent" />
                  <span className="text-xs font-medium italic">{t('thinking')}</span>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:p-2 prose-pre:rounded-lg">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className="p-4 border-t border-white/20 dark:border-black/20">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder={t('chatPlaceholder')}
            className="w-full pl-4 pr-12 py-3 bg-white/50 dark:bg-slate-700/50 border-0 rounded-xl focus:ring-2 focus:ring-accent text-slate-900 dark:text-white resize-none text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ChatBotProps {
  projects: Project[];
  onAiAction: (functionName: string, args: Record<string, unknown>) => void;
}

const ChatBot: React.FC<ChatBotProps> = (props) => {
  const { t } = useContext(LanguageContext);
  
  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 overflow-hidden">
          <ChatView t={t} onAiAction={props.onAiAction} />
      </main>
    </div>
  );
};

export default ChatBot;
