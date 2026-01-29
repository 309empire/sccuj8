import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  TicketIcon,
  ClaimIcon,
  CloseIcon,
  SendIcon,
  MessageIcon,
  BellIcon,
  CheckIcon,
} from "./Icons";
import {
  fetchTickets,
  updateTicket,
  fetchMessages,
  sendMessage,
  generateNotificationSound,
} from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { Ticket, Message } from "@shared/schema";

function TicketList({
  tickets,
  onSelectTicket,
  selectedTicketId,
}: {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  selectedTicketId: string | null;
}) {
  return (
    <Card className="p-4 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-foreground">Tickets</h2>
        <Badge variant="secondary" className="bg-primary/20 text-primary">
          {tickets.filter((t) => t.status !== "closed").length} Open
        </Badge>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tickets yet</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onSelectTicket(ticket)}
              className={`w-full p-3 rounded-lg text-left transition-all hover-elevate ${
                selectedTicketId === ticket.id
                  ? "bg-primary/20 border border-primary/30"
                  : "bg-secondary/50"
              }`}
              data-testid={`staff-ticket-${ticket.ticketNumber}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant="secondary"
                  className={
                    ticket.status === "open"
                      ? "bg-green-500/20 text-green-400"
                      : ticket.status === "claimed"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-gray-500/20 text-gray-400"
                  }
                >
                  {ticket.status === "open"
                    ? "New"
                    : ticket.status === "claimed"
                    ? "Claimed"
                    : "Closed"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="font-medium text-foreground text-sm">
                Ticket-{ticket.ticketNumber}
              </div>
              <div className="text-xs text-muted-foreground truncate mt-1">
                {ticket.subject}
              </div>
            </button>
          ))
        )}
      </div>
    </Card>
  );
}

function TicketView({
  ticket,
  onClose,
  onUpdate,
}: {
  ticket: Ticket;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/tickets", ticket.id, "messages"],
    queryFn: () => fetchMessages(ticket.id),
    refetchInterval: 2000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(ticket.id, content, "staff"),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticket.id, "messages"] });
    },
  });

  const claimMutation = useMutation({
    mutationFn: () => updateTicket(ticket.id, { status: "claimed", claimedBy: "Staff" }),
    onSuccess: () => {
      onUpdate();
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => updateTicket(ticket.id, { status: "closed" }),
    onSuccess: () => {
      onClose();
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMutation.mutate(newMessage);
  };

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            Ticket-{ticket.ticketNumber}
          </Badge>
          <div>
            <div className="font-medium text-foreground">{ticket.subject}</div>
            <div className="text-xs text-muted-foreground">
              Created {new Date(ticket.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {ticket.status === "open" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className="gap-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
              data-testid="button-claim-ticket"
            >
              <ClaimIcon className="w-4 h-4" />
              Claim
            </Button>
          )}
          {ticket.status === "claimed" && (
            <Badge
              variant="secondary"
              className="bg-yellow-500/20 text-yellow-400 flex items-center gap-1"
            >
              <CheckIcon className="w-3 h-3" />
              Claimed by {ticket.claimedBy}
            </Badge>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => closeMutation.mutate()}
            disabled={closeMutation.isPending}
            className="gap-1"
            data-testid="button-close-staff-ticket"
          >
            <CloseIcon className="w-4 h-4" />
            Close
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <div className="bg-secondary/50 rounded-lg p-3 text-sm">
          <span className="font-medium text-foreground">User's Initial Message:</span>
          <p className="text-muted-foreground mt-1">{ticket.message}</p>
        </div>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "staff" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.sender === "staff"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <div className="text-xs opacity-70 mb-1">
                {msg.sender === "staff" ? "Staff" : "User"}
              </div>
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {ticket.status !== "closed" && (
        <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 bg-background border-border"
            data-testid="input-staff-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || sendMutation.isPending}
            data-testid="button-staff-send"
          >
            <SendIcon className="w-4 h-4" />
          </Button>
        </form>
      )}
    </Card>
  );
}

export function StaffPanel() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const prevTicketCountRef = useRef(0);

  const { data: tickets = [] } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
    queryFn: fetchTickets,
    refetchInterval: 2000,
  });

  const sortedTickets = [...tickets].sort((a, b) => {
    if (a.status === "open" && b.status !== "open") return -1;
    if (b.status === "open" && a.status !== "open") return 1;
    if (a.status === "claimed" && b.status === "closed") return -1;
    if (b.status === "claimed" && a.status === "closed") return 1;
    return b.createdAt - a.createdAt;
  });

  useEffect(() => {
    if (notificationEnabled && tickets.length > prevTicketCountRef.current) {
      const newTickets = tickets.filter(
        (t) => t.status === "open" && t.createdAt > Date.now() - 5000
      );
      if (newTickets.length > 0 && prevTicketCountRef.current > 0) {
        generateNotificationSound();
      }
    }
    prevTicketCountRef.current = tickets.length;
  }, [tickets, notificationEnabled]);

  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [tickets, selectedTicket]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="text-gaming-red" style={{ textShadow: "0 0 30px rgba(200, 30, 30, 0.5)" }}>
                Staff
              </span>{" "}
              <span className="text-foreground">Panel</span>
            </h1>
            <p className="text-muted-foreground mt-1">Manage support tickets</p>
          </div>
          <Button
            variant={notificationEnabled ? "default" : "secondary"}
            size="sm"
            onClick={() => setNotificationEnabled(!notificationEnabled)}
            className="gap-2"
            data-testid="button-toggle-notifications"
          >
            <BellIcon className="w-4 h-4" />
            {notificationEnabled ? "Notifications On" : "Notifications Off"}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="md:col-span-1">
            <TicketList
              tickets={sortedTickets}
              onSelectTicket={setSelectedTicket}
              selectedTicketId={selectedTicket?.id || null}
            />
          </div>
          <div className="md:col-span-2 min-h-[600px]">
            {selectedTicket ? (
              <TicketView
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
                onUpdate={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
                }}
              />
            ) : (
              <Card className="h-full flex items-center justify-center bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d">
                <div className="text-center text-muted-foreground">
                  <MessageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Select a ticket to view</p>
                  <p className="text-sm mt-1">Click on a ticket from the list to start responding</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
