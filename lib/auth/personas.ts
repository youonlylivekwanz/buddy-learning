import { Role } from '@/lib/db';

export interface PublicUserPersona {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  organizationName: string;
  title: string;
  avatarUrl: string;
  allowedViews: ('dashboard' | 'learner' | 'tutor' | 'sponsor' | 'admin')[];
}

export const VERIFIED_PERSONAS: PublicUserPersona[] = [
  {
    id: 'usr-learner-01',
    name: 'Zanele Khumalo',
    email: 'zanele.k@anglo-scholars.co.za',
    role: Role.LEARNER,
    organizationId: 'org-anglo',
    organizationName: 'Anglo American Education Foundation Branch',
    title: 'Grade 12 STEM Scholar',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    allowedViews: ['dashboard', 'learner'],
  },
  {
    id: 'usr-tutor-01',
    name: 'Sipho Sithole, BSc',
    email: 'sipho.tutor@buddylearning.co.za',
    role: Role.TUTOR,
    organizationId: 'org-hq',
    organizationName: 'Buddy Learning Global Network',
    title: 'Senior STEM Tutor (Calculus & Physics)',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    allowedViews: ['dashboard', 'tutor'],
  },
  {
    id: 'usr-mgr-anglo',
    name: 'Dr. Thandiwe Mthembu',
    email: 'thandiwe.m@anglo-edu.co.za',
    role: Role.BRANCH_MANAGER,
    organizationId: 'org-anglo',
    organizationName: 'Anglo American Education Foundation Branch',
    title: 'Bursary & Branch Director',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
    allowedViews: ['dashboard', 'sponsor'],
  },
  {
    id: 'usr-admin-01',
    name: 'Elena Rostova',
    email: 'admin@buddylearning.co.za',
    role: Role.GLOBAL_ADMIN,
    organizationId: 'org-hq',
    organizationName: 'Buddy Learning Global Network',
    title: 'Chief Academic Officer & SuperAdmin',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
    allowedViews: ['dashboard', 'learner', 'tutor', 'sponsor', 'admin'],
  },
];
