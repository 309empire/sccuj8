import { randomUUID } from "crypto";
import type { Ticket, Message, InsertTicket, InsertMessage } from "@shared/schema";

export interface IStorage {
  getTickets(): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined>;
  deleteTicket(id: string): Promise<boolean>;
  
  getMessages(ticketId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private tickets: Map<string, Ticket>;
  private messages: Map<string, Message>;

  constructor() {
    this.tickets = new Map();
    this.messages = new Map();
  }

  async getTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = randomUUID();
    const ticketNumber = `${Math.floor(10000 + Math.random() * 90000)}`;
    const ticket: Ticket = {
      ...insertTicket,
      id,
      ticketNumber,
      status: "open",
      createdAt: Date.now(),
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    const updated = { ...ticket, ...updates };
    this.tickets.set(id, updated);
    return updated;
  }

  async deleteTicket(id: string): Promise<boolean> {
    return this.tickets.delete(id);
  }

  async getMessages(ticketId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.ticketId === ticketId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: Date.now(),
    };
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
