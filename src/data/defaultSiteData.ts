import type { SiteData } from '../types/site';

export const DEFAULT_PROFILE_IMAGE = '/assets/aistudio/asif-islam_5f20bfab.jpg';

export const DEFAULT_SITE_DATA: SiteData = {
  general: {
    siteTitle: 'ASIF ISLAM — Exploring Technology. Building Digital Possibilities.',
    brandName: 'ASIF ISLAM',
    logoText: 'ASIF ISLAM',
    siteDescription:
      'Asif Islam — Independent digital creator and aspiring computer science student from Bangladesh exploring technology and building digital solutions.',
    browserTitle: 'ASIF ISLAM — Exploring Technology. Building Digital Possibilities.',
    faviconUrl: DEFAULT_PROFILE_IMAGE,
    footerText: 'ASIF ISLAM — Exploring Technology. Building Digital Possibilities.',
  },
  profile: {
    name: 'Asif Islam',
    imageUrl: DEFAULT_PROFILE_IMAGE,
    location: 'Daulatpur, Kushtia, Bangladesh',
    education: 'SSC 2027 Batch',
    startedYear: '2024',
    interests: 'Technology, Digital Creativity, Cybersecurity, Web Development',
    futureGoal: 'Computer Science & Technology',
    aboutHeading: 'BEHIND THE DIGITAL WORLD',
    introduction:
      "Hi, I'm Asif Islam — a technology enthusiast, digital creator, and aspiring computer science student from Bangladesh.\n\nSince 2024, I've been exploring the digital world, learning new technologies, developing creative solutions, and building my experience across different areas of the online ecosystem.\n\nI enjoy staying active online, experimenting with technology, creating digital projects, and helping people solve their digital challenges.\n\nMy long-term ambition is to pursue Computer Science and continue growing in the fields of technology, cybersecurity, and software development.\n\nThis is my digital space — a place where creativity meets technology.",
    aboutDescription:
      "I'm Asif Islam, a technology enthusiast with a strong interest in digital creativity, online platforms, and cybersecurity-related technology.\n\nI enjoy learning, experimenting, building, and exploring how digital systems work.\n\nI believe technology is not just about using tools — it's about understanding possibilities and creating useful solutions.\n\nCurrently, I'm continuing my educational journey as an SSC 2027 student, with a long-term ambition to study Computer Science and grow in the technology industry.",
  },
  hero: {
    visible: true,
    badge: 'INDEPENDENT DIGITAL CREATOR',
    heading: 'Building Digital Experiences. Exploring Tomorrow.',
    subtitle:
      'From creative websites to customized digital solutions, I explore technology and turn ideas into meaningful digital experiences.',
    typingPhrases:
      'Websites & Digital Presence|Custom Telegram Bots|Online Safety Guidance|Creative Short Videos',
    primaryBtn: 'Explore My Services',
    secondaryBtn: 'Discover My Journey',
    bgImageUrl: '',
    profileImageUrl: DEFAULT_PROFILE_IMAGE,
  },
  banners: [
    {
      id: 1,
      title: 'Custom Cyber-Tech Websites',
      subtitle:
        'Responsive personal portfolios, landing pages, and clean UI/UX crafted around your identity.',
      imageUrl: '/assets/images/banner-web.svg',
      destinationLink: '#services',
      buttonText: 'Explore Services',
      displayOrder: 1,
      isActive: true,
    },
    {
      id: 2,
      title: 'Automated Telegram Bot Systems',
      subtitle:
        'Workflow automation, database-backed bots, and custom admin tools built cleanly.',
      imageUrl: '/assets/images/banner-bot.svg',
      destinationLink: '#services',
      buttonText: 'View Bot Solutions',
      displayOrder: 2,
      isActive: true,
    },
    {
      id: 3,
      title: 'Lawful Online Safety & Account Guidance',
      subtitle:
        'Structured guidance for reporting impersonation, harmful content, and navigating official platform channels.',
      imageUrl: '/assets/images/banner-safety.svg',
      destinationLink: '#support',
      buttonText: 'Get In Touch',
      displayOrder: 3,
      isActive: true,
    },
  ],
  milestones: [
    {
      id: 1,
      yearLabel: '2024',
      title: 'The Beginning',
      description:
        'Started exploring the digital world, online platforms, technology, and creative opportunities.',
      displayOrder: 1,
      isActive: true,
    },
    {
      id: 2,
      yearLabel: '2025',
      title: 'Learning & Exploration',
      description:
        'Continued exploring digital tools, website technologies, online platforms, and creative projects.',
      displayOrder: 2,
      isActive: true,
    },
    {
      id: 3,
      yearLabel: '2026',
      title: 'Building & Expanding',
      description:
        'Focused on developing digital projects, customized website solutions, Telegram bots, and learning more about cybersecurity-related topics.',
      displayOrder: 3,
      isActive: true,
    },
    {
      id: 4,
      yearLabel: '2027',
      title: 'The Next Chapter',
      description:
        'An upcoming milestone focused on education, Computer Science ambitions, and continued growth in technology.',
      displayOrder: 4,
      isActive: true,
    },
  ],
  services: [
    {
      id: 1,
      serviceNumber: '01',
      slug: 'website-development',
      iconKey: 'code',
      title: 'Website Development',
      shortDescription:
        'Modern, responsive, and customized websites designed to establish a strong digital presence.',
      fullDescription:
        'Modern, responsive, and customized websites crafted with clean structure, fast performance, mobile-first layout, and cyber-tech visual polish tailored to personal brands and growing businesses.',
      features: [
        'Personal Portfolio Websites',
        'Business Websites',
        'Landing Pages',
        'Customized Website Design',
        'Website UI/UX Improvements',
      ],
      platforms: ['web', 'uiux'],
      contactButtonText: 'Discuss a Website',
      displayOrder: 1,
      isActive: true,
    },
    {
      id: 2,
      serviceNumber: '02',
      slug: 'social-media-assistance',
      iconKey: 'shield-user',
      title: 'Social Media Account Assistance',
      shortDescription:
        'Guidance and assistance with common account-related issues across popular social platforms.',
      fullDescription:
        'Structured, honest guidance for navigating official recovery, verification, and appeal workflows on major social media platforms. Official platform decisions belong solely to each platform — recovery or appeal approval is never guaranteed.',
      features: [
        'Account Access & Recovery Guidance',
        'Account Appeal Assistance',
        'Suspended Account Guidance',
        'Profile and Account Issues',
        'Platform Support Guidance (No guaranteed recovery)',
      ],
      platforms: ['tiktok', 'facebook', 'instagram', 'telegram', 'youtube'],
      contactButtonText: 'Request Guidance',
      displayOrder: 2,
      isActive: true,
    },
    {
      id: 3,
      serviceNumber: '03',
      slug: 'reporting-online-safety',
      iconKey: 'alert-shield',
      title: 'Reporting & Online Safety Assistance',
      shortDescription:
        'Guidance for reporting harmful content, impersonation, harassment, and policy violations through official platform channels.',
      fullDescription:
        'Lawful and authorized guidance to document evidence and submit structured reports through official platform safety portals. No unauthorized access, hacking, mass reporting, or guaranteed removal is ever offered.',
      features: [
        'Fake Profile Reporting Guidance',
        'Impersonation Reporting',
        'Harassment Reporting Assistance',
        'Harmful Content Reporting',
        'Official Platform Complaint Guidance (Lawful channels only)',
      ],
      platforms: ['facebook', 'instagram', 'tiktok', 'youtube', 'telegram'],
      contactButtonText: 'Get Safety Guidance',
      displayOrder: 3,
      isActive: true,
    },
    {
      id: 4,
      serviceNumber: '04',
      slug: 'telegram-bot-development',
      iconKey: 'bot',
      title: 'Telegram Bot Development',
      shortDescription:
        'Customized Telegram bots designed to improve automation, communication, and digital workflows.',
      fullDescription:
        'Purpose-built Telegram bots with automated reply flows, admin management dashboards, structured database integration, and customized command systems.',
      features: [
        'Custom Telegram Bots',
        'Automated Reply Systems',
        'Admin Management Systems',
        'Database-Based Bot Solutions',
        'Custom Bot Features',
      ],
      platforms: ['telegram'],
      contactButtonText: 'Plan a Telegram Bot',
      displayOrder: 4,
      isActive: true,
    },
    {
      id: 5,
      serviceNumber: '05',
      slug: 'short-video-creation',
      iconKey: 'video',
      title: 'Short Video Creation',
      shortDescription:
        'Creative short-form video editing and content presentation for modern social media platforms.',
      fullDescription:
        'Dynamic short-form edits built for retention on YouTube Shorts, TikTok, and Instagram Reels, including clean pacing, captions, promotional edits, and basic motion graphics.',
      features: [
        'YouTube Shorts',
        'TikTok Videos',
        'Reels',
        'Promotional Videos',
        'Basic Motion Graphics',
      ],
      platforms: ['youtube', 'tiktok', 'instagram'],
      contactButtonText: 'Start a Video Project',
      displayOrder: 5,
      isActive: true,
    },
    {
      id: 6,
      serviceNumber: '06',
      slug: 'customized-digital-solutions',
      iconKey: 'sparkles',
      title: 'Customized Digital Solutions',
      shortDescription:
        "Have a different idea? Let's discuss it and explore a customized digital solution.",
      fullDescription:
        'Collaborative planning and custom-built web utilities, workflow tools, or tailored digital projects built cleanly around your exact requirements.',
      features: [
        'Custom Web Projects',
        'Digital Tools',
        'Creative Technical Solutions',
        'Personalized Digital Projects',
      ],
      platforms: ['web', 'telegram'],
      contactButtonText: 'Share Your Idea',
      displayOrder: 6,
      isActive: true,
    },
  ],
  socials: [
    {
      id: 1,
      platformKey: 'whatsapp',
      platformName: 'WhatsApp',
      supportingText: 'Direct chat for projects & inquiries',
      url: 'https://wa.me/8801XXXXXXXXX',
      brandColor: '#25D366',
      displayOrder: 1,
      isActive: true,
    },
    {
      id: 2,
      platformKey: 'email',
      platformName: 'Email',
      supportingText: 'Detailed briefs & official correspondence',
      url: 'mailto:contact@asifislam.example',
      brandColor: '#00E5FF',
      displayOrder: 2,
      isActive: true,
    },
    {
      id: 3,
      platformKey: 'telegram',
      platformName: 'Telegram',
      supportingText: 'Fast messaging & bot consultations',
      url: 'https://t.me/asifislam',
      brandColor: '#26A5E4',
      displayOrder: 3,
      isActive: true,
    },
    {
      id: 4,
      platformKey: 'facebook',
      platformName: 'Facebook',
      supportingText: 'Connect & follow digital updates',
      url: '',
      brandColor: '#1877F2',
      displayOrder: 4,
      isActive: true,
    },
    {
      id: 5,
      platformKey: 'instagram',
      platformName: 'Instagram',
      supportingText: 'Creative reels & visual highlights',
      url: '',
      brandColor: '#E4405F',
      displayOrder: 5,
      isActive: true,
    },
    {
      id: 6,
      platformKey: 'tiktok',
      platformName: 'TikTok',
      supportingText: 'Short-form edits & digital clips',
      url: '',
      brandColor: '#00F2EA',
      displayOrder: 6,
      isActive: true,
    },
    {
      id: 7,
      platformKey: 'youtube',
      platformName: 'YouTube',
      supportingText: 'Longer videos & project showcases',
      url: '',
      brandColor: '#FF0000',
      displayOrder: 7,
      isActive: true,
    },
  ],
  contact: {
    heading: "LET'S CONNECT",
    subtitle:
      'Have a project, a question, or need digital assistance? Choose your preferred platform and get in touch.',
    email: 'contact@asifislam.example',
    whatsapp: '+8801XXXXXXXXX',
    telegram: 'https://t.me/asifislam',
    enableWhatsapp: true,
    enableEmailMailto: true,
    enablePhpMail: false,
    successMessage:
      'Your inquiry has been recorded cleanly. Use the direct links below to continue immediately via WhatsApp or Email.',
  },
  ai: {
    isEnabled: true,
    mode: 'builtin',
    assistantName: "ASIF'S ASSISTANT",
    welcomeMessage:
      "Hello! I'm Asif's Assistant. How can I help you explore his digital services and learn more about his journey?",
    systemInstructions:
      "You are ASIF'S ASSISTANT, the official digital assistant for Asif Islam's personal brand website. Only discuss Asif Islam, his provided personal info, digital journey (2024–2027), his 6 services, and how visitors can contact him. Never act as a general-purpose chatbot, never invent credentials or prices, and never promise guaranteed recovery or content removal.",
    fallbackMessage:
      "I don't have confirmed information about that yet. Please contact Asif directly for clarification.",
    offTopicMessage:
      "I'm Asif's website assistant. I can help you with information about Asif Islam, his journey, digital services, and support options.",
    apiProvider: 'openai_compatible',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    modelName: 'gpt-4o-mini',
    hasApiKeyConfigured: false,
    suggestedQuestions: [
      'Who is Asif Islam?',
      'Tell me about his journey.',
      'What services are available?',
      'Do you develop websites?',
      'Can you develop Telegram bots?',
      'How can I contact Asif?',
    ],
    rateLimitPerMinute: 15,
  },
  knowledgeBase: [
    {
      id: 1,
      topic: 'Who is Asif Islam',
      keywords:
        'who is asif, about asif, asif islam, background, location, education, ssc, bangladesh, kushtia, goal, computer science',
      answerText:
        'Asif Islam is an independent digital creator, technology enthusiast, and SSC 2027 Batch student based in Daulatpur, Kushtia, Bangladesh. Since 2024, he has been exploring web technologies, digital creativity, Telegram automation, and cybersecurity-related topics, with a long-term ambition to study Computer Science.',
      category: 'profile',
      isActive: true,
      displayOrder: 1,
    },
    {
      id: 2,
      topic: 'Digital Journey (2024–2027)',
      keywords: 'journey, timeline, started, 2024, 2025, 2026, 2027, history, chapter, milestone',
      answerText:
        'Asif started exploring the digital world in 2024. In 2025 he deepened his exploration of web tools and creative projects; in 2026 he focused on customized websites, Telegram bots, and cybersecurity learning; and 2027 represents his upcoming educational milestone toward Computer Science.',
      category: 'journey',
      isActive: true,
      displayOrder: 2,
    },
    {
      id: 3,
      topic: 'Available Services Overview',
      keywords: 'services, what do you do, help with, offer, capabilities, solutions',
      answerText:
        'Asif offers six core digital services: 01 Website Development, 02 Social Media Account Assistance, 03 Reporting & Online Safety Assistance, 04 Telegram Bot Development, 05 Short Video Creation, and 06 Customized Digital Solutions. Click any service card in the Services section to view full details.',
      category: 'services',
      isActive: true,
      displayOrder: 3,
    },
    {
      id: 4,
      topic: 'Website Development',
      keywords: 'website, web, develop, portfolio, landing page, ui, ux, business site, html, php',
      answerText:
        'Yes! Under Service 01 (Website Development), Asif builds modern, responsive personal portfolios, business websites, landing pages, customized web designs, and UI/UX improvements tailored to your digital presence.',
      category: 'services',
      isActive: true,
      displayOrder: 4,
    },
    {
      id: 5,
      topic: 'Telegram Bot Development',
      keywords: 'telegram, bot, bots, automation, auto reply, admin bot, database bot',
      answerText:
        'Yes! Under Service 04 (Telegram Bot Development), Asif designs customized Telegram bots including automated reply systems, admin management panels, database-connected workflows, and custom bot features.',
      category: 'services',
      isActive: true,
      displayOrder: 5,
    },
    {
      id: 6,
      topic: 'Social Media & Online Safety Assistance',
      keywords:
        'social media, account, recovery, appeal, suspended, tiktok, facebook, instagram, youtube, report, impersonation, harassment, fake profile',
      answerText:
        "Asif provides lawful guidance for common social media account issues (TikTok, Facebook, Instagram, Telegram, YouTube) and step-by-step assistance for reporting impersonation, harassment, or policy violations through official platform channels. Outcomes depend strictly on each platform — recovery, appeal approval, or content removal is never guaranteed.",
      category: 'services',
      isActive: true,
      displayOrder: 6,
    },
    {
      id: 7,
      topic: 'Short Video Creation & Custom Solutions',
      keywords:
        'video, short video, reels, tiktok video, youtube shorts, motion graphics, custom project, digital tool',
      answerText:
        'Under Service 05, Asif creates YouTube Shorts, TikTok videos, Reels, promotional edits, and basic motion graphics. Under Service 06, he collaborates on custom web projects and personalized digital tools.',
      category: 'services',
      isActive: true,
      displayOrder: 7,
    },
    {
      id: 8,
      topic: 'How to Contact Asif',
      keywords: 'contact, support, whatsapp, email, telegram link, reach, connect, message, price, pricing, cost',
      answerText:
        'You can connect with Asif through the Support section ("LET\'S CONNECT") using the configured social platform cards (WhatsApp, Email, Telegram, and active social links) or by submitting the Contact Form with your preferred method and service category. For project scope or pricing details, please message Asif directly.',
      category: 'contact',
      isActive: true,
      displayOrder: 8,
    },
  ],
  appearance: {
    accentPrimary: '#00E5FF',
    accentSecondary: '#00FF9D',
    accentPurple: '#8B5CF6',
    bgStyle: 'cyber-grid',
    animationIntensity: 'balanced',
    glowIntensity: 'medium',
    borderStyle: 'conic-glow',
    cardRadius: 18,
    showBanners: true,
    showJourney: true,
    showAbout: true,
    showServices: true,
    showSupport: true,
  },
  seo: {
    metaTitle: 'ASIF ISLAM — Exploring Technology. Building Digital Possibilities.',
    metaDescription:
      'Independent digital creator and aspiring computer science student from Daulatpur, Kushtia, Bangladesh. Websites, Telegram bots, short videos, and online safety guidance.',
    ogImage: DEFAULT_PROFILE_IMAGE,
    robots: 'index, follow',
  },
  messages: [],
};
