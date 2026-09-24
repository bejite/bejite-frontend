const STORAGE_KEY = "bejite_admin_recruiter_mailbox_v2";
const TEMPLATES_KEY = "bejite_admin_recruiter_email_templates_v2";
const NOTES_KEY = "bejite_admin_recruiter_notes_v2";

export const MAIL_FOLDERS = {
  INBOX: "inbox",
  SENT: "sent",
  STARRED: "starred",
  DRAFTS: "drafts",
  ARCHIVE: "archive",
  TRASH: "trash",
};

export const RECRUITER_CATEGORIES = [
  { id: "active_hiring", label: "Active Hiring", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "candidate_review", label: "Candidate Review", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "partnership", label: "Enterprise Partner", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "follow_up", label: "Follow-up Required", color: "bg-amber-50 text-amber-700 border-amber-200" },
];

export const DEFAULT_TEMPLATES = [
  {
    id: "tpl-1",
    title: "🎯 Introduction to Pre-vetted Tech Talent",
    category: "Intro & Outreach",
    subject: "Top Pre-vetted Tech Talent for {{company_name}} — Bejite Platform",
    body: `Hi {{recruiter_name}},

Hope you're having a productive week!

I noticed that {{company_name}} has been expanding its technical team. At Bejite, we pre-evaluate top African software engineers, designers, and product leaders through our rigorous ASE (Applied Skills Evaluation) process.

We currently have over 150+ verified senior engineers actively open to new opportunities. Would you be open to reviewing a curated shortlist of top candidates tailored specifically for {{company_name}}?

Looking forward to hearing from you.

Best regards,
{{admin_name}}
Bejite Recruitment & Talent Partnerships
https://bejite.com`,
  },
  {
    id: "tpl-2",
    title: "⚡ Verified Recruiter Badge & VIP Hiring Assistance",
    category: "Verification & Trust",
    subject: "Claim Your Verified Recruiter Badge on Bejite — {{company_name}}",
    body: `Hello {{recruiter_name}},

Thank you for being an active hiring partner on Bejite!

I wanted to personally reach out to help you activate your **Verified Recruiter Badge**. Verified recruiters receive 3.5x higher applicant response rates and priority ranking on our talent feed.

To fast-track your verification, I can help review your company profile and activate your verified badge today. Could you confirm if you'd like us to complete this for {{company_name}}?

Warm regards,
{{admin_name}}
Bejite Platform Administrator`,
  },
  {
    id: "tpl-3",
    title: "💼 Follow-up: Qualified Candidates for Your Job Posting",
    category: "Job Posting Follow-up",
    subject: "Following up: Candidates matching your recent job opening at {{company_name}}",
    body: `Hi {{recruiter_name}},

I saw your recent job opening listed on Bejite. We ran an automated ASE match across our active talent pool and found 5 highly qualified candidates whose technical scores are in the top 5th percentile.

Would you like me to send over their anonymized profiles and technical assessment scores for a quick review?

Let me know what time works best for a quick chat!

Best regards,
{{admin_name}}
Bejite Talent Operations`,
  },
  {
    id: "tpl-4",
    title: "🤝 Enterprise Hiring & AdPro Campaign Partnership",
    category: "Enterprise Partnership",
    subject: "Special Recruiter Promotion & Featured AdPro slots for {{company_name}}",
    body: `Hi {{recruiter_name}},

As part of our Q3 hiring initiative, we're extending an exclusive package for tech leaders at {{company_name}}:

• 3 Free Featured Job slots with priority talent matching
• Direct access to ASE benchmarked candidate leaderboards
• Dedicated Bejite talent advisor support

If you'd like to activate this for your hiring team, reply directly to this email and I'll configure your dashboard immediately.

Cheers,
{{admin_name}}
Enterprise Partnerships | Bejite`,
  },
];

// Seed sample recruiter threads showing realistic two-way communication
const SEED_THREADS = [
  {
    id: "thread-101",
    recruiter: {
      id: "rec-1",
      name: "Sarah Jenkins",
      email: "sarah.jenkins@moniepoint.com",
      company: "Moniepoint Inc.",
      role: "Lead Technical Recruiter",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      verified: true,
      activeJobsCount: 4,
      location: "Lagos, Nigeria (Hybrid)",
      memberSince: "March 2025",
    },
    subject: "Partnering on Senior Backend Engineers & Platform Growth",
    category: "active_hiring",
    folder: MAIL_FOLDERS.INBOX,
    isStarred: true,
    isRead: false,
    lastActivity: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    messages: [
      {
        id: "msg-101-1",
        senderType: "admin",
        senderName: "Bejite Admin Team",
        senderEmail: "admin@bejite.com",
        to: "sarah.jenkins@moniepoint.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        body: `Hi Sarah,

Hope you're having a great week!

I noticed that Moniepoint is actively scaling its core banking and settlement platform team. We have recently concluded our Q3 Applied Skills Evaluation (ASE) cohort, where over 40 senior Golang and distributed systems engineers scored in the top 95th percentile.

Would you be open to reviewing a curated shortlist of top candidates tailored specifically for Moniepoint's engineering stack?

Looking forward to hearing from you.

Best regards,
Admin Team
Bejite Talent Operations`,
        deliveryStatus: "Opened",
        attachments: [],
      },
      {
        id: "msg-101-2",
        senderType: "recruiter",
        senderName: "Sarah Jenkins",
        senderEmail: "sarah.jenkins@moniepoint.com",
        to: "admin@bejite.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
        body: `Hi Admin team,

Thank you so much for reaching out! This timing is actually ideal.

We are currently hiring for 2 Senior Distributed Systems Engineers (Go / Kafka / PostgreSQL) and 1 Principal Database Architect. 

Could you share 3 to 4 pre-vetted profiles along with their ASE assessment scores and availability? If they look like a solid fit, I can fast-track them directly to our Technical Hiring Manager this Friday.

Best,
Sarah Jenkins
Lead Technical Recruiter | Moniepoint Inc.`,
        deliveryStatus: "Received",
        attachments: [
          { name: "Moniepoint_Senior_Go_Job_Spec.pdf", size: "245 KB", type: "pdf" },
        ],
      },
    ],
  },
  {
    id: "thread-102",
    recruiter: {
      id: "rec-2",
      name: "David Adeyemi",
      email: "david.a@paystack.com",
      company: "Paystack Payments",
      role: "Head of People & Recruiting",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verified: true,
      activeJobsCount: 6,
      location: "San Francisco / Lagos (Remote)",
      memberSince: "January 2025",
    },
    subject: "ASE Candidate Verification & Senior Product Designer Shortlist",
    category: "candidate_review",
    folder: MAIL_FOLDERS.INBOX,
    isStarred: false,
    isRead: true,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    messages: [
      {
        id: "msg-102-1",
        senderType: "admin",
        senderName: "Bejite Admin Team",
        senderEmail: "admin@bejite.com",
        to: "david.a@paystack.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        body: `Hello David,

Trust you are doing well.

Following up on your recent job posting on Bejite for a Senior Fintech Product Designer. We have 3 verified candidates who completed real-world design audits with top benchmark ratings.

Let me know if you would like their portfolio case studies sent over.

Warm regards,
Bejite Recruitment Team`,
        deliveryStatus: "Opened",
        attachments: [],
      },
      {
        id: "msg-102-2",
        senderType: "recruiter",
        senderName: "David Adeyemi",
        senderEmail: "david.a@paystack.com",
        to: "admin@bejite.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        body: `Hello Bejite Team,

Yes, please! How does the ASE scoring work for designers? Is there a breakdown of design systems vs UX research ability?

Looking forward to taking a look at those portfolios.

Best,
David`,
        deliveryStatus: "Received",
        attachments: [],
      },
      {
        id: "msg-102-3",
        senderType: "admin",
        senderName: "Bejite Admin Team",
        senderEmail: "admin@bejite.com",
        to: "david.a@paystack.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        body: `Hi David,

Great question! Our design ASE scores candidates on 4 key axes: 
1) Design Systems Architecture (Tokens & Figma mastery)
2) Interactive Prototyping
3) Complex User Flow & Edge-Case Handling
4) Business & Engineering collaboration

I've attached the evaluation rubric and the 3 candidate profile packages below. Let us know what you think!`,
        deliveryStatus: "Delivered",
        attachments: [
          { name: "ASE_Design_Assessment_Rubric.pdf", size: "410 KB", type: "pdf" },
          { name: "Paystack_Designer_Candidates_Batch_1.zip", size: "3.2 MB", type: "zip" },
        ],
      },
    ],
  },
  {
    id: "thread-103",
    recruiter: {
      id: "rec-3",
      name: "Elena Vance",
      email: "elena.vance@flutterwavego.com",
      company: "Flutterwave",
      role: "Talent Acquisition Partner",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      verified: true,
      activeJobsCount: 2,
      location: "Nairobi, Kenya",
      memberSince: "April 2025",
    },
    subject: "Claim Your Recruiter Verified Badge & Featured Listings",
    category: "partnership",
    folder: MAIL_FOLDERS.SENT,
    isStarred: true,
    isRead: true,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    messages: [
      {
        id: "msg-103-1",
        senderType: "admin",
        senderName: "Bejite Admin Team",
        senderEmail: "admin@bejite.com",
        to: "elena.vance@flutterwavego.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        body: `Dear Elena,

We are delighted to have Flutterwave using Bejite for your East African engineering expansion.

I noticed your recruiter profile is ready for our official **Verified Recruiter Badge**. This badge confirms your corporate affiliation and highlights your jobs at the top of candidate feeds.

I can expedite this badge approval today. Let me know if you would also like 2 complimentary AdPro featured promotional slots this month!

Warm regards,
Bejite Admin Team`,
        deliveryStatus: "Delivered",
        attachments: [],
      },
    ],
  },
  {
    id: "thread-104",
    recruiter: {
      id: "rec-4",
      name: "Marcus Thorne",
      email: "m.thorne@microsoft.com",
      company: "Microsoft ADC (African Development Centre)",
      role: "University & Senior Tech Recruiter",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verified: true,
      activeJobsCount: 8,
      location: "Lagos / Nairobi",
      memberSince: "February 2025",
    },
    subject: "Bejite 2026 Virtual Tech Career Fair & Recruiter Booth",
    category: "follow_up",
    folder: MAIL_FOLDERS.INBOX,
    isStarred: false,
    isRead: false,
    lastActivity: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    messages: [
      {
        id: "msg-104-1",
        senderType: "admin",
        senderName: "Bejite Admin Team",
        senderEmail: "admin@bejite.com",
        to: "m.thorne@microsoft.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        body: `Hi Marcus,

Hope you're well!

We are hosting our annual Bejite Tech Talent Expo featuring over 1,200 verified software developers, devops specialists, and cloud architects. Microsoft ADC has been one of our most valued hiring partners.

Would you be interested in reserving a virtual recruiter booth and keynote slot?

Best regards,
Bejite Events & Partnerships`,
        deliveryStatus: "Opened",
        attachments: [],
      },
      {
        id: "msg-104-2",
        senderType: "recruiter",
        senderName: "Marcus Thorne",
        senderEmail: "m.thorne@microsoft.com",
        to: "admin@bejite.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        body: `Hi Bejite Team,

Thanks for the invitation! We would definitely be interested in the Cloud & AI booth. 

Could you send over the attendee demographic breakdown and the schedule? Also, will recruiters have the ability to conduct 15-minute speed interviews directly on the platform?

Looking forward to your reply.

Marcus Thorne
Microsoft ADC Recruiting`,
        deliveryStatus: "Received",
        attachments: [],
      },
    ],
  },
  {
    id: "thread-105",
    recruiter: {
      id: "rec-5",
      name: "Amara Okonkwo",
      email: "amara@kuda.com",
      company: "Kuda Microfinance Bank",
      role: "Talent Sourcing Lead",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
      verified: false,
      activeJobsCount: 1,
      location: "Lagos, Nigeria",
      memberSince: "May 2025",
    },
    subject: "Kuda Tech Hiring & Candidate Retention Strategy",
    category: "active_hiring",
    folder: MAIL_FOLDERS.DRAFTS,
    isStarred: false,
    isRead: true,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    messages: [
      {
        id: "msg-105-1",
        senderType: "admin",
        senderName: "Bejite Admin Team",
        senderEmail: "admin@bejite.com",
        to: "amara@kuda.com",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        body: `Hi Amara,

Drafting this quick note to check in on Kuda's mobile development roles. We noticed your iOS engineer posting has had over 60 applications...`,
        deliveryStatus: "Draft",
        attachments: [],
      },
    ],
  },
];

// Helper to load threads from LocalStorage with fallback to seed data
export const getStoredThreads = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_THREADS));
      return SEED_THREADS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_THREADS;
  } catch (e) {
    console.error("Failed to parse stored recruiter mail threads:", e);
    return SEED_THREADS;
  }
};

export const saveStoredThreads = (threads) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch (e) {
    console.error("Failed to save recruiter mail threads:", e);
  }
};

const DEFAULT_RECRUITERS = [
  {
    id: "rec-1",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@moniepoint.com",
    company: "Moniepoint Inc.",
    role: "Lead Technical Recruiter",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    verified: true,
    activeJobsCount: 4,
    location: "Lagos, Nigeria (Hybrid)",
    memberSince: "March 2025",
    phone: "+234 801 234 5678",
  },
  {
    id: "rec-2",
    name: "David Adeyemi",
    email: "david.a@paystack.com",
    company: "Paystack Payments",
    role: "Head of People & Recruiting",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    verified: true,
    activeJobsCount: 6,
    location: "San Francisco / Lagos (Remote)",
    memberSince: "January 2025",
    phone: "+234 802 345 6789",
  },
  {
    id: "rec-3",
    name: "Elena Vance",
    email: "elena.vance@flutterwavego.com",
    company: "Flutterwave",
    role: "Talent Acquisition Partner",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    verified: true,
    activeJobsCount: 2,
    location: "Nairobi, Kenya",
    memberSince: "April 2025",
    phone: "+254 712 345 678",
  },
  {
    id: "rec-4",
    name: "Marcus Thorne",
    email: "m.thorne@microsoft.com",
    company: "Microsoft ADC (African Development Centre)",
    role: "University & Senior Tech Recruiter",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    verified: true,
    activeJobsCount: 8,
    location: "Lagos / Nairobi",
    memberSince: "February 2025",
    phone: "+234 803 456 7890",
  },
  {
    id: "rec-5",
    name: "Amara Okonkwo",
    email: "amara@kuda.com",
    company: "Kuda Microfinance Bank",
    role: "Talent Sourcing Lead",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    verified: false,
    activeJobsCount: 1,
    location: "Lagos, Nigeria",
    memberSince: "May 2025",
    phone: "+234 804 567 8901",
  },
  {
    id: "rec-6",
    name: "Tunde Bakare",
    email: "tunde.bakare@interswitchgroup.com",
    company: "Interswitch Group",
    role: "Group Talent Director",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    verified: true,
    activeJobsCount: 5,
    location: "Lagos, Nigeria",
    memberSince: "December 2024",
    phone: "+234 805 678 9012",
  },
  {
    id: "rec-7",
    name: "Zainab Aliyu",
    email: "zainab.a@opay-inc.com",
    company: "OPay Digital Services",
    role: "Senior Tech Talent Partner",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    verified: true,
    activeJobsCount: 3,
    location: "Abuja / Lagos (Hybrid)",
    memberSince: "June 2025",
    phone: "+234 806 789 0123",
  },
  {
    id: "rec-8",
    name: "Kofi Mensah",
    email: "kofi.mensah@andela.com",
    company: "Andela",
    role: "Principal Talent Matcher",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    verified: true,
    activeJobsCount: 7,
    location: "Accra, Ghana (Remote)",
    memberSince: "January 2025",
    phone: "+233 24 123 4567",
  },
];

export const fetchRecruitersDirectory = async () => {
  return DEFAULT_RECRUITERS;
};

// Templates
export const getStoredTemplates = () => {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(DEFAULT_TEMPLATES));
      return DEFAULT_TEMPLATES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_TEMPLATES;
  }
};

export const saveStoredTemplates = (templates) => {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error("Failed to save templates:", e);
  }
};

// Recruiter Notes
export const getRecruiterNotes = (recruiterEmail) => {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    const notes = raw ? JSON.parse(raw) : {};
    return notes[recruiterEmail.toLowerCase()] || "";
  } catch (e) {
    return "";
  }
};

export const saveRecruiterNotes = (recruiterEmail, noteText) => {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    const notes = raw ? JSON.parse(raw) : {};
    notes[recruiterEmail.toLowerCase()] = noteText;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error("Failed to save recruiter note:", e);
  }
};

// Send an outreach email or reply
export const sendRecruiterMessage = async ({
  threadId,
  toEmail,
  toName,
  company,
  subject,
  body,
  attachments = [],
  adminUser = null,
}) => {
  const threads = getStoredThreads();
  const now = new Date().toISOString();
  const adminDisplayName = [adminUser?.firstName, adminUser?.lastName].filter(Boolean).join(" ") || "Bejite Admin";
  const adminEmail = adminUser?.email || "admin@bejite.com";

  let targetThread = null;

  if (threadId) {
    targetThread = threads.find((t) => t.id === threadId);
  }

  // If thread doesn't exist, create a new one in SENT folder
  if (!targetThread) {
    const newThreadId = `thread-${Date.now()}`;
    const newRecruiter = {
      id: `rec-${Date.now()}`,
      name: toName || toEmail.split("@")[0],
      email: toEmail,
      company: company || "Independent Recruiter",
      role: "Talent Partner",
      avatar: null,
      verified: true,
      activeJobsCount: 1,
      location: "Verified Platform Recruiter",
      memberSince: "2025",
    };

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderType: "admin",
      senderName: adminDisplayName,
      senderEmail: adminEmail,
      to: toEmail,
      timestamp: now,
      body,
      deliveryStatus: "Delivered",
      attachments,
    };

    targetThread = {
      id: newThreadId,
      recruiter: newRecruiter,
      subject,
      category: "active_hiring",
      folder: MAIL_FOLDERS.SENT,
      isStarred: false,
      isRead: true,
      lastActivity: now,
      messages: [newMsg],
    };

    threads.unshift(targetThread);
  } else {
    // Append to existing thread
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderType: "admin",
      senderName: adminDisplayName,
      senderEmail: adminEmail,
      to: targetThread.recruiter.email,
      timestamp: now,
      body,
      deliveryStatus: "Delivered",
      attachments,
    };

    targetThread.messages.push(newMsg);
    targetThread.lastActivity = now;
    // Mark as sent folder or keep in inbox if conversation is active
    if (targetThread.folder === MAIL_FOLDERS.DRAFTS) {
      targetThread.folder = MAIL_FOLDERS.SENT;
    }
  }

  saveStoredThreads(threads);
  return targetThread;
};

// Simulate Recruiter Reply in real-time (for demo and interactive testing)
export const simulateRecruiterReply = (threadId, customReplyText = null) => {
  const threads = getStoredThreads();
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return null;

  const now = new Date().toISOString();
  const recruiter = thread.recruiter;

  const sampleResponses = [
    `Hi ${recruiter.name.split(" ")[0]} here! Thank you so much for the detailed information. We'd love to review the candidate profiles. Can you send over their GitHub and portfolio links?`,
    `Hello! Thanks for reaching out. We actually have an urgent requirement for this role starting next month. What are their salary expectations and notice periods?`,
    `Great connecting with you! We've evaluated the candidate specs you provided and our VP of Engineering would like to speak with them. When are they available for a technical round?`,
    `Thank you for following up! We are reviewing the partnership details and will have our HR team finalize the verification documentation by tomorrow afternoon.`,
  ];

  const replyBody = customReplyText || sampleResponses[Math.floor(Math.random() * sampleResponses.length)];

  const newMsg = {
    id: `msg-reply-${Date.now()}`,
    senderType: "recruiter",
    senderName: recruiter.name,
    senderEmail: recruiter.email,
    to: "admin@bejite.com",
    timestamp: now,
    body: replyBody,
    deliveryStatus: "Received",
    attachments: [],
  };

  thread.messages.push(newMsg);
  thread.lastActivity = now;
  thread.folder = MAIL_FOLDERS.INBOX; // Bring to inbox
  thread.isRead = false; // Mark unread for badge notification

  // Move thread to the top of the list
  const idx = threads.findIndex((t) => t.id === threadId);
  if (idx > -1) {
    threads.splice(idx, 1);
    threads.unshift(thread);
  }

  saveStoredThreads(threads);
  return { thread, newMsg };
};
