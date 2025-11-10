import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  Trash2, 
  MessageSquare, 
  Sparkles,
  Loader2,
  Plus,
  MessageCircle
} from "lucide-react";
import { format } from "date-fns";

export default function AIAssistant({ employee }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      const unsubscribe = base44.agents.subscribeToConversation(currentConversation.id, (data) => {
        setMessages(data.messages || []);
      });

      return () => unsubscribe();
    }
  }, [currentConversation]);

  const loadConversations = async () => {
    setConversationsLoading(true);
    try {
      const convos = await base44.agents.listConversations({
        agent_name: 'manager_assistant'
      });
      setConversations(convos || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setConversationsLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const conversation = await base44.agents.createConversation({
        agent_name: 'manager_assistant',
        metadata: {
          name: `Manager Chat - ${format(new Date(), 'MMM dd, HH:mm')}`,
          description: `AI Assistant conversation`,
          employee_id: employee?.id || ''
        }
      });
      setCurrentConversation(conversation);
      setConversations([conversation, ...conversations]);
      setMessages([]);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const selectConversation = async (convo) => {
    try {
      const fullConvo = await base44.agents.getConversation(convo.id);
      setCurrentConversation(fullConvo);
      setMessages(fullConvo.messages || []);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentConversation || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      await base44.agents.addMessage(currentConversation, {
        role: "user",
        content: userMessage
      });
    } catch (error) {
      console.error("Error sending message:", error);
      alert(isRTL ? 'حدث خطأ في إرسال الرسالة' : 'Error sending message');
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (convoId) => {
    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذه المحادثة؟' : 'Delete this conversation?')) {
      setConversations(conversations.filter(c => c.id !== convoId));
      if (currentConversation?.id === convoId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    }
  };

  const quickActions = [
    {
      label: 'Suggest Onboarding Tasks',
      labelAr: 'اقتراح مهام الإعداد',
      prompt: 'I have a new Software Engineer joining the IT department. What onboarding tasks should I create?'
    },
    {
      label: 'Draft Review Comments',
      labelAr: 'صياغة تعليقات التقييم',
      prompt: 'Help me draft performance review comments for an employee who exceeded their sales targets by 15% and showed strong leadership skills.'
    },
    {
      label: 'Check Leave Balance',
      labelAr: 'التحقق من رصيد الإجازة',
      prompt: 'What is the current leave balance for employees in my team?'
    },
    {
      label: 'Policy Guidance',
      labelAr: 'إرشادات السياسة',
      prompt: 'What is our company policy on remote work and flexible hours?'
    }
  ];

  return (
    <div className="h-[calc(100vh-200px)] flex gap-4">
      {/* Conversations Sidebar */}
      <Card className={`w-80 flex-shrink-0 ${isRTL ? 'ml-0 mr-auto' : 'mr-0 ml-auto'}`}>
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-purple-100">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <span>{isRTL ? 'المحادثات' : 'Chats'}</span>
            </CardTitle>
            <Button size="sm" onClick={createNewConversation}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="p-2 space-y-2">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <p>{isRTL ? 'لا توجد محادثات' : 'No conversations'}</p>
                <p className="text-xs mt-2">{isRTL ? 'ابدأ محادثة جديدة' : 'Start a new chat'}</p>
              </div>
            ) : (
              conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => selectConversation(convo)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    currentConversation?.id === convo.id
                      ? 'bg-purple-100 border-2 border-purple-600'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  } ${isRTL ? 'text-right' : ''}`}
                >
                  <div className={`flex items-start justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {convo.metadata?.name || 'Manager Chat'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {convo.created_date && format(new Date(convo.created_date), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(convo.id);
                      }}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-purple-100">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Bot className="w-6 h-6 text-purple-600" />
              <span>{isRTL ? 'مساعد المديرين الذكي' : 'AI Manager Assistant'}</span>
              <Badge variant="outline" className="bg-purple-100 text-purple-700">
                <Sparkles className="w-3 h-3 mr-1" />
                {isRTL ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered'}
              </Badge>
            </CardTitle>
            {!currentConversation && (
              <Button size="sm" onClick={createNewConversation}>
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'محادثة جديدة' : 'New Chat'}
              </Button>
            )}
          </div>
        </CardHeader>

        {!currentConversation ? (
          <CardContent className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {isRTL ? 'مرحباً في مساعد المديرين الذكي' : 'Welcome to AI Manager Assistant'}
              </h3>
              <p className="text-gray-600 mb-6">
                {isRTL 
                  ? 'احصل على مساعدة فورية في إدارة الفريق، الموافقات، الإعداد، وتقييمات الأداء'
                  : 'Get instant help with team management, approvals, onboarding, and performance reviews'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={async () => {
                      await createNewConversation();
                      setTimeout(() => setInput(action.prompt), 100);
                    }}
                    className={`p-4 text-left border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors ${isRTL ? 'text-right' : ''}`}
                  >
                    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">
                          {isRTL ? action.labelAr : action.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {action.prompt.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <Button 
                onClick={createNewConversation}
                className={`bg-gradient-to-r from-purple-600 to-purple-700 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <MessageSquare className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'بدء محادثة' : 'Start Conversation'}
              </Button>
            </div>
          </CardContent>
        ) : (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>{isRTL ? 'ابدأ المحادثة بطرح سؤال' : 'Start the conversation by asking a question'}</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <MessageBubble key={index} message={message} isRTL={isRTL} employee={employee} />
                  ))
                )}
                {loading && (
                  <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4 bg-gray-50">
              <form onSubmit={sendMessage} className="space-y-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isRTL ? 'اسأل المساعد الذكي...' : 'Ask the AI assistant...'}
                  rows={3}
                  className={`resize-none ${isRTL ? 'text-right' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                />
                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className={`bg-gradient-to-r from-purple-600 to-purple-700 ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    {loading ? (
                      <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    ) : (
                      <Send className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    )}
                    {isRTL ? 'إرسال' : 'Send'}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

const MessageBubble = ({ message, isRTL, employee }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? (isRTL ? 'flex-row' : 'flex-row-reverse') : (isRTL ? 'flex-row-reverse' : '')}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-purple-600" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? 'flex flex-col' : ''} ${isUser && isRTL ? 'items-start' : isUser ? 'items-end' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-purple-600 text-white'
              : 'bg-white border border-gray-200'
          }`}
        >
          <p className={`text-sm whitespace-pre-wrap ${isRTL && !isUser ? 'text-right' : ''}`}>
            {message.content}
          </p>
        </div>
        {message.tool_calls && message.tool_calls.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.tool_calls.map((toolCall, idx) => (
              <div key={idx} className="text-xs bg-purple-50 border border-purple-200 rounded px-2 py-1">
                <span className="text-purple-700">🔧 {toolCall.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 ${isRTL ? 'mr-0' : 'ml-0'}`}>
          <span className="text-sm font-semibold text-gray-600">
            {employee?.full_name?.charAt(0) || 'M'}
          </span>
        </div>
      )}
    </div>
  );
};