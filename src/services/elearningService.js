import { getUser } from "../utils/tokenManager";

export function isJobseekerAccount(user) {
  if (!user || typeof user !== "object") return false;
  return String(user.role || "").trim().toLowerCase() === "jobseeker";
}

const DEFAULT_COURSES = [
  {
    id: "digital-marketing-fundamentals",
    title: "Digital Marketing Fundamentals",
    category: "Marketing & Growth",
    categoryUpper: "MARKETING & GROWTH",
    level: "Beginner Level",
    levelShort: "Beginner",
    levelUpper: "BEGINNER LEVEL",
    accessLabel: "Free Course",
    priceBadge: "Free",
    isPaid: false,
    partnerId: "digital-growth-academy",
    partnerName: "Digital Growth Academy",
    partnerDescription:
      "Employer & Skill Partner offering practical, employer-vetted digital marketing and growth curriculums.",
    summary:
      "Learn the basics of digital marketing, including audiences, content, and campaign planning.",
    totalDurationLabel: "Approx. 2h total content",
    enrolledByDefault: true,
    defaultCompletedLessonIds: ["dmf-l1", "dmf-l2", "dmf-l3"],
    defaultCurrentLessonId: "dmf-l4",
    learningOutcomes: [
      "Explain what digital marketing means.",
      "Identify a target audience.",
      "Choose suitable content for a simple campaign.",
      "Outline a basic campaign plan.",
    ],
    modules: [
      {
        id: "dmf-m1",
        code: "MODULE 1",
        title: "Module 1: Introduction to Digital Marketing",
        description:
          "Understand core concepts of digital marketing channels and workflows.",
        lessons: [
          {
            id: "dmf-l1",
            title: "What Digital Marketing Means",
            type: "Reading",
            durationMinutes: 15,
            summary:
              "Understand digital marketing and how businesses use digital channels to reach their audiences.",
            sectionHeading: "Introduction to Modern Digital Marketing",
            videoDuration: "04:15",
            bodyParagraphs: [
              "Digital marketing encompasses every marketing effort that uses internet-connected devices and online channels—such as search engines, social platforms, email newsletters, and websites—to connect with prospective and current customers.",
              "Unlike traditional offline billboards or print ads, digital channels enable measurable two-way engagement, precise audience targeting, and rapid creative iteration.",
            ],
            takeaways: [
              "Digital marketing uses digital channels to promote products, services, or brands.",
              "Businesses choose channels based on their goals and audiences.",
              "Different channels can support different parts of a marketing campaign.",
            ],
          },
          {
            id: "dmf-l2",
            title: "Common Digital Marketing Channels",
            type: "Video",
            durationMinutes: 20,
            summary:
              "Explore the strengths of social, search, email, and content channels.",
            sectionHeading: "Comparing Core Acquisition & Retention Channels",
            videoDuration: "06:40",
            bodyParagraphs: [
              "High-performing marketing teams combine organic discovery channels (SEO and social content) with direct relationship channels (email and community) and paid amplification.",
              "Selecting the right channel mix starts with understanding where your audience spends time and how they evaluate solutions.",
            ],
            takeaways: [
              "Search channels capture high-intent prospects actively looking for answers.",
              "Social media builds brand awareness, community trust, and top-of-funnel reach.",
              "Email marketing drives repeat engagement and measurable conversion.",
            ],
          },
        ],
      },
      {
        id: "dmf-m2",
        code: "MODULE 2",
        title: "Module 2: Understanding Your Audience",
        description:
          "Segment customer personas and align messaging with audience goals.",
        lessons: [
          {
            id: "dmf-l3",
            title: "Identifying a Target Audience",
            type: "Reading",
            durationMinutes: 25,
            summary:
              "Define clear audience segments using goals, pain points, and buying triggers.",
            sectionHeading: "Building Practical Audience Personas",
            videoDuration: "05:20",
            bodyParagraphs: [
              "A target audience is a specific group of people most likely to benefit from your product or service. Defining demographics, job roles, motivations, and frustrations prevents wasted spend.",
              "Strong audience research relies on customer interviews, search trends, and support conversations rather than guesswork.",
            ],
            takeaways: [
              "Specific audience personas outperform broad, generic messaging.",
              "Focus on audience pain points, desired outcomes, and decision triggers.",
              "Validate audience assumptions using real customer feedback and analytics.",
            ],
          },
          {
            id: "dmf-l4",
            title: "Choosing Content for an Audience",
            type: "Reading",
            durationMinutes: 20,
            summary:
              "Match educational, comparison, and action-oriented formats to buyer readiness.",
            sectionHeading: "Aligning Content Formats with Audience Intent",
            videoDuration: "05:50",
            bodyParagraphs: [
              "Once you know who you are speaking to, choose formats they naturally consume—short-form video reels for discovery, practical guides for evaluation, and clear case studies for decision-making.",
              "Every piece of campaign content should have one clear takeaway and a single next step.",
            ],
            takeaways: [
              "Match content format and depth to your audience's stage of awareness.",
              "Lead with clear value and problem-solving before pitching an offer.",
              "Pair every content asset with a clear, measurable call to action.",
            ],
          },
        ],
      },
      {
        id: "dmf-m3",
        code: "MODULE 3",
        title: "Module 3: Planning a Simple Campaign",
        description:
          "Set measurable goals and assemble a ready-to-launch checklist.",
        lessons: [
          {
            id: "dmf-l5",
            title: "Setting a Campaign Goal",
            type: "Exercise",
            durationMinutes: 15,
            summary:
              "Translate business objectives into measurable SMART campaign targets.",
            sectionHeading: "Defining SMART Marketing Objectives",
            videoDuration: "04:30",
            bodyParagraphs: [
              "Every effective campaign anchors on one primary metric—such as qualified sign-ups, demo requests, or event registrations—within a defined timeframe.",
              "Clear baseline benchmarks help teams evaluate what worked and optimize future launches.",
            ],
            takeaways: [
              "Tie campaign KPIs directly to a concrete business outcome.",
              "Set specific numeric targets and a clear campaign timeline.",
              "Avoid tracking vanity metrics without conversion context.",
            ],
          },
          {
            id: "dmf-l6",
            title: "Creating a Basic Campaign Outline",
            type: "Exercise",
            durationMinutes: 30,
            summary:
              "Bring audience, core message, channel mix, and timeline into one brief.",
            sectionHeading: "Structuring Your One-Page Campaign Plan",
            videoDuration: "07:10",
            bodyParagraphs: [
              "A concise campaign brief aligns writers, designers, and stakeholders around the who, what, where, and why of your launch.",
              "Documenting your core hook, primary channels, publishing cadence, and success metric prepares you for the Practical Portfolio Deliverable.",
            ],
            takeaways: [
              "A one-page campaign outline keeps cross-functional execution aligned.",
              "Combine persona, core value proposition, channels, and KPIs clearly.",
              "Review results post-launch to turn every campaign into a learning loop.",
            ],
          },
        ],
      },
    ],
    quiz: {
      id: "dmf-quiz",
      title: "Digital Marketing Basics Quiz",
      description:
        "Answer key questions to check your understanding of digital marketing audiences, channels, and planning.",
      passMark: 80,
      allowedAttempts: "Unlimited",
      questions: [
        {
          id: "q1",
          prompt:
            "What is the primary advantage of defining a specific target audience before launching a campaign?",
          options: [
            "It guarantees viral reach on every social network automatically",
            "It aligns messaging and channel selection with the people most likely to convert",
            "It eliminates the need to measure campaign performance",
            "It replaces product or service quality",
          ],
          correctIndex: 1,
        },
        {
          id: "q2",
          prompt:
            "Which channel is strongest for capturing prospects who are actively searching for a specific solution right now?",
          options: [
            "Search engines (SEO & Search Ads)",
            "Offline print flyers only",
            "Unsegmented cold broadcasts",
            "Internal team memos",
          ],
          correctIndex: 0,
        },
        {
          id: "q3",
          prompt:
            "Which element belongs in a well-structured one-page digital marketing campaign brief?",
          options: [
            "Only a list of competitor logos",
            "Target persona, primary SMART goal, key channels, and core message",
            "Random daily posts with no call to action",
            "A 50-page unmeasured brainstorm",
          ],
          correctIndex: 1,
        },
      ],
    },
    deliverable: {
      id: "dmf-project",
      title: "Mini Campaign Brief",
      badge: "Portfolio Deliverable",
      subtitle: "Submit your hands-on deliverable.",
      instructions:
        "Prepare a 1-page campaign brief outlining chosen target persona, primary campaign goal, key channels, and sample messaging.",
    },
  },
  {
    id: "social-media-content-planning",
    title: "Social Media Content Planning",
    category: "Content & Social Media",
    categoryUpper: "CONTENT & SOCIAL MEDIA",
    level: "Beginner Level",
    levelShort: "Beginner",
    levelUpper: "BEGINNER LEVEL",
    accessLabel: "Free Course",
    priceBadge: "Free",
    isPaid: false,
    partnerId: "digital-growth-academy",
    partnerName: "Digital Growth Academy",
    partnerDescription:
      "Employer & Skill Partner offering practical, employer-vetted digital marketing and growth curriculums.",
    summary:
      "Learn how to organize content pillars, build a realistic editorial calendar, and measure engagement across social platforms.",
    totalDurationLabel: "Approx. 1h 25m total content",
    enrolledByDefault: true,
    defaultCompletedLessonIds: ["smcp-l1", "smcp-l2"],
    defaultCurrentLessonId: "smcp-l3",
    learningOutcomes: [
      "Define 3–4 repeatable brand content pillars.",
      "Map weekly social formats to audience engagement goals.",
      "Write clear hooks and captions for short-form posts.",
      "Build a 2-week publishing calendar workflow.",
    ],
    modules: [
      {
        id: "smcp-m1",
        code: "MODULE 1",
        title: "Module 1: Content Pillars & Audience Hooks",
        description:
          "Establish clear content themes that educate, inspire, and convert.",
        lessons: [
          {
            id: "smcp-l1",
            title: "Defining Brand Content Pillars",
            type: "Reading",
            durationMinutes: 20,
            summary:
              "Structure repeatable topic themes so you never run out of relevant post ideas.",
            sectionHeading: "Why Content Pillars Matter",
            videoDuration: "04:45",
            bodyParagraphs: [
              "Content pillars are 3 to 5 core themes your brand consistently teaches or showcases, bridging what your audience cares about with your product expertise.",
              "Balancing educational tutorials, proof-of-work stories, and community discussions builds steady authority.",
            ],
            takeaways: [
              "Anchor social strategy in 3–5 clear, repeatable content pillars.",
              "Balance educational value, credibility proof, and clear calls to action.",
              "Keep pillar themes tied directly to audience problems.",
            ],
          },
          {
            id: "smcp-l2",
            title: "Writing Scroll-Stopping Hooks",
            type: "Video",
            durationMinutes: 20,
            summary:
              "Craft clear opening lines and visual cues that earn attention in busy feeds.",
            sectionHeading: "Clarity Over Clickbait",
            videoDuration: "05:15",
            bodyParagraphs: [
              "The first two seconds of a video or first line of a post determine whether a reader stops scrolling. Lead with a specific outcome, counter-intuitive insight, or relatable challenge.",
            ],
            takeaways: [
              "Open with a specific problem or clear outcome in the first line.",
              "Keep sentences scannable with clean formatting.",
              "Deliver fully on the promise made in your hook.",
            ],
          },
        ],
      },
      {
        id: "smcp-m2",
        code: "MODULE 2",
        title: "Module 2: Editorial Calendars & Analytics",
        description:
          "Turn sporadic posting into a sustainable weekly publishing workflow.",
        lessons: [
          {
            id: "smcp-l3",
            title: "Building a Two-Week Content Calendar",
            type: "Reading",
            durationMinutes: 20,
            summary:
              "Batch-plan topics, formats, owners, and publish dates in one view.",
            sectionHeading: "Designing a Sustainable Cadence",
            videoDuration: "05:00",
            bodyParagraphs: [
              "Consistency beats short bursts of daily posting followed by silence. A structured 2-week calendar lets you batch-write copy, prepare visuals early, and maintain quality.",
            ],
            takeaways: [
              "Choose a realistic weekly cadence you can sustain consistently.",
              "Assign a pillar, format, and goal to every scheduled post.",
              "Batch creation reduces context switching and last-minute stress.",
            ],
          },
          {
            id: "smcp-l4",
            title: "Reviewing Post Engagement Metrics",
            type: "Exercise",
            durationMinutes: 25,
            summary:
              "Evaluate saves, shares, comments, and profile clicks to refine next month's plan.",
            sectionHeading: "Turning Social Signals into Decisions",
            videoDuration: "06:10",
            bodyParagraphs: [
              "High saves and shares signal strong educational resonance, while profile visits and link clicks indicate conversion intent.",
            ],
            takeaways: [
              "Track saves and shares to measure genuine content utility.",
              "Monitor profile visits and link clicks for conversion intent.",
              "Double down on top-performing pillars every two weeks.",
            ],
          },
        ],
      },
    ],
    quiz: {
      id: "smcp-quiz",
      title: "Social Content Planning Quiz",
      description:
        "Verify your grasp of content pillars, hooks, editorial batching, and engagement signals.",
      passMark: 80,
      allowedAttempts: "Unlimited",
      questions: [
        {
          id: "sq1",
          prompt: "What is the main purpose of establishing 3–5 content pillars?",
          options: [
            "To post identical copy every day",
            "To organize consistent, relevant topics aligned with audience needs and brand goals",
            "To avoid replying to comments",
            "To replace visual design",
          ],
          correctIndex: 1,
        },
        {
          id: "sq2",
          prompt: "Which metric best indicates that readers found an educational post worth revisiting?",
          options: ["Saves / Bookmarks", "Font size", "Post time zone", "Draft count"],
          correctIndex: 0,
        },
        {
          id: "sq3",
          prompt: "What makes a social publishing cadence effective long-term?",
          options: [
            "Posting 15 times on one day and pausing for a month",
            "A realistic, consistent schedule supported by batched preparation",
            "Skipping audience research",
            "Never reviewing analytics",
          ],
          correctIndex: 1,
        },
      ],
    },
    deliverable: {
      id: "smcp-project",
      title: "7-Day Content Calendar Plan",
      badge: "Portfolio Deliverable",
      subtitle: "Submit your structured 7-day content schedule.",
      instructions:
        "Submit a 7-day social content plan listing 3 content pillars, post headlines/hooks, chosen formats, and target call-to-action.",
    },
  },
  {
    id: "intermediate-digital-marketing",
    title: "Intermediate Digital Marketing",
    category: "Marketing & Growth",
    categoryUpper: "MARKETING & GROWTH",
    level: "Intermediate Level",
    levelShort: "Intermediate",
    levelUpper: "INTERMEDIATE LEVEL",
    accessLabel: "Paid Course",
    priceBadge: "Paid Course",
    isPaid: true,
    partnerId: "digital-growth-academy",
    partnerName: "Digital Growth Academy",
    partnerDescription:
      "Employer & Skill Partner offering practical, employer-vetted digital marketing and growth curriculums.",
    summary:
      "Build full-funnel conversion journeys, manage performance campaign budgets, optimize landing pages, and measure ROI.",
    totalDurationLabel: "Approx. 2h 15m total content",
    enrolledByDefault: false,
    defaultCompletedLessonIds: [],
    defaultCurrentLessonId: "idm-l1",
    learningOutcomes: [
      "Map full-funnel acquisition and conversion stages.",
      "Audit landing page clarity and conversion friction.",
      "Calculate CPA, ROAS, and funnel drop-off rates.",
      "Design structured A/B experiments.",
    ],
    modules: [
      {
        id: "idm-m1",
        code: "MODULE 1",
        title: "Module 1: Funnel Architecture & Conversion Optimization",
        description:
          "Diagnose drop-offs from ad click to landing page conversion.",
        lessons: [
          {
            id: "idm-l1",
            title: "Mapping Full-Funnel Customer Journeys",
            type: "Reading",
            durationMinutes: 30,
            summary:
              "Connect awareness touchpoints with activation and retention milestones.",
            sectionHeading: "Designing Cohesive Funnel Stages",
            videoDuration: "06:30",
            bodyParagraphs: [
              "Intermediate growth marketers look beyond single-click metrics to understand how prospects progress from initial discovery to activated, retained customers.",
            ],
            takeaways: [
              "Align message match between ad creative and landing page headline.",
              "Measure conversion rate between each funnel stage to spot bottlenecks.",
              "Pair acquisition campaigns with clear onboarding follow-up.",
            ],
          },
          {
            id: "idm-l2",
            title: "Landing Page Messaging & Friction Audits",
            type: "Video",
            durationMinutes: 35,
            summary:
              "Improve conversion rates with clear value propositions, trust proof, and streamlined forms.",
            sectionHeading: "High-Converting Landing Page Anatomy",
            videoDuration: "08:15",
            bodyParagraphs: [
              "Visitors decide within seconds whether a landing page matches their intent. Clear headlines, specific social proof, and minimal form friction lift conversions dramatically.",
            ],
            takeaways: [
              "Keep above-the-fold headlines outcome-focused and specific.",
              "Place customer proof near key decision points.",
              "Remove unnecessary form fields that create drop-off.",
            ],
          },
        ],
      },
      {
        id: "idm-m2",
        code: "MODULE 2",
        title: "Module 2: Performance Metrics & Experimentation",
        description:
          "Manage CPA/ROAS targets and run disciplined creative tests.",
        lessons: [
          {
            id: "idm-l3",
            title: "Understanding CAC, CPA, and Attribution",
            type: "Reading",
            durationMinutes: 35,
            summary:
              "Evaluate unit economics so paid and organic investments remain profitable.",
            sectionHeading: "Unit Economics for Growth Teams",
            videoDuration: "07:05",
            bodyParagraphs: [
              "Tracking Cost Per Acquisition (CPA) alongside customer lifetime value ensures growth campaigns scale sustainably.",
            ],
            takeaways: [
              "Compare CPA against customer value before scaling spend.",
              "Use UTM parameters consistently across every campaign link.",
              "Combine quantitative attribution with qualitative user " +
                "discovery.",
            ],
          },
          {
            id: "idm-l4",
            title: "Designing Clean A/B Hypotheses",
            type: "Exercise",
            durationMinutes: 35,
            summary:
              "Prioritize high-impact experiments and avoid false positives.",
            sectionHeading: "Structured Growth Experimentation",
            videoDuration: "06:45",
            bodyParagraphs: [
              "Strong experiments test a single clear variable backed by user behavior evidence—such as headline framing or CTA offer—rather than random tweaks.",
            ],
            takeaways: [
              "Write a clear 'If we change X, then Y will improve because Z' hypothesis.",
              "Change one primary variable per test to isolate impact.",
              "Document learnings from both winning and losing variants.",
            ],
          },
        ],
      },
    ],
    quiz: {
      id: "idm-quiz",
      title: "Growth & Funnel Optimization Quiz",
      description:
        "Assess your mastery of funnel diagnostics, message match, unit economics, and A/B testing.",
      passMark: 80,
      allowedAttempts: "Unlimited",
      questions: [
        {
          id: "iq1",
          prompt: "What does 'message match' refer to in conversion marketing?",
          options: [
            "Using the exact promise and context from an ad on the destination landing page",
            "Sending duplicate emails",
            "Matching brand colors only",
            "Hiding pricing details",
          ],
          correctIndex: 0,
        },
        {
          id: "iq2",
          prompt: "Why should an A/B test isolate one primary variable at a time?",
          options: [
            "To make pages load slower",
            "So you can accurately attribute performance changes to that specific change",
            "To avoid setting a goal",
            "To skip analytics tracking",
          ],
          correctIndex: 1,
        },
        {
          id: "iq3",
          prompt: "Which tagging standard helps track campaign sources accurately in analytics?",
          options: ["UTM parameters", "CSS classes", "File extensions", "Alt tags"],
          correctIndex: 0,
        },
      ],
    },
    deliverable: {
      id: "idm-project",
      title: "Landing Page & Funnel Optimization Audit",
      badge: "Portfolio Deliverable",
      subtitle: "Submit your conversion audit & experiment plan.",
      instructions:
        "Audit a sample landing page funnel: identify 3 conversion bottlenecks and propose 2 prioritized A/B test hypotheses with target KPIs.",
    },
  },
  {
    id: "career-portfolio-interview-readiness",
    title: "Technical & Portfolio Interview Readiness",
    category: "Career Readiness",
    categoryUpper: "CAREER READINESS",
    level: "Beginner Level",
    levelShort: "Beginner",
    levelUpper: "BEGINNER LEVEL",
    accessLabel: "Free Course",
    priceBadge: "Free",
    isPaid: false,
    partnerId: "bejite-talent-lab",
    partnerName: "Bejite Talent Lab",
    partnerDescription:
      "Official Bejite career acceleration partner helping jobseekers showcase verified project evidence to recruiters.",
    summary:
      "Structure impact-driven case studies, record standout 24h pitches, and communicate project outcomes clearly in interviews.",
    totalDurationLabel: "Approx. 1h 30m total content",
    enrolledByDefault: true,
    defaultCompletedLessonIds: ["cpir-l1", "cpir-l2"],
    defaultCurrentLessonId: "cpir-l3",
    learningOutcomes: [
      "Present project outcomes using the STAR framework.",
      "Record a concise, high-impact 60-second talent pitch.",
      "Answer behavioral and role-fit questions with confidence.",
      "Follow up professionally at every pipeline stage.",
    ],
    modules: [
      {
        id: "cpir-m1",
        code: "MODULE 1",
        title: "Module 1: Evidence-Driven Portfolios & Pitches",
        description:
          "Turn completed projects into clear proof of capability for hiring teams.",
        lessons: [
          {
            id: "cpir-l1",
            title: "Structuring Case Studies Recruiters Read",
            type: "Reading",
            durationMinutes: 20,
            summary:
              "Highlight problem context, your specific contribution, and measurable outcomes.",
            sectionHeading: "What Hiring Managers Scan First",
            videoDuration: "04:50",
            bodyParagraphs: [
              "Recruiters review dozens of profiles quickly. Leading with the business problem, your concrete execution steps, and the outcome makes your work immediately memorable.",
            ],
            takeaways: [
              "Lead with problem context and measurable impact.",
              "Clarify your exact individual role vs. team work.",
              "Keep portfolio visuals crisp and scannable.",
            ],
          },
          {
            id: "cpir-l2",
            title: "Recording a High-Impact Talent Pitch",
            type: "Video",
            durationMinutes: 25,
            summary:
              "Craft a natural 60-second video pitch showcasing your core strengths and target role.",
            sectionHeading: "Delivering a Confident 60-Second Pitch",
            videoDuration: "05:30",
            bodyParagraphs: [
              "A great Bejite video pitch introduces your specialty, shares one concrete achievement, and states the exact role you are ready to contribute to next.",
            ],
            takeaways: [
              "Hook viewers in the first 10 seconds with your core specialty.",
              "Share one concrete result or project highlight.",
              "Close with the specific role and impact you bring.",
            ],
          },
        ],
      },
      {
        id: "cpir-m2",
        code: "MODULE 2",
        title: "Module 2: Structured Interview Execution",
        description:
          "Navigate screening calls and panel stages with structured clarity.",
        lessons: [
          {
            id: "cpir-l3",
            title: "Mastering Behavioral & Scenario Questions",
            type: "Reading",
            durationMinutes: 25,
            summary:
              "Use Situation, Task, Action, and Result to deliver focused interview answers.",
            sectionHeading: "Applying the STAR Method Naturally",
            videoDuration: "05:40",
            bodyParagraphs: [
              "Structured answers prevent rambling under pressure. Spend 20% of your answer on context, 50% on your specific actions, and 30% on outcomes and lessons learned.",
            ],
            takeaways: [
              "Keep situation setup brief and spend most time on your actions.",
              "Quantify outcomes wherever possible.",
              "Prepare 4 adaptable stories covering teamwork, ownership, and problem-solving.",
            ],
          },
          {
            id: "cpir-l4",
            title: "Asking Insightful Questions to Interviewers",
            type: "Exercise",
            durationMinutes: 20,
            summary:
              "Evaluate team culture, 90-day expectations, and success criteria thoughtfully.",
            sectionHeading: "Turning Interviews into Two-Way Conversations",
            videoDuration: "04:20",
            bodyParagraphs: [
              "Thoughtful questions at the end of an interview demonstrate strategic curiosity and genuine preparation.",
            ],
            takeaways: [
              "Ask what success looks like in the first 60–90 days.",
              "Explore current team priorities and collaboration workflows.",
              "Send a concise, specific thank-you note within 24 hours.",
            ],
          },
        ],
      },
    ],
    quiz: {
      id: "cpir-quiz",
      title: "Interview & Portfolio Readiness Quiz",
      description:
        "Check your understanding of case study framing, pitch structure, and STAR interview responses.",
      passMark: 80,
      allowedAttempts: "Unlimited",
      questions: [
        {
          id: "cq1",
          prompt: "In the STAR interview framework, which part should receive the most detail?",
          options: [
            "Your specific Actions and measurable Results",
            "Unrelated background history",
            "Company Wikipedia trivia",
            "Generic buzzwords",
          ],
          correctIndex: 0,
        },
        {
          id: "cq2",
          prompt: "What makes a portfolio case study stand out to recruiters?",
          options: [
            "Clear problem context, your specific execution, and concrete outcomes",
            "Screenshots with zero explanation",
            "Listing every tool without showing a project",
            "Hidden contact details",
          ],
          correctIndex: 0,
        },
        {
          id: "cq3",
          prompt: "What is a strong closing question to ask an interviewer?",
          options: [
            "What does success in this role look like over the first 90 days?",
            "What does your company do?",
            "Did I pass?",
            "No questions at all",
          ],
          correctIndex: 0,
        },
      ],
    },
    deliverable: {
      id: "cpir-project",
      title: "STAR Case Study & 60s Pitch Script",
      badge: "Portfolio Deliverable",
      subtitle: "Submit one STAR story and your 60-second pitch outline.",
      instructions:
        "Write a concise 60-second pitch script for your target role plus one STAR-formatted project achievement summary.",
    },
  },
];

const STORAGE_PREFIX = "bejite:elearning-progress:v1";

function getStorageKey() {
  const user = getUser();
  const id = String(user?.id || user?._id || user?.email || "guest")
    .trim()
    .toLowerCase();
  return `${STORAGE_PREFIX}:${id || "guest"}`;
}

function buildDefaultState() {
  const courses = {};
  for (const course of DEFAULT_COURSES) {
    courses[course.id] = {
      enrolled: Boolean(course.enrolledByDefault),
      completedLessonIds: [...(course.defaultCompletedLessonIds || [])],
      currentLessonId:
        course.defaultCurrentLessonId ||
        course.modules?.[0]?.lessons?.[0]?.id ||
        null,
      quiz: {
        attempts: 0,
        latestScore: null,
        bestScore: null,
        passed: false,
      },
      deliverable: {
        submitted: false,
        status: "Not Submitted",
        content: "",
        portfolioUrl: "",
        submittedAt: null,
      },
    };
  }
  return { courses };
}

function readProgressStore() {
  const defaults = buildDefaultState();
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.courses) {
      return defaults;
    }

    const merged = { courses: { ...defaults.courses } };
    for (const [courseId, saved] of Object.entries(parsed.courses)) {
      if (!saved || typeof saved !== "object") continue;
      const base = defaults.courses[courseId] || {
        enrolled: false,
        completedLessonIds: [],
        currentLessonId: null,
        quiz: { attempts: 0, latestScore: null, bestScore: null, passed: false },
        deliverable: {
          submitted: false,
          status: "Not Submitted",
          content: "",
          portfolioUrl: "",
          submittedAt: null,
        },
      };
      merged.courses[courseId] = {
        ...base,
        ...saved,
        quiz: { ...base.quiz, ...(saved.quiz || {}) },
        deliverable: { ...base.deliverable, ...(saved.deliverable || {}) },
      };
    }
    return merged;
  } catch {
    return defaults;
  }
}

function writeProgressStore(store) {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(store));
  } catch {
    // Ignore quota issues
  }
}

export function flattenCourseLessons(course) {
  if (!course?.modules) return [];
  const flat = [];
  for (const mod of course.modules) {
    for (const lesson of mod.lessons || []) {
      flat.push({
        ...lesson,
        moduleId: mod.id,
        moduleCode: mod.code,
        moduleTitle: mod.title,
      });
    }
  }
  return flat;
}

export function enrichCourseWithProgress(course, courseState) {
  const allLessons = flattenCourseLessons(course);
  const totalLessons = allLessons.length;
  const completedSet = new Set(courseState?.completedLessonIds || []);
  const completedLessonsCount = allLessons.filter((l) =>
    completedSet.has(l.id)
  ).length;

  const nextUnfinished =
    allLessons.find((l) => !completedSet.has(l.id)) || allLessons[0] || null;
  const currentLesson =
    allLessons.find((l) => l.id === courseState?.currentLessonId) ||
    nextUnfinished;

  const lessonsSatisfied =
    totalLessons > 0 && completedLessonsCount >= totalLessons;
  const quizSatisfied = Boolean(courseState?.quiz?.passed);
  const deliverableSatisfied = Boolean(courseState?.deliverable?.submitted);

  const criteriaSatisfiedCount =
    (lessonsSatisfied ? 1 : 0) +
    (quizSatisfied ? 1 : 0) +
    (deliverableSatisfied ? 1 : 0);

  // Weighted overall course progress: lessons (60%) + quiz (20%) + deliverable (20%)
  const lessonRatio =
    totalLessons > 0 ? completedLessonsCount / totalLessons : 0;
  const weightedPercent = Math.round(
    lessonRatio * 60 +
      (quizSatisfied ? 20 : 0) +
      (deliverableSatisfied ? 20 : 0)
  );
  const lessonPercent =
    totalLessons > 0
      ? Math.round((completedLessonsCount / totalLessons) * 100)
      : 0;

  return {
    ...course,
    enrolled: Boolean(courseState?.enrolled),
    totalModules: course.modules?.length || 0,
    totalLessons,
    completedLessonIds: Array.from(completedSet),
    completedLessonsCount,
    lessonPercent,
    overallPercent: weightedPercent,
    nextLesson: nextUnfinished,
    currentLesson,
    quizState: courseState?.quiz || {
      attempts: 0,
      latestScore: null,
      bestScore: null,
      passed: false,
    },
    deliverableState: courseState?.deliverable || {
      submitted: false,
      status: "Not Submitted",
      content: "",
      portfolioUrl: "",
      submittedAt: null,
    },
    criteria: {
      lessonsSatisfied,
      quizSatisfied,
      deliverableSatisfied,
      satisfiedCount: criteriaSatisfiedCount,
      totalCount: 3,
      allComplete: criteriaSatisfiedCount === 3,
    },
  };
}

export function getAllCoursesWithProgress() {
  const store = readProgressStore();
  return DEFAULT_COURSES.map((course) =>
    enrichCourseWithProgress(course, store.courses[course.id])
  );
}

export function getEnrolledCourses() {
  return getAllCoursesWithProgress().filter((c) => c.enrolled);
}

export function getCourseById(courseId) {
  const store = readProgressStore();
  const target =
    DEFAULT_COURSES.find((c) => c.id === courseId) || DEFAULT_COURSES[0];
  if (!target) return null;
  return enrichCourseWithProgress(target, store.courses[target.id]);
}

export function getPartnerCourses(partnerId, excludeCourseId = null) {
  return getAllCoursesWithProgress().filter(
    (c) =>
      (!partnerId || c.partnerId === partnerId) && c.id !== excludeCourseId
  );
}

export function enrollInCourse(courseId) {
  const store = readProgressStore();
  const current = store.courses[courseId] || {};
  store.courses[courseId] = {
    ...current,
    enrolled: true,
  };
  writeProgressStore(store);
  return getCourseById(courseId);
}

export function setCurrentLesson(courseId, lessonId) {
  const store = readProgressStore();
  const current = store.courses[courseId] || {};
  store.courses[courseId] = {
    ...current,
    enrolled: true,
    currentLessonId: lessonId,
  };
  writeProgressStore(store);
  return getCourseById(courseId);
}

export function markLessonCompleted(courseId, lessonId, nextLessonId = null) {
  const store = readProgressStore();
  const current = store.courses[courseId] || {};
  const completed = new Set(current.completedLessonIds || []);
  if (lessonId) completed.add(lessonId);

  store.courses[courseId] = {
    ...current,
    enrolled: true,
    completedLessonIds: Array.from(completed),
    currentLessonId: nextLessonId || current.currentLessonId || lessonId,
  };
  writeProgressStore(store);
  return getCourseById(courseId);
}

export function recordQuizSubmission(courseId, answersMap = {}) {
  const course = DEFAULT_COURSES.find((c) => c.id === courseId);
  if (!course?.quiz) return null;

  const questions = course.quiz.questions || [];
  let correct = 0;
  for (const q of questions) {
    if (Number(answersMap[q.id]) === q.correctIndex) {
      correct += 1;
    }
  }
  const scorePercent =
    questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  const passed = scorePercent >= (course.quiz.passMark || 80);

  const store = readProgressStore();
  const current = store.courses[courseId] || {};
  const prevQuiz = current.quiz || {
    attempts: 0,
    latestScore: null,
    bestScore: null,
    passed: false,
  };
  const bestScore =
    prevQuiz.bestScore == null
      ? scorePercent
      : Math.max(prevQuiz.bestScore, scorePercent);

  store.courses[courseId] = {
    ...current,
    enrolled: true,
    quiz: {
      attempts: (prevQuiz.attempts || 0) + 1,
      latestScore: scorePercent,
      bestScore,
      passed: Boolean(prevQuiz.passed || passed),
    },
  };
  writeProgressStore(store);

  return {
    scorePercent,
    correct,
    total: questions.length,
    passed,
    course: getCourseById(courseId),
  };
}

export function submitCourseDeliverable(
  courseId,
  { content = "", portfolioUrl = "" } = {}
) {
  const trimmed = String(content || "").trim();
  if (!trimmed) {
    throw new Error("Please enter your campaign brief or project summary.");
  }

  const store = readProgressStore();
  const current = store.courses[courseId] || {};
  store.courses[courseId] = {
    ...current,
    enrolled: true,
    deliverable: {
      submitted: true,
      status: "Submitted",
      content: trimmed,
      portfolioUrl: String(portfolioUrl || "").trim(),
      submittedAt: new Date().toISOString(),
    },
  };
  writeProgressStore(store);
  return getCourseById(courseId);
}

