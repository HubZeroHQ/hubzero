/**
 * One-time import of `team/*.md` into real Studio records: a published
 * `Team` entry, a published `EngineeringProfile`, and its `introduction`,
 * `interview`, `quotes`, and `timeline` Documents — for each of the five
 * founders (team/README.md's EP-001..EP-005).
 *
 * `team/*.md` remains the canonical editorial source; this script only
 * transcribes it into the platform's real content model. It does not
 * paraphrase or invent — every block below is the founder's own words,
 * lightly restructured into the Document Engine's block shape. The one
 * exception is `timeline` block `date` values: the source files present an
 * undated sequence, so this uses plain stage labels ("Stage 01", …)
 * rather than inventing calendar dates.
 *
 * There is no "achievements" Document — none of the five files contains
 * real achievement content (only an unchecked "Future Additions"
 * checklist), so that role is left unpublished rather than fabricated.
 *
 * Portraits come from `team-portraits/*.jpg` and are uploaded through the
 * same Cloudinary client Studio's own media actions use
 * (`lib/media/cloudinary.ts`) — no new upload mechanism.
 *
 * Reality check this script does NOT change: a public Engineering Profile
 * also requires at least two real evidence links to a visible Work/Build/
 * Blueprint/Lab/Note (`isEligibleEngineeringProfile`,
 * `src/lib/public/repository.ts`). None of those collections have real
 * published content yet, so these profiles will not appear on `/engineering`,
 * in search, or unlock founder bylines elsewhere until that evidence exists
 * — by design, not a bug. Re-run is safe: idempotent per founder slug.
 *
 * Usage: npm run seed:engineering-profiles
 */
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createBlockId } from '@/lib/documents/block-ops';
import type { Block } from '@/lib/documents/blocks';
import { hashPassword } from '@/lib/auth/password';
import { documentRepository } from '@/lib/db/repositories/document';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { mediaRepository } from '@/lib/db/repositories/media';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';
import { userRepository } from '@/lib/db/repositories/user';
import { getCloudinaryClient } from '@/lib/media/cloudinary';
import { collections } from '@/lib/db/collections';

// ---------------------------------------------------------------------------
// Block builders
// ---------------------------------------------------------------------------

const heading = (text: string, level: 2 | 3 | 4 = 2): Block => ({
  id: createBlockId(),
  type: 'heading',
  data: { level, text },
});
const paragraph = (text: string): Block => ({
  id: createBlockId(),
  type: 'paragraph',
  data: { text },
});
const quote = (text: string, attribution?: string): Block => ({
  id: createBlockId(),
  type: 'quote',
  data: { text, ...(attribution ? { attribution } : {}) },
});
const timeline = (events: { date: string; title: string }[]): Block => ({
  id: createBlockId(),
  type: 'timeline',
  data: { events },
});

interface InterviewEntry {
  question: string;
  answer: string[];
}

interface FounderSeed {
  slug: string;
  name: string;
  role: string;
  group: 'Founders';
  overview: string;
  engineeringPhilosophy: string;
  currentExploration: string;
  areasOfExpertise: string[];
  currentInterests: string[];
  engineeringIdentity: string[];
  technologies: string[];
  portraitFile: string;
  introduction: { philosophy: string[]; journey: string[] };
  interview: InterviewEntry[];
  quotes: { text: string; attribution?: string }[];
  timelineEvents: string[];
}

// ---------------------------------------------------------------------------
// Content — transcribed from team/*.md (see file header)
// ---------------------------------------------------------------------------

const FOUNDERS: FounderSeed[] = [
  {
    slug: 'rifaque',
    name: 'Rifaque Ahmed',
    role: 'Chief Executive Officer',
    group: 'Founders',
    overview:
      'Rifaque Ahmed is a software engineer focused on building long-term technology products rather than one-off software projects. His interests span artificial intelligence, developer tools, infrastructure, cloud architecture, product design, and full-stack engineering, with a consistent goal of reducing complexity and making powerful technology more accessible.',
    engineeringPhilosophy:
      "I believe engineering isn't about using the newest framework or the most fashionable technology. It's about understanding the problem, choosing the right solution, writing maintainable systems, and making decisions that still make sense years later. I value simplicity over unnecessary complexity, long-term thinking over short-term trends, and meaningful products over novelty.",
    currentExploration:
      'Large language models, retrieval-augmented generation, and how AI changes software development over the next decade.',
    areasOfExpertise: [
      'Artificial Intelligence',
      'Large Language Models',
      'Retrieval-Augmented Generation',
      'Developer Tools',
      'Product Engineering',
      'Infrastructure',
      'Distributed Systems',
      'Cloud Architecture',
      'Full-Stack Development',
    ],
    currentInterests: [
      'Artificial Intelligence Systems',
      'Large Language Models',
      'Retrieval-Augmented Generation',
      'Scalable Software Architecture',
      'Distributed Systems',
      'Modern Cloud Infrastructure',
    ],
    engineeringIdentity: [
      'Simplicity over unnecessary complexity.',
      'Long-term thinking over short-term trends.',
      'Meaningful products over novelty.',
      'Building things is fun. Building things for yourself is even more fun.',
    ],
    technologies: [
      'Artificial Intelligence',
      'Large Language Models',
      'Retrieval-Augmented Generation',
      'Cloud Architecture',
      'Distributed Systems',
      'Full-Stack Development',
    ],
    portraitFile: 'rifaque.jpg',
    introduction: {
      philosophy: [
        'Technology changes quickly. Good engineering principles rarely do.',
        "I believe engineering isn't about using the newest framework or the most fashionable technology. It's about understanding the problem, choosing the right solution, writing maintainable systems, and making decisions that still make sense years later.",
        'I value simplicity over unnecessary complexity, long-term thinking over short-term trends, and meaningful products over novelty.',
      ],
      journey: [
        "HubZero didn't begin as a company. It started as a small friend group built around gaming. Over time it naturally evolved into a place where we collaborated on small engineering projects and experimented with ideas we wanted to build together.",
        'Around April 2025 I realized I wanted to turn that into something much larger. Life delayed that vision for a while, but after graduating I finally had the freedom to pursue it properly.',
        'I never grew up dreaming of becoming an entrepreneur. Instead, I discovered that creating products we genuinely believed in was far more exciting than simply writing software for someone else. That realization eventually became HubZero.',
      ],
    },
    interview: [
      {
        question:
          'HubZero is more than a project for you. At what moment did you realize you wanted to build a company instead of simply writing software?',
        answer: [
          'HubZero actually started as a friend group for gaming. Over time it became a place where we worked on small projects together and wanted to build something we could truly call our own.',
          "Around April 2025 I realized I wanted to turn that idea into a real company, but life got in the way and I couldn't give it my full attention. Now that I've graduated, I finally have the freedom to pursue it properly.",
          "I didn't grow up dreaming of entrepreneurship, but the more I built things, the more I realized creating products for ourselves was far more exciting than simply writing software for someone else.",
        ],
      },
      {
        question:
          "You often describe HubZero as an engineering company rather than a software agency. What's the difference?",
        answer: [
          'To me, agencies usually deliver individual projects like websites or small applications.',
          'I want HubZero to build complete engineering solutions. If a company has a problem, I want us to understand the business, design the system, build the software, connect the infrastructure, and deliver something that genuinely improves how they operate.',
          "That's much more interesting than shipping another website.",
        ],
      },
      {
        question:
          'Your interests span AI, developer tools, infrastructure, and product design. What connects them?',
        answer: [
          'They all help people build better things. AI makes engineers more capable. Developer tools make them faster. Infrastructure makes products reliable. Product design makes technology enjoyable to use.',
          "They're different disciplines, but they're all pieces of the same puzzle.",
        ],
      },
      {
        question:
          'If you could solve one problem for engineers over the next decade, what would it be?',
        answer: [
          "I'd love to see AI assistants work together across platforms instead of existing in separate ecosystems.",
          'Imagine ChatGPT, Claude, Gemini, and other AI systems communicating through a common layer. Each has different strengths, and combining them would let engineers build workflows far more powerful than any single assistant can today.',
        ],
      },
      {
        question: 'How do you decide whether an idea is worth years of your time?',
        answer: [
          'I ask myself two questions. Will it still matter in five years? And am I genuinely excited to work on it every day?',
          'Technology changes quickly, but meaningful problems stay around much longer.',
        ],
      },
      {
        question: "What's an engineering opinion you hold that many people might disagree with?",
        answer: [
          "AI won't replace engineers. It will raise the bar.",
          'Engineers who learn how to work alongside AI will become dramatically more productive. AI can generate code and ideas, but engineering judgment will become even more valuable.',
        ],
      },
      {
        question: 'When someone joins HubZero, what qualities matter more than technical skill?',
        answer: [
          'Curiosity. Humility. Passion.',
          "I'd rather work with someone eager to learn than someone technically brilliant but difficult to collaborate with. Technical skills can be learned. Mindset is much harder to teach.",
        ],
      },
      {
        question: 'How do you personally define success for HubZero?',
        answer: [
          "Success isn't just revenue. It's when people hear the name HubZero and immediately associate it with exceptional engineering, thoughtful products, and a team that consistently builds things that matter.",
        ],
      },
    ],
    quotes: [
      {
        text: 'Technology changes every day. The mindset to learn, adapt, and build lasts a lifetime.',
      },
      { text: 'Building things is fun. Building things for yourself is even more fun.' },
    ],
    timelineEvents: [
      'Developed an interest in software engineering and full-stack development.',
      'Expanded into artificial intelligence, cloud architecture, and developer tooling.',
      'Built Atlas to explore Retrieval-Augmented Generation and AI systems.',
      'Founded HubZero after years of collaborative side projects.',
      'Graduated with a degree in Computer Science.',
      'Continues leading HubZero toward becoming an engineering-led product company.',
    ],
  },
  {
    slug: 'raif',
    name: 'Raif Karani',
    role: 'Chief Technical Officer',
    group: 'Founders',
    overview:
      "Raif Karani is a software engineer specializing in full-stack web development, scalable backend systems, and modern software architecture. His work focuses on designing systems that remain understandable, maintainable, and reliable as they grow, with a strong belief that simplicity is one of engineering's greatest strengths.",
    engineeringPhilosophy:
      'Modern software often becomes difficult to maintain because engineers introduce unnecessary abstractions or chase new technologies without solving real problems. I prefer writing clean, maintainable systems that prioritize clarity, scalability, and long-term reliability over short-term cleverness. Good architecture should help future engineers, not confuse them.',
    currentExploration:
      'Retrieval-augmented generation and modern backend architecture for scalable cloud systems.',
    areasOfExpertise: [
      'Full-Stack Development',
      'Backend Systems',
      'Cloud Architecture',
      'Infrastructure',
      'Artificial Intelligence',
      'Retrieval-Augmented Generation',
      'Developer Tools',
      'System Design',
    ],
    currentInterests: [
      'Artificial Intelligence',
      'Retrieval-Augmented Generation',
      'Modern Backend Architecture',
      'Scalable Cloud Systems',
    ],
    engineeringIdentity: [
      'Simplicity over complexity.',
      'Build systems people can understand years later.',
      'Code is poetry, but execution is everything.',
    ],
    technologies: [
      'Full-Stack Development',
      'Backend Systems',
      'Cloud Architecture',
      'Next.js',
      'Artificial Intelligence',
      'Retrieval-Augmented Generation',
    ],
    portraitFile: 'raif.jpg',
    introduction: {
      philosophy: [
        'I strongly believe in simplicity over complexity.',
        'Modern software often becomes difficult to maintain because engineers introduce unnecessary abstractions or chase new technologies without solving real problems. I prefer writing clean, maintainable systems that prioritize clarity, scalability, and long-term reliability over short-term cleverness.',
        'Good architecture should help future engineers, not confuse them.',
      ],
      journey: [
        'My journey into software engineering began through backend development, databases, and full-stack web applications.',
        'As my experience grew, I became increasingly interested in system architecture, cloud infrastructure, and the challenge of making complex backend systems easier for people to use.',
        'Today my interests span modern web technologies, AI systems, and scalable backend engineering, with a particular focus on designing foundations that continue working well as products evolve.',
      ],
    },
    interview: [
      {
        question:
          'Where do you think software becomes unnecessarily complicated, and how would you simplify it?',
        answer: [
          'I think software becomes unnecessarily complicated when engineers force complex architectures onto simple problems.',
          "Everyone wants to use the newest framework simply because it's popular. I'd rather stick to the fundamentals and build what the project actually needs. Clean logic will always outlast clever code.",
        ],
      },
      {
        question:
          "As HubZero's CTO, what principles do you want every engineer on the team to follow?",
        answer: [
          'HubZero started as five friends learning and building together, and I want that collaborative mindset to remain part of the company.',
          'I want every engineer to write maintainable code, keep solutions simple, choose solid technologies, and always think about the next person who will have to understand their work.',
        ],
      },
      {
        question: 'What has working on QueryCraft taught you about collaboration?',
        answer: [
          "I'm still early in my journey as a technical lead, but working on QueryCraft has already shown me that communication is just as important as technical ability.",
          'When you’re working alone, every design decision exists only in your own mind. In a team, you have to explain your reasoning, coordinate with others, and merge different approaches into one coherent system.',
        ],
      },
      {
        question:
          'How do you balance shipping quickly with building systems that still make sense years later?',
        answer: [
          'The key is building the right foundation first.',
          'Using established patterns in frameworks like Next.js or Express allows you to move quickly without sacrificing maintainability. If the architecture is solid, smaller details can always be improved later.',
          'Clever code usually becomes technical debt.',
        ],
      },
      {
        question:
          'Backend engineering is often invisible to users. What makes a well-engineered system satisfying?',
        answer: [
          'Backend engineering is the engine behind every application.',
          'Users may never see the APIs, database queries, or business logic, but knowing the data flows efficiently, the architecture scales properly, and everything works reliably behind the scenes is deeply satisfying.',
        ],
      },
      {
        question: "If you could redesign one part of today's software ecosystem, what would it be?",
        answer: [
          "I'd simplify the JavaScript tooling ecosystem.",
          "Setting up a project shouldn't require dozens of configuration files before writing the first feature. I'd love development to become far more plug-and-play so engineers can spend more time solving problems instead of configuring tools.",
        ],
      },
      {
        question:
          'Which emerging technology will change software engineering the most over the next decade?',
        answer: [
          'AI and Retrieval-Augmented Generation.',
          'Working on QueryCraft showed me that natural language is becoming a powerful way to interact with complex systems. Instead of writing increasingly complicated queries, engineers will increasingly communicate with software using natural language while AI handles the translation.',
        ],
      },
      {
        question:
          'As HubZero becomes a product company, what technical foundations should it invest in today?',
        answer: [
          'We should invest early in scalable cloud infrastructure, reliable CI/CD pipelines, automated testing, and strong hardware-software integration.',
          "Choosing the right architecture now means we won't have to rebuild everything when our products and teams grow over the next several years.",
        ],
      },
    ],
    quotes: [{ text: 'Code is poetry, but execution is everything.' }],
    timelineEvents: [
      'Began exploring software engineering through backend systems and full-stack web development.',
      'Expanded into scalable architecture, cloud systems, and modern JavaScript frameworks.',
      'Contributed to QueryCraft while growing into a technical leadership role.',
      'Became Co-Founder and Chief Technical Officer of HubZero.',
      'Continues researching AI systems, RAG architectures, and scalable engineering practices.',
    ],
  },
  {
    slug: 'iyad',
    name: 'Mohammed Iyad',
    role: 'Chief Operating Officer & Chief Partnership Officer',
    group: 'Founders',
    overview:
      'Mohammed Iyad is an Electronics and Communication Engineering graduate whose interests extend well beyond traditional engineering. His work sits at the intersection of intelligent software, embedded hardware, robotics, product design, branding, and organizational systems. Rather than viewing these as separate disciplines, he sees them as different parts of the same product journey.',
    engineeringPhilosophy:
      'Every successful product is the result of multiple disciplines working together: engineering, design, branding, communication, operations, and user experience. Ignoring any one of these weakens the final product. My approach is built around three simple ideas: build with purpose, design for people, and never stop improving.',
    currentExploration:
      'AI agents, embedded and IoT systems, and how product engineering, design, and organizational systems combine to build products people genuinely enjoy using.',
    areasOfExpertise: [
      'Artificial Intelligence Systems',
      'Embedded Systems',
      'Robotics',
      'Product Engineering',
      'Human-Centered Product Design',
      'Cloud Architecture',
      'Internet of Things',
      'Automation',
      'UI/UX Design',
      'Engineering Leadership',
    ],
    currentInterests: [
      'AI Agents',
      'Embedded Systems',
      'Internet of Things',
      'Robotics',
      'Cloud Technologies',
      'Product Engineering',
      'UI/UX Design',
      'Branding',
    ],
    engineeringIdentity: [
      'Build with purpose.',
      'Design for people.',
      'Never stop improving.',
      'Technology solves problems. Design earns trust. Innovation happens when both work together.',
    ],
    technologies: [
      'Artificial Intelligence',
      'Embedded Systems',
      'Robotics',
      'Product Engineering',
      'Internet of Things',
      'UI/UX Design',
    ],
    portraitFile: 'iyad.jpg',
    introduction: {
      philosophy: [
        'Technology alone is rarely enough.',
        'Every successful product is the result of multiple disciplines working together: engineering, design, branding, communication, operations, and user experience. Ignoring any one of these weakens the final product.',
        'My approach is built around three simple ideas: build with purpose, design for people, and never stop improving. A product should be technically reliable, visually refined, intuitive to use, and simple enough that people naturally understand it. Engineering should reduce complexity for the user, not expose it.',
      ],
      journey: [
        "I've always been fascinated by how complete products come together. Early on, I realized I wasn't satisfied understanding only one part of the process. I wanted to understand how engineering, design, branding, marketing, leadership, and organizational systems all contribute to building products people genuinely enjoy using.",
        'That curiosity eventually expanded into studying not only embedded systems and software, but also product design, branding, workflow management, and partnerships. Rather than specializing narrowly, I chose to understand the entire product lifecycle.',
      ],
    },
    interview: [
      {
        question:
          "Many engineers focus on one discipline, but you're equally interested in engineering, design, branding, and management. What made you want to understand the entire product lifecycle instead of specializing early?",
        answer: [
          "I've always been fascinated by how great products come together. A product isn't defined only by its engineering—it also depends on its design, branding, user experience, marketing, and the team behind it. I want to understand how each piece contributes so I can help build products that are technically strong, visually compelling, and genuinely valuable to users.",
        ],
      },
      {
        question:
          'You describe great products as a combination of technology and design. Can you think of a product that perfectly represents that philosophy?',
        answer: [
          'The smartphone is probably the best example. It combines sophisticated engineering with thoughtful design into something billions of people use every day without thinking about the complexity behind it. I admire products where advanced technology feels simple, intuitive, and almost effortless to use.',
        ],
      },
      {
        question:
          "As HubZero's Chief Operating Officer and Chief Partnership Officer, what role do you hope to play beyond building products?",
        answer: [
          'I want to build the systems that help people do their best work. That means creating efficient workflows, fostering strong partnerships, maintaining high standards, and helping turn ambitious ideas into well-executed products. If HubZero grows into a respected engineering company, I want part of that success to come from the culture and structure we built together.',
        ],
      },
      {
        question:
          'Your robotic arm project sparked your interest in robotics and embedded systems. Looking back, what was the biggest lesson it taught you?',
        answer: [
          'It taught me that every successful system is built one small problem at a time. There were many moments when nothing worked as expected, but solving each issue step by step made me appreciate the value of patience, iteration, and hands-on experimentation.',
        ],
      },
      {
        question:
          'Imagine someone using a product you helped create five years from now. What feeling or experience do you hope they walk away with?',
        answer: [
          'I want them to feel that the product simply works. It should solve a real problem, feel intuitive to use, look thoughtfully designed, and leave the impression that every detail was carefully considered. I also hope it becomes something they continue using for years because it naturally fits into their everyday lives.',
        ],
      },
      {
        question:
          'If you could spend the next five years mastering one field, what would it be, and why?',
        answer: [
          'Product engineering. It naturally combines AI, embedded systems, robotics, software, design, and user experience into one discipline. Mastering it would allow me to build complete products instead of isolated components.',
        ],
      },
      {
        question:
          'What kind of engineering challenges instantly make you think, "I want to work on this"?',
        answer: [
          "Projects that combine hardware and software to solve real-world problems immediately grab my attention. I'm especially drawn to robotics, intelligent embedded systems, automation, and futuristic products that require interdisciplinary thinking and push me to learn something new.",
        ],
      },
    ],
    quotes: [
      { text: 'Build with purpose, design for people, and never stop improving.' },
      {
        text: 'Technology solves problems. Design earns trust. Innovation happens when both work together.',
      },
    ],
    timelineEvents: [
      'Began exploring electronics and embedded engineering through personal projects.',
      'Built an IoT-based robotic arm, strengthening an interest in robotics and interdisciplinary engineering.',
      'Expanded interests beyond engineering into branding, UI/UX, product strategy, and organizational systems.',
      'Became Co-Founder of HubZero.',
      'Took on the roles of Chief Operating Officer and Chief Partnership Officer.',
      'Continues exploring product engineering as the convergence of AI, embedded systems, software, design, and leadership.',
    ],
  },
  {
    slug: 'sultan',
    name: 'Syed Mohammed Sultan',
    role: 'Chief Marketing Officer',
    group: 'Founders',
    overview:
      'Syed Mohammed Sultan is a software engineer with a strong interest in full-stack development, artificial intelligence, and building software that solves practical business problems. His work focuses on creating reliable, maintainable applications that simplify workflows, improve decision-making, and help people accomplish more with technology.',
    engineeringPhilosophy:
      "I believe software should remain simple long after it's finished. That means writing clean, reusable code, designing maintainable architecture, and avoiding unnecessary complexity whenever possible. Good engineering isn't measured by how complicated a system looks, it is measured by how easily people can understand, maintain, and extend it years later.",
    currentExploration:
      'Spring Boot, neural networks, and combining reliable backend systems with AI features that provide real value.',
    areasOfExpertise: [
      'Artificial Intelligence',
      'Large Language Models',
      'Developer Tools',
      'Full-Stack Development',
      'Backend Systems',
      'Java',
      'Spring Boot',
      'Spring Framework',
      'Neural Networks',
      'SQL & Databases',
    ],
    currentInterests: [
      'Spring Boot',
      'Spring Framework',
      'Neural Networks',
      'Artificial Intelligence',
      'JavaScript',
    ],
    engineeringIdentity: [
      'Build simple, maintainable, and scalable systems that solve real problems.',
      'Technology should exist to solve meaningful problems, not simply because it is interesting to build.',
    ],
    technologies: [
      'Artificial Intelligence',
      'Large Language Models',
      'Spring Boot',
      'Neural Networks',
      'Full-Stack Development',
      'Backend Systems',
    ],
    portraitFile: 'sultan.jpg',
    introduction: {
      philosophy: [
        "I believe software should remain simple long after it's finished.",
        'That means writing clean, reusable code, designing maintainable architecture, and avoiding unnecessary complexity whenever possible.',
        "Good engineering isn't measured by how complicated a system looks—it is measured by how easily people can understand, maintain, and extend it years later. Whenever I design software, I try to prioritize clarity, reliability, scalability, and the needs of the people who will actually use it.",
      ],
      journey: [
        'My interest in software engineering grew from wanting to build systems that solve real problems rather than simply demonstrating technical concepts.',
        'Over time I became interested in artificial intelligence, backend systems, databases, and full-stack web development because together they make it possible to build complete applications that businesses and individuals can rely on every day.',
        'That curiosity eventually led me toward projects involving AI, natural language processing, and developer tooling, while continuing to explore new technologies through personal experimentation.',
      ],
    },
    interview: [
      {
        question:
          'QueryCraft introduced you to large language models and AI systems. What did building it teach you that textbooks couldn’t?',
        answer: [
          "Building QueryCraft taught me that making AI work in a real project is very different from learning about it in books. Although I didn't have the lead role on the project, the biggest challenge wasn't the AI itself—it was making sure the output was actually useful, handling different situations, and making every part of the system work together properly.",
        ],
      },
      {
        question:
          'You often mention building simple, maintainable software. Can you describe a time when choosing a simpler solution turned out to be the better engineering decision?',
        answer: [
          "While building my projects, I often wanted to add more features, but I deliberately kept the design simple so I wouldn't confuse myself when returning later for updates.",
          'That decision made the software much easier to understand, debug, maintain, and extend without getting lost in unnecessary complexity.',
        ],
      },
      {
        question:
          'You enjoy solving business problems through software rather than building technology for its own sake. Why does that approach resonate with you?',
        answer: [
          'I like building software that people can actually use.',
          'If a project saves time, makes work easier, or solves a real problem, then I feel the effort invested in building it was worthwhile.',
        ],
      },
      {
        question:
          "You're currently exploring Spring Boot, neural networks, and JavaScript. What kinds of systems do you hope to build?",
        answer: [
          "I want to build complete web applications that combine a polished frontend, a reliable backend, and AI features that are genuinely useful instead of adding AI simply because it's popular.",
        ],
      },
      {
        question:
          'You mention creating parody websites and experimenting with random ideas. What do those side projects teach you?',
        answer: [
          'They give me the freedom to experiment without worrying about perfection.',
          "If something doesn't work, I still learn something new, and the process itself remains enjoyable.",
        ],
      },
      {
        question:
          'As HubZero evolves into a product company, what kind of products would you most like to see it known for?',
        answer: [
          'I want HubZero to build software that businesses trust and use every day.',
          'Products should solve real problems, remain easy to use, and genuinely help people work better. Just as importantly, I hope our team continues working together with strong cooperation and mutual respect as the company grows.',
        ],
      },
    ],
    quotes: [
      { text: 'The best way to predict the future is to invent it.', attribution: 'Alan Kay' },
    ],
    timelineEvents: [
      'Began exploring software engineering through Java, Python, SQL, and web development.',
      'Developed the Language Translator project, introducing machine learning concepts through TensorFlow.',
      'Expanded interests into AI systems, developer tools, and full-stack development.',
      'Contributed to QueryCraft as part of a collaborative engineering team, gaining practical experience with large language models.',
      'Became Co-Founder and Chief Marketing Officer of HubZero.',
      'Continues exploring backend architecture, artificial intelligence, and modern web technologies.',
    ],
  },
  {
    slug: 'salsabeel',
    name: 'Salsabeel Kobattey',
    role: 'Vice President of Hardware & Chief Financial Officer',
    group: 'Founders',
    overview:
      'Salsabeel Kobattey is an electronics engineer whose passion lies in understanding technology at its most fundamental level. His interests span embedded systems, robotics, VLSI, FPGA design, and computer architecture, with a particular focus on building efficient, reliable hardware that solves real-world problems.',
    engineeringPhilosophy:
      'I believe engineering is about understanding problems before designing solutions. Rather than searching for the most complex approach, I aim to build systems that are efficient, reliable, practical, and easy to maintain. Complexity belongs in the engineering process, not in the experience of the people who use what we build.',
    currentExploration:
      'VLSI and FPGA design, and understanding how modern processors and embedded systems are designed from the ground up.',
    areasOfExpertise: [
      'Embedded Systems',
      'Robotics',
      'Infrastructure',
      'VLSI',
      'FPGA Design',
      'Chip Architecture',
    ],
    currentInterests: [
      'VLSI Design',
      'FPGA Development',
      'Digital Hardware Design',
      'Modern Chip Architectures',
    ],
    engineeringIdentity: [
      'Understanding the problem is more important than building the solution quickly.',
      'Simplifying complexity isn’t reducing effort — it’s evidence that you’ve truly understood the problem.',
      'Knowledge is my foundation, curiosity is my compass, and continuous growth is my journey.',
    ],
    technologies: [
      'Embedded Systems',
      'Robotics',
      'VLSI',
      'FPGA Design',
      'Chip Architecture',
      'Infrastructure',
    ],
    portraitFile: 'salsabeel.jpg',
    introduction: {
      philosophy: [
        'I believe engineering is about understanding problems before designing solutions.',
        'Rather than searching for the most complex approach, I aim to build systems that are efficient, reliable, practical, and easy to maintain. Complexity belongs in the engineering process—not in the experience of the people who use what we build.',
        'To me, simplifying a difficult problem is evidence of understanding it deeply.',
      ],
      journey: [
        "I've always been curious about how things work beneath the surface. Instead of simply accepting that technology functions, I naturally want to understand why it works. That curiosity eventually led me toward electronics, embedded systems, and hardware engineering, where every component contributes to a larger system.",
        'As my interests expanded, I became increasingly fascinated by semiconductor design and the foundations of modern computing.',
      ],
    },
    interview: [
      {
        question:
          'You often mention simplifying complex problems. Where does that mindset come from?',
        answer: [
          "I've always been drawn to understanding how things work rather than simply accepting that they do.",
          'I naturally break complex systems into smaller, connected pieces until they make sense. Over time, that became the way I approach almost every engineering problem.',
          "To me, simplifying complexity isn't reducing effort—it's evidence that you've truly understood the problem.",
        ],
      },
      {
        question: 'What excites you most about working close to the hardware?',
        answer: [
          'One of my personal goals has always been to explore every major area of engineering.',
          'Hardware excites me because it transforms ideas into physical systems that perform real work. Designing hardware requires thinking about timing, efficiency, power consumption, and how every component interacts at a fundamental level.',
          'VLSI and FPGA design are especially fascinating because they reveal how computing actually works beneath the surface.',
        ],
      },
      {
        question: 'Your IoT LED controller remains your favorite project. Why?',
        answer: [
          'It was one of the first projects where I gave everything I had.',
          'I spent countless hours learning new concepts, solving bugs, experimenting, and improving the system until everything finally worked together. The process itself became more rewarding than the final product.',
        ],
      },
      {
        question:
          'Can you share an example where understanding the problem first led to a better outcome?',
        answer: [
          'During one of our mini projects, my teammates wanted to begin building the hardware immediately.',
          'Instead, I suggested we spend more time understanding every aspect of the problem before starting implementation. That extra planning uncovered several design flaws early, saving significant time, money, and unnecessary work later.',
        ],
      },
      {
        question: 'What keeps you motivated when working on difficult engineering problems?',
        answer: [
          'Curiosity is my biggest source of motivation.',
          'I genuinely enjoy learning and improving with every challenge. But I also rely on structured methods instead of motivation alone. I break large problems into very small tasks, write everything down, and track progress carefully.',
        ],
      },
      {
        question: 'If there were no limitations, what hardware would you love to help build?',
        answer: [
          "I'd love to contribute to next-generation processors and embedded systems that deliver higher performance while consuming less power.",
          "I'm particularly interested in hardware for artificial intelligence, edge computing, and space technology—areas where thoughtful engineering can have a meaningful impact on the future.",
        ],
      },
      {
        question: 'Have your interests outside engineering influenced the way you solve problems?',
        answer: [
          'Absolutely. Reading has taught me patience and curiosity, encouraging me to understand ideas deeply rather than searching for quick answers.',
          'History and geography remind me that engineering exists within a much larger context. They encourage me to learn from existing solutions, understand how technology evolves, and approach every problem with perspective instead of assumptions.',
        ],
      },
    ],
    quotes: [
      {
        text: 'Knowledge is my foundation, curiosity is my compass, and continuous growth is my journey.',
      },
    ],
    timelineEvents: [
      'Developed an early passion for electronics and hardware systems.',
      'Built an IoT LED Controller that solidified an interest in embedded engineering.',
      'Expanded into robotics, infrastructure, and semiconductor technologies.',
      'Began exploring VLSI and FPGA design.',
      'Became Co-Founder, Vice President of Hardware, and Chief Financial Officer at HubZero.',
      'Continues researching next-generation hardware and chip architectures.',
    ],
  },
];

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------

async function ensureSeedUserId(): Promise<string> {
  const email = 'engineering-profiles-seed@hubzero.internal';
  const existing = await userRepository.findByEmail(email);
  if (existing) return existing._id.toString();
  const created = await userRepository.create({
    name: 'HubZero Content Import',
    email,
    role: 'headAdmin',
    passwordHash: await hashPassword(randomBytes(32).toString('hex')),
    disabled: false,
    mustChangePassword: false,
  });
  return created._id.toString();
}

async function ensureTechnology(label: string): Promise<string> {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const existing = await taxonomyRepository.findBySlug(slug);
  if (existing) return existing._id.toString();
  const created = await taxonomyRepository.create({ kind: 'technology', label, slug });
  return created._id.toString();
}

async function ensurePortrait(founder: FounderSeed, createdByUserId: string): Promise<string> {
  const publicIdSeed = `hubzero/team/${founder.slug}`;
  const existing = await mediaRepository.findByCloudinaryPublicId(publicIdSeed);
  if (existing) return existing._id.toString();

  const filePath = path.resolve(process.cwd(), 'team-portraits', founder.portraitFile);
  const cloudinary = getCloudinaryClient();
  const upload = await cloudinary.uploader.upload(filePath, {
    public_id: publicIdSeed,
    overwrite: false,
  });

  const created = await mediaRepository.create(
    {
      cloudinaryPublicId: upload.public_id,
      url: upload.secure_url,
      altText: `Portrait of ${founder.name}, ${founder.role} at HubZero.`,
      width: upload.width,
      height: upload.height,
      fileSizeBytes: upload.bytes,
      mimeType: `image/${upload.format}`,
      originalFilename: founder.portraitFile,
      folder: 'team',
      reuseTags: ['team', 'founder', founder.slug],
    },
    { createdByUserId },
  );
  return created._id.toString();
}

function buildIntroductionBlocks(founder: FounderSeed): Block[] {
  return [
    heading('Engineering philosophy', 2),
    ...founder.introduction.philosophy.map(paragraph),
    heading('Journey', 2),
    ...founder.introduction.journey.map(paragraph),
  ];
}

function buildInterviewBlocks(founder: FounderSeed): Block[] {
  return founder.interview.flatMap((entry) => [
    heading(entry.question, 3),
    ...entry.answer.map(paragraph),
  ]);
}

function buildQuotesBlocks(founder: FounderSeed): Block[] {
  return founder.quotes.map((q) => quote(q.text, q.attribution));
}

function buildTimelineBlocks(founder: FounderSeed): Block[] {
  return [
    timeline(
      founder.timelineEvents.map((title, index) => ({
        date: `Stage ${String(index + 1).padStart(2, '0')}`,
        title,
      })),
    ),
  ];
}

async function seedDocument(
  ownerId: string,
  role: 'introduction' | 'interview' | 'quotes' | 'timeline',
  blocks: Block[],
): Promise<void> {
  const existing = await documentRepository.findByOwnerAndRole('EngineeringProfile', ownerId, role);
  if (existing) {
    await documentRepository.updateBlocks(existing._id.toString(), blocks);
    return;
  }
  await documentRepository.create({ ownerType: 'EngineeringProfile', ownerId, role, blocks });
}

async function seedFounder(
  founder: FounderSeed,
  createdByUserId: string,
  order: number,
): Promise<void> {
  const portraitId = await ensurePortrait(founder, createdByUserId);
  const technologyIds = await Promise.all(founder.technologies.map(ensureTechnology));

  const teamCollection = await collections.team();
  const existingTeam = await teamCollection.findOne({ name: founder.name });
  const team = existingTeam
    ? await teamRepository.update(existingTeam._id.toString(), {
        role: founder.role,
        bio: founder.overview,
        group: founder.group,
        portraitId,
        publicProfile: true,
      })
    : await teamRepository.create({
        name: founder.name,
        role: founder.role,
        bio: founder.overview,
        group: founder.group,
        portraitId,
        publicProfile: true,
        founder: true,
        order,
        socialLinks: [],
        archived: false,
      });
  if (!team) throw new Error(`Failed to upsert Team record for ${founder.name}`);

  const existingProfile = await engineeringProfileRepository.findByTeamMemberId(
    team._id.toString(),
  );
  const profileFields = {
    slug: founder.slug,
    status: 'published' as const,
    teamMemberId: team._id.toString(),
    overview: founder.overview,
    engineeringPhilosophy: founder.engineeringPhilosophy,
    currentExploration: founder.currentExploration,
    areasOfExpertise: founder.areasOfExpertise,
    currentInterests: founder.currentInterests,
    engineeringIdentity: founder.engineeringIdentity,
    technologyIds,
    featuredWorkIds: [],
    featuredBuildIds: [],
    featuredBlueprintIds: [],
    featuredLabIds: [],
    featuredNoteIds: [],
    galleryImageIds: [],
  };
  const profile = existingProfile
    ? await engineeringProfileRepository.update(existingProfile._id.toString(), profileFields)
    : await engineeringProfileRepository.create(profileFields, createdByUserId);
  if (!profile) throw new Error(`Failed to upsert Engineering Profile for ${founder.name}`);

  const profileId = profile._id.toString();
  await seedDocument(profileId, 'introduction', buildIntroductionBlocks(founder));
  await seedDocument(profileId, 'interview', buildInterviewBlocks(founder));
  await seedDocument(profileId, 'quotes', buildQuotesBlocks(founder));
  await seedDocument(profileId, 'timeline', buildTimelineBlocks(founder));

  console.log(
    `Seeded ${founder.name} (${founder.slug}) — Team ${team.referenceId}, Profile ${profile.referenceId}`,
  );
}

async function main(): Promise<void> {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  if (nodeEnv !== 'development') {
    console.error(`Refusing to run: NODE_ENV is "${nodeEnv}", not "development".`);
    process.exit(1);
  }

  // Fail fast and clearly if a founder's portrait is missing, rather than
  // uploading four and silently skipping the fifth.
  for (const founder of FOUNDERS) {
    const filePath = path.resolve(process.cwd(), 'team-portraits', founder.portraitFile);
    await readFile(filePath).catch(() => {
      throw new Error(`Missing portrait for ${founder.name} at ${filePath}`);
    });
  }

  const createdByUserId = await ensureSeedUserId();
  for (const [index, founder] of FOUNDERS.entries()) {
    await seedFounder(founder, createdByUserId, index);
  }

  console.log('\nDone. Note: these profiles will not be publicly visible until at least two real');
  console.log('Work/Build/Blueprint/Lab/Note entries exist and link back to a profile as evidence');
  console.log('(the eligibility gate in src/lib/public/repository.ts) — by design, not a bug.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
