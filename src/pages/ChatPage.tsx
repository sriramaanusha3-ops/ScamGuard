import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  AlertTriangle,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { Card, Button, Input } from '../components/ui';
import { cn } from '../lib/supabase';
import type { ChatMessage } from '../types';

const suggestedQuestions = [
  'Is this offer letter legitimate?',
  'What are common scam patterns?',
  'How do I verify a company?',
  'Explain this clause: [paste clause]',
  'Compare this salary with market rates',
  'What should I ask the recruiter?',
];

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI Scam Detection Assistant. I can help you:\n\n- Analyze offer letters and job descriptions\n- Identify potential scam patterns\n- Explain suspicious clauses\n- Suggest verification steps\n- Compare salary offers with market rates\n\nHow can I assist you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('scam') || lowerMessage.includes('fake')) {
      return "Based on my analysis of thousands of job scams, here are the key red flags to watch for:\n\n**Financial Red Flags:**\n- Requests for registration fees, training fees, or security deposits\n- Payment requests via gift cards, cryptocurrency, or personal bank accounts\n- Unrealistic salary promises (e.g., ₹50,000/month for simple work)\n\n**Communication Red Flags:**\n- Contact only via Telegram, WhatsApp, or personal email\n- Urgent hiring with 'limited positions'\n- No official company email domain\n\n**Process Red Flags:**\n- No interview or very simple screening\n- Immediate job offers\n- Pressure to decide quickly\n\nWould you like me to analyze a specific document or situation?";
    }

    if (lowerMessage.includes('verify') && lowerMessage.includes('company')) {
      return "Here's how to verify a company's legitimacy:\n\n**Step 1: Check the Website**\n- Verify HTTPS and SSL certificate\n- Look for privacy policy and terms pages\n- Check if contact information is provided\n\n**Step 2: Verify Domain Age**\n- Use WHOIS lookup (whois.net)\n- Legitimate companies usually have domains older than 1 year\n- New domains (< 30 days) with job offers are suspicious\n\n**Step 3: Check Online Presence**\n- LinkedIn company page\n- Glassdoor reviews\n- Google Maps business listing\n\n**Step 4: Cross-verify**\n- Call official phone numbers\n- Verify recruiter on LinkedIn\n- Check if the recruiter's email matches company domain\n\nWant me to help verify a specific company?";
    }

    if (lowerMessage.includes('salary') || lowerMessage.includes('pay')) {
      return "Here's how to assess if a salary offer is legitimate:\n\n**Market Rate Check:**\n- Compare on Glassdoor, AmbitionBox, and Payscale\n- Entry-level IT roles in India: ₹3-8 LPA\n- Mid-level (3-5 years): ₹8-20 LPA\n- Senior roles: ₹20-50+ LPA\n\n**Warning Signs:**\n- Offers significantly above market rate\n- '₹50,000/month work from home' for freshers\n- Guaranteed '₹X lakhs' without interview\n\n**Legitimate Practices:**\n- Salary mentioned in offer letter\n- Clear breakdown (CTC, in-hand)\n- Professional HR communication\n\nShare the offer details and I can provide a more specific assessment.";
    }

    if (lowerMessage.includes('clause') || lowerMessage.includes('explain')) {
      return "I can help explain any clause from your offer letter. Please paste the specific clause or section you'd like me to analyze.\n\n**Common clauses to watch for:**\n\n1. **Training Bond** - Period where you must stay or pay a penalty\n2. **Non-compete** - Restrictions on working for competitors\n3. **Notice Period** - How much advance notice before leaving\n4. **Probation** - Trial period with fewer protections\n5. **Confidentiality** - What you can't share\n6. **IP Rights** - Who owns your work\n\nWhen sharing a clause, I'll explain:\n- What it means in plain English\n- If it's standard or unusual\n- Potential risks for you\n- Suggestions for negotiation\n\nPaste a clause and I'll break it down for you!";
    }

    if (lowerMessage.includes('recruiter')) {
      return "To verify a recruiter's authenticity:\n\n**Email Check:**\n- Legitimate recruiters use company email (not @gmail.com)\n- Format: name@company.com\n- Verify domain matches company website\n\n**LinkedIn Verification:**\n- Check profile completeness\n- Look for endorsements and connections\n- Verify employment history\n- Cross-check company page\n\n**Phone Verification:**\n- Call company's official number\n- Ask HR to confirm recruiter's identity\n- Official landlines > personal mobile numbers\n\n**Red Flags:**\n- No LinkedIn presence\n- Personal email only\n- Telegram/WhatsApp as primary contact\n- Rushing you to accept\n\nWould you like me to help verify specific recruiter details?";
    }

    return "I understand your question. Based on my knowledge of job scams and fraudulent recruitment practices, here's my analysis:\n\n**Key Points to Consider:**\n1. Always verify the company through official channels\n2. Never pay money for job opportunities\n3. Use professional email communication\n4. Check for online presence and reviews\n5. Be wary of urgent or 'limited time' offers\n\nFor a more specific analysis, you can:\n- Upload a document (offer letter, job description)\n- Paste specific clauses or text\n- Provide company and recruiter details\n\nI'm here to help! What else would you like to know?";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1500));

    const aiResponse: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: generateAIResponse(input),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)]">
      <div>
        <h1 className="text-3xl font-bold text-dark-50">AI Assistant</h1>
        <p className="text-dark-400 mt-1">
          Ask questions about offers, scams, and verification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100%-80px)]">
        <Card variant="gradient" className="lg:col-span-3 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      message.role === 'user'
                        ? 'bg-primary-500'
                        : 'bg-gradient-to-br from-accent-400 to-primary-500'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User size={16} className="text-white" />
                    ) : (
                      <Bot size={16} className="text-white" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl p-4',
                      message.role === 'user'
                        ? 'bg-primary-500/20 border border-primary-500/30'
                        : 'bg-dark-700/50 border border-dark-600'
                    )}
                  >
                    <p className="text-sm text-dark-100 whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p className="text-xs text-dark-500 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-primary-500 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-dark-700/50 rounded-2xl p-4 border border-dark-600">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-dark-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-dark-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-dark-700 pt-4 mt-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about job scams, offer verification, recruiter checks..."
                className="flex-1 px-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-dark-100 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
              <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
                <Send size={18} />
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-primary-400" />
              Suggested Questions
            </h3>
            <div className="space-y-2">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="w-full text-left text-xs p-2.5 rounded-lg bg-dark-700/30 hover:bg-dark-700/50 text-dark-300 hover:text-dark-100 transition-colors truncate"
                >
                  {question}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
              <HelpCircle size={16} className="text-accent-400" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <FileText size={16} />
                Analyze Document
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <AlertTriangle size={16} />
                Check Scam Patterns
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Bot size={16} />
                Explain a Clause
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
