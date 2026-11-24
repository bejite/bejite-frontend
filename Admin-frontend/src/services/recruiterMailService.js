import axiosInstance from "../utils/axiosInstance";

const API = "/api/admin/mailbox";
const NOTES_KEY = "bejite_admin_contact_notes_v1";

export const MAIL_FOLDERS = {
  INBOX: "inbox",
  SENT: "sent",
};

export const getThreadContact = (thread) => {
  if (!thread) return { name: "Unknown", email: "" };
  const contact = thread.contact || thread.recruiter || {};
  return {
    name: contact.name || contact.email?.split("@")[0] || "Unknown",
    email: contact.email || "",
    avatar: contact.avatar || null,
  };
};

export function notifyMailboxChanged() {
  window.dispatchEvent(new Event("bejite-mailbox-changed"));
}

export async function listMailboxThreads() {
  const response = await axiosInstance.get(`${API}/threads`);
  return response.data?.threads || [];
}

export async function fetchMailboxSummary() {
  const response = await axiosInstance.get(`${API}/summary`);
  return {
    inboxUnread: response.data?.inboxUnread || 0,
    sent: response.data?.sent || 0,
  };
}

export async function searchMailboxContacts(query) {
  const q = String(query || "").trim();
  if (q.length < 2) return [];
  const response = await axiosInstance.get(`${API}/contacts`, { params: { q } });
  return response.data?.contacts || [];
}

export async function updateMailboxRead(ids, isRead) {
  const response = await axiosInstance.patch(`${API}/threads/read`, { ids, isRead });
  notifyMailboxChanged();
  return response.data;
}

export async function deleteMailboxThreads(ids) {
  const response = await axiosInstance.post(`${API}/threads/delete`, { ids });
  notifyMailboxChanged();
  return response.data;
}

export async function sendAdminMessage(payload) {
  const response = await axiosInstance.post(`${API}/messages`, payload);
  notifyMailboxChanged();
  return response.data;
}

export const sendRecruiterMessage = sendAdminMessage;

export async function fetchRecruitersDirectory() {
  return [];
}

function readNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getRecruiterNotes(email) {
  const notes = readNotes();
  return notes[String(email || "").toLowerCase()] || "";
}

export function saveRecruiterNotes(email, note) {
  const notes = readNotes();
  notes[String(email || "").toLowerCase()] = String(note || "");
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export const RECRUITER_CATEGORIES = [];
export const DEFAULT_TEMPLATES = [];
export const simulateRecruiterReply = () => null;
