import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  Building,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import { sendAssistantChat } from '../../api/authApi';

export const AIAssistant = () => {
  const { user, role, selectedBranch } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${user?.name || 'there'}! I am your **TravelSphere AI Operations Assistant**.\n\nI am scoped to your **${role || 'Staff'}** role and live SQLite operational records. How can I assist you with your operations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Role-specific sample prompts
  const getRoleSuggestions = () => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return [
          'Summarize network-wide revenue and identify top performing franchises',
          'Check franchise compliance and license audit status across all regions',
          'Show me pending registration approvals and user counts by role',
          'Provide a system health overview and SQLite database status'
        ];
      case ROLES.FRANCHISE_OWNER:
        return [
          `How is my franchise (${user?.franchiseName || 'West Coast Tourism Holdings'}) performing this quarter?`,
          'Show revenue and booking breakdown across my branches',
          'Which staff members in our franchise have the highest task completions?',
          'Audit our SOP compliance score and upcoming renewal dates'
        ];
      case ROLES.BRANCH_MANAGER:
      case ROLES.FRANCHISE_MANAGER:
        return [
          `What is today's booking status for ${user?.branchName || 'Mumbai'} branch?`,
          'Show operational task completion rate for my branch staff',
          'Are there any pending customer vouchers or high priority tasks?',
          'Review branch attendance punch logs and weekly roster'
        ];
      case ROLES.STAFF:
        return [
          'What are my assigned tasks and duties for today\'s shift?',
          'Check customer booking details for reference BK-2026-001',
          'Show me the standard operating procedure for visa submissions',
          'What is my active shift schedule for this week?'
        ];
      default:
        return [
          'What are my assigned operational duties?',
          'Show current branch booking metrics',
          'Check system announcements and alerts'
        ];
    }
  };

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await sendAssistantChat(textToSend, user?.id, user?.franchiseId, user?.branchId);
      const reply = res?.reply || res?.message || 'I have analyzed your request based on current SQLite records.';

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue retrieving live data. Please try again or check backend connectivity.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: `Conversation cleared. I am ready to assist you with **${role || 'operational'}** tasks.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Demonstration AI Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-xs">
            <span className="font-bold">Demonstration AI Assistant:</span> Scoped strictly to authenticated role permissions ({role}), franchise hierarchy ({user?.franchiseName || 'Global'}), and live SQLite operational records.
          </div>
        </div>
        <button
          onClick={handleClear}
          className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-md hover:bg-amber-100 transition-colors"
          title="Clear conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                TravelSphere AI Assistant
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Active Role: <span className="font-semibold text-teal-700">{role}</span> &bull; Scope: <span className="font-semibold text-slate-700">{user?.branchName || 'Network-wide'}</span>
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
            FastAPI Intelligent Agent v2.4
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-[#142B4A] text-white'
                    : 'bg-teal-600 text-white shadow-xs'
                }`}
              >
                {m.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-[#142B4A] text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-1.5'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div
                  className={`text-[10px] text-right mt-1 font-medium ${
                    m.sender === 'user' ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-2 text-[11px] font-medium text-slate-400">Analyzing SQLite operational records...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pills */}
        <div className="px-5 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" />
            Quick Prompts:
          </span>
          {getRoleSuggestions().map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] text-slate-600 bg-slate-50 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 hover:border-teal-300 px-3 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
            >
              <span>{prompt}</span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask TravelSphere Assistant as ${role}...`}
              className="flex-1 text-xs border border-slate-300 rounded-lg px-4 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
