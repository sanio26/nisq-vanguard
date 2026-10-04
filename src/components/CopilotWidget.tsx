import {
  Bot,
  ChevronDown,
  ExternalLink,
  Loader2,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

interface Citation {
  title: string;
  source_url?: string | null;
  document_id?: string;
  chunk_id?: string;
  similarity?: number;
}

interface Action {
  type: "NAVIGATE";
  label: string;
  path: string;
}

interface CopilotResponse {
  answer: string;
  intent?: string;
  confidence?: number;
  conversation_id?: string;
  message_id?: string;
  citations?: Citation[];
  actions?: Action[];
  suggested_followups?: string[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  actions?: Action[];
  messageId?: string;
  confidence?: number;
}

const initialMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "I'm the NISQ Vanguard AI Co-Pilot. I can help you navigate the platform, understand cybersecurity concepts, discover labs and courses, and guide you through your learning workspace.",
  citations: [],
  actions: [],
};

const defaultFollowups = [
  "Show me the cyber labs",
  "What can you help me with?",
  "Explain cybersecurity concepts",
];

export default function CopilotWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    initialMessage,
  ]);
  const [conversationId, setConversationId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<
    Record<string, "HELPFUL" | "NOT_HELPFUL">
  >({});

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const pageContext = useMemo(
    () => ({
      page_path: window.location.pathname,
      page_title: document.title,
    }),
    [open],
  );

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSessionReady(Boolean(session));
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSessionReady(Boolean(session));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      messagesRef.current?.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 40);

    return () => window.clearTimeout(timer);
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  const resetConversation = () => {
    setConversationId(null);
    setMessages([initialMessage]);
    setError("");
    setMessage("");
    setFeedbackSent({});
  };

  const navigateToAction = (action: Action) => {
    if (action.type !== "NAVIGATE") return;

    window.location.href = action.path;
  };

  const sendMessage = async (value?: string) => {
    const text = (value ?? message).trim();

    if (!text || loading) return;

    setError("");
    setMessage("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((current) => [...current, userMessage]);
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Please sign in to use the NISQ Vanguard AI Co-Pilot.",
        );
      }

      const { data, error: functionError } =
        await supabase.functions.invoke("copilot", {
          body: {
            message: text,
            conversation_id: conversationId,
            page_path: pageContext.page_path,
            page_title: pageContext.page_title,
            context: {
              source: "website_copilot",
            },
          },
        });

      if (functionError) {
        throw new Error(functionError.message);
      }

      const response = data as CopilotResponse;

      if (!response?.answer) {
        throw new Error(
          "The Co-Pilot returned an empty response.",
        );
      }

      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      const assistantMessage: ChatMessage = {
        id:
          response.message_id ||
          `assistant-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        citations: response.citations || [],
        actions: response.actions || [],
        messageId: response.message_id,
        confidence: response.confidence,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (requestError) {
      const errorMessage =
        requestError instanceof Error
          ? requestError.message
          : "Unable to contact the AI Co-Pilot.";

      setError(errorMessage);

      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "I couldn't complete that request. Please check your session and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (
    messageId: string | undefined,
    rating: "HELPFUL" | "NOT_HELPFUL",
  ) => {
    if (!messageId || feedbackSent[messageId]) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const { error: feedbackError } = await supabase
      .from("copilot_feedback")
      .insert({
        message_id: messageId,
        user_id: session.user.id,
        rating,
      });

    if (!feedbackError) {
      setFeedbackSent((current) => ({
        ...current,
        [messageId]: rating,
      }));
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          className="copilot-launcher"
          onClick={() => setOpen(true)}
          aria-label="Open NISQ Vanguard AI Co-Pilot"
        >
          <span className="copilot-launcher-icon">
            <Sparkles size={19} />
          </span>

          <span className="copilot-launcher-copy">
            <strong>AI Co-Pilot</strong>
            <small>
              {sessionReady
                ? "Ask Vanguard"
                : "Sign in to use"}
            </small>
          </span>
        </button>
      )}

      {open && (
        <section
          className="copilot-panel"
          aria-label="NISQ Vanguard AI Co-Pilot"
        >
          <header className="copilot-header">
            <div className="copilot-header-identity">
              <div className="copilot-avatar">
                <Bot size={20} />
              </div>

              <div>
                <div className="copilot-title-row">
                  <strong>AI Co-Pilot</strong>
                  <span className="copilot-live">
                    <span />
                    LIVE
                  </span>
                </div>

                <span>
                  NISQ Vanguard intelligence layer
                </span>
              </div>
            </div>

            <div className="copilot-header-actions">
              <button
                type="button"
                onClick={resetConversation}
                title="New conversation"
                aria-label="New conversation"
              >
                <RotateCcw size={16} />
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Minimize Co-Pilot"
                aria-label="Minimize Co-Pilot"
              >
                <ChevronDown size={18} />
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close Co-Pilot"
                aria-label="Close Co-Pilot"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="copilot-security-bar">
            <ShieldCheck size={14} />
            <span>
              Authenticated workspace · grounded responses
            </span>
          </div>

          <div
            className="copilot-messages"
            ref={messagesRef}
          >
            {messages.map((chatMessage) => (
              <article
                key={chatMessage.id}
                className={`copilot-message copilot-message-${chatMessage.role}`}
              >
                {chatMessage.role === "assistant" && (
                  <div className="copilot-message-avatar">
                    <Bot size={14} />
                  </div>
                )}

                <div className="copilot-message-body">
                  <div className="copilot-message-content">
                    {chatMessage.content}
                  </div>

                  {chatMessage.confidence !== undefined &&
                    chatMessage.role === "assistant" && (
                      <div className="copilot-confidence">
                        Grounding confidence{" "}
                        {Math.round(
                          chatMessage.confidence * 100,
                        )}
                        %
                      </div>
                    )}

                  {chatMessage.actions &&
                    chatMessage.actions.length > 0 && (
                      <div className="copilot-actions">
                        {chatMessage.actions.map(
                          (action, index) => (
                            <button
                              key={`${action.path}-${index}`}
                              type="button"
                              onClick={() =>
                                navigateToAction(action)
                              }
                            >
                              {action.label}
                              <ExternalLink size={13} />
                            </button>
                          ),
                        )}
                      </div>
                    )}

                  {chatMessage.citations &&
                    chatMessage.citations.length > 0 && (
                      <div className="copilot-citations">
                        <span className="copilot-citations-label">
                          Sources
                        </span>

                        {chatMessage.citations.map(
                          (citation, index) => (
                            <div
                              className="copilot-citation"
                              key={
                                citation.chunk_id ||
                                `${citation.title}-${index}`
                              }
                            >
                              <span>
                                {citation.title}
                              </span>

                              {citation.source_url && (
                                <a
                                  href={
                                    citation.source_url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`Open ${citation.title}`}
                                >
                                  <ExternalLink
                                    size={12}
                                  />
                                </a>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    )}

                  {chatMessage.role === "assistant" &&
                    chatMessage.messageId && (
                      <div className="copilot-feedback">
                        <span>Was this useful?</span>

                        <button
                          type="button"
                          className={
                            feedbackSent[
                              chatMessage.messageId
                            ] === "HELPFUL"
                              ? "selected"
                              : ""
                          }
                          onClick={() =>
                            void submitFeedback(
                              chatMessage.messageId,
                              "HELPFUL",
                            )
                          }
                          aria-label="Helpful response"
                        >
                          <ThumbsUp size={13} />
                        </button>

                        <button
                          type="button"
                          className={
                            feedbackSent[
                              chatMessage.messageId
                            ] === "NOT_HELPFUL"
                              ? "selected"
                              : ""
                          }
                          onClick={() =>
                            void submitFeedback(
                              chatMessage.messageId,
                              "NOT_HELPFUL",
                            )
                          }
                          aria-label="Not helpful response"
                        >
                          <ThumbsDown size={13} />
                        </button>
                      </div>
                    )}
                </div>
              </article>
            ))}

            {loading && (
              <article className="copilot-message copilot-message-assistant">
                <div className="copilot-message-avatar">
                  <Bot size={14} />
                </div>

                <div className="copilot-message-body">
                  <div className="copilot-thinking">
                    <Loader2 size={15} className="spin" />
                    <span>
                      Vanguard is analysing your request…
                    </span>
                  </div>
                </div>
              </article>
            )}

            {error && (
              <div className="copilot-error">
                <MessageCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="copilot-suggestions">
            {(
              messages.length === 1
                ? defaultFollowups
                : [
                    "Explain this concept",
                    "Show me relevant labs",
                    "What should I learn next?",
                  ]
            ).map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                onClick={() => void sendMessage(suggestion)}
                disabled={loading}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form
            className="copilot-composer"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <textarea
              ref={inputRef}
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder={
                sessionReady
                  ? "Ask the Co-Pilot anything…"
                  : "Sign in to use the Co-Pilot…"
              }
              rows={1}
              disabled={loading}
              aria-label="Ask AI Co-Pilot"
            />

            <button
              type="submit"
              disabled={!message.trim() || loading}
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 size={17} className="spin" />
              ) : (
                <Send size={17} />
              )}
            </button>
          </form>

          <footer className="copilot-footer">
            <span>AI assistance</span>
            <span>•</span>
            <span>Human verification recommended</span>
          </footer>
        </section>
      )}
    </>
  );
}