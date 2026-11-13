export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  venue: string;
  description: string;
  imageSrc?: string;
  pdfSrc?: string;
  category: 'Hackathon & Open Source' | 'Athletics & Health';
}

export const CERTIFICATES: Certificate[] = [
  {
    id: 'hacktoberfest-2026',
    title: 'Hacktoberfest Hack Day Kathmandu 2026',
    issuer: 'The Hacktoberfest Team · Major League Hacking (MLH) · DEV · DigitalOcean',
    date: 'October 10, 2026',
    venue: 'Sunway College Kathmandu, Kathmandu, Nepal',
    description: 'Certificate of Attendance certifying that Dipson Basnet attended Hacktoberfest Hack Day Kathmandu 2026 organized at Sunway College Kathmandu, contributing to open-source software ecosystems and participating in developer hackathon sprints.',
    imageSrc: '/assets/aistudio/hacktoberfest-2026-fest-certificate-2026-01a04aa8-fb04-9831-3263-9f0a09eebc5c_bce08524.png',
    category: 'Hackathon & Open Source'
  },
  {
    id: 'walk-for-health-2026',
    title: 'Certificate of Participation — #WalkForHealth',
    issuer: 'International Olympic Committee (Olympism365) · PATH · Health Concern · Artha Run Club',
    date: 'January 24, 2026',
    venue: 'International Club, Sanepa, Lalitpur, Nepal',
    description: 'Awarded for active participation in the #WalkForHealth initiative organized in the framework of the Community Sport and Health Cooperation initiative in Nepal, supported by the International Olympic Committee under its Olympism365 strategy to promote physical activity and well-being.',
    imageSrc: '/assets/aistudio/Community_Run__Walk-For-Health__27944097.png',
    category: 'Athletics & Health'
  },
  {
    id: 'naya-paila-5k-2025',
    title: 'Certificate of Participation — Naya Paila Run (5K)',
    issuer: 'Pyari Education Pvt. Ltd. & Artha Run Club',
    date: '15th November 2025',
    venue: 'Patan Durbar Square, Lalitpur, Nepal',
    description: 'Awarded for successfully completing the Naya Paila Run (5K) in support of the mission to bring stigma-free health and sexuality education to 10,000 students across Nepal, celebrating running as a vehicle for youth empowerment.',
    imageSrc: '/assets/aistudio/certificate_0db9eb7f.png',
    category: 'Athletics & Health'
  }
];
