import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  User, 
  CheckCircle2, 
  ArrowRight,
  Info,
  HelpCircle
} from 'lucide-react';
import { 
  askNutritionCoach, 
  SUGGESTED_COACH_PROMPTS 
} from '../../services/nutritionCoachService.js';

export const AICoachSection = ({
  profile = {},
  summary = {},
  recommendations = {},
  todayMeals = []
}) => {
  const studentName = profile.name || 'Student';

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'coach',
      text: `Hello ${studentName}! I am your MessMates Campus Nutrition Coach. I have your fitness profile (${profile.weightKg || 60}kg • ${profile.dailyProteinTargetG || 120}g daily target • ${profile.dietaryPreference || 'Vegetarian'}) and today's actual campus mess schedule loaded. 

How can I help you optimize your plate today?`,
      disclaimer: "Campus dining guidance grounded in your mess menu. Not medical advice."
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSendQuery = (queryText) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    setTimeout(() => {
      const response = askNutritionCoach({
        query: textToSend,
        profile,
        summary,
        recommendations,
        todayMeals
      });

      const coachMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'coach',
        text: response.answer,
        disclaimer: response.disclaimer
      };

      setMessages(prev => [...prev, coachMsg]);
      setIsThinking(false);
    }, 400);
  };

  return (
    <div className="space-y-5">
      
      {/* ── TOP HEADER WITH GROUNDED CAMPUS CONTEXT ─────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Campus Nutrition Coach
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100/70 text-emerald-800">
                Menu-Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Grounded in today's actual hostel dining schedule and your logged intake.
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-medium max-w-xs text-left sm:text-right">
          🔒 Private to you • ICMR-NIN nutrition data • No medical claims
        </div>
      </div>

      {/* ── SUGGESTED PROMPT PILLS ──────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_COACH_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(prompt)}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-all cursor-pointer shadow-2xs flex items-center space-x-1.5"
          >
            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* ── CHAT MESSAGES CONTAINER ─────────────────────────────────────────── */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 min-h-[380px] max-h-[520px] overflow-y-auto flex flex-col">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                isUser ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-xs whitespace-pre-line'
                }`}
              >
                <div>{msg.text}</div>
                {msg.disclaimer && (
                  <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-medium">
                    ℹ️ {msg.disclaimer}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 p-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Reviewing today's mess menu &amp; intake...</span>
          </div>
        )}
      </div>

      {/* ── INPUT BOX ───────────────────────────────────────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        className="p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about today's mess menu, protein, or skipping a meal..."
          className="flex-1 px-4 py-2 text-xs font-medium bg-transparent outline-none text-slate-900"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isThinking}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs transition-all cursor-pointer flex items-center space-x-1"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};
