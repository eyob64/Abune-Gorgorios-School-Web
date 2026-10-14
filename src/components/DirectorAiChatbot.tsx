import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  User, 
  BarChart3, 
  DollarSign, 
  GraduationCap, 
  FileText, 
  Calendar,
  X,
  Maximize2,
  Minimize2,
  MessageSquare
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface DirectorAiChatbotProps {
  lang: 'en' | 'am';
  stats: {
    studentCount: number;
    facultyCount: number;
    pendingAdmissionsCount: number;
    totalTuitionCollected: number;
    newsCount: number;
    eventCount: number;
  };
  isFloating?: boolean;
  isOpenFloating?: boolean;
  onCloseFloating?: () => void;
}

export const DirectorAiChatbot: React.FC<DirectorAiChatbotProps> = ({
  lang,
  stats,
  isFloating = false,
  isOpenFloating = false,
  onCloseFloating
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome',
        role: 'model',
        content: lang === 'en'
          ? `Greetings, School Director. I am your executive School Management AI Assistant. I have live access to your school statistics (${stats.studentCount} students, ${stats.facultyCount} faculty, ${stats.totalTuitionCollected.toLocaleString()} ETB tuition collected).\n\nHow can I assist you with academic planning, financial summaries, admissions analysis, or drafting school correspondence today?`
          : `እንኳን ደህና መጡ ክብርት/ክቡር የትምህርት ቤት ዳይሬክተር። እኔ የእርስዎ የትምህርት ቤት አስተዳደር AI ረዳት ነኝ። የቀጥታ የትምህርት ቤት መረጃዎች በእጄ ይገኛሉ (${stats.studentCount} ተማሪዎች፣ ${stats.facultyCount} መምህራን፣ ${stats.totalTuitionCollected.toLocaleString()} የብር ክፍያ)። ዛሬ በምን ላገልግልዎት?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    {
      title: lang === 'en' ? '📊 Student Statistics' : '📊 የተማሪዎች ስታቲስቲክስ',
      prompt: lang === 'en' 
        ? 'Provide an executive summary of current student enrollment, class breakdown, and admissions pipeline.' 
        : 'ስለ አሁኑ የተማሪዎች ምዝገባ እና አጠቃላይ ሁኔታ ማጠቃለያ ስጠኝ።'
    },
    {
      title: lang === 'en' ? '💰 Tuition Collection' : '💰 የትምህርት ክፍያ ሁኔታ',
      prompt: lang === 'en' 
        ? 'Summarize tuition fee collections, pending payments, and provide financial recommendations.' 
        : 'የትምህርት ክፍያ ገቢን እና የክፍያ ሁኔታ ማጠቃለያ አዘጋጅልኝ።'
    },
    {
      title: lang === 'en' ? '📝 Draft Welcome Memo' : '📝 የደስታ መግለጫ ደብዳቤ',
      prompt: lang === 'en' 
        ? 'Draft an inspiring welcome message for new students and parents for the upcoming semester.' 
        : 'ለአዳዲስ ተማሪዎች እና ወላጆች አበረታች ይፋዊ የእንኳን ደህና መጣችሁ መልዕክት ጻፍልኝ።'
    },
    {
      title: lang === 'en' ? '🎓 Report Card Remarks' : '🎓 የውጤት ካርድ አስተያየቶች',
      prompt: lang === 'en' 
        ? 'Give me 3 professional director remarks for student report cards: for top performers, steady improvers, and students needing academic focus.' 
        : 'ለተማሪዎች የውጤት ካርድ 3 የተለያዩ አበረታች እና ገንቢ የዳይሬክተር አስተያየቶችን አዘጋጅልኝ።'
    }
  ];

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/director-ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          messages: messages.concat(userMsg).map(m => ({
            role: m.role,
            content: m.content
          })),
          context: {
            studentCount: stats.studentCount,
            facultyCount: stats.facultyCount,
            pendingAdmissionsCount: stats.pendingAdmissionsCount,
            totalTuitionCollected: stats.totalTuitionCollected.toLocaleString(),
            newsCount: stats.newsCount,
            eventCount: stats.eventCount
          }
        })
      });

      const data = await response.json();
      const replyContent = data.reply || (
        lang === 'en' 
          ? 'I have processed your query based on current school records. Please let me know how you would like to proceed.'
          : 'ጥያቄዎ በትምህርት ቤቱ መረጃ መሰረት ተዘጋጅቷል። ተጨማሪ የሚያስፈልግዎ ነገር ካለ ይንገሩኝ።'
      );

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Director chatbot request error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: lang === 'en'
          ? `Executive Brief: Based on recorded records, the school currently registers ${stats.studentCount} students, ${stats.facultyCount} faculty, and ${stats.totalTuitionCollected.toLocaleString()} ETB collected. You can review individual records directly in the dashboard tabs.`
          : `የመረጃ ማጠቃለያ፡ በትምህርት ቤቱ ${stats.studentCount} ተማሪዎች፣ ${stats.facultyCount} መምህራን እና ${stats.totalTuitionCollected.toLocaleString()} የብር ገቢ ተመዝግቧል።`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'reset',
        role: 'model',
        content: lang === 'en'
          ? 'Conversation reset. Ready for new executive inquiries or data analysis.'
          : 'ውይይቱ ታድሷል። አዲስ ጥያቄዎችን ለመመለስ ዝግጁ ነኝ።',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const chatbotContent = (
    <div className={`flex flex-col bg-white overflow-hidden ${isFloating ? 'h-[580px] w-full' : 'rounded-3xl border border-slate-100 shadow-sm min-h-[640px]'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-5 text-white flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base tracking-tight">
                {lang === 'en' ? 'Director AI Executive Assistant' : 'የዳይሬክተር AI አስተዳዳሪ ረዳት'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Director Only
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {lang === 'en'
                ? `Live Grounding: ${stats.studentCount} Students • ${stats.totalTuitionCollected.toLocaleString()} ETB Revenue • Gemini 3.8 Flash`
                : `ቀጥታ መረጃ፡ ${stats.studentCount} ተማሪዎች • ${stats.totalTuitionCollected.toLocaleString()} ብር`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleClearChat}
            title={lang === 'en' ? 'Clear Chat' : 'ውይይት አጽዳ'}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isFloating && onCloseFloating && (
            <button
              type="button"
              onClick={onCloseFloating}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Real-time KPI Ribbon */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-5 py-2.5 flex items-center gap-4 text-xs overflow-x-auto no-scrollbar">
        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1 shrink-0">
          <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
          {lang === 'en' ? 'Live School State:' : 'የትምህርት ቤት ሁኔታ:'}
        </span>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-700 shrink-0">
          <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            🎓 {stats.studentCount} {lang === 'en' ? 'Students' : 'ተማሪዎች'}
          </span>
          <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            👩‍🏫 {stats.facultyCount} {lang === 'en' ? 'Faculty' : 'መምህራን'}
          </span>
          <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            📥 {stats.pendingAdmissionsCount} {lang === 'en' ? 'Pending Adm.' : 'ማመልከቻ'}
          </span>
          <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-emerald-700 font-bold">
            💵 {stats.totalTuitionCollected.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl p-4 shadow-xs text-sm relative group ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-xs'
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>

              <div className={`flex items-center justify-between gap-3 mt-2 pt-2 border-t text-[10px] ${
                msg.role === 'user' ? 'border-white/20 text-blue-100' : 'border-slate-100 text-slate-400'
              }`}>
                <span>{msg.timestamp}</span>
                {msg.role === 'model' && (
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{lang === 'en' ? 'Copied' : 'ተቀድቷል'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{lang === 'en' ? 'Copy' : 'ቅዳ'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                DIR
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 items-center text-slate-500 text-xs py-2"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="font-medium text-slate-600 ml-1">
                {lang === 'en' ? 'Analyzing school metrics...' : 'መረጃዎችን በመተንተን ላይ...'}
              </span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Executive Quick Prompt Chips */}
      <div className="p-3 bg-white border-t border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-2">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => handleSendMessage(qp.prompt)}
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold border border-slate-200 transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {qp.title}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Ask about student stats, tuition trends, draft memos, or events...'
                  : 'ስለ ተማሪዎች፣ የትምህርት ክፍያ ወይም ማስታወቂያዎች ይጠይቁ...'
              }
              disabled={isLoading}
              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl text-sm outline-none transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-40 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-200 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'en' ? 'Consult AI' : 'ላክ'}</span>
          </button>
        </form>
      </div>
    </div>
  );

  if (isFloating) {
    return (
      <AnimatePresence>
        {isOpenFloating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[460px] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden bg-white"
          >
            {chatbotContent}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return chatbotContent;
};
