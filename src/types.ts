export type UserRole = 'admin' | 'industry' | 'institution' | 'student';

export interface StudentProfile {
  rollNumber: string;
  year: string;
  branch: string;
  institutionName: string;
  verifiedStatus: 'pending' | 'verified' | 'rejected';
  bio?: string;
  skills: string[];
}

export interface IndustryProfile {
  designation: string;
  mobile: string;
  website: string;
  address: string;
  sector: string;
  ciiMembershipId: string;
  registrationNumber: string;
  gstNumber?: string;
  companyIdCardFile?: string;
  authorizationLetterFile?: string;
  logoFile?: string;
}

export interface InstitutionProfile {
  designation: string;
  mobile: string;
  university: string;
  department: string;
  website: string;
  aicteCode: string;
  collegeIdCardFile?: string;
  authorizationLetterFile?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionName?: string; // For institutions
  companyName?: string;     // For industries
  companyLogo?: string;     // For industries
  studentProfile?: StudentProfile; // For students
  industryProfile?: IndustryProfile; // For Industry SPOCs
  institutionProfile?: InstitutionProfile; // For Institution SPOCs
  createdAt: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  rejectionReason?: string;
  moreInfoComment?: string;
}

export interface ChallengeDocument {
  id: string;
  name: string;
  size: number; // in bytes
  url: string;  // Simulated data url or path
}

export interface Challenge {
  id: string;
  title: string;
  problemStatement: string;
  description: string;
  timeline: string;
  skillsRequired: string[];
  budget?: number; // Secret: Hidden from students!
  deadline: string;
  industrySpocId: string;
  industryName: string;
  companyLogo?: string;
  published: boolean;
  documents: ChallengeDocument[];
  createdAt: string;
}

export interface ProposalDocument {
  id: string;
  name: string;
  size: number;
  url: string;
}

export interface Proposal {
  id: string;
  challengeId: string;
  challengeTitle: string;
  studentId: string;
  studentName: string; // Will be hidden from Industry, replaced with "Student #ID"
  studentInstitution: string;
  proposalText: string;
  documents: ProposalDocument[];
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  revisionComments?: string;
  createdAt: string;
  updatedAt: string;
  studentVerified?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export interface DiscussionThread {
  id: string; // same as proposalId for convenience
  challengeId: string;
  proposalId: string;
  messages: Message[];
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: 'challenge_created' | 'challenge_published' | 'proposal_submitted' | 'proposal_approved' | 'proposal_rejected' | 'revision_requested' | 'login' | 'role_changed' | 'student_verified' | 'student_registered' | 'message_sent';
  description: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  timestamp: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalStudents: number;
  totalIndustries: number;
  totalInstitutions: number;
  totalChallenges: number;
  activeChallenges: number;
  totalProposals: number;
  approvedProposals: number;
  rejectedProposals: number;
  revisionProposals: number;
  pendingProposals: number;
  studentParticipationRate: number; // percentage
  pendingIndustryApprovals?: number;
  pendingInstitutionApprovals?: number;
  pendingStudentVerifications?: number;
}
