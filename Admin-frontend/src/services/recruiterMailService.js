const STORAGE_KEY = "bejite_admin_mailbox_v3";
const CONTACTS_KEY = "bejite_admin_contacts_v3";

export const MAIL_FOLDERS = {
  INBOX: "inbox",
  SENT: "sent",
};

// Seed sample email threads with realistic user and external emails
const SEED_THREADS = [
  {
    id: "thread-101",
    contact: {
      name: "Sarah Jenkins",
      email: "sarah.jenkins@moniepoint.com",
      avatar: null,
    },
    subject: "Inquiry about senior engineering talent & ASE benchmark",
    folder: MAIL_FOLDERS.INBOX,
    isRead: false,
    lastActivity: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    messages: [
      {
        id: "msg-101-1",
        senderType: "admin",
        senderName: "Bejite Admin",
        senderEmail: "admin@bejite.com",
        to: "sarah.jenkins@moniepoint.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        body: `Hello Sarah,

Hope you're having a productive week.

We noticed your team is expanding its backend infrastructure. At Bejite, our ASE assessment benchmarks senior engineers on distributed systems and cloud architecture.

Would you be open to reviewing candidate profiles suited for your stack?

Best regards,
Admin Team | Bejite`,
        attachments: [],
      },
      {
        id: "msg-101-2",
        senderType: "contact",
        senderName: "Sarah Jenkins",
        senderEmail: "sarah.jenkins@moniepoint.com",
        to: "admin@bejite.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
        body: `Hi Admin team,

Thank you for reaching out! We are currently hiring for 2 Senior Distributed Systems Engineers (Go / Kafka) and would love to review the assessment scores of available candidates.

Could you share 3 to 4 profiles?

Best,
Sarah Jenkins
Moniepoint Inc.`,
        attachments: [
          { name: "Engineering_Job_Spec.pdf", size: "245 KB", type: "pdf" },
        ],
      },
    ],
  },
  {
    id: "thread-102",
    contact: {
      name: "Emeka Nwosu",
      email: "emeka.nwosu@gmail.com",
      avatar: null,
    },
    subject: "Question regarding profile verification and assessment score",
    folder: MAIL_FOLDERS.INBOX,
    isRead: true,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    messages: [
      {
        id: "msg-102-1",
        senderType: "contact",
        senderName: "Emeka Nwosu",
        senderEmail: "emeka.nwosu@gmail.com",
        to: "admin@bejite.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        body: `Hello Bejite Support,

I recently completed the Frontend Engineering ASE evaluation and would like to confirm when the badge will reflect on my public profile.

Thank you for your assistance.

Warm regards,
Emeka Nwosu`,
        attachments: [],
      },
      {
        id: "msg-102-2",
        senderType: "admin",
        senderName: "Bejite Admin",
        senderEmail: "admin@bejite.com",
        to: "emeka.nwosu@gmail.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        body: `Hi Emeka,

Thank you for contacting us. Your ASE evaluation score has been verified and your Verified Badge will appear on your public profile within 2 to 4 business hours.

Feel free to reply if you need any additional help!

Best regards,
Bejite Admin Team`,
        attachments: [],
      },
    ],
  },
  {
    id: "thread-103",
    contact: {
      name: "Partnerships Team",
      email: "partnerships@techstart.io",
      avatar: null,
    },
    subject: "Exploring hiring collaboration for Q4 accelerator cohort",
    folder: MAIL_FOLDERS.INBOX,
    isRead: false,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    messages: [
      {
        id: "msg-103-1",
        senderType: "contact",
        senderName: "TechStart Partnerships",
        senderEmail: "partnerships@techstart.io",
        to: "admin@bejite.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        body: `Hi Bejite Team,

We run an early-stage startup accelerator supporting 25 tech founders across West Africa. Several of our portfolio companies are hiring technical talent.

We would like to explore partnering with Bejite for candidate sourcing. What is the best time this week for a brief call?

Regards,
Partnerships Team
TechStart Accelerator`,
        attachments: [],
      },
    ],
  },
  {
    id: "thread-104",
    contact: {
      name: "David Adeyemi",
      email: "david.a@paystack.com",
      avatar: null,
    },
    subject: "Candidate shortlist for Product Designer position",
    folder: MAIL_FOLDERS.SENT,
    isRead: true,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    messages: [
      {
        id: "msg-104-1",
        senderType: "admin",
        senderName: "Bejite Admin",
        senderEmail: "admin@bejite.com",
        to: "david.a@paystack.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        body: `Hello David,

Following our conversation, please find attached the candidate profiles and design audit evaluations for the Senior Product Designer position.

Let us know once you've reviewed them so we can coordinate interviews.

Best regards,
Bejite Admin`,
        attachments: [
          { name: "Candidate_Portfolios_Batch.pdf", size: "1.2 MB", type: "pdf" },
        ],
      },
    ],
  },
];

// Helper to normalize thread contact data safely
export const getThreadContact = (thread) => {
  if (!thread) return { name: "Unknown", email: "" };
  const contact = thread.contact || thread.recruiter || {};
  return {
    name: contact.name || contact.email?.split("@")[0] || "Unknown",
    email: contact.email || "",
    avatar: contact.avatar || null,
  };
};

// Retrieve stored threads
export const getStoredThreads = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_THREADS));
      return SEED_THREADS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_THREADS));
      return SEED_THREADS;
    }
    return parsed;
  } catch (err) {
    console.error("Failed to read stored threads:", err);
    return SEED_THREADS;
  }
};

// Save threads
export const saveStoredThreads = (threads) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch (err) {
    console.error("Failed to save stored threads:", err);
  }
};

// Directory of suggested contacts (for auto-complete)
export const fetchRecruitersDirectory = async () => {
  const threads = getStoredThreads();
  const contactsMap = new Map();

  threads.forEach((t) => {
    const c = getThreadContact(t);
    if (c.email && !contactsMap.has(c.email.toLowerCase())) {
      contactsMap.set(c.email.toLowerCase(), {
        name: c.name,
        email: c.email,
      });
    }
  });

  return Array.from(contactsMap.values());
};

// Send an email (New conversation or append to existing)
export const sendAdminMessage = async ({
  threadId,
  toEmail,
  toName,
  subject,
  body,
  attachments = [],
  adminUser = null,
}) => {
  const threads = getStoredThreads();
  const now = new Date().toISOString();
  const adminDisplayName =
    [adminUser?.firstName, adminUser?.lastName].filter(Boolean).join(" ") ||
    "Bejite Admin";
  const adminEmail = adminUser?.email || "admin@bejite.com";

  let targetThread = null;

  if (threadId) {
    targetThread = threads.find((t) => t.id === threadId);
  } else if (toEmail) {
    targetThread = threads.find((t) => {
      const c = getThreadContact(t);
      return c.email.toLowerCase() === toEmail.toLowerCase();
    });
  }

  const newMsg = {
    id: `msg-${Date.now()}`,
    senderType: "admin",
    senderName: adminDisplayName,
    senderEmail: adminEmail,
    to: toEmail || getThreadContact(targetThread).email,
    timestamp: now,
    body,
    attachments,
  };

  if (targetThread) {
    // Append to existing thread
    targetThread.messages = targetThread.messages || [];
    targetThread.messages.push(newMsg);
    targetThread.lastActivity = now;
    if (subject && !targetThread.subject) {
      targetThread.subject = subject;
    }
  } else {
    // Create new thread in Sent folder
    const cleanToEmail = (toEmail || "").trim();
    const cleanToName = (toName || "").trim() || cleanToEmail.split("@")[0] || "Recipient";

    targetThread = {
      id: `thread-${Date.now()}`,
      contact: {
        name: cleanToName,
        email: cleanToEmail,
        avatar: null,
      },
      // Backward compatibility for legacy references
      recruiter: {
        name: cleanToName,
        email: cleanToEmail,
      },
      subject: subject?.trim() || "No Subject",
      folder: MAIL_FOLDERS.SENT,
      isRead: true,
      lastActivity: now,
      messages: [newMsg],
    };

    threads.unshift(targetThread);
  }

  saveStoredThreads(threads);
  return targetThread;
};

// Backward-compatible alias
export const sendRecruiterMessage = sendAdminMessage;

// Legacy exports kept as empty safe constants so no imports break
export const RECRUITER_CATEGORIES = [];
export const DEFAULT_TEMPLATES = [];
export const simulateRecruiterReply = () => null;
