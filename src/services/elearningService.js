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
    totalDurationLabel: "Approx 21 hours of content",
    enrolledByDefault: false,
    defaultCompletedLessonIds: [],
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
          {
            id: "dmf-l4b",
            title: "Validating Audience Insights",
            type: "Exercise",
            durationMinutes: 15,
            summary:
              "Validate customer pain points with direct qualitative feedback.",
            sectionHeading: "Confirming Core Assumptions",
            videoDuration: "04:10",
            bodyParagraphs: [
              "Test messaging against real user signals before committing production budget.",
            ],
            takeaways: [
              "Listen directly to customer language to shape resonant messaging.",
            ],
          },
        ],
      },
      {
        id: "dmf-m3",
        code: "MODULE 3",
        title: "Module 3: Planning a Simple Campaign",
        description:
          "Set realistic goals and assemble a step-by-step launch checklist.",
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
          {
            id: "dmf-l7",
            title: "Reviewing Launch Metrics & Iteration",
            type: "Exercise",
            durationMinutes: 20,
            summary:
              "Measure initial results and identify iteration opportunities.",
            sectionHeading: "Campaign Post-Mortems",
            videoDuration: "05:10",
            bodyParagraphs: [
              "Review conversions post-launch to continuously improve campaign quality.",
            ],
            takeaways: [
              "Turn every campaign launch into a repeatable learning asset.",
            ],
          },
        ],
      },
    ],
    quiz: {
      id: "dmf-quiz",
      title: "Knowledge Assessment Quiz",
      description:
        "Check your understanding of key concepts before attempting the practical project.",
      passMark: 80,
      maxAttempts: null,
      allowedAttempts: "Unlimited",
      timeLimitMinutes: 15,
      questions: [
        {
          id: "q1",
          prompt: "What is digital marketing?",
          options: [
            "Promoting products or services through digital channels.",
            "Selling products only in physical stores.",
            "Printing promotional posters only.",
            "Managing office operations.",
          ],
          correctIndex: 0,
        },
        {
          id: "q2",
          prompt:
            "What is the primary advantage of defining a specific target audience before launching a campaign?",
          options: [
            "It guarantees viral reach on every social network automatically.",
            "It aligns messaging and channel selection with the people most likely to convert.",
            "It eliminates the need to measure campaign performance.",
            "It replaces product or service quality.",
          ],
          correctIndex: 1,
        },
        {
          id: "q3",
          prompt:
            "Which channel is strongest for capturing prospects who are actively searching for a specific solution right now?",
          options: [
            "Search engines (SEO & Search Ads).",
            "Offline print flyers only.",
            "Unsegmented cold broadcasts.",
            "Internal team memos.",
          ],
          correctIndex: 0,
        },
        {
          id: "q4",
          prompt:
            "Which element belongs in a well-structured one-page digital marketing campaign brief?",
          options: [
            "Only a list of competitor logos.",
            "Target persona, primary SMART goal, key channels, and core message.",
            "Random daily posts with no call to action.",
            "A 50-page unmeasured brainstorm.",
          ],
          correctIndex: 1,
        },
        {
          id: "q5",
          prompt: "What is a core benefit of combining organic content with paid amplification?",
          options: [
            "Testing content organically before putting ad spend behind top performers.",
            "Eliminating the need for customer personas.",
            "Avoiding all analytics tracking.",
            "Guaranteeing instant sales.",
          ],
          correctIndex: 0,
        },
        {
          id: "q6",
          prompt: "How does audience segmentation improve conversion rates?",
          options: [
            "By tailoring messaging to specific pain points and needs.",
            "By showing the exact same ad to every demographic.",
            "By removing calls to action.",
            "By increasing generic impressions.",
          ],
          correctIndex: 0,
        },
        {
          id: "q7",
          prompt: "Which SMART metric best evaluates a top-of-funnel brand awareness campaign?",
          options: [
            "Reach, qualified video views, and brand search lift.",
            "Employee headcount.",
            "Internal code commits.",
            "Office supplies count.",
          ],
          correctIndex: 0,
        },
        {
          id: "q8",
          prompt: "Why should every campaign conclude with an outcome review?",
          options: [
            "To document learnings, optimize benchmarks, and inform subsequent launches.",
            "To delete all performance data.",
            "To avoid testing new channels.",
            "To ignore customer feedback.",
          ],
          correctIndex: 0,
        },
      ],
    },
    deliverable: {
      id: "dmf-project",
      title: "Mini Campaign Brief",
      badge: "Evidence Deliverable",
      subtitle: "Real-world project requirements for course completion.",
      instructions:
        "Prepare a 1-page campaign brief for an imaginary business: target audience, chosen channel, content idea, and simple metric.",
      projectBrief:
        'You have been hired as a freelance digital assistant for "Kikio Botanicals", an emerging eco-friendly skincare brand. The brand needs a structured, engaging 2-week social schedule across Instagram and LinkedIn to boost community engagement ahead of their new product launch.',
      expectedDeliverable:
        "Completed 2-week social calendar document containing 6 scheduled posts with copy, hooks, hashtags, and visual directions.",
      placeholderUrl:
        "https://docs.google.com/document/d/demo-campaign-brief/edit",
      placeholderNotes:
        "Attached full audience personas, channel allocation, and 2-week scheduled calendar.",
      steps: [
        "Create 2 distinct customer personas detailing demographics, shopping pain points, and preferred media channels.",
        "Select Instagram and LinkedIn content pillars and map 6 launch-week posts with clear hooks, copy, hashtags, and visual directions.",
        "Define 1 primary SMART engagement goal and double-check that sharing permissions are enabled before submitting.",
      ],
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
      "Learn how to organize content ideas, define strategic pillars, and execute a consistent editorial content calendar.",
    totalDurationLabel: "Approx. 1h 25m total content",
    enrolledByDefault: false,
    defaultCompletedLessonIds: [],
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
      title: "Content Planning Check",
      description:
        "Verify your grasp of content pillars, hooks, editorial batching, and engagement signals.",
      passMark: 75,
      maxAttempts: 3,
      allowedAttempts: "3 attempts",
      timeLimitMinutes: 15,
      questions: [
        {
          id: "sq1",
          prompt: "What is the main purpose of establishing 3–5 content pillars?",
          options: [
            "To post identical copy every day.",
            "To organize consistent, relevant topics aligned with audience needs and brand goals.",
            "To avoid replying to comments.",
            "To replace visual design.",
          ],
          correctIndex: 1,
        },
        {
          id: "sq2",
          prompt: "Which metric best indicates that readers found an educational post worth revisiting?",
          options: ["Saves / Bookmarks.", "Font size.", "Post time zone.", "Draft count."],
          correctIndex: 0,
        },
        {
          id: "sq3",
          prompt: "What makes a social publishing cadence effective long-term?",
          options: [
            "Posting 15 times on one day and pausing for a month.",
            "A realistic, consistent schedule supported by batched preparation.",
            "Skipping audience research.",
            "Never reviewing analytics.",
          ],
          correctIndex: 1,
        },
        {
          id: "sq4",
          prompt: "Why should every scheduled social post include a clear call to action or goal?",
          options: [
            "So audiences know the next step to take and engagement aligns with campaign objectives.",
            "To make captions harder to read.",
            "To hide brand identity.",
            "To avoid tracking conversions.",
          ],
          correctIndex: 0,
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
      projectBrief:
        "Design a structured 7-day social content schedule for a fast-growing consumer or B2B brand preparing a monthly awareness push across Instagram, X, and LinkedIn.",
      expectedDeliverable:
        "A 7-day editorial calendar spreadsheet or document listing 3 core content pillars, daily post hooks, formats, and measurable calls to action.",
      placeholderUrl:
        "https://docs.google.com/spreadsheets/d/7-day-content-calendar/edit",
      placeholderNotes:
        "Attached 3 content pillars, 7 daily hooks/captions, visual briefs, and engagement KPIs.",
      steps: [
        "Define 3 repeatable brand content pillars aligned with audience pain points and brand goals.",
        "Draft 7 scheduled posts specifying publish day, platform, format (Reel, Carousel, or Text), opening hook, and CTA.",
        "Include the primary engagement metrics (saves, shares, profile visits) you will review after week one.",
      ],
    },
  },
  {
    id: "intermediate-digital-marketing",
    title: "Intermediate digital Marketing",
    category: "Marketing & Growth",
    categoryUpper: "MARKETING & GROWTH",
    level: "Intermediate Level",
    levelShort: "Intermediate",
    levelUpper: "INTERMEDIATE LEVEL",
    accessLabel: "Paid Course",
    priceBadge: "N50,000",
    isPaid: true,
    partnerId: "digital-growth-academy",
    partnerName: "Digital Growth Academy",
    partnerDescription:
      "Employer & Skill Partner offering practical, employer-vetted digital marketing and growth curriculums.",
    summary:
      "Scale customer acquisition, manage performance marketing campaigns, optimize conversion funnels, and calculate conversion metrics.",
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
      maxAttempts: 2,
      allowedAttempts: "2 attempts",
      timeLimitMinutes: 15,
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
      projectBrief:
        "You are consulting for a SaaS team whose paid search campaign drives strong click-through rates, but landing page sign-up conversion has stalled below 2%.",
      expectedDeliverable:
        "A concise funnel audit document identifying 3 message-match or form-friction bottlenecks and 2 structured A/B test hypotheses.",
      placeholderUrl:
        "https://docs.google.com/document/d/funnel-optimization-audit/edit",
      placeholderNotes:
        "Included above-the-fold teardown, 3 friction points, and 2 prioritized A/B experiment specs.",
      steps: [
        "Evaluate message match, social proof placement, and form friction across the target landing page.",
        "Document 3 concrete conversion bottlenecks backed by funnel heuristics.",
        "Write 2 'If we change X, then Y will improve because Z' A/B hypotheses with primary metrics.",
      ],
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
    defaultCompletedLessonIds: [],
    defaultCurrentLessonId: "cpir-l1",
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
      maxAttempts: 2,
      allowedAttempts: "2 attempts",
      timeLimitMinutes: 15,
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
      projectBrief:
        "Prepare recruiter-ready evidence showcasing one of your strongest past projects or academic/freelance achievements alongside a crisp 60-second talent pitch script.",
      expectedDeliverable:
        "A 1-page STAR project case study (Situation, Task, Action, Result) paired with a natural 60-second video pitch script tailored to your target role.",
      placeholderUrl:
        "https://docs.google.com/document/d/star-case-study-pitch/edit",
      placeholderNotes:
        "Submitted full STAR project breakdown with quantified impact and 60-second role pitch script.",
      steps: [
        "Select one high-impact project and structure it clearly into Situation, Task, Action, and Result.",
        "Quantify outcomes and clarify your individual contribution versus team deliverables.",
        "Draft a 60-second spoken pitch script opening with your specialty, proof highlight, and target role.",
      ],
    },
  },
];

const STORAGE_PREFIX = "bejite:elearning-progress:v2";

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
        fileName: "",
        fileSize: null,
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
  return getCatalogCourses().map((course) =>
    enrichCourseWithProgress(course, store.courses[course.id])
  );
}

export function getEnrolledCourses() {
  return getAllCoursesWithProgress().filter((c) => c.enrolled);
}

export function getCourseById(courseId) {
  const store = readProgressStore();
  const catalog = getCatalogCourses();
  const target = catalog.find((c) => c.id === courseId) || catalog[0];
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

export function processCoursePayment(courseId, paymentDetails = {}) {
  if (paymentDetails.shouldFail) {
    return {
      success: false,
      message:
        "The card simulation declined this transaction or network timed out. No funds were deducted and course access has not been enrolled.",
    };
  }

  const updatedCourse = enrollInCourse(courseId);
  const store = readProgressStore();
  store.courses[courseId] = {
    ...(store.courses[courseId] || {}),
    paymentReceipt: {
      transactionId: `BEJ-${Date.now().toString(36).toUpperCase()}`,
      paidAt: new Date().toISOString(),
      amount: updatedCourse?.priceBadge || "N50,000",
      cardholder: paymentDetails.cardholderName || "Amara Okafor",
      last4: String(paymentDetails.cardNumber || "4242").slice(-4),
    },
  };
  writeProgressStore(store);

  return {
    success: true,
    course: getCourseById(courseId),
  };
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
  const course = getCatalogCourses().find((c) => c.id === courseId);
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
      lastAnswers: { ...answersMap },
      submittedAt: new Date().toISOString(),
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
  { content = "", portfolioUrl = "", fileName = "", fileSize = null } = {}
) {
  const trimmedNotes = String(content || "").trim();
  const trimmedUrl = String(portfolioUrl || "").trim();
  const trimmedFile = String(fileName || "").trim();

  if (!trimmedNotes && !trimmedUrl && !trimmedFile) {
    throw new Error(
      "Please provide a project link, upload a project file, or add submission notes before submitting."
    );
  }

  const store = readProgressStore();
  const current = store.courses[courseId] || {};
  store.courses[courseId] = {
    ...current,
    enrolled: true,
    deliverable: {
      submitted: true,
      status: "Submitted",
      content: trimmedNotes,
      portfolioUrl: trimmedUrl,
      fileName: trimmedFile,
      fileSize: fileSize || null,
      submittedAt: new Date().toISOString(),
    },
  };
  writeProgressStore(store);
  return getCourseById(courseId);
}


// ============================================================================
// Recruiter E-Learning Course Management Store & Helpers
// ============================================================================

const RECRUITER_COURSES_STORAGE_KEY = "bejite:recruiter-courses:v1";

export const COURSE_BUILDER_STEPS = [
  { id: "basic_info", number: 1, label: "Basic Info" },
  { id: "structure", number: 2, label: "Structure" },
  { id: "content", number: 3, label: "Content" },
  { id: "assessment", number: 4, label: "Assessment" },
  { id: "project", number: 5, label: "Project" },
  { id: "pricing", number: 6, label: "Pricing" },
  { id: "completion", number: 7, label: "Completion" },
  { id: "review", number: 8, label: "Review" },
];

export const COURSE_SUBJECT_AREAS = [
  "Digital Marketing",
  "UI/UX Design",
  "Content & Social Media",
  "Software Engineering",
  "Data Analytics",
  "Product Management",
  "Career Readiness",
  "Business Operations",
];

function slugifyCourseTitle(title) {
  const base = String(title || "course")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "course"}-${Date.now().toString(36)}`;
}

export function formatCourseRelativeTime(isoString, fallbackLabel = "Just now") {
  if (!isoString) return fallbackLabel;
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return fallbackLabel;

  const diffSeconds = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 1000));
  if (diffSeconds < 60) return "Just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function createEmptyCourseDraft() {
  return {
    id: null,
    title: "",
    summary: "",
    coverImage: "",
    coverImageName: "",
    subjectArea: "Digital Marketing",
    targetAudience: "",
    levelShort: "Beginner",
    learningOutcomes: [
      "Explain what digital marketing means.",
      "Identify a target audience.",
      "Choose suitable content for a simple campaign",
      "Outline a basic campaign plan",
    ],
    organisationType: "modules",
    modules: [
      {
        id: "mod-1",
        title: "Introduction to Digital Marketing",
        description:
          "Understand the landscape of modern digital marketing channels and user intent.",
        lessons: [
          {
            id: "les-1-1",
            title: "What Digital Marketing Means",
            type: "Video",
            durationMinutes: 15,
            summary:
              "Core concepts of digital outreach, audiences, and customer journeys.",
            sectionHeading: "Introduction to Modern Digital Marketing",
            mediaType: "video",
            mediaUrl:
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            mediaFileName: "case_study_walkthrough.mp4",
            mediaFileSize: "62.1 MB",
            mediaDuration: "15:10",
            mediaFormat: "video/mp4",
            mediaStatus: "Ready",
            takeawaysText:
              "By the end of the course, the learner should be able to:\ne.g 1.",
            videoUrl:
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            bodyText:
              "Digital marketing encompasses every marketing effort that uses internet-connected devices and online channels to connect with prospective and current customers.",
            takeaways: [
              "Digital marketing uses digital channels to promote products, services, or brands.",
              "Businesses choose channels based on their goals and audiences.",
            ],
          },
          {
            id: "les-1-2",
            title: "Common Digital Marketing Channels",
            type: "Video",
            durationMinutes: 20,
            summary:
              "Overview of search, social, email, and content channels.",
            sectionHeading: "Comparing Core Acquisition & Retention Channels",
            mediaType: "video",
            mediaUrl: "",
            mediaFileName: "",
            mediaFileSize: "",
            mediaDuration: "",
            mediaFormat: "",
            mediaStatus: "",
            takeawaysText:
              "By the end of the course, the learner should be able to:\ne.g 1.",
            videoUrl: "",
            bodyText:
              "High-performing marketing teams combine organic discovery channels with direct relationship channels and paid amplification.",
            takeaways: [
              "Search channels capture high-intent prospects actively looking for answers.",
              "Social media builds brand awareness and top-of-funnel reach.",
            ],
          },
        ],
      },
      {
        id: "mod-2",
        title: "Understanding Your Audience",
        description:
          "Segment customer personas and align messaging with customer goals.",
        lessons: [
          {
            id: "les-2-1",
            title: "Identifying a Target Audience",
            type: "Reading",
            durationMinutes: 25,
            summary:
              "Techniques for building demographic and psychographic buyer personas.",
            sectionHeading: "Building Practical Audience Personas",
            mediaType: "reading",
            mediaUrl: "",
            mediaFileName: "",
            takeawaysText:
              "By the end of the course, the learner should be able to:\ne.g 1.",
            videoUrl: "",
            bodyText:
              "A target audience is a specific group of people most likely to benefit from your product or service.",
            takeaways: [
              "Specific audience personas outperform broad, generic messaging.",
            ],
          },
          {
            id: "les-2-2",
            title: "Choosing Content for an Audience",
            type: "Reading",
            durationMinutes: 20,
            summary:
              "Tailoring campaign format and tone of voice for specific audiences.",
            sectionHeading: "Aligning Content Formats with Audience Intent",
            mediaType: "reading",
            mediaUrl: "",
            mediaFileName: "",
            takeawaysText:
              "By the end of the course, the learner should be able to:\ne.g 1.",
            videoUrl: "",
            bodyText:
              "Choose formats your audience naturally consumes and pair each asset with one clear call to action.",
            takeaways: [
              "Match content format and depth to your audience's stage of awareness.",
            ],
          },
        ],
      },
      {
        id: "mod-3",
        title: "Planning a Simple Campaign",
        description:
          "Set realistic targets and assemble a step-by-step launch checklist.",
        lessons: [
          {
            id: "les-3-1",
            title: "Setting a Campaign Goal",
            type: "Exercise",
            durationMinutes: 15,
            summary:
              "Establishing measurable KPIs using SMART frameworks.",
            sectionHeading: "Defining SMART Marketing Objectives",
            mediaType: "exercise",
            mediaUrl: "",
            mediaFileName: "",
            takeawaysText:
              "By the end of the course, the learner should be able to:\ne.g 1.",
            videoUrl: "",
            bodyText:
              "Every effective campaign anchors on one primary measurable metric within a defined timeframe.",
            takeaways: [
              "Tie campaign KPIs directly to a concrete business outcome.",
            ],
          },
          {
            id: "les-3-2",
            title: "Creating a Basic Campaign Outline",
            type: "Exercise",
            durationMinutes: 30,
            summary:
              "Step-by-step assembly of an actionable marketing plan.",
            sectionHeading: "Structuring Your One-Page Campaign Plan",
            mediaType: "exercise",
            mediaUrl: "",
            mediaFileName: "",
            takeawaysText:
              "By the end of the course, the learner should be able to:\ne.g 1.",
            videoUrl: "",
            bodyText:
              "A concise campaign brief aligns writers, designers, and stakeholders around the who, what, where, and why of your launch.",
            takeaways: [
              "A one-page campaign outline keeps cross-functional execution aligned.",
            ],
          },
        ],
      },
    ],
    quiz: {
      enabled: true,
      title: "Digital Marketing Basics Quiz",
      description:
        "Answer the questions to check your understanding of digital marketing audiences and campaign planning.",
      passMark: 80,
      maxAttempts: 2,
      timeLimitMinutes: 15,
      passingScoreEnabled: true,
      retryLimitEnabled: true,
      questions: [
        {
          id: "q-1",
          type: "multiple_choice",
          prompt: "What is digital marketing?",
          points: 1,
          options: [
            "Promoting products or services through digital channels.",
            "Selling products only in physical stores.",
            "Printing promotional flyers only.",
            "Managing office operations.",
          ],
          correctAnswers: [0, 1],
          correctIndex: 0,
        },
        {
          id: "q-2",
          type: "single_choice",
          prompt: "Which of the following can be a digital marketing channel?",
          points: 1,
          options: [
            "Social media",
            "Email",
            "A business website",
            "All of the above",
          ],
          correctAnswers: [0],
          correctIndex: 0,
        },
        {
          id: "q-3",
          type: "true_false",
          prompt:
            "A business should consider its target audience when choosing marketing content.",
          points: 1,
          options: ["True", "False"],
          correctAnswers: [0],
          correctIndex: 0,
        },
        {
          id: "q-4",
          type: "text_based",
          prompt:
            "A business should consider its target audience when choosing marketing content.",
          points: 1,
          correctText:
            "Understanding audience intent and demographics allows businesses to select suitable content formats that drive measurable engagement.",
          options: [],
          correctAnswers: [],
          correctIndex: 0,
        },
      ],
    },
    project: {
      enabled: true,
      title: "Practical Portfolio Deliverable",
      brief:
        "Complete a practical real-world deliverable demonstrating the skills learned across this course.",
      expectedDeliverable:
        "A structured strategy document, prototype link, or project archive ready for recruiter review.",
      steps: [
        "Review the scenario brief and define your target audience or problem statement.",
        "Build your solution document or workspace asset with clear rationale.",
        "Enable view permissions on your link or attach your project file before submitting.",
      ],
    },
    pricing: {
      isPaid: false,
      currency: "NGN",
      amount: "",
    },
    completion: {
      requireAllLessons: true,
      requireQuizPass: true,
      requireProjectSubmission: true,
      certificateNote:
        "Completing this course records verified skill evidence on the learner's Bejite Academy profile.",
    },
    status: "draft",
  };
}

function buildDefaultRecruiterCourses() {
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const baseDraft = createEmptyCourseDraft();

  return [
    {
      ...baseDraft,
      id: "digital-marketing-fundamentals",
      title: "Digital Marketing Fundamentals",
      summary:
        "Learn the basics of digital marketing, including audiences, content, and campaign planning.",
      subjectArea: "Digital Marketing",
      targetAudience: "Entry-level marketers, career switchers, and founders",
      levelShort: "Beginner",
      pricing: { isPaid: false, currency: "NGN", amount: "" },
      status: "published",
      createdAt: "2026-06-11T09:00:00.000Z",
      updatedAt: tenMinsAgo,
    },
    {
      ...baseDraft,
      id: "intro-to-ui-ux-design",
      title: "Introduction to UI/UX Design",
      summary:
        "Explore user experience, interface design, and interactive prototyping workflows.",
      subjectArea: "UI/UX Design",
      targetAudience: "Aspiring product designers and frontend builders",
      levelShort: "Intermediate",
      learningOutcomes: [
        "Conduct lightweight user discovery and usability heuristics.",
        "Build clean wireframes and reusable component systems in Figma.",
        "Prototype end-to-end user flows ready for developer handoff.",
      ],
      modules: [
        {
          id: "uiux-m1",
          title: "User Research & Information Architecture",
          description:
            "Map user journeys, pain points, and clear navigation hierarchies.",
          lessons: [
            {
              id: "uiux-l1",
              title: "Foundations of User-Centered Design",
              type: "Reading",
              durationMinutes: 20,
              summary:
                "Understand how research insights shape intuitive digital interfaces.",
              sectionHeading: "Designing for Clarity & Usability",
              videoUrl: "",
              bodyText:
                "User-centered design anchors every screen and interaction around real user goals, context, and accessibility.",
              takeaways: [
                "Solve user friction before polishing surface visuals.",
                "Validate navigation flows early with low-fidelity wireframes.",
              ],
            },
            {
              id: "uiux-l2",
              title: "Structuring User Flows & Wireframes",
              type: "Exercise",
              durationMinutes: 25,
              summary:
                "Translate product requirements into clear task flows and screen layouts.",
              sectionHeading: "From User Story to Wireframe",
              videoUrl: "",
              bodyText:
                "Mapping each decision point in a user flow uncovers edge cases early and keeps engineering handoffs clean.",
              takeaways: [
                "Map happy paths and empty/error states side by side.",
              ],
            },
          ],
        },
      ],
      pricing: { isPaid: true, currency: "NGN", amount: "15000" },
      status: "draft",
      createdAt: "2026-06-13T12:00:00.000Z",
      updatedAt: tenMinsAgo,
    },
    {
      ...baseDraft,
      id: "social-media-content-planning-pro",
      title: "Social Media Content Planning",
      summary:
        "Learn how to organise content ideas, define pillars, and scale multi-channel calendars.",
      subjectArea: "Content & Social Media",
      targetAudience: "Content strategists, brand managers, and creators",
      levelShort: "Advanced",
      learningOutcomes: [
        "Architect repeatable multi-platform content pillars.",
        "Design editorial workflows and creative briefs for teams.",
        "Measure retention, saves, and attribution across social funnels.",
      ],
      pricing: { isPaid: true, currency: "NGN", amount: "25000" },
      status: "in_review",
      createdAt: "2026-06-15T15:30:00.000Z",
      updatedAt: tenMinsAgo,
    },
    {
      ...baseDraft,
      id: "career-interview-readiness-archive",
      title: "Portfolio & Case Study Storytelling",
      summary:
        "Structure measurable project outcomes and present clear case studies during hiring reviews.",
      subjectArea: "Career Readiness",
      targetAudience: "Jobseekers preparing portfolio case studies",
      levelShort: "Beginner",
      pricing: { isPaid: false, currency: "NGN", amount: "" },
      status: "archived",
      createdAt: "2026-06-10T10:00:00.000Z",
      updatedAt: tenMinsAgo,
    },
  ];
}

function readRecruiterCoursesStore() {
  const defaults = buildDefaultRecruiterCourses();
  try {
    const raw = localStorage.getItem(RECRUITER_COURSES_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaults;
    return parsed;
  } catch {
    return defaults;
  }
}

function writeRecruiterCoursesStore(courses) {
  try {
    localStorage.setItem(RECRUITER_COURSES_STORAGE_KEY, JSON.stringify(courses));
  } catch {
    // Ignore storage quota issues
  }
}

export function getRecruiterManagedCourses() {
  return readRecruiterCoursesStore();
}

export function getRecruiterCourseById(courseId) {
  if (!courseId) return null;
  const list = readRecruiterCoursesStore();
  return list.find((c) => c.id === courseId) || null;
}

export function saveRecruiterCourse(draft, { status } = {}) {
  const list = readRecruiterCoursesStore();
  const nowIso = new Date().toISOString();
  const user = getUser();
  const partnerName =
    user?.companyName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    "Bejite Employer Partner";

  const resolvedId = draft.id || slugifyCourseTitle(draft.title);
  const nextStatus = status || draft.status || "draft";

  const cleanedOutcomes = (draft.learningOutcomes || [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  const normalizedRecord = {
    ...createEmptyCourseDraft(),
    ...draft,
    id: resolvedId,
    title: String(draft.title || "Untitled Course").trim(),
    summary: String(draft.summary || "").trim(),
    learningOutcomes:
      cleanedOutcomes.length > 0
        ? cleanedOutcomes
        : ["Apply practical concepts covered in this course."],
    partnerName,
    status: nextStatus,
    createdAt: draft.createdAt || nowIso,
    updatedAt: nowIso,
  };

  const existingIndex = list.findIndex((c) => c.id === resolvedId);
  let updatedList;
  if (existingIndex >= 0) {
    const copy = [...list];
    copy.splice(existingIndex, 1);
    updatedList = [normalizedRecord, ...copy];
  } else {
    updatedList = [normalizedRecord, ...list];
  }

  writeRecruiterCoursesStore(updatedList);
  return normalizedRecord;
}

export function updateRecruiterCourseStatus(courseId, status) {
  const list = readRecruiterCoursesStore();
  const idx = list.findIndex((c) => c.id === courseId);
  if (idx < 0) return null;
  const updated = {
    ...list[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  const nextList = [...list];
  nextList[idx] = updated;
  writeRecruiterCoursesStore(nextList);
  return updated;
}

export function deleteRecruiterCourse(courseId) {
  const list = readRecruiterCoursesStore();
  const nextList = list.filter((c) => c.id !== courseId);
  writeRecruiterCoursesStore(nextList);
  return nextList;
}

function convertManagedCourseToCatalogCourse(managed) {
  const levelShort = managed.levelShort || "Beginner";
  const level = `${levelShort} Level`;
  const category = managed.subjectArea || "Marketing & Growth";
  const isPaid = Boolean(managed.pricing?.isPaid);
  const formattedPrice =
    isPaid && managed.pricing?.amount
      ? `${managed.pricing.currency || "NGN"} ${Number(
          managed.pricing.amount
        ).toLocaleString()}`
      : "Paid Course";

  const rawModules =
    managed.organisationType === "standalone"
      ? [
          {
            id: `${managed.id}-standalone`,
            title: "Course Lessons",
            description: managed.summary || "Core instructional units.",
            lessons: (managed.modules || []).flatMap((m) => m.lessons || []),
          },
        ]
      : managed.modules || [];

  const normalizedModules = rawModules.map((mod, mIdx) => {
    const cleanTitle = String(mod.title || `Module ${mIdx + 1}`).trim();
    const prefixedTitle = /^module\s+\d+/i.test(cleanTitle)
      ? cleanTitle
      : `Module ${mIdx + 1}: ${cleanTitle}`;
    return {
      id: mod.id || `${managed.id}-m${mIdx + 1}`,
      code: `MODULE ${mIdx + 1}`,
      title: prefixedTitle,
      description: mod.description || "",
      lessons: (mod.lessons || []).map((les, lIdx) => ({
        id: les.id || `${managed.id}-l-${mIdx + 1}-${lIdx + 1}`,
        title: les.title || `Lesson ${lIdx + 1}`,
        type: les.type || "Reading",
        durationMinutes: Number(les.durationMinutes) || 15,
        summary: les.summary || "",
        sectionHeading: les.sectionHeading || les.title || "Lesson Overview",
        videoDuration: "05:00",
        videoUrl: les.videoUrl || "",
        bodyParagraphs: String(les.bodyText || les.summary || "")
          .split(/\n+/)
          .map((p) => p.trim())
          .filter(Boolean),
        takeaways:
          Array.isArray(les.takeaways) && les.takeaways.length > 0
            ? les.takeaways.filter(Boolean)
            : ["Apply the key principles from this lesson in practice."],
      })),
    };
  });

  const totalMinutes = normalizedModules
    .flatMap((m) => m.lessons)
    .reduce((sum, l) => sum + (Number(l.durationMinutes) || 15), 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const totalDurationLabel =
    hours > 0
      ? `Approx. ${hours}h${mins > 0 ? ` ${mins}m` : ""} total content`
      : `Approx. ${Math.max(15, totalMinutes)}m total content`;

  return {
    id: managed.id,
    title: managed.title,
    coverImage: managed.coverImage || "",
    category,
    categoryUpper: category.toUpperCase(),
    level,
    levelShort,
    levelUpper: level.toUpperCase(),
    accessLabel: isPaid ? "Paid Course" : "Free Course",
    priceBadge: isPaid ? formattedPrice : "Free",
    isPaid,
    partnerId: "recruiter-academy-partner",
    partnerName: managed.partnerName || "Digital Growth Academy",
    partnerDescription:
      "Employer & Skill Partner offering practical, employer-vetted courses on Bejite Academy.",
    summary: managed.summary || "",
    totalDurationLabel,
    enrolledByDefault: false,
    defaultCompletedLessonIds: [],
    defaultCurrentLessonId: normalizedModules[0]?.lessons?.[0]?.id || null,
    learningOutcomes: (managed.learningOutcomes || []).filter(Boolean),
    modules: normalizedModules,
    quiz: {
      id: `${managed.id}-quiz`,
      title: managed.quiz?.title || `${managed.title} Quiz`,
      description:
        managed.quiz?.description ||
        "Check your understanding of the topics covered in this course.",
      passMark: Number(managed.quiz?.passMark) || 80,
      maxAttempts: Number(managed.quiz?.maxAttempts) || 2,
      allowedAttempts: `${Number(managed.quiz?.maxAttempts) || 2} attempts`,
      timeLimitMinutes: Number(managed.quiz?.timeLimitMinutes) || 15,
      questions:
        Array.isArray(managed.quiz?.questions) &&
        managed.quiz.questions.length > 0
          ? managed.quiz.questions
          : [
              {
                id: `${managed.id}-q1`,
                prompt: `Which statement best summarizes a core takeaway from ${managed.title}?`,
                options: [
                  (managed.learningOutcomes || [])[0] ||
                    "Applying structured, audience-focused workflows.",
                  "Skipping discovery and planning.",
                  "Ignoring measurable outcomes.",
                  "Working without clear objectives.",
                ],
                correctIndex: 0,
              },
            ],
    },
    deliverable: {
      id: `${managed.id}-project`,
      title: managed.project?.title || `${managed.title} Practical Brief`,
      badge: "Portfolio Deliverable",
      subtitle: "Submit your hands-on deliverable.",
      instructions:
        managed.project?.expectedDeliverable ||
        "Submit your completed practical project link or file.",
      projectBrief:
        managed.project?.brief ||
        managed.summary ||
        "Complete the practical deliverable for this course.",
      expectedDeliverable:
        managed.project?.expectedDeliverable ||
        "Completed project document, link, or archive.",
      placeholderUrl: "https://docs.google.com/document/d/your-project/edit",
      placeholderNotes:
        "Attached completed project deliverable and executive summary.",
      steps:
        Array.isArray(managed.project?.steps) &&
        managed.project.steps.length > 0
          ? managed.project.steps.filter(Boolean)
          : [
              "Review the project brief and requirements carefully.",
              "Prepare your practical deliverable and verify link permissions.",
              "Submit your link or file with a concise summary.",
            ],
    },
  };
}

function getCatalogCourses() {
  const managedPublished = readRecruiterCoursesStore().filter(
    (c) => c.status === "published"
  );
  const baseMap = new Map(DEFAULT_COURSES.map((c) => [c.id, c]));

  const customPublished = [];
  for (const managed of managedPublished) {
    if (baseMap.has(managed.id)) {
      // Preserve rich built-in course defaults while reflecting recruiter title/summary/level/pricing updates if edited
      const existing = baseMap.get(managed.id);
      const converted = convertManagedCourseToCatalogCourse(managed);
      baseMap.set(managed.id, {
        ...existing,
        title: converted.title || existing.title,
        summary: converted.summary || existing.summary,
        coverImage: converted.coverImage || existing.coverImage,
        level: converted.level,
        levelShort: converted.levelShort,
        levelUpper: converted.levelUpper,
        isPaid: converted.isPaid,
        accessLabel: converted.accessLabel,
        priceBadge: converted.priceBadge,
      });
    } else {
      customPublished.push(convertManagedCourseToCatalogCourse(managed));
    }
  }

  return [...customPublished, ...Array.from(baseMap.values())];
}
