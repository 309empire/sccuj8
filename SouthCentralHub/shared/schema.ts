import { z } from "zod";

export const ticketSchema = z.object({
  id: z.string(),
  ticketNumber: z.string(),
  subject: z.string().min(1),
  message: z.string().min(1),
  status: z.enum(["open", "claimed", "closed"]),
  claimedBy: z.string().optional(),
  createdAt: z.number(),
});

export const messageSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  content: z.string().min(1),
  sender: z.enum(["user", "staff"]),
  timestamp: z.number(),
});

export const insertTicketSchema = ticketSchema.omit({ id: true, ticketNumber: true, status: true, createdAt: true });
export const insertMessageSchema = messageSchema.omit({ id: true, timestamp: true });

export type Ticket = z.infer<typeof ticketSchema>;
export type Message = z.infer<typeof messageSchema>;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export interface TeamMember {
  name: string;
  role: string;
  description: string;
  category: "owner" | "coowner" | "highrank" | "developer";
  isHeadDeveloper?: boolean;
}

export interface UpdateStatus {
  percentage: number;
}

export const users = {
  id: "",
  username: "",
  password: "",
};

export type User = typeof users;
export type InsertUser = Omit<User, "id">;
