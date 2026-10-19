export const truncateText = (text, limit = 200, type = 'words') => {
    if (!text) return { text: '', needsTruncation: false };

    if (type === 'words') {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        if (words.length <= limit) return { text, needsTruncation: false };
        return {
            text: words.slice(0, limit).join(' ') + '...',
            needsTruncation: true
        };
    } else {
        // Character-based truncation (alternative)
        if (text.length <= limit) return { text, needsTruncation: false };
        return {
            text: text.slice(0, limit).trim() + '...',
            needsTruncation: true
        };
    }
};

export const SKILL_SUGGESTIONS = [
    "Python",
    "JavaScript",
    "React",
    "Node.js",
    "Java",
    "C++",
    "C#",
    "PHP",
    "Ruby",
    "Go",
    "Swift",
    "Kotlin",
    "TypeScript",
    "HTML",
    "CSS",
    "SQL",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Firebase",
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "Git",
    "GitHub",
    "GitLab",
    "Jira",
    "Agile",
    "Scrum",
    "Project Management",
    "Leadership",
    "Communication",
    "Problem Solving",
    "Critical Thinking",
    "Teamwork",
    "Time Management",
    "Data Analysis",
    "Machine Learning",
    "Artificial Intelligence",
    "Deep Learning",
    "Data Science",
    "R",
    "Excel",
    "Tableau",
    "Power BI",
    "Digital Marketing",
    "SEO",
    "Content Writing",
    "Graphic Design",
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Figma",
    "UI/UX Design",
    "Product Management",
    "Sales",
    "Customer Service",
    "Public Speaking",
    "Negotiation",
    "Financial Analysis",
    "Accounting",
    "HR Management",
    "Recruiting",
    "Teaching",
    "Research",
    "Writing",
    "Editing",
    "Photography",
    "Video Editing",
    "Programmer",
    "Web Developer",
    "Software Engineer",
    "DevOps Engineer",
    "System Administrator",
    "Network Engineer",
    "Database Administrator",
    "Business Analyst",
    "Marketing Manager",
    "Sales Representative",
    "Project Coordinator",
    "Product Owner",
    "Scrum Master",
    "Quality Assurance",
    "Technical Writing",
    "Cloud Architect",
    "Security Analyst",
    "Data Engineer",
    "ML Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "iOS Developer",
    "Android Developer",
    "DevOps",
    "CI/CD",
    "Jenkins",
    "Terraform",
    "Ansible",
    "Linux",
    "Windows Server",
    "Networking",
    "Cybersecurity",
    "Penetration Testing",
    "Ethical Hacking",
    "Blockchain",
    "Smart Contracts",
    "Solidity",
    "Rust",
    "Web3",
    "NFT",
    "Cryptocurrency",
];



/**
 * Format a date string to a readable format (MMM DD, YYYY)
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "Jan 15, 2024")
 */
export const formatDate = (date) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Format date for API submission (YYYY-MM-DD)
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "2024-01-15")
 */
export const formatDateForAPI = (date) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toISOString().split('T')[0];
};

/**
 * Format date for display (e.g., "2024-01-15")
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (date) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Format date range with start and end dates
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date (can be "Present")
 * @param {boolean} isPresent - Whether it's currently ongoing
 * @returns {string} Formatted date range (e.g., "Jan 2024 - Present" or "Jan 2024 - Mar 2024")
 */
export const formatDateRange = (startDate, endDate, isPresent = false) => {
    const formattedStart = formatDateToMonthYear(startDate);
    const ongoing =
        isPresent || endDate == null || endDate === '' || endDate === 'Present';
    const formattedEnd = ongoing ? 'Present' : formatDateToMonthYear(endDate);

    if (!formattedStart && !formattedEnd) return '';
    if (!formattedStart) return formattedEnd;
    if (!formattedEnd) return formattedStart;
    return `${formattedStart} — ${formattedEnd}`;
};

/** True when an education/work row has no end date (still in progress). */
export const isOngoingCvEntry = (row) =>
    Boolean(
        row?.isCurrentlyStudying ||
        row?.isCurrentJob ||
        row?.is_current_job ||
        !(row?.end_date ?? row?.endDate),
    );

/**
 * Format date to Month Year format (e.g., "Jan 2024")
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateToMonthYear = (date) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
    });
};

/**
 * Format date to full date (e.g., "January 15, 2024")
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateFull = (date) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Parse API date format (YYYY-MM-DD) to Date object
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} Date object
 */
export const parseAPIDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Validate if a date string is valid
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidDate = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return !isNaN(d.getTime());
};

/**
 * Check if start date is before end date
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {boolean} True if valid range, false otherwise
 */
export const isValidDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
};

// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
};

export function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

 
export const formatTimeRemaining = (expiresAt) => {
  const remaining = new Date(expiresAt).getTime() - Date.now();
  const hours = Math.max(0, Math.floor(remaining / (1000 * 60 * 60)));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return { text: `${days}d left`, isUrgent: false };
  }
  if (hours > 0) {
    return { text: `${hours}h left`, isUrgent: hours < 24 };
  }
  return { text: 'Expiring soon', isUrgent: true };
};

export const formatSalary = (job) => {
  if (job.salary) return job.salary;
  if (job.salaryMin || job.salaryMax) {
    const currency = job.salaryCurrency === 'USD' ? '$' : 
                     job.salaryCurrency === 'NGN' ? '₦' :
                     job.salaryCurrency === 'KES' ? 'KES ' :
                     job.salaryCurrency === 'GHS' ? 'GH₵' :
                     job.salaryCurrency === 'ZAR' ? 'R' : '';
    const min = Number(job.salaryMin) || 0;
    const max = Number(job.salaryMax) || 0;
    if (min && max && min === max) {
      return `${currency}${min.toLocaleString()}`;
    }
    if (min && max) {
      return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
    }
    if (min) return `${currency}${min.toLocaleString()}`;
    if (max) return `${currency}${max.toLocaleString()}`;
  }
  return 'Competitive';
};