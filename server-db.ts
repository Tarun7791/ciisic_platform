import fs from 'fs';
import path from 'path';
import { User, Challenge, Proposal, DiscussionThread, AuditLog, PlatformStats, Message } from './src/types';

const DB_FILE = path.join(process.cwd(), 'ciisic_db.json');

interface DatabaseSchema {
  users: User[];
  challenges: Challenge[];
  proposals: Proposal[];
  discussions: DiscussionThread[];
  auditLogs: AuditLog[];
}

// Generate random ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 11).toUpperCase();
}

// Pre-seeded data
const SEED_USERS: User[] = [
  {
    id: 'USR_ADMIN_1',
    name: 'Dr. Ramesh Kumar',
    email: 'admin@ciisic.org',
    role: 'admin',
    createdAt: new Date('2026-01-15').toISOString(),
    approvalStatus: 'approved'
  },
  {
    id: 'USR_IND_TATA',
    name: 'Sanjeev Nair',
    email: 'tata@industry.com',
    role: 'industry',
    companyName: 'Tata Steel',
    companyLogo: 'https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=120&h=120&q=80', // Industrial texture
    createdAt: new Date('2026-02-10').toISOString(),
    approvalStatus: 'approved'
  },
  {
    id: 'USR_IND_MAHINDRA',
    name: 'Anjali Sharma',
    email: 'mahindra@industry.com',
    role: 'industry',
    companyName: 'Mahindra & Mahindra',
    companyLogo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=120&h=120&q=80', // SUV/auto
    createdAt: new Date('2026-02-12').toISOString(),
    approvalStatus: 'approved'
  },
  {
    id: 'USR_IND_PENDING_RELIANCE',
    name: 'Rajesh Gupta',
    email: 'reliance@industry.com',
    role: 'industry',
    companyName: 'Reliance Industries',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&h=120&q=80',
    createdAt: new Date('2026-06-27T10:00:00Z').toISOString(),
    approvalStatus: 'pending'
  },
  {
    id: 'USR_IND_REJECTED_FAKE',
    name: 'Vikram Rao',
    email: 'vikram@fakecorp.com',
    role: 'industry',
    companyName: 'Fake Corp LLC',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&h=120&q=80',
    createdAt: new Date('2026-06-26T14:30:00Z').toISOString(),
    approvalStatus: 'rejected',
    rejectionReason: 'The provided corporate domain and company name could not be verified by our verification board.'
  },
  {
    id: 'USR_INST_IITB',
    name: 'Prof. Anil Sahasrabudhe',
    email: 'iitb@edu.in',
    role: 'institution',
    institutionName: 'IIT Bombay',
    createdAt: new Date('2026-01-20').toISOString(),
    approvalStatus: 'approved'
  },
  {
    id: 'USR_INST_BITS',
    name: 'Dr. Sandhya Rao',
    email: 'bits@edu.in',
    role: 'institution',
    institutionName: 'BITS Pilani',
    createdAt: new Date('2026-01-25').toISOString(),
    approvalStatus: 'approved'
  },
  {
    id: 'USR_INST_PENDING_NIT',
    name: 'Dr. Meera Sen',
    email: 'nittrichy@edu.in',
    role: 'institution',
    institutionName: 'NIT Trichy',
    createdAt: new Date('2026-06-27T11:15:00Z').toISOString(),
    approvalStatus: 'pending'
  },
  {
    id: 'USR_STUD_RAHUL',
    name: 'Rahul Sharma',
    email: 'student@ciisic.org', // Primary student
    role: 'student',
    studentProfile: {
      rollNumber: '22B030012',
      year: '3rd Year',
      branch: 'Computer Science & Engineering',
      institutionName: 'IIT Bombay',
      verifiedStatus: 'verified',
      bio: 'Enthusiastic developer focusing on machine learning and energy optimization solutions.',
      skills: ['Python', 'TensorFlow', 'React', 'TypeScript', 'Data Science']
    },
    createdAt: new Date('2026-03-01').toISOString()
  },
  {
    id: 'USR_STUD_PRIYA',
    name: 'Priya Patel',
    email: 'priya@student.in',
    role: 'student',
    studentProfile: {
      rollNumber: 'BITS2023A7PS012H',
      year: '4th Year',
      branch: 'Electronics & Instrumentation',
      institutionName: 'BITS Pilani',
      verifiedStatus: 'verified',
      bio: 'IoT hardware designer and embedded systems programmer. Passionate about agricultural automation.',
      skills: ['C++', 'ROS', 'IoT', 'Embedded Systems', 'PCB Design']
    },
    createdAt: new Date('2026-03-05').toISOString()
  },
  {
    id: 'USR_STUD_AMIT',
    name: 'Amit Verma',
    email: 'amit@student.in',
    role: 'student',
    studentProfile: {
      rollNumber: '23B040056',
      year: '2nd Year',
      branch: 'Mechanical Engineering',
      institutionName: 'IIT Bombay',
      verifiedStatus: 'pending',
      bio: 'Mechanical design student with hands-on experience in CAD/CAM modeling.',
      skills: ['SolidWorks', 'CAD', 'Python', 'Matlab']
    },
    createdAt: new Date('2026-03-10').toISOString()
  }
];

const SEED_CHALLENGES: Challenge[] = [
  {
    id: 'CHG_TATA_001',
    title: 'AI-Based Blast Furnace Coke Carbon Emission Optimization',
    problemStatement: 'Blast furnaces consume large amounts of coke as a reducing agent, leading to high CO2 emissions. We need a real-time predictive algorithm that optimizes fuel-air mixtures based on continuous exhaust and telemetry feeds.',
    description: 'Tata Steel is committed to reducing its carbon footprint by 30% over the next decade. In this challenge, students are provided with a simulated dataset containing blast furnace parameters (temperature, pressure, gas analysis, and raw material feed rate). The goal is to build an AI model that predicts coke consumption 15 minutes in advance and suggests corrective adjustments to the gas inflow and temperature to reduce coke usage while maintaining iron quality.',
    timeline: '3 Months (Phase 1: Model development, Phase 2: Simulation testing)',
    skillsRequired: ['Machine Learning', 'Python', 'Process Control', 'Data Analytics'],
    budget: 650000, // INR 6.5 Lakhs (Hidden from students!)
    deadline: '2026-08-15',
    industrySpocId: 'USR_IND_TATA',
    industryName: 'Tata Steel',
    companyLogo: 'https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=120&h=120&q=80',
    published: true,
    documents: [
      { id: 'DOC_T1', name: 'Blast_Furnace_Technical_Specifications.pdf', size: 2450000, url: '#' },
      { id: 'DOC_T2', name: 'Sample_Dataset_Description.csv', size: 104000, url: '#' }
    ],
    createdAt: new Date('2026-04-01').toISOString()
  },
  {
    id: 'CHG_MAH_002',
    title: 'Autonomous Navigation Algorithm for E-Tractors in Multi-Terrain Farms',
    problemStatement: 'Traditional GPS navigation fails under dense foliage or uneven agricultural terrain. We need an on-device computer vision and sensor fusion algorithm to allow electric compact tractors to follow straight tilling paths.',
    description: 'Mahindra Farm Equipment sector is prototyping an autonomous 25HP electric tractor. The tractor must navigate through crop rows, detect obstacles (animals, rocks, humans), and adjust wheel torque under muddy conditions. Students must develop a sensor-fusion algorithm that combines low-cost IMU, visual odometry from a stereo camera, and wheel encoders to maintain a tilling trajectory error of under 5 cm.',
    timeline: '4 Months (Phase 1: Simulator, Phase 2: Real-world pilot on Mahindra test tracks)',
    skillsRequired: ['ROS', 'Computer Vision', 'Deep Learning', 'Sensor Fusion', 'C++'],
    budget: 900000, // INR 9 Lakhs (Hidden from students!)
    deadline: '2026-09-01',
    industrySpocId: 'USR_IND_MAHINDRA',
    industryName: 'Mahindra & Mahindra',
    companyLogo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=120&h=120&q=80',
    published: true,
    documents: [
      { id: 'DOC_M1', name: 'E-Tractor_Sensor_Harness_Specs.pdf', size: 4120000, url: '#' }
    ],
    createdAt: new Date('2026-04-05').toISOString()
  },
  {
    id: 'CHG_TATA_002',
    title: 'Refractory Lining Thermal Degradation Warning System',
    problemStatement: 'Thermal wear of ladle refractories during liquid metal transport is a major safety hazard. Create a thermal imaging classification system to identify structural degradation.',
    description: 'We transport liquid steel at 1600°C. The refractory brick lining inside transport ladles wears out unpredictably. We have high-resolution thermal camera feeds of ladles entering and exiting the casting bay. We seek an image-processing solution that detects hotspots and predicts shell failure.',
    timeline: '2 Months',
    skillsRequired: ['Computer Vision', 'PyTorch', 'Thermal Imaging Analysis'],
    budget: 450000, // INR 4.5 Lakhs (Hidden from students!)
    deadline: '2026-07-25',
    industrySpocId: 'USR_IND_TATA',
    industryName: 'Tata Steel',
    companyLogo: 'https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=120&h=120&q=80',
    published: false, // Draft Mode!
    documents: [],
    createdAt: new Date('2026-04-10').toISOString()
  }
];

const SEED_PROPOSALS: Proposal[] = [
  {
    id: 'PRP_001',
    challengeId: 'CHG_TATA_001',
    challengeTitle: 'AI-Based Blast Furnace Coke Carbon Emission Optimization',
    studentId: 'USR_STUD_RAHUL',
    studentName: 'Student #RAHUL', // Privacy placeholder
    studentInstitution: 'IIT Bombay',
    proposalText: 'We propose a lightweight LSTM-Transformer network that captures short-term temporal dynamics in furnace exhaust gases and feeds a reinforcement learning agent. Our simulations demonstrate an average 4.2% reduction in coke consumption while maintaining high quality standards. We will deliver a complete Dockerized API service and web monitoring dashboard.',
    documents: [
      { id: 'PDOC_1', name: 'IITB_TataSteel_BlastFurnace_Proposal.pdf', size: 1850000, url: '#' }
    ],
    status: 'revision_requested',
    revisionComments: 'The core LSTM model looks great, but how do you handle telemetry sensor dropout and bad packet delivery? Please update the proposal detailing your fault-tolerance mechanisms.',
    createdAt: new Date('2026-04-15T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-04-16T14:30:00Z').toISOString()
  },
  {
    id: 'PRP_002',
    challengeId: 'CHG_MAH_002',
    challengeTitle: 'Autonomous Navigation Algorithm for E-Tractors in Multi-Terrain Farms',
    studentId: 'USR_STUD_PRIYA',
    studentName: 'Student #PRIYA', // Privacy placeholder
    studentInstitution: 'BITS Pilani',
    proposalText: 'Our solution implements an Extended Kalman Filter (EKF) combining stereo Visual Inertial Odometry (VIO) with wheel encoders. For obstacle classification, we deploy a quantized MobileNetV4 running on an onboard Coral Edge TPU to keep power consumption below 5W. We will supply full ROS2 nodes ready for deployment on your prototype tractor.',
    documents: [
      { id: 'PDOC_2', name: 'BITS_Mahindra_AutonomousTractor_Architecture.pdf', size: 3200000, url: '#' }
    ],
    status: 'approved',
    createdAt: new Date('2026-04-18T11:20:00Z').toISOString(),
    updatedAt: new Date('2026-04-20T09:00:00Z').toISOString()
  }
];

const SEED_DISCUSSIONS: DiscussionThread[] = [
  {
    id: 'PRP_001', // Linked to proposal 1
    challengeId: 'CHG_TATA_001',
    proposalId: 'PRP_001',
    updatedAt: new Date('2026-04-16T14:30:00Z').toISOString(),
    messages: [
      {
        id: 'MSG_1',
        senderId: 'USR_STUD_RAHUL',
        senderName: 'Student #RAHUL (IIT Bombay)',
        senderRole: 'student',
        text: 'Hello, we have submitted our preliminary proposal. We are looking forward to collaborating and modifying our architecture based on Tata Steel\'s production environment.',
        timestamp: new Date('2026-04-15T10:15:00Z').toISOString()
      },
      {
        id: 'MSG_2',
        senderId: 'USR_IND_TATA',
        senderName: 'Sanjeev Nair (Tata Steel SPOC)',
        senderRole: 'industry',
        text: 'Thank you for the detailed layout. The mathematical foundation of the model is outstanding. However, our actual sensors experience 5% to 8% signal drops. How will your neural controller behave when data packets are missing?',
        timestamp: new Date('2026-04-16T14:00:00Z').toISOString()
      },
      {
        id: 'MSG_3',
        senderId: 'USR_IND_TATA',
        senderName: 'Sanjeev Nair (Tata Steel SPOC)',
        senderRole: 'industry',
        text: 'I have officially requested a revision. Please attach an updated system safety/redundancy plan to your proposal.',
        timestamp: new Date('2026-04-16T14:30:00Z').toISOString()
      }
    ]
  },
  {
    id: 'PRP_002', // Linked to proposal 2
    challengeId: 'CHG_MAH_002',
    proposalId: 'PRP_002',
    updatedAt: new Date('2026-04-20T09:00:00Z').toISOString(),
    messages: [
      {
        id: 'MSG_M1',
        senderId: 'USR_STUD_PRIYA',
        senderName: 'Student #PRIYA (BITS Pilani)',
        senderRole: 'student',
        text: 'We have compiled our initial hardware layout and ROS2 nodes description. Does Mahindra have preferred simulator interfaces (like Gazebo or Webots) for pre-evaluating our odometry models?',
        timestamp: new Date('2026-04-18T11:30:00Z').toISOString()
      },
      {
        id: 'MSG_M2',
        senderId: 'USR_IND_MAHINDRA',
        senderName: 'Anjali Sharma (Mahindra SPOC)',
        senderRole: 'industry',
        text: 'Priya, we use Gazebo Classic 11 with a custom URDF model of our electric tractor. We will provide this simulation package to approved teams. Your Coral Edge TPU optimization is exactly what we were looking for to preserve tractor battery life.',
        timestamp: new Date('2026-04-19T10:00:00Z').toISOString()
      },
      {
        id: 'MSG_M3',
        senderId: 'USR_IND_MAHINDRA',
        senderName: 'Anjali Sharma (Mahindra SPOC)',
        senderRole: 'industry',
        text: 'Your proposal is officially approved! We are scheduling an introductory technical call inside the cell next week.',
        timestamp: new Date('2026-04-20T09:00:00Z').toISOString()
      }
    ]
  }
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG_1',
    action: 'login',
    description: 'Administrator Dr. Ramesh Kumar logged in.',
    actorName: 'Dr. Ramesh Kumar',
    actorEmail: 'admin@ciisic.org',
    actorRole: 'admin',
    timestamp: new Date('2026-06-25T09:00:00Z').toISOString()
  },
  {
    id: 'LOG_2',
    action: 'challenge_created',
    description: 'New draft challenge "Refractory Lining Thermal Degradation" created.',
    actorName: 'Sanjeev Nair',
    actorEmail: 'tata@industry.com',
    actorRole: 'industry',
    timestamp: new Date('2026-04-10T08:30:00Z').toISOString()
  },
  {
    id: 'LOG_3',
    action: 'proposal_submitted',
    description: 'Proposal submitted for "Blast Furnace Coke Optimization" challenge.',
    actorName: 'Rahul Sharma',
    actorEmail: 'student@ciisic.org',
    actorRole: 'student',
    timestamp: new Date('2026-04-15T10:00:00Z').toISOString()
  },
  {
    id: 'LOG_4',
    action: 'revision_requested',
    description: 'Revision requested for proposal PRP_001 by Sanjeev Nair.',
    actorName: 'Sanjeev Nair',
    actorEmail: 'tata@industry.com',
    actorRole: 'industry',
    timestamp: new Date('2026-04-16T14:30:00Z').toISOString()
  },
  {
    id: 'LOG_5',
    action: 'proposal_approved',
    description: 'Proposal PRP_002 for E-Tractor Navigation approved by Anjali Sharma.',
    actorName: 'Anjali Sharma',
    actorEmail: 'mahindra@industry.com',
    actorRole: 'industry',
    timestamp: new Date('2026-04-20T09:00:00Z').toISOString()
  }
];

// Database loading & saving helper
class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      users: [],
      challenges: [],
      proposals: [],
      discussions: [],
      auditLogs: []
    };
    this.init();
  }

  private init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure arrays exist
        if (!this.data.users) this.data.users = [];
        if (!this.data.challenges) this.data.challenges = [];
        if (!this.data.proposals) this.data.proposals = [];
        if (!this.data.discussions) this.data.discussions = [];
        if (!this.data.auditLogs) this.data.auditLogs = [];
      } else {
        // First boot: pre-seed
        this.data = {
          users: SEED_USERS,
          challenges: SEED_CHALLENGES,
          proposals: SEED_PROPOSALS,
          discussions: SEED_DISCUSSIONS,
          auditLogs: SEED_AUDIT_LOGS
        };
        this.save();
      }
    } catch (e) {
      console.error('Error loading database file. Initializing with empty state.', e);
      this.data = {
        users: SEED_USERS,
        challenges: SEED_CHALLENGES,
        proposals: SEED_PROPOSALS,
        discussions: SEED_DISCUSSIONS,
        auditLogs: SEED_AUDIT_LOGS
      };
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing to database file.', e);
    }
  }

  // --- API Methods ---

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: 'USR_' + generateId(),
      createdAt: new Date().toISOString()
    };

    // Assign default approvalStatus if industry or institution
    if (newUser.role === 'industry' || newUser.role === 'institution') {
      newUser.approvalStatus = 'pending';
    } else {
      newUser.approvalStatus = 'approved';
    }

    this.data.users.push(newUser);
    this.save();

    // Log registration
    const regRole = newUser.role === 'student' ? 'Student' : newUser.role === 'industry' ? 'Industry SPOC' : 'Institution SPOC';
    this.addAuditLog(
      'student_registered',
      `User ${newUser.name} registered as a ${regRole} (Status: ${newUser.approvalStatus}).`,
      newUser
    );

    return newUser;
  }

  updateSpocApproval(
    id: string,
    status: 'approved' | 'rejected' | 'revision_requested',
    feedback: { rejectionReason?: string; moreInfoComment?: string },
    admin: User
  ): User | undefined {
    const spoc = this.getUserById(id);
    if (!spoc || (spoc.role !== 'industry' && spoc.role !== 'institution')) return undefined;

    spoc.approvalStatus = status;
    if (status === 'rejected') {
      spoc.rejectionReason = feedback.rejectionReason || 'No reason provided';
      spoc.moreInfoComment = undefined;
    } else if (status === 'revision_requested') {
      spoc.moreInfoComment = feedback.moreInfoComment || 'More information requested';
      spoc.rejectionReason = undefined;
    } else if (status === 'approved') {
      spoc.rejectionReason = undefined;
      spoc.moreInfoComment = undefined;
    }

    this.updateUser(id, spoc);

    // Log in immutable audit logs
    const spocRoleLabel = spoc.role === 'industry' ? 'Industry SPOC' : 'Institution SPOC';
    this.addAuditLog(
      'role_changed',
      `Admin ${admin.name} updated status of ${spocRoleLabel} ${spoc.name} (${spoc.companyName || spoc.institutionName}) to ${status.toUpperCase()}.`,
      admin
    );

    return spoc;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return undefined;

    const updatedUser = {
      ...this.data.users[userIndex],
      ...updates
    };
    this.data.users[userIndex] = updatedUser;
    this.save();
    return updatedUser;
  }

  verifyStudent(studentId: string, verifiedStatus: 'verified' | 'rejected', verifier: User): User | undefined {
    const student = this.getUserById(studentId);
    if (!student || student.role !== 'student' || !student.studentProfile) return undefined;

    student.studentProfile.verifiedStatus = verifiedStatus;
    this.updateUser(studentId, { studentProfile: student.studentProfile });

    // Log verification
    this.addAuditLog(
      'student_verified',
      `Student profile for ${student.name} was ${verifiedStatus} by ${verifier.name}.`,
      verifier
    );

    return student;
  }

  // Challenges
  getChallenges(): Challenge[] {
    return this.data.challenges;
  }

  getChallengeById(id: string): Challenge | undefined {
    return this.data.challenges.find(c => c.id === id);
  }

  createChallenge(challenge: Omit<Challenge, 'id' | 'createdAt' | 'industryName' | 'companyLogo'>, industrySpoc: User): Challenge {
    const newChallenge: Challenge = {
      ...challenge,
      id: 'CHG_' + generateId(),
      industryName: industrySpoc.companyName || 'Unknown Industry',
      companyLogo: industrySpoc.companyLogo,
      createdAt: new Date().toISOString()
    };
    this.data.challenges.push(newChallenge);
    this.save();

    this.addAuditLog(
      'challenge_created',
      `Challenge "${newChallenge.title}" created as ${newChallenge.published ? 'Published' : 'Draft'}.`,
      industrySpoc
    );

    return newChallenge;
  }

  updateChallenge(id: string, updates: Partial<Challenge>, industrySpoc: User): Challenge | undefined {
    const index = this.data.challenges.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    const oldPublished = this.data.challenges[index].published;
    const updated = {
      ...this.data.challenges[index],
      ...updates,
      id // Prevent ID change
    };
    this.data.challenges[index] = updated;
    this.save();

    if (!oldPublished && updated.published) {
      this.addAuditLog(
        'challenge_published',
        `Challenge "${updated.title}" was published to students.`,
        industrySpoc
      );
    } else {
      this.addAuditLog(
        'challenge_created',
        `Challenge "${updated.title}" details updated.`,
        industrySpoc
      );
    }

    return updated;
  }

  // Proposals
  getProposals(): Proposal[] {
    return this.data.proposals;
  }

  getProposalById(id: string): Proposal | undefined {
    return this.data.proposals.find(p => p.id === id);
  }

  createProposal(proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'studentName' | 'studentInstitution' | 'status' | 'challengeTitle' | 'studentId'>, student: User): Proposal {
    const challenge = this.getChallengeById(proposal.challengeId);
    const challengeTitle = challenge ? challenge.title : 'Unknown Challenge';

    // Protect Student personal info: Industry only sees "Student #ID"
    const studentNamePlaceholder = `Student #ST-${student.id.substring(4, 9)}`;

    const newProposal: Proposal = {
      ...proposal,
      id: 'PRP_' + generateId(),
      challengeTitle,
      studentId: student.id,
      studentName: studentNamePlaceholder,
      studentInstitution: student.studentProfile?.institutionName || student.institutionName || 'CII Member Institute',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.proposals.push(newProposal);

    // Auto-create blank discussion thread
    const newDiscussion: DiscussionThread = {
      id: newProposal.id,
      challengeId: newProposal.challengeId,
      proposalId: newProposal.id,
      messages: [],
      updatedAt: new Date().toISOString()
    };
    this.data.discussions.push(newDiscussion);

    this.save();

    // Log audit
    this.addAuditLog(
      'proposal_submitted',
      `Submitted proposal for challenge "${challengeTitle}" (ID: ${newProposal.id}).`,
      student
    );

    return newProposal;
  }

  updateProposalStatus(id: string, status: 'approved' | 'rejected' | 'revision_requested', comments: string | undefined, user: User): Proposal | undefined {
    const index = this.data.proposals.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    const oldProposal = this.data.proposals[index];
    oldProposal.status = status;
    oldProposal.updatedAt = new Date().toISOString();
    if (comments) {
      oldProposal.revisionComments = comments;
    }

    this.data.proposals[index] = oldProposal;
    this.save();

    let action: 'proposal_approved' | 'proposal_rejected' | 'revision_requested' = 'proposal_approved';
    if (status === 'rejected') action = 'proposal_rejected';
    else if (status === 'revision_requested') action = 'revision_requested';

    this.addAuditLog(
      action,
      `Proposal ${id} updated to status "${status}" with comments: "${comments || 'None'}".`,
      user
    );

    return oldProposal;
  }

  resubmitProposal(id: string, text: string, documents: any[], student: User): Proposal | undefined {
    const index = this.data.proposals.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    const proposal = this.data.proposals[index];
    proposal.proposalText = text;
    proposal.documents = documents;
    proposal.status = 'pending'; // Reset back to pending reviews
    proposal.updatedAt = new Date().toISOString();

    this.data.proposals[index] = proposal;
    this.save();

    this.addAuditLog(
      'proposal_submitted',
      `Proposal ${id} was revised and resubmitted by student.`,
      student
    );

    return proposal;
  }

  // Discussions
  getDiscussionByProposalId(proposalId: string): DiscussionThread | undefined {
    return this.data.discussions.find(d => d.proposalId === proposalId);
  }

  addMessage(proposalId: string, text: string, sender: User): Message | undefined {
    const discussion = this.data.discussions.find(d => d.proposalId === proposalId);
    if (!discussion) return undefined;

    // Sender label (Respect privacy constraints: Industry SPOC cannot see Student Name, only Student #ID)
    let displayName = sender.name;
    if (sender.role === 'student') {
      const inst = sender.studentProfile?.institutionName || sender.institutionName || 'CII Member Institute';
      displayName = `Student #ST-${sender.id.substring(4, 9)} (${inst})`;
    } else if (sender.role === 'industry') {
      displayName = `${sender.name} (${sender.companyName} SPOC)`;
    } else if (sender.role === 'institution') {
      displayName = `Prof. ${sender.name} (${sender.institutionName} Coordinator)`;
    }

    const newMessage: Message = {
      id: 'MSG_' + generateId(),
      senderId: sender.id,
      senderName: displayName,
      senderRole: sender.role,
      text,
      timestamp: new Date().toISOString()
    };

    discussion.messages.push(newMessage);
    discussion.updatedAt = new Date().toISOString();
    this.save();

    this.addAuditLog(
      'message_sent',
      `Message sent on proposal discussion thread ${proposalId}.`,
      sender
    );

    return newMessage;
  }

  // Audit logs (IMMUTABLE: No editing or deleting!)
  getAuditLogs(): AuditLog[] {
    // Return sorted newest first
    return [...this.data.auditLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  private addAuditLog(action: AuditLog['action'], description: string, actor: User) {
    const newLog: AuditLog = {
      id: 'LOG_' + generateId(),
      action,
      description,
      actorName: actor.name,
      actorEmail: actor.email,
      actorRole: actor.role,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.push(newLog);
    this.save();
  }

  // Specific admin audit logger for login
  logLogin(user: User) {
    this.addAuditLog('login', `User ${user.name} logged into the system.`, user);
  }

  // Reports and Analytics
  getStats(): PlatformStats {
    const users = this.data.users;
    const challenges = this.data.challenges;
    const proposals = this.data.proposals;

    const totalUsers = users.length;
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalIndustries = users.filter(u => u.role === 'industry').length;
    const totalInstitutions = users.filter(u => u.role === 'institution').length;

    const totalChallenges = challenges.length;
    const activeChallenges = challenges.filter(c => c.published).length;

    const totalProposals = proposals.length;
    const approvedProposals = proposals.filter(p => p.status === 'approved').length;
    const rejectedProposals = proposals.filter(p => p.status === 'rejected').length;
    const revisionProposals = proposals.filter(p => p.status === 'revision_requested').length;
    const pendingProposals = proposals.filter(p => p.status === 'pending').length;

    // New approval & verification KPIs
    const pendingIndustryApprovals = users.filter(u => u.role === 'industry' && u.approvalStatus === 'pending').length;
    const pendingInstitutionApprovals = users.filter(u => u.role === 'institution' && u.approvalStatus === 'pending').length;
    const pendingStudentVerifications = users.filter(u => u.role === 'student' && u.studentProfile?.verifiedStatus === 'pending').length;

    // Student participation rate calculation: verified students who submitted proposals
    const studentsWhoSubmitted = new Set(proposals.map(p => p.studentId)).size;
    const studentParticipationRate = totalStudents > 0 
      ? Math.round((studentsWhoSubmitted / totalStudents) * 100) 
      : 0;

    return {
      totalUsers,
      totalStudents,
      totalIndustries,
      totalInstitutions,
      totalChallenges,
      activeChallenges,
      totalProposals,
      approvedProposals,
      rejectedProposals,
      revisionProposals,
      pendingProposals,
      studentParticipationRate,
      pendingIndustryApprovals,
      pendingInstitutionApprovals,
      pendingStudentVerifications
    };
  }
}

export const db = new Database();
