
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSellerChat } from "@/hooks/chat/useChat";
import { Conversation } from "@/types/customer/customer.types";
import { cn } from "@/lib/utils";
import { Loader2, Search, MessageSquareOff, MessageCircle, HelpCircle, ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ChatWindow from "./ChatWindow";
import { SellerChatSession } from "./SellerChatSession";
import ConversationItem from "./ConversationItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllSellerQuestions } from "@/hooks/faq/useAllSellerQuestions";
import QuestionItem from "@/components/faq/QuestionItem";
import QuestionThread from "@/components/faq/QuestionThread";

interface MessagesSectionProps {
  conversations: Conversation[];
  convLoading: boolean;
  recieverId: string;
  customerId?: string | null;
}

export default function MessagesSection({
  conversations,
  convLoading,
  recieverId,
  customerId,
}: MessagesSectionProps) {
  const [activeTab, setActiveTab] = useState("messages");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);

  // FAQ Hook
  const { questions, isLoading: questionsLoading, submitAnswer } = useAllSellerQuestions();

  // Check for mobile view to handle navigation logic
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* REMOVED: useSellerChat hook moved to SellerChatSession */

  /* REMOVED: useEffect for refetchMessages moved to SellerChatSession */

  // Filter Conversations
  const filteredConversations = conversations
    .filter((conv) => {
      if (customerId && conv.sender?.id !== customerId) return false;
      if (!searchQuery) return true;
      const name = conv.reciever?.firstName || conv.sender?.firstName || "";
      const product = conv.product?.name || "";
      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  // Filter Questions
  const filteredQuestions = questions.filter(q => {
    if (!searchQuery) return true;
    const content = q.content || "";
    const product = q.product.name || "";
    const user = q.user.firstName || "";
    return (
      content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setSelectedQuestionId(null);
  };

  const handleSelectQuestion = (id: string) => {
    setSelectedQuestionId(id);
    setSelectedConversationId(null);
  };

  const handleBackToMenu = () => {
    setSelectedConversationId(null);
    setSelectedQuestionId(null);
  };

  const showList = !isMobileView || (!selectedConversationId && !selectedQuestionId);
  const showChat = !isMobileView || selectedConversationId || selectedQuestionId;

  return (
    <div className="h-[calc(100vh-120px)] min-h-[500px] max-h-[900px] w-full flex flex-col md:flex-row gap-4 overflow-hidden">

      {/* Left Sidebar */}
      <Card className={cn(
        "flex flex-col h-full border-border/60 shadow-sm transition-all duration-300",
        "w-full md:w-[320px] lg:w-[380px] shrink-0",
        !showList && "hidden md:flex"
      )}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 py-3 border-b space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold tracking-tight">Inbox</CardTitle>
            </div>

            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="messages" className="flex gap-2">
                <MessageCircle className="w-4 h-4" /> Messages
              </TabsTrigger>
              <TabsTrigger value="qa" className="flex gap-2">
                <HelpCircle className="w-4 h-4" /> Q&A
              </TabsTrigger>
            </TabsList>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={activeTab === "messages" ? "Search messages..." : "Search questions..."}
                className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <CardContent className="p-0 flex-1 overflow-hidden relative">
            <TabsContent value="messages" className="h-full m-0 data-[state=active]:flex flex-col">
              <ScrollArea className="h-full">
                <div className="flex flex-col p-2 gap-1">
                  {convLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Loading chats...</span>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <p className="text-sm text-muted-foreground">No conversations found.</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isActive={selectedConversationId === conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                        currentUserId={recieverId}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="qa" className="h-full m-0 data-[state=active]:flex flex-col">
              <ScrollArea className="h-full">
                <div className="flex flex-col p-2 gap-1">
                  {questionsLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Loading questions...</span>
                    </div>
                  ) : filteredQuestions.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <p className="text-sm text-muted-foreground">No questions found.</p>
                    </div>
                  ) : (
                    filteredQuestions.map((q) => (
                      <QuestionItem
                        key={q.id}
                        question={q}
                        isActive={selectedQuestionId === q.id}
                        onClick={() => handleSelectQuestion(q.id)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Right Side - Chat/Question Area */}
      <Card className={cn(
        "flex-1 flex flex-col h-full border-border/60 shadow-sm overflow-hidden",
        !showChat && "hidden md:flex"
      )}>
        {activeTab === "messages" && selectedConversationId ? (
          <SellerChatSession
            key={selectedConversationId} // FORCE REMOUNT on chat switch
            conversation={filteredConversations.find(c => c.id === selectedConversationId)!}
            recieverId={recieverId}
            onBack={handleBackToMenu}
          />
        ) : activeTab === "qa" && selectedQuestionId ? (
          <div className="h-full relative">
            <button
              onClick={handleBackToMenu}
              className="md:hidden absolute top-4 left-4 z-10 p-2 bg-background/80 backdrop-blur rounded-full border shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <QuestionThread
              question={questions.find(q => q.id === selectedQuestionId)!}
              onReply={submitAnswer}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 bg-muted/10">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
              <MessageSquareOff className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No conversation selected</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {activeTab === "messages"
                  ? "Choose a conversation from the list to start chatting."
                  : "Select a question to view details and reply."}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}