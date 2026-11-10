import { PrismaClient, Role, EnrollmentStatus, ExpirationWindow, ScormVersion } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const isDatabaseConfigured = (): boolean => {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Re-export generated enums for seamless consumer imports
export { Role, EnrollmentStatus, ExpirationWindow, ScormVersion };

// ==========================================
// RESILIENT LOCAL IN-MEMORY MOCK STORE
// Active when DATABASE_URL is not configured
// ==========================================
export interface MockOrganization {
  id: string;
  name: string;
  code: string;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockCourse {
  id: string;
  title: string;
  slug: string;
  isComplianceMandatory: boolean;
  validityDays: number | null;
  scormPackageUrl: string | null;
  scormVersion: ScormVersion;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  progressPercent: number;
  scoreRaw: number | null;
  scoreMin: number | null;
  scoreMax: number | null;
  bookmarkLocation: string | null;
  suspendData: string | null;
  cmiState: Record<string, string> | null;
  assignedAt: Date;
  completedAt: Date | null;
  expiresAt: Date | null;
  reenrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockCertificate {
  id: string;
  userId: string;
  courseId: string;
  serialNumber: string;
  issuedAt: Date;
  expiresAt: Date;
  expirationWindow: ExpirationWindow;
  isExpired: boolean;
  lastEvaluatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockInAppAlert {
  id: string;
  userId: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export interface MockXApiStatement {
  id: string;
  userId: string;
  actor: Record<string, unknown>;
  verb: Record<string, unknown>;
  object: Record<string, unknown>;
  result?: Record<string, unknown> | null;
  context?: Record<string, unknown> | null;
  timestamp: Date;
}

// Initial Seed Data for Local Development & Graceful Degradation
const now = new Date();
const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

export const memoryStore = {
  organizations: [
    {
      id: 'org-hq',
      name: 'Buddy Learning Global Network',
      code: 'BL-HQ',
      parentId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'org-anglo',
      name: 'Anglo American Education Foundation Branch',
      code: 'AA-ZA-BRANCH',
      parentId: 'org-hq',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'org-sasol',
      name: 'Sasol STEM Development Hub',
      code: 'SASOL-SEC-BRANCH',
      parentId: 'org-hq',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'org-standardbank',
      name: 'Standard Bank Tutoring Academy',
      code: 'SB-FIN-BRANCH',
      parentId: 'org-hq',
      createdAt: now,
      updatedAt: now,
    },
  ] as MockOrganization[],

  users: [
    {
      id: 'usr-admin-01',
      email: 'admin@buddylearning.co.za',
      name: 'Elena Rostova',
      role: Role.GLOBAL_ADMIN,
      organizationId: 'org-hq',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-tutor-01',
      email: 'sipho.tutor@buddylearning.co.za',
      name: 'Sipho Sithole, BSc',
      role: Role.TUTOR,
      organizationId: 'org-hq',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-mgr-anglo',
      email: 'thandiwe.m@anglo-edu.co.za',
      name: 'Dr. Thandiwe Mthembu',
      role: Role.BRANCH_MANAGER,
      organizationId: 'org-anglo',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-mgr-sasol',
      email: 'johan.v@sasol-stem.co.za',
      name: 'Johan van der Merwe',
      role: Role.BRANCH_MANAGER,
      organizationId: 'org-sasol',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-learner-01',
      email: 'zanele.k@anglo-scholars.co.za',
      name: 'Zanele Khumalo',
      role: Role.LEARNER,
      organizationId: 'org-anglo',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-learner-02',
      email: 'sipho.d@anglo-scholars.co.za',
      name: 'Sipho Dlamini',
      role: Role.LEARNER,
      organizationId: 'org-anglo',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-learner-03',
      email: 'anika.p@sasol-stem.co.za',
      name: 'Anika Patel',
      role: Role.LEARNER,
      organizationId: 'org-sasol',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-learner-04',
      email: 'lerato.m@sasol-stem.co.za',
      name: 'Lerato Molefe',
      role: Role.LEARNER,
      organizationId: 'org-sasol',
      createdAt: now,
      updatedAt: now,
    },
  ] as MockUser[],

  courses: [
    {
      id: 'course-popia',
      title: 'POPIA & High School Learner Data Privacy (South Africa)',
      slug: 'popia-learner-privacy-za',
      isComplianceMandatory: true,
      validityDays: 365,
      scormPackageUrl: '/scorm/popia-compliance/imsmanifest.xml',
      scormVersion: ScormVersion.SCORM_12,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course-lab-safety',
      title: 'Occupational Health & Physical Science Laboratory Safety',
      slug: 'physics-chemistry-lab-safety',
      isComplianceMandatory: true,
      validityDays: 180,
      scormPackageUrl: '/scorm/lab-safety-2026/imsmanifest.xml',
      scormVersion: ScormVersion.SCORM_2004,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course-calculus-pedagogy',
      title: 'CAPS Curriculum Grade 12 Advanced Calculus Methodology',
      slug: 'caps-grade-12-calculus-pedagogy',
      isComplianceMandatory: false,
      validityDays: 730,
      scormPackageUrl: '/scorm/calculus-mastery/imsmanifest.xml',
      scormVersion: ScormVersion.SCORM_12,
      createdAt: now,
      updatedAt: now,
    },
  ] as MockCourse[],

  enrollments: [
    {
      id: 'enr-01',
      userId: 'usr-learner-01',
      courseId: 'course-popia',
      status: EnrollmentStatus.COMPLETED,
      progressPercent: 100,
      scoreRaw: 96,
      scoreMin: 0,
      scoreMax: 100,
      bookmarkLocation: 'slide_module_4_quiz',
      suspendData: 'v=1.2&step=completed&attempts=1',
      cmiState: {
        'cmi.core.lesson_location': 'slide_module_4_quiz',
        'cmi.core.lesson_status': 'passed',
        'cmi.core.score.raw': '96',
        'cmi.suspend_data': 'v=1.2&step=completed&attempts=1',
      },
      assignedAt: daysFromNow(-300),
      completedAt: daysFromNow(-290),
      expiresAt: daysFromNow(75), // Triggers WINDOW_90_DAYS
      reenrollmentCount: 0,
      createdAt: daysFromNow(-300),
      updatedAt: daysFromNow(-290),
    },
    {
      id: 'enr-02',
      userId: 'usr-learner-02',
      courseId: 'course-popia',
      status: EnrollmentStatus.COMPLETED,
      progressPercent: 100,
      scoreRaw: 92,
      scoreMin: 0,
      scoreMax: 100,
      bookmarkLocation: 'assessment_final',
      suspendData: 'v=1.2&step=done',
      cmiState: {
        'cmi.core.lesson_location': 'assessment_final',
        'cmi.core.lesson_status': 'passed',
        'cmi.core.score.raw': '92',
      },
      assignedAt: daysFromNow(-350),
      completedAt: daysFromNow(-340),
      expiresAt: daysFromNow(25), // Triggers WINDOW_30_DAYS
      reenrollmentCount: 0,
      createdAt: daysFromNow(-350),
      updatedAt: daysFromNow(-340),
    },
    {
      id: 'enr-03',
      userId: 'usr-learner-03',
      courseId: 'course-lab-safety',
      status: EnrollmentStatus.COMPLETED,
      progressPercent: 100,
      scoreRaw: 88,
      scoreMin: 0,
      scoreMax: 100,
      bookmarkLocation: 'lab_quiz_p2',
      suspendData: 'scorm2004=state_ok',
      cmiState: {
        'cmi.location': 'lab_quiz_p2',
        'cmi.completion_status': 'completed',
        'cmi.success_status': 'passed',
        'cmi.score.raw': '88',
      },
      assignedAt: daysFromNow(-200),
      completedAt: daysFromNow(-190),
      expiresAt: daysFromNow(-5), // Triggers EXPIRED
      reenrollmentCount: 0,
      createdAt: daysFromNow(-200),
      updatedAt: daysFromNow(-190),
    },
    {
      id: 'enr-04',
      userId: 'usr-learner-04',
      courseId: 'course-calculus-pedagogy',
      status: EnrollmentStatus.IN_PROGRESS,
      progressPercent: 45,
      scoreRaw: 42,
      scoreMin: 0,
      scoreMax: 100,
      bookmarkLocation: 'calculus_limits_part_2',
      suspendData: 'step=module_2',
      cmiState: {
        'cmi.core.lesson_location': 'calculus_limits_part_2',
        'cmi.core.lesson_status': 'incomplete',
      },
      assignedAt: daysFromNow(-10),
      completedAt: null,
      expiresAt: daysFromNow(720),
      reenrollmentCount: 0,
      createdAt: daysFromNow(-10),
      updatedAt: daysFromNow(-2),
    },
  ] as MockEnrollment[],

  certificates: [
    {
      id: 'cert-01',
      userId: 'usr-learner-01',
      courseId: 'course-popia',
      serialNumber: 'CERT-POPIA-2026-0081',
      issuedAt: daysFromNow(-290),
      expiresAt: daysFromNow(75), // Within 90-day window
      expirationWindow: ExpirationWindow.ACTIVE,
      isExpired: false,
      lastEvaluatedAt: null,
      createdAt: daysFromNow(-290),
      updatedAt: daysFromNow(-290),
    },
    {
      id: 'cert-02',
      userId: 'usr-learner-02',
      courseId: 'course-popia',
      serialNumber: 'CERT-POPIA-2026-0042',
      issuedAt: daysFromNow(-340),
      expiresAt: daysFromNow(25), // Within 30-day window
      expirationWindow: ExpirationWindow.ACTIVE,
      isExpired: false,
      lastEvaluatedAt: null,
      createdAt: daysFromNow(-340),
      updatedAt: daysFromNow(-340),
    },
    {
      id: 'cert-03',
      userId: 'usr-learner-03',
      courseId: 'course-lab-safety',
      serialNumber: 'CERT-LAB-2026-0019',
      issuedAt: daysFromNow(-190),
      expiresAt: daysFromNow(-5), // Expired 5 days ago
      expirationWindow: ExpirationWindow.ACTIVE,
      isExpired: false,
      lastEvaluatedAt: null,
      createdAt: daysFromNow(-190),
      updatedAt: daysFromNow(-190),
    },
  ] as MockCertificate[],

  alerts: [] as MockInAppAlert[],

  xapiStatements: [] as MockXApiStatement[],
};
