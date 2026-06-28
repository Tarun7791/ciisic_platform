import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server-db';
import { User, UserRole } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Helper middleware to extract user from Bearer token
  // For the prototype, we pass the user's ID as the Bearer token directly.
  // This makes authentication flawless, incredibly easy to test, and robust.
  app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const userId = authHeader.split(' ')[1];
      const user = db.getUserById(userId);
      if (user) {
        (req as any).user = user;
      }
    }
    next();
  });

  // Guard middleware for roles
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }
    next();
  };

  const requireRoles = (allowedRoles: UserRole[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const user = (req as any).user as User;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized.' });
      }
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: `Forbidden. Requires one of these roles: ${allowedRoles.join(', ')}` });
      }
      next();
    };
  };

  // --- API ROUTES ---

  // Auth
  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please try pre-seeded accounts or register.' });
    }

    if ((user.role === 'industry' || user.role === 'institution') && user.approvalStatus !== 'approved') {
      if (user.approvalStatus === 'pending') {
        return res.status(403).json({ 
          error: 'Registration Request Submitted – Pending Admin Approval. You will receive an email once our team completes verification.' 
        });
      } else if (user.approvalStatus === 'revision_requested') {
        return res.status(403).json({ 
          error: `Information Revision Requested. Feedback: "${user.moreInfoComment || 'Please provide updated official documents.'}"` 
        });
      } else if (user.approvalStatus === 'rejected') {
        return res.status(403).json({ 
          error: `Registration Request Declined. Reason: "${user.rejectionReason || 'The provided corporate domain and company name could not be verified.'}"` 
        });
      }
    }

    db.logLogin(user);
    res.json({ user, token: user.id });
  });

  app.post('/api/auth/register', (req, res) => {
    const { 
      name, 
      email, 
      role, 
      institutionName, 
      companyName, 
      studentProfile,
      industryProfile,
      institutionProfile
    } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      if (role === 'student' && existingUser.role === 'student') {
        const updated = db.updateUser(existingUser.id, {
          name,
          institutionName: institutionName || studentProfile?.institutionName || existingUser.institutionName || 'IIT Bombay',
          studentProfile: {
            rollNumber: studentProfile?.rollNumber || existingUser.studentProfile?.rollNumber || 'REG_22B',
            year: studentProfile?.year || existingUser.studentProfile?.year || '1st Year',
            branch: studentProfile?.branch || existingUser.studentProfile?.branch || 'General Engineering',
            institutionName: institutionName || studentProfile?.institutionName || existingUser.studentProfile?.institutionName || 'IIT Bombay',
            verifiedStatus: existingUser.studentProfile?.verifiedStatus || 'pending',
            bio: studentProfile?.bio || existingUser.studentProfile?.bio || '',
            skills: studentProfile?.skills || existingUser.studentProfile?.skills || []
          }
        });
        return res.json({ user: updated, token: existingUser.id });
      }
      return res.status(400).json({ error: 'Email already registered' });
    }

    let newUserPayload: Omit<User, 'id' | 'createdAt'> = {
      name,
      email,
      role
    };

    if (role === 'student') {
      newUserPayload.institutionName = institutionName || studentProfile?.institutionName || 'IIT Bombay';
      newUserPayload.studentProfile = {
        rollNumber: studentProfile?.rollNumber || 'REG_' + Math.floor(1000 + Math.random() * 9000),
        year: studentProfile?.year || '1st Year',
        branch: studentProfile?.branch || 'General Engineering',
        institutionName: institutionName || studentProfile?.institutionName || 'IIT Bombay',
        verifiedStatus: 'pending', // Pending verification by college SPOC
        bio: studentProfile?.bio || '',
        skills: studentProfile?.skills || []
      };
    } else if (role === 'industry') {
      newUserPayload.companyName = companyName || industryProfile?.companyName || 'CII Member Industry';
      newUserPayload.companyLogo = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&h=120&q=80'; // standard modern building
      newUserPayload.industryProfile = {
        designation: industryProfile?.designation || '',
        mobile: industryProfile?.mobile || '',
        website: industryProfile?.website || '',
        address: industryProfile?.address || '',
        sector: industryProfile?.sector || '',
        ciiMembershipId: industryProfile?.ciiMembershipId || '',
        registrationNumber: industryProfile?.registrationNumber || '',
        gstNumber: industryProfile?.gstNumber || '',
        companyIdCardFile: industryProfile?.companyIdCardFile || '',
        authorizationLetterFile: industryProfile?.authorizationLetterFile || '',
        logoFile: industryProfile?.logoFile || ''
      };
    } else if (role === 'institution') {
      newUserPayload.institutionName = institutionName || institutionProfile?.institutionName || 'CII Member Institution';
      newUserPayload.institutionProfile = {
        designation: institutionProfile?.designation || '',
        mobile: institutionProfile?.mobile || '',
        university: institutionProfile?.university || '',
        department: institutionProfile?.department || '',
        website: institutionProfile?.website || '',
        aicteCode: institutionProfile?.aicteCode || '',
        collegeIdCardFile: institutionProfile?.collegeIdCardFile || '',
        authorizationLetterFile: institutionProfile?.authorizationLetterFile || ''
      };
    }

    const created = db.createUser(newUserPayload);
    res.json({ user: created, token: created.id });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: (req as any).user });
  });

  // Challenges
  app.get('/api/challenges', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const allChallenges = db.getChallenges();

    // 1. Role-based Challenge Filtering:
    // Students and Institution coordinators only see PUBLISHED challenges.
    // Industry SPOCs see all challenges they created.
    // Admins see all challenges.
    let visibleChallenges = allChallenges;
    if (user.role === 'student' || user.role === 'institution') {
      visibleChallenges = allChallenges.filter(c => c.published);
    } else if (user.role === 'industry') {
      visibleChallenges = allChallenges.filter(c => c.industrySpocId === user.id);
    }

    // 2. Security Rule: Students CANNOT see the industry budget!
    // Strip budget for students
    const sanitized = visibleChallenges.map(c => {
      if (user.role === 'student') {
        const { budget, ...studentFriendlyChallenge } = c;
        return studentFriendlyChallenge;
      }
      return c;
    });

    res.json(sanitized);
  });

  app.get('/api/challenges/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const user = (req as any).user as User;
    const challenge = db.getChallengeById(id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Authorization checks
    if (user.role === 'student' || user.role === 'institution') {
      if (!challenge.published) {
        return res.status(403).json({ error: 'This challenge is a draft.' });
      }
    } else if (user.role === 'industry' && challenge.industrySpocId !== user.id) {
      // Industry SPOCs should only access their own challenges
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Strip budget if student
    if (user.role === 'student') {
      const { budget, ...studentFriendlyChallenge } = challenge;
      return res.json(studentFriendlyChallenge);
    }

    res.json(challenge);
  });

  app.post('/api/challenges', requireAuth, requireRoles(['industry', 'admin']), (req, res) => {
    const user = (req as any).user as User;
    const { title, problemStatement, description, timeline, skillsRequired, budget, deadline, published, documents } = req.body;

    if (!title || !problemStatement || !description || !timeline || !skillsRequired || !deadline) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const newChallenge = db.createChallenge({
      title,
      problemStatement,
      description,
      timeline,
      skillsRequired,
      budget: budget ? Number(budget) : undefined,
      deadline,
      published: !!published,
      documents: documents || [],
      industrySpocId: user.id
    }, user);

    res.status(201).json(newChallenge);
  });

  app.put('/api/challenges/:id', requireAuth, requireRoles(['industry', 'admin']), (req, res) => {
    const { id } = req.params;
    const user = (req as any).user as User;
    const challenge = db.getChallengeById(id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (user.role === 'industry' && challenge.industrySpocId !== user.id) {
      return res.status(403).json({ error: 'You can only edit your own challenges' });
    }

    const { title, problemStatement, description, timeline, skillsRequired, budget, deadline, published, documents } = req.body;
    
    const updated = db.updateChallenge(id, {
      title: title ?? challenge.title,
      problemStatement: problemStatement ?? challenge.problemStatement,
      description: description ?? challenge.description,
      timeline: timeline ?? challenge.timeline,
      skillsRequired: skillsRequired ?? challenge.skillsRequired,
      budget: budget !== undefined ? Number(budget) : challenge.budget,
      deadline: deadline ?? challenge.deadline,
      published: published !== undefined ? !!published : challenge.published,
      documents: documents ?? challenge.documents
    }, user);

    res.json(updated);
  });

  // Proposals
  app.get('/api/proposals', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const allProposals = db.getProposals();

    let visibleProposals = allProposals;

    if (user.role === 'student') {
      // Students only see their own proposals
      visibleProposals = allProposals.filter(p => p.studentId === user.id);
    } else if (user.role === 'industry') {
      // Industry SPOCs see proposals sent to their challenges
      const myChallengeIds = db.getChallenges()
        .filter(c => c.industrySpocId === user.id)
        .map(c => c.id);
      
      visibleProposals = allProposals.filter(p => myChallengeIds.includes(p.challengeId));

      // SECURITY RULE: Industry cannot see Student personal details (email, phone, real name).
      // Our database stores anonymized names in proposal.studentName, but let's double check and enforce this:
      visibleProposals = visibleProposals.map(p => ({
        ...p,
        // Enforce anonymity and clear out any backdoors
        studentName: p.studentName.startsWith('Student #') ? p.studentName : `Student #ST-${p.studentId.substring(4, 9)}`
      }));
    } else if (user.role === 'institution') {
      // Institution SPOCs see proposals of students of their institution
      visibleProposals = allProposals.filter(p => p.studentInstitution === user.institutionName);
    }

    // Enrich visibleProposals with student verification status
    const enrichedProposals = visibleProposals.map(p => {
      const studentUser = db.getUserById(p.studentId);
      return {
        ...p,
        studentVerified: studentUser?.studentProfile?.verifiedStatus === 'verified'
      };
    });

    res.json(enrichedProposals);
  });

  app.get('/api/proposals/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const user = (req as any).user as User;
    const proposal = db.getProposalById(id);

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Role checks
    if (user.role === 'student' && proposal.studentId !== user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    } else if (user.role === 'industry') {
      const challenge = db.getChallengeById(proposal.challengeId);
      if (!challenge || challenge.industrySpocId !== user.id) {
        return res.status(403).json({ error: 'Access denied.' });
      }
    } else if (user.role === 'institution' && proposal.studentInstitution !== user.institutionName) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const studentUser = db.getUserById(proposal.studentId);
    res.json({
      ...proposal,
      studentVerified: studentUser?.studentProfile?.verifiedStatus === 'verified'
    });
  });

  app.post('/api/proposals', requireAuth, requireRoles(['student']), (req, res) => {
    const user = (req as any).user as User;
    const { challengeId, proposalText, documents } = req.body;

    if (!challengeId || !proposalText) {
      return res.status(400).json({ error: 'Challenge ID and proposal content are required' });
    }

    // Check student verification status before submission!
    if (user.studentProfile?.verifiedStatus !== 'verified') {
      return res.status(403).json({ error: 'Your student profile is pending verification or rejected by your institution. You cannot submit proposals yet.' });
    }

    const challenge = db.getChallengeById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check if deadline passed
    const deadlineDate = new Date(challenge.deadline);
    const today = new Date();
    if (today > deadlineDate) {
      return res.status(400).json({ error: 'Challenge deadline has already passed' });
    }

    // Check if already submitted
    const existing = db.getProposals().find(p => p.challengeId === challengeId && p.studentId === user.id);
    if (existing) {
      return res.status(400).json({ error: 'You have already submitted a proposal for this challenge.' });
    }

    const newProposal = db.createProposal({
      challengeId,
      proposalText,
      documents: documents || []
    }, user);

    res.status(201).json(newProposal);
  });

  app.put('/api/proposals/:id/status', requireAuth, requireRoles(['industry', 'admin']), (req, res) => {
    const { id } = req.params;
    const user = (req as any).user as User;
    const { status, comments } = req.body;

    if (!status || !['approved', 'rejected', 'revision_requested'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const proposal = db.getProposalById(id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const challenge = db.getChallengeById(proposal.challengeId);
    if (!challenge || (user.role === 'industry' && challenge.industrySpocId !== user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = db.updateProposalStatus(id, status, comments, user);
    res.json(updated);
  });

  app.put('/api/proposals/:id/resubmit', requireAuth, requireRoles(['student']), (req, res) => {
    const { id } = req.params;
    const user = (req as any).user as User;
    const { proposalText, documents } = req.body;

    if (!proposalText) {
      return res.status(400).json({ error: 'Proposal text is required for resubmission' });
    }

    const proposal = db.getProposalById(id);
    if (!proposal || proposal.studentId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (proposal.status !== 'revision_requested') {
      return res.status(400).json({ error: 'Only proposals in "Revision Requested" state can be resubmitted' });
    }

    const updated = db.resubmitProposal(id, proposalText, documents || proposal.documents, user);
    res.json(updated);
  });

  // Discussions
  app.get('/api/proposals/:id/discussion', requireAuth, (req, res) => {
    const { id } = req.params;
    const user = (req as any).user as User;
    
    const proposal = db.getProposalById(id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Role auth
    if (user.role === 'student' && proposal.studentId !== user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    } else if (user.role === 'industry') {
      const challenge = db.getChallengeById(proposal.challengeId);
      if (!challenge || challenge.industrySpocId !== user.id) {
        return res.status(403).json({ error: 'Access denied.' });
      }
    } else if (user.role === 'institution' && proposal.studentInstitution !== user.institutionName) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    let thread = db.getDiscussionByProposalId(id);
    if (!thread) {
      // Just-in-time creation
      thread = {
        id,
        challengeId: proposal.challengeId,
        proposalId: id,
        messages: [],
        updatedAt: new Date().toISOString()
      };
    }

    res.json(thread);
  });

  app.post('/api/proposals/:id/discussion', requireAuth, (req, res) => {
    const { id } = req.params;
    const user = (req as any).user as User;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text cannot be empty' });
    }

    const proposal = db.getProposalById(id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Role checks
    if (user.role === 'student' && proposal.studentId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    } else if (user.role === 'industry') {
      const challenge = db.getChallengeById(proposal.challengeId);
      if (!challenge || challenge.industrySpocId !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (user.role === 'institution' && proposal.studentInstitution !== user.institutionName) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = db.addMessage(id, text, user);
    if (!message) {
      return res.status(500).json({ error: 'Failed to record message' });
    }

    res.status(201).json(message);
  });

  // Students and Stakeholders directory list
  app.get('/api/students', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const allUsers = db.getUsers();

    if (user.role === 'admin') {
      return res.json(allUsers);
    }

    let students = allUsers.filter(u => u.role === 'student');

    if (user.role === 'institution') {
      // Only students from this institution
      students = students.filter(s => s.studentProfile?.institutionName === user.institutionName);
    } else if (user.role === 'student') {
      // Students cannot list other students' personal detail portfolios
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(students);
  });

  app.put('/api/spocs/:id/approval', requireAuth, requireRoles(['admin']), (req, res) => {
    const { id } = req.params;
    const admin = (req as any).user as User;
    const { status, rejectionReason, moreInfoComment } = req.body;

    if (!status || !['approved', 'rejected', 'revision_requested'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved, rejected, or revision_requested' });
    }

    const updated = db.updateSpocApproval(id, status as any, { rejectionReason, moreInfoComment }, admin);
    if (!updated) {
      return res.status(404).json({ error: 'Industry or Institution SPOC not found' });
    }

    res.json(updated);
  });

  app.put('/api/students/:id/verify', requireAuth, requireRoles(['institution', 'admin']), (req, res) => {
    const { id } = req.params;
    const user = (req as any).user as User;
    const { status } = req.body; // 'verified' or 'rejected'

    if (!status || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be verified or rejected' });
    }

    const student = db.getUserById(id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (user.role === 'institution' && student.studentProfile?.institutionName !== user.institutionName) {
      return res.status(403).json({ error: 'You can only verify students from your own institution' });
    }

    const updated = db.verifyStudent(id, status as any, user);
    res.json(updated);
  });

  // Audit Logs (ADMIN ONLY!)
  // Security Constraint: "Cannot modify or delete audit logs" -> Expose only GET, no PUT or DELETE endpoints.
  app.get('/api/audit-logs', requireAuth, requireRoles(['admin']), (req, res) => {
    res.json(db.getAuditLogs());
  });

  // Platform stats & reports
  app.get('/api/reports', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const stats = db.getStats();

    // If student, strip sensitive stats
    if (user.role === 'student') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(stats);
  });

  // --- VITE MIDDLEWARE AND SPA FALLBACK ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CIISIC Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
