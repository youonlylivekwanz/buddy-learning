import {
  Lesson,
  SessionLog,
  Invoice,
  ResourceItem,
  NoticeItem,
  SponsorStudent,
  TutorAvailability,
  AISessionSummary,
} from '@/types';

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  health: {
    check: () => fetcher<{ status: string; database: string; lastPing: string }>('/api/health'),
  },

  lessons: {
    getAll: (params?: { status?: string; subject?: string; q?: string }) => {
      const search = new URLSearchParams();
      if (params?.status) search.set('status', params.status);
      if (params?.subject) search.set('subject', params.subject);
      if (params?.q) search.set('q', params.q);
      const qs = search.toString();
      return fetcher<Lesson[]>(`/api/lessons${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => fetcher<Lesson>(`/api/lessons/${id}`),
    create: (data: Partial<Lesson>) =>
      fetcher<Lesson>('/api/lessons', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Lesson>) =>
      fetcher<Lesson>(`/api/lessons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    complete: (id: string, data?: { notes?: string; attendanceStatus?: string; durationMinutes?: number }) =>
      fetcher<{
        lessonId: string;
        xpAwarded: number;
        tutorEarned: number;
        learner: any;
        aiSummary: AISessionSummary;
      }>(`/api/lessons/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    delete: (id: string) =>
      fetcher<{ message: string }>(`/api/lessons/${id}`, {
        method: 'DELETE',
      }),
  },

  tutors: {
    getSchedule: () => fetcher<TutorAvailability[]>('/api/tutor/schedule'),
    updateSlot: (day: string, time: string, status: 'available' | 'booked' | 'blocked') =>
      fetcher<{ day: string; slots: any[] }>('/api/tutor/schedule', {
        method: 'PUT',
        body: JSON.stringify({ day, time, status }),
      }),
    getLogs: (tutorId?: string) => {
      const qs = tutorId ? `?tutorId=${tutorId}` : '';
      return fetcher<SessionLog[]>(`/api/tutor/logs${qs}`);
    },
    createLog: (log: Partial<SessionLog>) =>
      fetcher<SessionLog>('/api/tutor/logs', {
        method: 'POST',
        body: JSON.stringify(log),
      }),
    getEarnings: (tutorId?: string) => {
      const qs = tutorId ? `?tutorId=${tutorId}` : '';
      return fetcher<{
        tutorId: string;
        rateTier: string;
        hourlyRate: number;
        totalHours: number;
        totalEarned: number;
        approvedEarned: number;
        pendingEarned: number;
        sessionsLogged: number;
      }>(`/api/tutor/earnings${qs}`);
    },
  },

  invoices: {
    getAll: (status?: string) => {
      const qs = status ? `?status=${status}` : '';
      return fetcher<Invoice[]>(`/api/invoices${qs}`);
    },
    getById: (id: string) => fetcher<Invoice>(`/api/invoices/${id}`),
    create: (data: Partial<Invoice>) =>
      fetcher<Invoice>('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    markPaid: (id: string) =>
      fetcher<Invoice>(`/api/invoices/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'paid' }),
      }),
  },

  payruns: {
    getAll: () =>
      fetcher<
        {
          id: string;
          batchNumber: string;
          title: string;
          totalTutors: number;
          totalHours: number;
          totalAmount: number;
          status: string;
          authorizedAt?: string;
          authorizedBy?: string;
        }[]
      >('/api/admin/payruns'),
    authorize: (id: string, authorizedBy?: string) =>
      fetcher<any>(`/api/admin/payruns/${id}/authorize`, {
        method: 'POST',
        body: JSON.stringify({ authorizedBy }),
      }),
  },

  resources: {
    getAll: (params?: { subject?: string; type?: string; grade?: string; q?: string }) => {
      const search = new URLSearchParams();
      if (params?.subject) search.set('subject', params.subject);
      if (params?.type) search.set('type', params.type);
      if (params?.grade) search.set('grade', params.grade);
      if (params?.q) search.set('q', params.q);
      const qs = search.toString();
      return fetcher<ResourceItem[]>(`/api/resources${qs ? `?${qs}` : ''}`);
    },
    download: (id: string) =>
      fetcher<{ downloadCount: number; downloadUrl: string }>(`/api/resources/${id}/download`, {
        method: 'POST',
      }),
  },

  notices: {
    getAll: (params?: { category?: string; q?: string }) => {
      const search = new URLSearchParams();
      if (params?.category) search.set('category', params.category);
      if (params?.q) search.set('q', params.q);
      const qs = search.toString();
      return fetcher<NoticeItem[]>(`/api/notices${qs ? `?${qs}` : ''}`);
    },
    create: (notice: Partial<NoticeItem>) =>
      fetcher<NoticeItem>('/api/notices', {
        method: 'POST',
        body: JSON.stringify(notice),
      }),
  },

  learners: {
    getAll: (params?: { grade?: string; status?: string; q?: string }) => {
      const search = new URLSearchParams();
      if (params?.grade) search.set('grade', params.grade);
      if (params?.status) search.set('status', params.status);
      if (params?.q) search.set('q', params.q);
      const qs = search.toString();
      return fetcher<SponsorStudent[]>(`/api/learners${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => fetcher<any>(`/api/learners/${id}`),
    checkInStreak: (id: string) =>
      fetcher<{
        streakCount: number;
        xpGained: number;
        totalXp: number;
        level: number;
        milestoneBonus: boolean;
      }>(`/api/learners/${id}/streak`, {
        method: 'POST',
      }),
  },

  sponsors: {
    getCohort: () =>
      fetcher<{
        sponsorName: string;
        cohortName: string;
        totalScholars: number;
        avgAttendanceRate: number;
        avgBaselineScore: number;
        avgCurrentScore: number;
        avgGradeJumpPercent: number;
        totalSponsoredHoursCompleted: number;
        statusDistribution: { excelling: number; on_track: number; needs_support: number };
        moduleUplifts: { module: string; baseline: number; current: number; jump: string }[];
      }>('/api/sponsors/cohort'),
  },

  ai: {
    getRecap: (data: { subject: string; topic?: string; notes?: string }) =>
      fetcher<AISessionSummary>('/api/ai/recap', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
