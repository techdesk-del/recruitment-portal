import { Candidate, JobPosting, InterviewSchedule, CallRecord } from '../types';

export const INITIAL_JOBS: JobPosting[] = [
  {
    id: 'job-fe-01',
    title: 'Senior Frontend Engineer (React/TypeScript)',
    department: 'Engineering',
    location: 'Bangalore / Hybrid',
    type: 'Full-time',
    experienceRequired: '3-6 Years',
    salaryRange: '₹18 - 28 LPA',
    openPositions: 3,
    postedDate: '2026-08-10T09:00:00Z',
    status: 'active',
    platforms: ['naukri', 'linkedin', 'indeed', 'urbangaon'],
    applicantsCount: 142,
    hiredCount: 1
  },
  {
    id: 'job-be-02',
    title: 'Lead Backend Developer (Node.js & Go)',
    department: 'Engineering',
    location: 'Remote (India)',
    type: 'Full-time',
    experienceRequired: '5-8 Years',
    salaryRange: '₹28 - 40 LPA',
    openPositions: 2,
    postedDate: '2026-08-05T11:30:00Z',
    status: 'active',
    platforms: ['naukri', 'linkedin', 'indeed'],
    applicantsCount: 98,
    hiredCount: 0
  },
  {
    id: 'job-pm-03',
    title: 'Senior Product Manager (FinTech/Growth)',
    department: 'Product',
    location: 'Gurgaon / Onsite',
    type: 'Full-time',
    experienceRequired: '4-7 Years',
    salaryRange: '₹25 - 38 LPA',
    openPositions: 1,
    postedDate: '2026-08-12T14:00:00Z',
    status: 'active',
    platforms: ['linkedin', 'urbangaon', 'referral'],
    applicantsCount: 64,
    hiredCount: 0
  },
  {
    id: 'job-qa-04',
    title: 'Lead QA Automation Engineer (Playwright/Cypress)',
    department: 'Quality Assurance',
    location: 'Pune / Hybrid',
    type: 'Full-time',
    experienceRequired: '4-7 Years',
    salaryRange: '₹16 - 24 LPA',
    openPositions: 2,
    postedDate: '2026-08-08T10:15:00Z',
    status: 'active',
    platforms: ['naukri', 'indeed', 'urbangaon'],
    applicantsCount: 53,
    hiredCount: 1
  },
  {
    id: 'job-ux-05',
    title: 'UI/UX Product Designer (Figma/Design Systems)',
    department: 'Design',
    location: 'Mumbai / Remote',
    type: 'Full-time',
    experienceRequired: '2-5 Years',
    salaryRange: '₹14 - 22 LPA',
    openPositions: 1,
    postedDate: '2026-08-14T16:45:00Z',
    status: 'active',
    platforms: ['linkedin', 'internshala', 'urbangaon'],
    applicantsCount: 76,
    hiredCount: 0
  },
  {
    id: 'job-devops-06',
    title: 'DevOps / Cloud Platform Engineer (AWS, K8s)',
    department: 'Infrastructure',
    location: 'Hyderabad / Hybrid',
    type: 'Full-time',
    experienceRequired: '3-6 Years',
    salaryRange: '₹20 - 32 LPA',
    openPositions: 2,
    postedDate: '2026-08-01T08:00:00Z',
    status: 'active',
    platforms: ['naukri', 'linkedin', 'indeed'],
    applicantsCount: 89,
    hiredCount: 1
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-001',
    name: 'Rajesh Kumar Verma',
    email: 'rajesh.verma@techmail.com',
    phone: '+91 98765 43210',
    location: 'Bengaluru, Karnataka',
    source: 'naukri',
    sourceId: 'NAUK-884920',
    jobAppliedFor: 'Senior Frontend Engineer (React/TypeScript)',
    jobId: 'job-fe-01',
    department: 'Engineering',
    appliedDate: '2026-08-24T10:15:00Z',
    lastUpdatedDate: '2026-08-25T16:30:00Z',
    status: 'shortlisted',
    atsMatchScore: 94,
    rating: 5,
    experienceYears: 4.5,
    currentCompany: 'Infosys Digital Labs',
    currentDesignation: 'Senior Systems Engineer',
    currentSalary: '₹14.5 LPA',
    expectedSalary: '₹22 - 25 LPA',
    noticePeriod: '30 Days',
    recruiterAssigned: 'Priya Sharma',
    tags: ['React 18', 'TypeScript', 'Next.js', 'Redux Toolkit', 'Tailwind CSS', 'Performance Tuning'],
    notes: 'Outstanding portfolio. Led the migration of legacy AngularJS to React 18 at Infosys. Strong knowledge of Webpack 5 module federation & Core Web Vitals.',
    profileUrl: 'https://linkedin.com/in/rajesh-verma-dev',
    resumeData: {
      summary: 'Passionate Senior Frontend Engineer with 4.5+ years building high-traffic, accessible web apps in FinTech and E-commerce. Specialized in React, TypeScript, Next.js SSR, and micro-frontend architectures with 99.9% uptime.',
      skills: ['React.js', 'TypeScript', 'Next.js', 'Redux Toolkit', 'Tailwind CSS', 'GraphQL', 'Jest & React Testing Library', 'Webpack', 'CI/CD Pipelines'],
      experience: [
        {
          company: 'Infosys Digital Labs',
          role: 'Senior Systems Engineer (Frontend Lead)',
          duration: 'Jan 2023 - Present',
          location: 'Bengaluru, India',
          highlights: [
            'Architected client banking portal handling 4.2M daily active sessions with sub-1.2s Largest Contentful Paint (LCP).',
            'Mentored 6 junior engineers and spearheaded design system unification reducing UI bugs by 38%.',
            'Implemented state management patterns with Redux Toolkit and RTK Query, slashing API payload redundancies.'
          ]
        },
        {
          company: 'Wipro Technologies',
          role: 'Software Engineer',
          duration: 'Jul 2021 - Dec 2022',
          location: 'Hyderabad, India',
          highlights: [
            'Developed modular UI components for international payment checkout flow.',
            'Collaborated closely with UX designers to achieve WCAG 2.1 AA accessibility compliance.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.Tech in Computer Science and Engineering',
          institution: 'Vellore Institute of Technology (VIT), Vellore',
          year: '2017 - 2021',
          grade: 'CGPA: 8.8 / 10'
        }
      ],
      certifications: ['AWS Certified Cloud Practitioner', 'Meta Certified Front-End Developer']
    },
    scorecard: {
      technical: 5,
      problemSolving: 5,
      communication: 4,
      cultureFit: 5,
      overallRecommendation: 'strong_hire',
      evaluationNotes: 'Exceptional hands-on React architecture understanding and deep intuition on browser rendering pipeline.'
    },
    activityHistory: [
      {
        id: 'act-101',
        action: 'Application Ingested',
        details: 'Candidate profile parsed automatically via Naukri Corporate API Ingestion.',
        performedBy: 'Naukri Sync Engine',
        timestamp: '2026-08-24T10:15:00Z',
        type: 'ingestion'
      },
      {
        id: 'act-102',
        action: 'Candidate Shortlisted',
        details: 'Shortlisted by Priya Sharma for Round 1 Technical Screening.',
        performedBy: 'Priya Sharma',
        timestamp: '2026-08-25T16:30:00Z',
        type: 'status'
      }
    ]
  },
  {
    id: 'cand-002',
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@fastmail.com',
    phone: '+91 97112 88419',
    location: 'Pune, Maharashtra',
    source: 'linkedin',
    sourceId: 'LI-901824',
    jobAppliedFor: 'Lead Backend Developer (Node.js & Go)',
    jobId: 'job-be-02',
    department: 'Engineering',
    appliedDate: '2026-08-23T14:20:00Z',
    lastUpdatedDate: '2026-08-26T09:40:00Z',
    status: 'interview_r2',
    atsMatchScore: 97,
    rating: 5,
    experienceYears: 6.8,
    currentCompany: 'Razorpay / Fintech Corp',
    currentDesignation: 'Senior Backend Engineer',
    currentSalary: '₹26 LPA',
    expectedSalary: '₹34 - 38 LPA',
    noticePeriod: '15 Days (Serving Notice)',
    recruiterAssigned: 'Amit Singh',
    tags: ['Node.js', 'Golang', 'Distributed Systems', 'PostgreSQL', 'Kafka', 'Redis', 'Docker', 'Kubernetes'],
    notes: 'Extremely strong backend systems background. Currently serving notice, available to join in 2 weeks. R1 Technical passed with flying colors.',
    profileUrl: 'https://linkedin.com/in/ananya-deshmukh-be',
    resumeData: {
      summary: 'Staff/Lead Backend Engineer with nearly 7 years designing resilient microservices, high-throughput message streaming, and distributed transactional architectures processing 50k+ QPS.',
      skills: ['Golang', 'Node.js / Express / NestJS', 'PostgreSQL', 'Redis Distributed Caching', 'Apache Kafka', 'gRPC & Protocol Buffers', 'Kubernetes & Helm', 'AWS (ECS, EKS, RDS, S3)'],
      experience: [
        {
          company: 'Razorpay / Fintech Core',
          role: 'Senior Backend Engineer',
          duration: 'Mar 2022 - Present',
          location: 'Pune, India',
          highlights: [
            'Engineered low-latency payout routing service in Go handling ₹200Cr+ monthly volume with p99 < 45ms.',
            'Architected event-driven settlement worker using Apache Kafka and Redis cluster locks to eliminate race conditions.',
            'Reduced AWS RDS IOPS costs by 42% through query index tuning and aggressive connection pooling.'
          ]
        },
        {
          company: 'Persistent Systems',
          role: 'Backend Developer',
          duration: 'Aug 2019 - Feb 2022',
          location: 'Pune, India',
          highlights: [
            'Built RESTful and GraphQL APIs for enterprise logistics management using Node.js and PostgreSQL.',
            'Implemented JWT-based RBAC authorization layer and automated integration test pipelines.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.E. in Information Technology',
          institution: 'College of Engineering Pune (COEP)',
          year: '2015 - 2019',
          grade: 'First Class with Distinction'
        }
      ],
      certifications: ['Certified Kubernetes Administrator (CKA)', 'AWS Certified Solutions Architect – Associate']
    },
    scorecard: {
      technical: 5,
      problemSolving: 5,
      communication: 4,
      cultureFit: 5,
      overallRecommendation: 'strong_hire',
      evaluationNotes: 'Mastery over concurrency patterns, goroutines, distributed locking, and Kafka consumer group rebalancing.'
    },
    activityHistory: [
      {
        id: 'act-201',
        action: 'Application Ingested',
        details: 'Received via LinkedIn EasyApply email ingestion parser.',
        performedBy: 'LinkedIn Email Parser',
        timestamp: '2026-08-23T14:20:00Z',
        type: 'ingestion'
      },
      {
        id: 'act-202',
        action: 'Interview R1 Completed',
        details: 'Cleared System Design & Concurrency Round by Principal Architect.',
        performedBy: 'Amit Singh',
        timestamp: '2026-08-25T11:00:00Z',
        type: 'interview'
      },
      {
        id: 'act-203',
        action: 'Moved to R2 Leadership Round',
        details: 'Scheduled with VP of Engineering for culture & architecture alignment.',
        performedBy: 'Amit Singh',
        timestamp: '2026-08-26T09:40:00Z',
        type: 'status'
      }
    ]
  },
  {
    id: 'cand-003',
    name: 'Siddharth Nair',
    email: 'siddharth.nair@workmail.in',
    phone: '+91 94471 20394',
    location: 'Kochi / Remote',
    source: 'indeed',
    sourceId: 'IND-77129',
    jobAppliedFor: 'Lead QA Automation Engineer (Playwright/Cypress)',
    jobId: 'job-qa-04',
    department: 'Quality Assurance',
    appliedDate: '2026-08-22T09:00:00Z',
    lastUpdatedDate: '2026-08-25T17:10:00Z',
    status: 'offered',
    atsMatchScore: 91,
    rating: 4,
    experienceYears: 5.2,
    currentCompany: 'UST Global',
    currentDesignation: 'Lead Automation QA',
    currentSalary: '₹15 LPA',
    expectedSalary: '₹21 - 23 LPA',
    noticePeriod: 'Immediate',
    recruiterAssigned: 'Neha Verma',
    tags: ['Playwright', 'Cypress', 'TypeScript', 'API Testing', 'CI/CD GitHub Actions', 'Performance/k6'],
    notes: 'Offered ₹22.5 LPA. Immediate joiner. Built automated cross-browser test suites from scratch.',
    resumeData: {
      summary: 'QA Automation Lead with 5+ years driving automated testing frameworks using Playwright, Cypress, and TypeScript. Reduced deployment regression cycles from 3 days to 45 minutes.',
      skills: ['Playwright', 'Cypress', 'JavaScript / TypeScript', 'Postman / Newman', 'k6 Load Testing', 'Docker', 'GitHub Actions', 'Jira / Xray'],
      experience: [
        {
          company: 'UST Global',
          role: 'Lead Automation QA Engineer',
          duration: 'Nov 2022 - Present',
          location: 'Kochi, Kerala',
          highlights: [
            'Created parallel Playwright test grid running 400+ E2E tests in under 12 minutes in CI/CD pipeline.',
            'Standardized API testing framework using Supertest & Jest, catching 85% of breaking changes pre-merge.',
            'Conducted k6 load testing simulations for Diwali flash sale peaks up to 30,000 virtual users.'
          ]
        },
        {
          company: 'IBS Software',
          role: 'Test Automation Engineer',
          duration: 'Aug 2020 - Oct 2022',
          location: 'Trivandrum, Kerala',
          highlights: [
            'Automated airline ticketing workflow using Selenium WebDriver and Java with BDD Cucumber.',
            'Integrated defect reporting directly with Slack and Jira webhooks.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.Tech in Computer Engineering',
          institution: 'Cochin University of Science and Technology (CUSAT)',
          year: '2016 - 2020',
          grade: 'CGPA: 8.4 / 10'
        }
      ]
    },
    activityHistory: [
      {
        id: 'act-301',
        action: 'Application Ingested',
        details: 'Received via Indeed Real-time Webhook.',
        performedBy: 'Indeed Webhook Engine',
        timestamp: '2026-08-22T09:00:00Z',
        type: 'ingestion'
      },
      {
        id: 'act-302',
        action: 'Offer Letter Released',
        details: 'Offer letter dispatched for ₹22.5 LPA with joining date set for next Monday.',
        performedBy: 'Neha Verma',
        timestamp: '2026-08-25T17:10:00Z',
        type: 'status'
      }
    ]
  },
  {
    id: 'cand-004',
    name: 'Pooja Bhattacharya',
    email: 'pooja.bhattacharya@designstudio.io',
    phone: '+91 98301 92847',
    location: 'Kolkata / Hybrid',
    source: 'urbangaon',
    sourceId: 'UG-DIRECT-1049',
    jobAppliedFor: 'UI/UX Product Designer (Figma/Design Systems)',
    jobId: 'job-ux-05',
    department: 'Design',
    appliedDate: '2026-08-25T11:45:00Z',
    lastUpdatedDate: '2026-08-25T15:20:00Z',
    status: 'interview_r1',
    atsMatchScore: 89,
    rating: 4,
    experienceYears: 3.5,
    currentCompany: 'Zomato Partner Ecosystem',
    currentDesignation: 'Product Designer',
    currentSalary: '₹12 LPA',
    expectedSalary: '₹18 - 20 LPA',
    noticePeriod: '30 Days',
    recruiterAssigned: 'Priya Sharma',
    tags: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Micro-interactions', 'Design Tokens'],
    notes: 'Direct application through our careers portal. Stunning portfolio with deep research methodologies for Bharat/tier-2 users.',
    profileUrl: 'https://poojabhattacharya.design',
    resumeData: {
      summary: 'Product Designer with 3.5+ years building intuitive, scalable digital experiences for 10M+ users. Passionate about design systems, accessible UX, and conversion-focused interaction design.',
      skills: ['Figma Mastery', 'Design Tokens & Variables', 'User Journey Mapping', 'Framer / Prototyping', 'Qualitative User Research', 'Usability Testing', 'HTML/CSS Basics'],
      experience: [
        {
          company: 'Zomato Partner Ecosystem',
          role: 'Product Designer',
          duration: 'Jan 2023 - Present',
          location: 'Gurgaon / Remote',
          highlights: [
            'Redesigned merchant onboarding flow, improving completion rates from 62% to 84%.',
            'Built atomic design component library in Figma with multi-brand variable modes.',
            'Conducted 35+ in-depth user interviews with rural and tier-2 restaurant owners.'
          ]
        },
        {
          company: 'Freelance Design Consultant',
          role: 'UI/UX Designer',
          duration: 'Jul 2021 - Dec 2022',
          location: 'Kolkata, India',
          highlights: [
            'Delivered complete UX prototypes for 4 SaaS startups in AgriTech and EdTech sectors.',
            'Created brand guidelines, iconography sets, and high-fidelity interaction prototypes.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.Des in Visual Communication Design',
          institution: 'National Institute of Design (NID), Ahmedabad',
          year: '2017 - 2021',
          grade: 'Distinction'
        }
      ]
    },
    activityHistory: [
      {
        id: 'act-401',
        action: 'Application Ingested',
        details: 'Candidate submitted via UrbanGaon Careers Portal.',
        performedBy: 'UrbanGaon Portal Ingestion',
        timestamp: '2026-08-25T11:45:00Z',
        type: 'ingestion'
      },
      {
        id: 'act-402',
        action: 'Shortlisted for Portfolio Review',
        details: 'Portfolio reviewed and approved by Design Lead.',
        performedBy: 'Priya Sharma',
        timestamp: '2026-08-25T15:20:00Z',
        type: 'status'
      }
    ]
  },
  {
    id: 'cand-005',
    name: 'Vikramaditya Rathore',
    email: 'vikram.rathore@fintechlab.com',
    phone: '+91 99283 71625',
    location: 'Jaipur / NCR',
    source: 'referral',
    sourceId: 'REF-EMP-041',
    jobAppliedFor: 'Senior Product Manager (FinTech/Growth)',
    jobId: 'job-pm-03',
    department: 'Product',
    appliedDate: '2026-08-21T18:00:00Z',
    lastUpdatedDate: '2026-08-26T11:00:00Z',
    status: 'interview_r2',
    atsMatchScore: 92,
    rating: 5,
    experienceYears: 5.8,
    currentCompany: 'Paytm Payments Bank',
    currentDesignation: 'Product Manager - Growth',
    currentSalary: '₹22 LPA',
    expectedSalary: '₹32 - 35 LPA',
    noticePeriod: '30 Days',
    recruiterAssigned: 'Rajesh Gupta',
    tags: ['Product Strategy', 'Growth Funnels', 'SQL & Metabase', 'A/B Testing', 'UPI & Payments', 'Agile Scrum'],
    notes: 'Referred by VP Tech. Strong background in consumer lending and UPI transaction growth.',
    resumeData: {
      summary: 'Data-driven Senior PM with 5.5+ years scaling consumer FinTech products. Increased user retention by 24% and led cross-functional squads across Engineering, Design, Compliance, and Operations.',
      skills: ['Product Lifecycle Management', 'Growth Experimentation', 'SQL & Mixpanel Analytics', 'Wireframing', 'PRD & Feature Specs', 'UPI 2.0 & BBPS Protocols', 'Stakeholder Management'],
      experience: [
        {
          company: 'Paytm Payments Bank',
          role: 'Product Manager - Consumer Growth',
          duration: 'Aug 2022 - Present',
          location: 'Noida, India',
          highlights: [
            'Scaled recurring subscription billing product to ₹120Cr ARR within 14 months of launch.',
            'Ran 40+ iterative A/B experiments on onboarding funnels, lifting KYC completion by 19%.',
            'Managed roadmap for squad of 14 engineers, 2 QA, and 2 designers using 2-week agile sprints.'
          ]
        },
        {
          company: 'KreditBee',
          role: 'Associate Product Manager',
          duration: 'Jun 2020 - Jul 2022',
          location: 'Bengaluru, India',
          highlights: [
            'Built real-time credit bureau ingestion pipeline reducing instant loan approval latency from 4 mins to 28 secs.'
          ]
        }
      ],
      education: [
        {
          degree: 'MBA in Tech Management',
          institution: 'NMIMS Mumbai',
          year: '2018 - 2020',
          grade: 'Top 5% Batch'
        },
        {
          degree: 'B.Tech in Information Technology',
          institution: 'MNIT Jaipur',
          year: '2014 - 2018'
        }
      ]
    },
    activityHistory: [
      {
        id: 'act-501',
        action: 'Candidate Referred',
        details: 'Internal employee referral submitted by VP Engineering.',
        performedBy: 'Internal System',
        timestamp: '2026-08-21T18:00:00Z',
        type: 'ingestion'
      }
    ]
  },
  {
    id: 'cand-006',
    name: 'Meghna Sundaram',
    email: 'meghna.sundaram@cloudtech.org',
    phone: '+91 98402 11984',
    location: 'Chennai, Tamil Nadu',
    source: 'naukri',
    sourceId: 'NAUK-918231',
    jobAppliedFor: 'DevOps / Cloud Platform Engineer (AWS, K8s)',
    jobId: 'job-devops-06',
    department: 'Infrastructure',
    appliedDate: '2026-08-25T14:10:00Z',
    lastUpdatedDate: '2026-08-26T08:30:00Z',
    status: 'screening',
    atsMatchScore: 88,
    rating: 4,
    experienceYears: 4.0,
    currentCompany: 'Freshworks',
    currentDesignation: 'DevOps Engineer',
    currentSalary: '₹16 LPA',
    expectedSalary: '₹24 - 26 LPA',
    noticePeriod: '60 Days',
    recruiterAssigned: 'Amit Singh',
    tags: ['Terraform', 'Kubernetes', 'AWS EKS', 'ArgoCD', 'Prometheus', 'Grafana', 'Helm Charts', 'Bash/Python'],
    notes: 'Strong Terraform IaC and multi-region Kubernetes cluster management experience. Notice period is 60 days negotiable to 30.',
    resumeData: {
      summary: 'Site Reliability and DevOps Engineer with 4 years specializing in Infrastructure as Code (IaC), zero-downtime GitOps deployments, and Kubernetes cluster optimization.',
      skills: ['Terraform', 'Kubernetes / Helm', 'AWS (EKS, IAM, CloudFront, Lambda)', 'ArgoCD & Flux', 'Prometheus & Grafana Alerting', 'Python & Bash Automation', 'Vault Secret Management'],
      experience: [
        {
          company: 'Freshworks',
          role: 'DevOps Engineer',
          duration: 'Jan 2023 - Present',
          location: 'Chennai, India',
          highlights: [
            'Maintained multi-tenant Kubernetes clusters across 3 AWS regions with 99.98% service availability.',
            'Automated VPC and security group provisioning using modular Terraform configurations.',
            'Built observability dashboards in Grafana reducing Mean Time to Detection (MTTD) by 45%.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.E. in Electronics & Communication',
          institution: 'Anna University, CEG Campus Chennai',
          year: '2018 - 2022',
          grade: 'CGPA: 8.6 / 10'
        }
      ]
    },
    activityHistory: [
      {
        id: 'act-601',
        action: 'Application Ingested',
        details: 'Ingested via Naukri Corporate Integration.',
        performedBy: 'Naukri Sync Engine',
        timestamp: '2026-08-25T14:10:00Z',
        type: 'ingestion'
      }
    ]
  },
  {
    id: 'cand-007',
    name: 'Karan Mehra',
    email: 'karan.mehra@codecraft.co',
    phone: '+91 98190 44219',
    location: 'Gurgaon, Haryana',
    source: 'internshala',
    sourceId: 'ISH-55102',
    jobAppliedFor: 'UI/UX Product Designer (Figma/Design Systems)',
    jobId: 'job-ux-05',
    department: 'Design',
    appliedDate: '2026-08-26T07:20:00Z',
    lastUpdatedDate: '2026-08-26T07:20:00Z',
    status: 'applied',
    atsMatchScore: 82,
    rating: 3,
    experienceYears: 1.8,
    currentCompany: 'ScaleUp Labs',
    currentDesignation: 'Junior UI Designer',
    currentSalary: '₹6.5 LPA',
    expectedSalary: '₹12 - 14 LPA',
    noticePeriod: 'Immediate',
    recruiterAssigned: 'Neha Verma',
    tags: ['Figma', 'UI Animation', 'Design Tokens', 'Design Systems'],
    notes: 'Recent applicant from Internshala. Good design eye, needs interview screening for product thinking.',
    resumeData: {
      summary: 'Creative Junior UI/UX Designer with 1.8 years crafting responsive web and mobile interfaces in Figma. Enthusiastic about motion design and micro-interactions.',
      skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'Design Systems', 'HTML/CSS Basics'],
      experience: [
        {
          company: 'ScaleUp Labs',
          role: 'Junior UI Designer',
          duration: 'Jul 2024 - Present',
          location: 'Gurgaon, India',
          highlights: [
            'Designed landing pages and onboarding illustrations that boosted signup conversion by 18%.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.Des in Communication Design',
          institution: 'Pearl Academy Delhi',
          year: '2020 - 2024'
        }
      ]
    },
    activityHistory: [
      {
        id: 'act-701',
        action: 'Application Ingested',
        details: 'Received from Internshala direct applicant queue.',
        performedBy: 'Internshala Sync',
        timestamp: '2026-08-26T07:20:00Z',
        type: 'ingestion'
      }
    ]
  },
  {
    id: 'cand-008',
    name: 'Tanya Sengupta',
    email: 'tanya.sengupta@finscale.in',
    phone: '+91 98310 55432',
    location: 'Kolkata / Remote',
    source: 'linkedin',
    sourceId: 'LI-994102',
    jobAppliedFor: 'Senior Frontend Engineer (React/TypeScript)',
    jobId: 'job-fe-01',
    department: 'Engineering',
    appliedDate: '2026-08-20T12:00:00Z',
    lastUpdatedDate: '2026-08-24T18:00:00Z',
    status: 'joined',
    atsMatchScore: 96,
    rating: 5,
    experienceYears: 5.0,
    currentCompany: 'PayU Payments',
    currentDesignation: 'Senior Frontend Developer',
    currentSalary: '₹18 LPA',
    expectedSalary: '₹26 LPA',
    noticePeriod: 'Joined',
    recruiterAssigned: 'Priya Sharma',
    tags: ['React', 'TypeScript', 'GraphQL', 'Next.js', 'Design Systems', 'Microfrontends'],
    notes: 'Successfully joined! Excellent addition to the frontend core team.',
    resumeData: {
      summary: 'Senior Frontend Architect with 5 years experience scaling web applications. Strong focus on design systems, web performance, and state management.',
      skills: ['React 18', 'TypeScript', 'GraphQL', 'Next.js', 'Zustand / Redux', 'Cypress', 'Vite & Webpack'],
      experience: [
        {
          company: 'PayU Payments',
          role: 'Senior Frontend Developer',
          duration: 'May 2022 - Aug 2026',
          location: 'Gurgaon, India',
          highlights: [
            'Led frontend development of core merchant analytics dashboard used by 100k+ Indian businesses.',
            'Improved bundle size by 48% via dynamic code splitting and tree-shaking optimizations.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.Tech in Computer Science',
          institution: 'Jadavpur University',
          year: '2017 - 2021',
          grade: 'First Class with Honors'
        }
      ]
    },
    activityHistory: [
      {
        id: 'act-801',
        action: 'Candidate Joined',
        details: 'Candidate onboarded successfully and joined the engineering team.',
        performedBy: 'Priya Sharma',
        timestamp: '2026-08-24T18:00:00Z',
        type: 'status'
      }
    ]
  }
];

export const INITIAL_INTERVIEWS: InterviewSchedule[] = [
  {
    id: 'int-001',
    candidateId: 'cand-001',
    candidateName: 'Rajesh Kumar Verma',
    candidateEmail: 'rajesh.verma@techmail.com',
    candidatePhone: '+91 98765 43210',
    candidateLocation: 'Bengaluru, Karnataka',
    jobTitle: 'Senior Frontend Engineer (React/TypeScript)',
    jobId: 'job-fe-01',
    department: 'Engineering',
    round: 'Round 2: System Design & Coding',
    date: '2026-08-29',
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    durationMinutes: 60,
    interviewerName: 'Akash Das',
    interviewerRole: 'CEO / SDE-3 Lead',
    interviewerEmail: 'akash.das@urbangaon.com',
    platform: 'google_meet',
    meetingLink: 'https://meet.google.com/urb-fend-arc',
    meetingId: 'urb-fend-arc',
    meetingPasscode: 'ug2026',
    status: 'in_progress',
    feedbackStatus: 'pending',
    notes: 'Focus on React 18 Concurrent Rendering, SSR performance optimization, and Microfrontend state synchronization.',
    atsMatchScore: 94,
    tags: ['React 18', 'TypeScript', 'System Design'],
    createdAt: '2026-08-26T10:00:00Z',
    updatedAt: '2026-08-29T09:00:00Z'
  },
  {
    id: 'int-002',
    candidateId: 'cand-004',
    candidateName: 'Sneha Nair',
    candidateEmail: 'sneha.nair.qa@gmail.com',
    candidatePhone: '+91 97412 34567',
    candidateLocation: 'Pune, Maharashtra',
    jobTitle: 'Lead QA Automation Engineer (Playwright/Cypress)',
    jobId: 'job-qa-04',
    department: 'Quality Assurance',
    round: 'Round 1: Screening / Technical',
    date: '2026-08-29',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    durationMinutes: 60,
    interviewerName: 'Rahul Mehta',
    interviewerRole: 'QA Architect',
    interviewerEmail: 'rahul.mehta@urbangaon.com',
    platform: 'zoom',
    meetingLink: 'https://zoom.us/j/8492048201',
    meetingId: '849 2048 201',
    meetingPasscode: 'qaPass99',
    status: 'confirmed',
    feedbackStatus: 'pending',
    notes: 'Evaluate hands-on live automation script execution with Playwright and CI pipeline integration in GitHub Actions.',
    atsMatchScore: 89,
    tags: ['Playwright', 'Cypress', 'CI/CD'],
    createdAt: '2026-08-27T11:30:00Z',
    updatedAt: '2026-08-28T14:20:00Z'
  },
  {
    id: 'int-003',
    candidateId: 'cand-005',
    candidateName: 'Tanmay Deshmukh',
    candidateEmail: 'tanmay.ux@designcraft.in',
    candidatePhone: '+91 98234 56789',
    candidateLocation: 'Mumbai, Maharashtra',
    jobTitle: 'UI/UX Product Designer (Figma/Design Systems)',
    jobId: 'job-ux-05',
    department: 'Design',
    round: 'Round 3: HR & Culture Fit',
    date: '2026-08-29',
    startTime: '04:30 PM',
    endTime: '05:15 PM',
    durationMinutes: 45,
    interviewerName: 'Priya Sharma',
    interviewerRole: 'HR Lead',
    interviewerEmail: 'priya.sharma@urbangaon.com',
    platform: 'google_meet',
    meetingLink: 'https://meet.google.com/des-fit-hrd',
    meetingId: 'des-fit-hrd',
    meetingPasscode: 'urbFit1',
    status: 'scheduled',
    feedbackStatus: 'pending',
    notes: 'Salary alignment, notice period discussion (immediate vs 15 days), and culture fitment walkthrough.',
    atsMatchScore: 91,
    tags: ['Figma', 'Culture Fit', 'Compensation'],
    createdAt: '2026-08-27T16:00:00Z',
    updatedAt: '2026-08-28T09:10:00Z'
  },
  {
    id: 'int-004',
    candidateId: 'cand-002',
    candidateName: 'Ananya Sharma',
    candidateEmail: 'ananya.sharma@backendpro.dev',
    candidatePhone: '+91 98112 33445',
    candidateLocation: 'Remote (Noida)',
    jobTitle: 'Lead Backend Developer (Node.js & Go)',
    jobId: 'job-be-02',
    department: 'Engineering',
    round: 'Round 4: CEO / Leadership Round',
    date: '2026-08-31',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    durationMinutes: 60,
    interviewerName: 'Akash Das',
    interviewerRole: 'CEO / SDE-3 Lead',
    interviewerEmail: 'akash.das@urbangaon.com',
    platform: 'google_meet',
    meetingLink: 'https://meet.google.com/ceo-final-lead',
    meetingId: 'ceo-final-lead',
    meetingPasscode: 'ceoUG2026',
    status: 'confirmed',
    feedbackStatus: 'pending',
    notes: 'Final leadership round: Discuss 1-year product vision, distributed event-driven architecture, and leadership ownership.',
    atsMatchScore: 96,
    tags: ['Golang', 'Distributed Systems', 'Leadership'],
    createdAt: '2026-08-28T12:00:00Z',
    updatedAt: '2026-08-28T15:30:00Z'
  },
  {
    id: 'int-005',
    candidateId: 'cand-006',
    candidateName: 'Pooja Kulkarni',
    candidateEmail: 'pooja.kulkarni@cloudeng.io',
    candidatePhone: '+91 99887 76655',
    candidateLocation: 'Hyderabad, Telangana',
    jobTitle: 'DevOps / Cloud Platform Engineer (AWS, K8s)',
    jobId: 'job-devops-06',
    department: 'Infrastructure',
    round: 'Round 1: Screening / Technical',
    date: '2026-09-01',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    durationMinutes: 60,
    interviewerName: 'Vikramaditya Rao',
    interviewerRole: 'Principal Cloud Architect',
    interviewerEmail: 'vikram.rao@urbangaon.com',
    platform: 'teams',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/cloud-k8s-interview',
    meetingId: 'ms-993-201',
    meetingPasscode: 'k8sPass',
    status: 'scheduled',
    feedbackStatus: 'pending',
    notes: 'Screening round on Terraform infrastructure-as-code, Kubernetes ingress controllers, and AWS cost optimization.',
    atsMatchScore: 88,
    tags: ['Kubernetes', 'AWS', 'Terraform'],
    createdAt: '2026-08-28T16:00:00Z',
    updatedAt: '2026-08-28T16:00:00Z'
  },
  {
    id: 'int-006',
    candidateId: 'cand-007',
    candidateName: 'Deepak Joshi',
    candidateEmail: 'deepak.joshi@reactnative.org',
    candidatePhone: '+91 98711 22334',
    candidateLocation: 'Jaipur, Rajasthan',
    jobTitle: 'Senior Frontend Engineer (React/TypeScript)',
    jobId: 'job-fe-01',
    department: 'Engineering',
    round: 'Round 1: Screening / Technical',
    date: '2026-09-02',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    durationMinutes: 60,
    interviewerName: 'Rajesh Kumar Verma',
    interviewerRole: 'Senior Frontend Lead',
    interviewerEmail: 'rajesh.verma@urbangaon.com',
    platform: 'google_meet',
    meetingLink: 'https://meet.google.com/fe-screen-round1',
    meetingId: 'fe-screen-round1',
    meetingPasscode: 'fePass1',
    status: 'scheduled',
    feedbackStatus: 'pending',
    notes: 'Technical screening on JavaScript fundamentals, DOM optimization, and Redux architecture.',
    atsMatchScore: 82,
    tags: ['React', 'JavaScript', 'State Management'],
    createdAt: '2026-08-29T08:00:00Z',
    updatedAt: '2026-08-29T08:00:00Z'
  },
  {
    id: 'int-007',
    candidateId: 'cand-003',
    candidateName: 'Vikramaditya Rao',
    candidateEmail: 'vikram.rao.pm@fintechhub.com',
    candidatePhone: '+91 98101 23456',
    candidateLocation: 'Gurgaon, Haryana',
    jobTitle: 'Senior Product Manager (FinTech/Growth)',
    jobId: 'job-pm-03',
    department: 'Product',
    round: 'Round 4: CEO / Leadership Round',
    date: '2026-08-27',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    durationMinutes: 60,
    interviewerName: 'Akash Das',
    interviewerRole: 'CEO / SDE-3 Lead',
    interviewerEmail: 'akash.das@urbangaon.com',
    platform: 'onsite',
    location: 'UrbanGaon HQ - Executive Boardroom 4A, Gurgaon',
    status: 'completed',
    feedbackStatus: 'submitted',
    notes: 'Exceptional product strategy presentation. Strong grasp of Unit Economics and user acquisition loops.',
    atsMatchScore: 95,
    tags: ['Product Strategy', 'FinTech', 'Metrics'],
    createdAt: '2026-08-25T10:00:00Z',
    updatedAt: '2026-08-27T17:30:00Z'
  }
];

export const INITIAL_CALL_RECORDS: CallRecord[] = [
  {
    id: 'call-001',
    candidateId: 'cand-001',
    candidateName: 'Rajesh Kumar Verma',
    candidatePhone: '+91 98765 43210',
    jobTitle: 'Senior Frontend Engineer (React/TypeScript)',
    jobId: 'job-fe-01',
    recruiterName: 'Priya Sharma',
    callTime: '2026-08-25T11:30:00Z',
    durationSeconds: 245,
    disposition: 'connected_screening_passed',
    notes: 'Candidate is extremely confident. Currently at Infosys, handling 4.2M daily active users. Confirmed expected CTC 22-25 LPA and notice period 30 days. Ready for technical round.',
    confirmedCurrentCtc: '₹14.5 LPA',
    confirmedExpectedCtc: '₹22 - 25 LPA',
    confirmedNoticePeriod: '30 Days',
    relocationPreference: 'Immediate Relocate',
    communicationRating: 5,
    technicalFitRating: 5,
    tags: ['React 18', 'Immediate Screening', 'Clear English']
  },
  {
    id: 'call-002',
    candidateId: 'cand-002',
    candidateName: 'Ananya Deshmukh',
    candidatePhone: '+91 97112 88419',
    jobTitle: 'Lead Backend Developer (Node.js & Go)',
    jobId: 'job-be-02',
    recruiterName: 'Amit Singh',
    callTime: '2026-08-24T15:10:00Z',
    durationSeconds: 310,
    disposition: 'connected_screening_passed',
    notes: 'Serving notice period at Razorpay, 15 days left. Confirmed high-scale Kafka & Golang architecture experience. Passed screening with top ratings.',
    confirmedCurrentCtc: '₹26 LPA',
    confirmedExpectedCtc: '₹34 - 38 LPA',
    confirmedNoticePeriod: '15 Days (Serving Notice)',
    relocationPreference: 'Open to Hybrid',
    communicationRating: 5,
    technicalFitRating: 5,
    tags: ['High Priority', 'Golang Lead', 'Quick Joiner']
  },
  {
    id: 'call-003',
    candidateId: 'cand-004',
    candidateName: 'Pooja Bhattacharya',
    candidatePhone: '+91 98301 92847',
    jobTitle: 'UI/UX Product Designer (Figma/Design Systems)',
    jobId: 'job-ux-05',
    recruiterName: 'Priya Sharma',
    callTime: '2026-08-25T14:00:00Z',
    durationSeconds: 190,
    disposition: 'connected_interested',
    notes: 'Strong portfolio walkthrough. Passionate about design tokens and tier-2 Bharat UX. Requested callback tomorrow after 4 PM to confirm interview slot.',
    followUpDate: '2026-08-30',
    followUpTime: '04:00 PM',
    confirmedCurrentCtc: '₹12 LPA',
    confirmedExpectedCtc: '₹18 - 20 LPA',
    confirmedNoticePeriod: '30 Days',
    relocationPreference: 'Current City Only',
    communicationRating: 4,
    technicalFitRating: 4,
    tags: ['Design Tokens', 'Figma', 'Follow-up']
  },
  {
    id: 'call-004',
    candidateId: 'cand-006',
    candidateName: 'Meghna Sundaram',
    candidatePhone: '+91 98402 11984',
    jobTitle: 'DevOps / Cloud Platform Engineer (AWS, K8s)',
    jobId: 'job-devops-06',
    recruiterName: 'Amit Singh',
    callTime: '2026-08-26T10:45:00Z',
    durationSeconds: 155,
    disposition: 'connected_callback_requested',
    notes: 'In client meeting currently. Asked to call back on Saturday at 11:30 AM to discuss Terraform and Kubernetes experience.',
    followUpDate: '2026-08-30',
    followUpTime: '11:30 AM',
    confirmedCurrentCtc: '₹16 LPA',
    confirmedExpectedCtc: '₹24 - 26 LPA',
    confirmedNoticePeriod: '60 Days (Negotiable)',
    relocationPreference: 'Open to Hybrid',
    communicationRating: 4,
    technicalFitRating: 4,
    tags: ['DevOps', 'Callback Scheduled']
  },
  {
    id: 'call-005',
    candidateId: 'cand-007',
    candidateName: 'Karan Mehra',
    candidatePhone: '+91 98190 44219',
    jobTitle: 'UI/UX Product Designer (Figma/Design Systems)',
    jobId: 'job-ux-05',
    recruiterName: 'Neha Verma',
    callTime: '2026-08-26T12:15:00Z',
    durationSeconds: 15,
    disposition: 'ringing_no_answer',
    notes: 'Phone rang continuously for 5 rings, no answer. Will retry in the evening session.',
    followUpDate: '2026-08-29',
    followUpTime: '06:00 PM',
    communicationRating: 0,
    technicalFitRating: 0,
    tags: ['Internshala Applicant', 'Ringing']
  }
];

