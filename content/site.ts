// All website copy lives here. Each { race, recruiter } pair switches with the mode toggle.
// In text: *word* = italic accent, `word` = code.

export type Copy = { race: string; recruiter: string };
const c = (race: string, recruiter: string = race): Copy => ({ race, recruiter });

export const site = {
  name: "R.A. Shankari",
  email: "shankari9514@gmail.com",
  resume: "/assets/Shankari-RA-Resume.pdf",
  // PLACEHOLDER: drop the photo at public/assets/img/shankari.jpg and set this to "/assets/img/shankari.jpg"
  photo: null as string | null,
  links: {
    github: "https://github.com/shanu-13",
    linkedin: "https://www.linkedin.com/in/shankari-ramu-6632b129a",
  },
};

export const nav = [
  { id: "start", label: c("Start Line", "Home") },
  { id: "driver", label: c("Driver", "About") },
  { id: "garage", label: c("Garage", "Skills") },
  { id: "laps", label: c("Laps", "Experience") },
  { id: "showroom", label: c("Showroom", "Projects") },
  { id: "podium", label: c("Podium", "Achievements") },
  { id: "radio", label: c("Pit Radio", "Contact") },
];

export const loaderLines = [
  "Warming up the tyres…",
  "Checking tyre pressure…",
  "Clearing the gravel trap…",
  "Five red lights…",
];

export const hero = {
  label: "#60 · R.A. SHANKARI · FRONTEND DEVELOPER",
  title: c("Hi, I'm Shankari. I build websites at *race pace.*", "R.A. Shankari — *Software Developer*"),
  second: "Currently studying *AI & Data Science* — so the next sites might start *thinking.*",
  sub: c(
    "60+ websites shipped. Zero left stuck in the pit lane.",
    "Frontend developer building responsive, high-performance websites with React, Next.js and Tailwind CSS. Final-year B.Tech student in AI & Data Science."
  ),
  ctaPrimary: c("See the laps →", "View experience →"),
  ctaSecondary: c("Grab the resume", "Download resume"),
};

export const marquee = ["Lights out", "60+ websites", "React", "Next.js", "TypeScript", "Tailwind", "Figma", "Race pace", "AI & DS"];

export const driver = {
  title: c("Meet the *driver.*", "About *me*"),
  stats: [
    { k: c("Driver"), v: c("R.A. Shankari") },
    { k: c("Team"), v: c("TCP International Inc.") },
    { k: c("Position"), v: c("Software Developer") },
    { k: c("Academy"), v: c("Jansons Institute of Technology — B.Tech AI & DS, Class of 2027") },
    { k: c("Qualifying time", "CGPA"), v: c("8.41 CGPA", "8.41") },
    { k: c("Radio languages", "Languages"), v: c("English (fluent), French (intermediate) — *je parle un peu, et je code beaucoup*", "English (fluent), French (intermediate)") },
    { k: c("Superpower", ""), v: c("Turning “can you make it pop?” into actual CSS", "") },
  ],
  lead: c(
    "I'm a frontend developer who treats every website like a race car: it has to look sharp, it has to be fast, and it has to cross the finish line before the deadline.",
    "Motivated engineering student and working software developer with strong analytical skills and hands-on frontend experience."
  ),
  body: [
    c(
      "I started with a coconut brand and a colour wheel. Now I build websites in bulk for one of the world's biggest automotive expos. Somewhere in between, I hosted an actual karting race. The racing theme isn't a gimmick. It's basically a documentary.",
      "I've delivered 60+ production websites and bring a habit of meeting deadlines without compromising design quality. Currently pursuing a B.Tech in Artificial Intelligence and Data Science (CGPA 8.41)."
    ),
    c("When I'm not writing code, I'm organising things: fests, magazines, 300-person events. Turns out managing chaos and managing `z-index` use the same skills.", ""),
  ],

  // ---- recruiter mode only: profile layout ----
  profile: {
    role: "Software Developer",
    team: "TCP International Inc.",
    languages: ["English · Fluent", "French · Intermediate"],
    now: [
      { k: "Work", v: "Software Developer", at: "TCP International Inc.", when: "Feb 2026 – Present" },
      { k: "Education", v: "B.Tech, AI & Data Science", at: "Jansons Institute of Technology", when: "Class of 2027" },
    ],
    highlights: [
      { v: "60+", k: "Production websites delivered" },
      { v: "8.41", k: "CGPA in B.Tech AI & DS" },
      { v: "300+", k: "Participants at a fest I coordinated" },
    ],
    strengths: [
      { icon: "code", t: "Frontend engineering", d: "React, Next.js, TypeScript, JavaScript and Tailwind CSS, built mobile-first." },
      { icon: "layers", t: "Delivery at scale", d: "60+ consistent, responsive websites for the Automechanika Expo, shipped on deadline." },
      { icon: "users", t: "Leadership & communication", d: "Overall Student Coordinator for a 300+ participant fest; event host and magazine team lead." },
    ],
  },

  // ---- race mode only: the comic-page version of this section ----
  card: { role: "Frontend Developer", team: "TCP International Inc.", licence: "LIC-0060-AIDS-27" },
  ratings: [
    { k: "Pace", v: 94 },
    { k: "Pixel precision", v: 98 },
    { k: "Deadline control", v: 100 },
    { k: "Bug avoidance", v: 87 },
  ],
  story: [
    { ep: "EP. 1", icon: "🥥", title: "The coconut era", text: "First real track: a full website for a coconut brand. Colour wheel, payments, shipping, the works.", tone: "yellow" },
    { ep: "EP. 2", icon: "🎙️", title: "Mic on the grid", text: "Hosted an actual karting race. Held the mic, not the steering wheel. *This time.*", tone: "teal" },
    { ep: "EP. 3", icon: "🏁", title: "Expo mode", text: "60+ websites for the Automechanika Expo. Every one across the line on time.", tone: "red" },
  ],
  facts: [
    { icon: "🎓", k: "Academy", v: "Jansons Institute of Technology · B.Tech AI & DS · Class of 2027" },
    { icon: "⏱️", k: "Qualifying time", v: "8.41 CGPA" },
    { icon: "📻", k: "Radio languages", v: "English (fluent) · French (intermediate)" },
    { icon: "⚡", k: "Superpower", v: "Turning “can you make it pop?” into actual CSS" },
  ],
  offTrack: "Meanwhile, off track… I'm running fests, magazines and 300-person events. Managing chaos and managing `z-index`: same skill.",
};

export const garage = {
  title: c("Welcome to the *garage.*", "*Skills*"),
  sub: c("Every good car is just good parts, well put together. Drag them around — they're yours to inspect.", ""),
  parts: [
    { icon: "🔧", name: c("The Engine", "Frontend"), chips: "React · Next.js · JavaScript · TypeScript", note: c("The part that makes things go. Components in, horsepower out.", ""), color: "#ffe9e6" },
    { icon: "🎨", name: c("The Bodywork", "Design & UI"), chips: "HTML · CSS · Tailwind CSS · Figma", note: c("Aerodynamics matter. So does padding. I care about both.", ""), color: "#e6f0ff" },
    { icon: "📡", name: c("The Telemetry", "Data"), chips: "SQL · Database Management · AI & DS (in progress)", note: c("Every great team reads the data. I'm studying how to make the data read back.", ""), color: "#e7f8ee" },
    { icon: "🧰", name: c("The Pit Crew Kit", "Tools & CMS"), chips: "Git & Version Control · WordPress", note: c('`git commit -m "final"` `git commit -m "final_final"` `git commit -m "ok this one is actually final"`', ""), color: "#fff6d6" },
  ],
};

export const laps = {
  title: c("Lap *times.*", "*Experience*"),
  sub: c("Real tracks, real deadlines, no safety car.", ""),
  items: [
    {
      flag: c("LAP 2 · ON TRACK", "CURRENT"),
      live: true,
      role: "Software Developer — TCP International Inc.",
      date: "Feb 2026 – Present",
      hook: c("**60+ websites for the Automechanika Expo.** Yes, sixty. Yes, an automotive expo. Yes, the racing theme is method acting.", ""),
      points: {
        race: [
          "Built and delivered 60+ responsive static websites that all look, feel and perform consistently. A whole grid of cars on the same setup sheet.",
          "Wrote frontend code in HTML, CSS, JavaScript and React/Next.js, mobile-first every time.",
          "Worked with the team to fix issues, tune performance and cross the line before every deadline.",
        ],
        recruiter: [
          "Developed and delivered 60+ responsive static websites for the Automechanika Expo, ensuring consistent design, usability and performance.",
          "Frontend development with HTML, CSS, JavaScript, React/Next.js and responsive design principles.",
          "Collaborated across teams to troubleshoot issues, optimise performance and meet deadlines.",
        ],
      },
      stats: [
        { n: 60, suffix: "+ sites" },
        { n: 100, suffix: "% responsive" },
      ],
    },
    {
      flag: c("LAP 1 · ROOKIE SEASON", "PREVIOUS"),
      live: false,
      role: "Frontend Developer — Anaimalais Coco",
      date: "Sep 2024 – Feb 2025",
      hook: c("**My first real track: a coconut brand.**", ""),
      points: {
        race: [
          "Designed and built the full website using colour theory, so the coconuts looked as fresh online as they do in real life.",
          "Connected shipping and payment APIs, so people can actually buy the coconuts. Kind of important.",
          "Built on WordPress: design, plugins and content management, start to finish.",
          "Delivered a fully working site on deadline. Rookie season, podium attitude.",
        ],
        recruiter: [
          "Built the company website using colour theory and integrated shipping and payment APIs.",
          "Implemented the site in WordPress, including design, plugin integration and content management.",
          "Delivered a fully functional website within the deadline.",
        ],
      },
      stats: [],
    },
  ],
};

// PLACEHOLDERS: set `image` to "/assets/projects/<file>.jpg" and `href` to the live link.
export const projects = {
  title: c("The *showroom.*", "*Projects*"),
  sub: c("Cars I built. Please don't lean on them.", ""),
  items: [
    { name: "Automechanika Expo websites", line: c("One design system, sixty websites, zero crashes.", "60+ responsive event websites with a shared design system."), tags: "Next.js · Responsive · 2026", hue: 0, tall: true, image: null as string | null, href: "#" },
    { name: "Anaimalais Coco", line: c("Coconuts, now with checkout.", "WordPress e-commerce site with shipping and payment integrations."), tags: "WordPress · E-commerce · 2024–25", hue: 120, tall: false, image: null as string | null, href: "#" },
    { name: "Project name", line: c("Still in the garage. Rolling out soon.", "Project description coming soon."), tags: "Tags · Year", hue: 210, tall: false, image: null as string | null, href: "#" },
    { name: "Project name", line: c("Still in the garage. Rolling out soon.", "Project description coming soon."), tags: "Tags · Year", hue: 280, tall: true, image: null as string | null, href: "#" },
    { name: "Project name", line: c("Still in the garage. Rolling out soon.", "Project description coming soon."), tags: "Tags · Year", hue: 40, tall: false, image: null as string | null, href: "#" },
    { name: "Project name", line: c("Still in the garage. Rolling out soon.", "Project description coming soon."), tags: "Tags · Year", hue: 170, tall: false, image: null as string | null, href: "#" },
  ],
  featuredTitle: c("Featured *builds.*", "Featured *projects*"),
  featured: [
    { name: "Automechanika Expo — 60+ event websites", tags: ["Next.js", "Responsive"], year: "2026", href: "#" },
    { name: "Anaimalais Coco — e-commerce website", tags: ["WordPress", "Payments"], year: "2024", href: "#" },
    { name: "Project name — short description", tags: ["Tag", "Tag"], year: "Year", href: "#" },
  ],
};

export const podium = {
  title: c("The *trophy* cabinet.", "*Achievements*"),
  sub: c("Things I did when nobody asked me to write code.", ""),
  items: [
    { icon: "🏎️", name: c("Track-side host", "Event host"), what: "Indian Karting Race (IKR) & Formula Imperial · Nov 2025", note: c("I hosted a real karting race. I held the mic, not the steering wheel. *This time.*", ""), gold: true },
    { icon: "🎪", name: c("Race director", "Overall Student Coordinator"), what: "Varnave 2025 · 300+ participants", note: c("300+ participants, one fest, and me with the clipboard. Nobody got lost. Mostly.", ""), gold: false },
    { icon: "🎭", name: c("Festival organiser", "Fest organiser & host"), what: "Technical & non-technical cultural fest", note: c("A fest with both a coding track and a dance-floor track. Range.", ""), gold: false },
    { icon: "📰", name: c("Magazine team lead"), what: "College magazine · design, editing, publishing", note: c("Led writers, designers and editors to publish it. Basically a website, but you can hold it.", ""), gold: false },
    { icon: "🏆", name: c("House captain", "School House President"), what: "“Best Squad” award", note: c("Team captain energy has been there since day one.", ""), gold: false },
  ],
};

export const radio = {
  label: "📻 PIT RADIO · CHANNEL OPEN",
  title: c("*Box, box!* Let's build something fast together.", "Let's work *together.*"),
  sub: c(
    "Got a website stuck in the pits, an idea that needs a body kit, or a role that needs a frontend developer? Radio in.",
    "I'm open to software and frontend developer roles. The fastest way to reach me is by email."
  ),
  copied: c("Copied! Radio check complete ✔", "Email copied ✔"),
};

export const footer = {
  big: c("🏁 You've reached the finish line. Thanks for the lap.", "Thanks for visiting."),
  top: c("Back to the start ↑", "Back to top ↑"),
};
