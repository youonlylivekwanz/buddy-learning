export type UserRole = 'dashboard' | 'learner' | 'tutor' | 'sponsor' | 'admin';

export type LessonStatus = 'upcoming' | 'completed' | 'missed' | 'rescheduled';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'streak' | 'mastery' | 'problem_solving' | 'community';
  earnedDate?: string;
  unlocked: boolean;
  xpReward: number;
}

export interface AISessionSummary {
  takeaways: string[];
  keyFormulas: string[];
  recommendedHomework: {
    id: string;
    task: string;
    dueDate: string;
    completed: boolean;
    difficulty: 'Easy' | 'Medium' | 'Challenge';
  }[];
  tutorFeedback: string;
  masteryScorePercent: number;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  grade: string;
  tutorName: string;
  tutorAvatar?: string;
  learnerName: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: LessonStatus;
  meetingUrl: string;
  roomCode: string;
  aiSummary?: AISessionSummary;
  recordingUrl?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  subject: 'Mathematics' | 'Physical Science' | 'Life Sciences' | 'Information Tech';
  type: 'worksheet' | 'past_paper' | 'notes' | 'recording';
  fileSize: string;
  format: 'PDF' | 'MP4' | 'ZIP' | 'DOCX';
  downloadCount: number;
  uploadDate: string;
  gradeLevel: string;
  tags: string[];
  description: string;
}

export interface TutorAvailability {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  slots: {
    time: string;
    status: 'available' | 'booked' | 'blocked';
    lessonId?: string;
  }[];
}

export interface SessionLog {
  id: string;
  tutorId: string;
  tutorName: string;
  learnerId: string;
  learnerName: string;
  subject: string;
  date: string;
  durationMinutes: number;
  rateTier: string;
  hourlyRate: number;
  totalEarned: number;
  attendanceStatus: 'present' | 'late' | 'absent';
  notes: string;
  aiSummaryGenerated: boolean;
  status: 'approved' | 'pending' | 'draft';
}

export interface SponsorStudent {
  id: string;
  name: string;
  avatar: string;
  grade: number;
  school: string;
  sponsorName: string;
  tutorAssigned: string;
  attendanceRate: number;
  baselineScore: number;
  currentScore: number;
  targetScore: number;
  hoursCompleted: number;
  status: 'excelling' | 'on_track' | 'needs_support';
  recentHighlight: string;
}

export interface InvoiceItem {
  description: string;
  hours: number;
  rate: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientType: 'corporate_sponsor' | 'private_family';
  clientContact: string;
  clientEmail: string;
  billingAddress: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  cohortName?: string;
}

export interface LiveActivityFeedItem {
  id: string;
  type: 'live_session' | 'onboarding' | 'pay_run' | 'milestone';
  title: string;
  subtitle: string;
  timestamp: string;
  activeNow?: boolean;
  status?: string;
  avatar?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  category: 'Exam Alert' | 'Bursary Notice' | 'Academic Calendar' | 'Workshop' | 'Curriculum Update';
  date: string;
  pinned?: boolean;
  priority: 'high' | 'normal' | 'info';
  summary: string;
  author: string;
  actionText?: string;
  actionPayload?: string;
}

export interface EducationPoster {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  accent: 'amber' | 'charcoal' | 'cream' | 'emerald';
  badgeText: string;
  deadlineOrDate: string;
  bulletPoints: string[];
  ctaLabel: string;
  targetRole?: UserRole;
  formulaNote?: string;
}
