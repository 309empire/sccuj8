import { apiRequest, queryClient } from "./queryClient";
import type { Ticket, Message, InsertTicket, InsertMessage } from "@shared/schema";

const STAFF_AUTH_KEY = "southcentral_staff_auth";
const UPDATE_STATUS_KEY = "southcentral_update_status";

export async function fetchTickets(): Promise<Ticket[]> {
  const response = await fetch("/api/tickets");
  if (!response.ok) throw new Error("Failed to fetch tickets");
  return response.json();
}

export async function fetchTicket(id: string): Promise<Ticket> {
  const response = await fetch(`/api/tickets/${id}`);
  if (!response.ok) throw new Error("Failed to fetch ticket");
  return response.json();
}

export async function createTicket(data: InsertTicket): Promise<Ticket> {
  const response = await apiRequest("POST", "/api/tickets", data);
  const ticket = await response.json();
  queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
  return ticket;
}

export async function updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
  const response = await apiRequest("PATCH", `/api/tickets/${id}`, data);
  const ticket = await response.json();
  queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
  queryClient.invalidateQueries({ queryKey: ["/api/tickets", id] });
  return ticket;
}

export async function deleteTicket(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/tickets/${id}`, undefined);
  queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
}

export async function fetchMessages(ticketId: string): Promise<Message[]> {
  const response = await fetch(`/api/tickets/${ticketId}/messages`);
  if (!response.ok) throw new Error("Failed to fetch messages");
  return response.json();
}

export async function sendMessage(ticketId: string, content: string, sender: "user" | "staff"): Promise<Message> {
  const response = await apiRequest("POST", `/api/tickets/${ticketId}/messages`, { content, sender });
  const message = await response.json();
  queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId, "messages"] });
  return message;
}

export async function authenticateAdmin(password: string): Promise<boolean> {
  try {
    const response = await apiRequest("POST", "/api/auth/admin", { password });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem(STAFF_AUTH_KEY, "true");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function isStaffAuthenticated(): boolean {
  return localStorage.getItem(STAFF_AUTH_KEY) === "true";
}

export function logoutStaff(): void {
  localStorage.removeItem(STAFF_AUTH_KEY);
}

export function getUpdateStatus(): number {
  const stored = localStorage.getItem(UPDATE_STATUS_KEY);
  return stored ? parseInt(stored, 10) : 50;
}

export function setUpdateStatus(percentage: number): void {
  localStorage.setItem(UPDATE_STATUS_KEY, percentage.toString());
}

export function generateNotificationSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.log("Audio not supported");
  }
}
