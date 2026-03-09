"use client";

import { useState } from "react";
import { useTicketDetail, useCreateMessage, useCreateFeedback } from "@/hooks/use-dashboard";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Send, Star, User, Headphones } from "lucide-react";
import { useParams } from "next/navigation";

export default function TicketDetailPage() {
    const params = useParams();
    const ticketId = parseInt(params.id as string);
    const { data, isLoading } = useTicketDetail(ticketId);
    const createMessage = useCreateMessage(ticketId);
    const createFeedback = useCreateFeedback(ticketId);

    const [messageText, setMessageText] = useState("");
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState("");
    const [hoveredStar, setHoveredStar] = useState(0);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim()) return;
        await createMessage.mutateAsync({ messageText, fromClient: true });
        setMessageText("");
    };

    const handleSendFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedbackRating) return;
        await createFeedback.mutateAsync({ rating: feedbackRating, feedbackText });
        setFeedbackText("");
    };

    if (isLoading) {
        return (
            <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
                <div className="loading-center"><div className="spinner" /></div>
            </div>
        );
    }

    if (!data) return null;

    const { ticket, messages, feedback } = data;

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }} className="animate-in">
            <Link href="/portal" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, marginBottom: 24 }}>
                <ArrowLeft size={16} /> Back to Tickets
            </Link>

            {/* Ticket Header */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)" }}>#{ticket.id}</span>
                    <span className={`badge badge-${ticket.status}`}>{ticket.status?.replace("_", " ")}</span>
                    <span className={`badge badge-${ticket.priority}`}>{ticket.priority}</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{ticket.title}</h2>
                <div style={{ display: "flex", gap: 24, fontSize: 13, color: "var(--text-secondary)", flexWrap: "wrap" }}>
                    <span>Type: <strong style={{ color: "var(--text-primary)" }}>{ticket.typeName}</strong></span>
                    {ticket.assigneeName && <span>Assigned to: <strong style={{ color: "var(--text-primary)" }}>{ticket.assigneeName.replace("_", " ")}</strong></span>}
                    <span>Created: <strong style={{ color: "var(--text-primary)" }}>{ticket.createdAt ? format(new Date(ticket.createdAt), "MMM d, yyyy h:mm a") : ""}</strong></span>
                    {ticket.resolvedAt && <span>Resolved: <strong style={{ color: "var(--accent-green)" }}>{format(new Date(ticket.resolvedAt), "MMM d, yyyy h:mm a")}</strong></span>}
                </div>
            </div>

            {/* Messages */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Conversation</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 400, overflowY: "auto", paddingRight: 8 }}>
                    {messages.map((msg) => (
                        <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.fromClient ? "flex-end" : "flex-start" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontSize: 12, color: "var(--text-secondary)" }}>
                                {msg.fromClient ? (
                                    <><User size={12} /> You</>
                                ) : (
                                    <><Headphones size={12} /> {msg.teamMemberName?.replace("_", " ") || "Support Agent"}</>
                                )}
                                <span>&middot;</span>
                                <span>{msg.createdAt ? format(new Date(msg.createdAt), "MMM d, h:mm a") : ""}</span>
                            </div>
                            <div className={`message-bubble ${msg.fromClient ? "message-client" : "message-team"}`}>
                                {msg.messageText}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Send Message */}
                <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 8, marginTop: 20, borderTop: "1px solid var(--border-color)", paddingTop: 16 }}>
                    <input className="input" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type your message..." style={{ flex: 1 }} />
                    <button type="submit" className="btn btn-primary" disabled={createMessage.isPending || !messageText.trim()}>
                        <Send size={16} />
                    </button>
                </form>
            </div>

            {/* Feedback */}
            {ticket.status === "resolved" && !feedback && (
                <div className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Leave Feedback</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>How was your experience with this ticket?</p>

                    <form onSubmit={handleSendFeedback} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="star"
                                    onClick={() => setFeedbackRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                                >
                                    <Star
                                        size={28}
                                        fill={(hoveredStar || feedbackRating) >= star ? "#f59e0b" : "transparent"}
                                        stroke={(hoveredStar || feedbackRating) >= star ? "#f59e0b" : "var(--text-secondary)"}
                                    />
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="input"
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Tell us more about your experience (optional)"
                            rows={3}
                            style={{ resize: "vertical" }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }} disabled={!feedbackRating || createFeedback.isPending}>
                            Submit Feedback
                        </button>
                    </form>
                </div>
            )}

            {feedback && (
                <div className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Your Feedback</h3>
                    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={20} fill={feedback.rating >= star ? "#f59e0b" : "transparent"} stroke={feedback.rating >= star ? "#f59e0b" : "var(--text-secondary)"} />
                        ))}
                    </div>
                    {feedback.feedbackText && <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{feedback.feedbackText}</p>}
                </div>
            )}
        </div>
    );
}
