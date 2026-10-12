import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Sprout,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { ChatMessage, Plant, ChatConversation } from '../types';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    "Why are my plant's leaves turning yellow at the bottom?",
    "How often should I water my monstera during active spring growth?",
    "What is the best aerated soil mix ratio for tropical aroids?",
    "How can I safely propagate this plant from stem cuttings?",
  ];

  useEffect(() => {
    api.getPlants().then(setPlants).catch(() => {});
    api.getChatConversations().then((convs) => {
      if (convs.length > 0) {
        setActiveConversationId(convs[0].id);
        setMessages(convs[0].messages || []);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMessageContent = text.trim();
    setInputText('');
    setIsLoading(true);

    // Optimistically add user message to list
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversationId || '',
      role: 'user',
      content: userMessageContent,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const resp = await api.sendChatMessage(
        userMessageContent,
        activeConversationId,
        selectedPlantId || undefined
      );

      setActiveConversationId(resp.conversation_id);
      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, resp]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        conversation_id: activeConversationId || '',
        role: 'assistant',
        content: 'I encountered a brief connection issue. Please check your network and ask again.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = async () => {
    if (activeConversationId) {
      await api.deleteChatConversation(activeConversationId);
      setActiveConversationId(undefined);
    }
    setMessages([]);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Consultation Header */}
      <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-4 sm:p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-forest-700 text-white flex items-center justify-center text-xl shadow-soft">
            <Bot className="w-6 h-6 text-leaf-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-forest-950 dark:text-leaf-100">AI Plant Doctor</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 dark:bg-forest-900/60 dark:text-leaf-300 font-bold">
                Online
              </span>
            </div>
            <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted">
              Horticultural diagnosis, care recommendations, and pest advice
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Target plant selector */}
          <select
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-bg dark:bg-botanical-darkBg text-xs font-semibold outline-none text-forest-900 dark:text-leaf-200"
          >
            <option value="">General Consultation</option>
            {plants.map((p) => (
              <option key={p.id} value={p.id}>Regarding: {p.common_name}</option>
            ))}
          </select>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl text-botanical-muted hover:text-rose-600 hover:bg-rose-50 transition"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 rounded-3xl bg-botanical-card/50 dark:bg-botanical-darkCard/50 border border-botanical-border/50 p-4 sm:p-6 shadow-inner">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 py-8">
            <div className="w-16 h-16 rounded-3xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-leaf-300 flex items-center justify-center text-3xl">
              🌿
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-forest-950 dark:text-leaf-100">
                Ask Flora Anything About Your Garden
              </h3>
              <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted leading-relaxed">
                Whether you need diagnosis for curling leaves, soil mix formulas, or seasonal light adjustments, I'm here to help.
              </p>
            </div>

            {/* Suggested Starter Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
              {starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="p-3 text-left rounded-2xl border border-botanical-border dark:border-botanical-darkBorder hover:border-forest-400 bg-botanical-card dark:bg-botanical-darkCard text-xs text-botanical-text dark:text-botanical-darkText hover:text-forest-700 transition shadow-soft"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-forest-700 text-white flex items-center justify-center text-xs flex-shrink-0 mt-1 shadow-sm">
                  🌿
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 shadow-soft space-y-2 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-forest-700 text-white rounded-tr-none'
                    : 'bg-botanical-card dark:bg-botanical-darkCard text-botanical-text dark:text-botanical-darkText border border-botanical-border dark:border-botanical-darkBorder rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Follow-up suggestions */}
                {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="pt-2 border-t border-botanical-border/40 dark:border-botanical-darkBorder/40 space-y-1">
                    <span className="text-[10px] font-bold text-forest-700 dark:text-leaf-400 block uppercase">
                      Suggested Inquiries:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggested_actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(act)}
                          className="px-2.5 py-1 rounded-lg bg-forest-50 dark:bg-forest-900/40 text-forest-800 dark:text-leaf-300 border border-forest-200 dark:border-forest-800 text-[11px] hover:bg-forest-100 transition"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msg.role === 'assistant' && (
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 rounded text-botanical-muted hover:text-forest-700 dark:hover:text-leaf-300"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-forest-200 dark:bg-forest-800 text-forest-800 dark:text-leaf-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-forest-700 text-white flex items-center justify-center text-xs flex-shrink-0">
              🌿
            </div>
            <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-2xl p-4 border border-botanical-border shadow-soft flex items-center gap-2 text-xs text-botanical-muted">
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 font-medium">Flora is formulating botanical advice...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-botanical-card dark:bg-botanical-darkCard rounded-2xl border border-botanical-border dark:border-botanical-darkBorder p-2 shadow-soft"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            selectedPlantId
              ? `Ask about ${plants.find(p => p.id === selectedPlantId)?.common_name || 'this plant'}...`
              : "Ask why leaves are yellowing, watering tips, or soil mixes..."
          }
          className="flex-1 px-4 py-2 bg-transparent text-xs sm:text-sm text-botanical-text dark:text-botanical-darkText outline-none"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!inputText.trim() || isLoading}
          icon={<Send className="w-4 h-4" />}
        >
          Send
        </Button>
      </form>
    </div>
  );
};
