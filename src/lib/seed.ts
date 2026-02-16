import { getDb } from "./db";
import type { ProposalData } from "./types";

export async function runMigrations() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug          VARCHAR(100) UNIQUE NOT NULL,
      client_name   VARCHAR(255) NOT NULL,
      business_type VARCHAR(255),
      location      VARCHAR(255),
      social_urls   JSONB DEFAULT '[]',
      notes         TEXT,
      status        VARCHAR(50) DEFAULT 'draft',
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS intake_responses (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id    UUID UNIQUE NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      responses     JSONB NOT NULL DEFAULT '{}',
      current_step  INT DEFAULT 0,
      completed     BOOLEAN DEFAULT FALSE,
      started_at    TIMESTAMPTZ DEFAULT NOW(),
      completed_at  TIMESTAMPTZ
    )
  `;

  // Add ai_analysis column if it doesn't exist (migration for existing DBs)
  await sql`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS ai_analysis JSONB
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS proposals (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug          VARCHAR(100) UNIQUE NOT NULL,
      project_id    UUID REFERENCES projects(id) ON DELETE SET NULL,
      client_name   VARCHAR(255) NOT NULL,
      contact_name  VARCHAR(255),
      industry      VARCHAR(255),
      proposal_data JSONB NOT NULL DEFAULT '{}',
      status        VARCHAR(50) DEFAULT 'draft',
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  return { success: true, message: "Migrations completed" };
}

// "A Taste of Pearl" — seed proposal data
const pearlProposal: ProposalData = {
  title: {
    client_name: "A Taste of Pearl",
    date: "February 2026",
    subtitle: "DIGITAL GROWTH PROPOSAL",
  },
  pain_points: [
    { icon: "bi-search", title: "PEOPLE CAN'T FIND YOU", description: "Only 22 organic visitors/month. Competitors get 10-50x more. \"Catering Hillsboro\" — you're invisible." },
    { icon: "bi-speedometer2", title: "YOUR WEBSITE IS SLOW", description: "PageSpeed: 66/100. Largest content takes 8.7s to load. Customers leave, Google penalizes you." },
    { icon: "bi-exclamation-triangle", title: "EZCATER MENU HEADACHES", description: "Emailing menu updates, descriptions getting mangled, pricing mismatches. Every error costs orders." },
    { icon: "bi-pin-map", title: "NAP INCONSISTENCIES", description: "Name, address & phone vary across Google, Yelp, Facebook, Alignable. Confuses Google, hurts rankings." },
    { icon: "bi-journal-x", title: "NO BLOG = NO GROWTH", description: "10 pages with low word count. No way to rank for \"curry catering corporate events\" or \"Sri Lankan wedding food.\"" },
    { icon: "bi-megaphone", title: "SOCIAL MEDIA UNTAPPED", description: "Wednesday Facebook posts but no consistent schedule, no cross-platform strategy, no website connection." },
  ],
  why_new_website: {
    before: [
      { label: "PageSpeed: 66 (mobile)", description: "Slow load penalized by Google" },
      { label: "8.7 second load time (LCP)", description: "Customers leave before seeing menu" },
      { label: "SEO score: 77/100", description: "Missing critical optimizations" },
      { label: "No blog or content pages", description: "Can't rank for long-tail keywords" },
      { label: "No Google Reviews on site", description: "Missing social proof on website" },
      { label: "8 hreflang errors", description: "Broken indexing confuses crawlers" },
      { label: "16 pages missing meta descriptions", description: "Invisible in search results" },
      { label: "14 pages missing H1 headings", description: "No heading hierarchy for SEO" },
      { label: "Menu updates = email & pray", description: "Manual process causes errors" },
      { label: "Built on Zyro (limited SEO)", description: "Platform restricts growth" },
    ],
    after: [
      { label: "Target: 90+ PageSpeed score", description: "Fast site ranks higher" },
      { label: "Sub-2 second load times", description: "Customers stay and browse" },
      { label: "SEO-first architecture & markup", description: "Built for Google from day one" },
      { label: "Blog for organic keyword growth", description: "Content drives free traffic" },
      { label: "Live Google Reviews via Maps API", description: "5-star proof on every page" },
      { label: "Clean technical SEO (zero errors)", description: "Nothing holding you back" },
      { label: "Optimized meta for every page", description: "Show up in search results" },
      { label: "Proper heading hierarchy (H1-H6)", description: "Clear structure for crawlers" },
      { label: "Menu syncs to ezCater via API", description: "Update once, syncs everywhere" },
      { label: "Built on Next.js (full SEO control)", description: "No platform limitations" },
    ],
  },
  aida_strategy: {
    attention: {
      title: "Get found when people search.",
      items: ["SEO keywords", "Google Business Profile", "Blog content", "AI search visibility", "Hillsboro & Portland see you first"],
    },
    interest: {
      title: "Make them stay and explore.",
      items: ["Fast-loading site", "Stunning photos", "Your story as Chef Kal", "Live 5-star Google Reviews", "Instant credibility"],
    },
    desire: {
      title: "Make them want YOUR food.",
      items: ["Menu pages", "Sri Lankan cuisine education", "Testimonials", "\"Only Sri Lankan caterer in Portland\" positioning"],
    },
    action: {
      title: "Make it effortless to order.",
      items: ["Clear CTAs", "Quote form", "ezCater link", "Click-to-call", "Dinner box signup", "Zero friction"],
    },
  },
  itemized_pricing: {
    sections: [
      {
        category: "ONE-TIME SETUP",
        items: [
          { name: "Website Redesign & Build (Next.js, Tailwind, mobile-first)", price: "$500" },
          { name: "SEO-optimized page structure & meta tags", description: "Included in build", price: "" },
          { name: "Blog page for content marketing & keyword growth", description: "Included in build", price: "" },
          { name: "Live Google Reviews widget (Maps API integration)", description: "Included in build", price: "" },
          { name: "Speed optimization (target 90+ PageSpeed)", description: "Included in build", price: "" },
          { name: "Backlink building (directories, citations)", description: "Included in build", price: "" },
          { name: "ezCater Menu Integration — auto-syncs menu, prices & descriptions", price: "$100" },
        ],
        subtotal: "$600",
      },
      {
        category: "MONTHLY SEO",
        items: [
          { name: "Local SEO optimization & keyword targeting", price: "" },
          { name: "On-page & technical SEO fixes + monthly performance reports", price: "" },
        ],
        subtotal: "$250/mo",
      },
      {
        category: "GBP PRO MANAGEMENT",
        items: [
          { name: "70+ directory listings synced & maintained (Google, Yelp, Facebook, Apple Maps, etc.)", price: "" },
          { name: "NAP consistency enforced across all platforms — critical for local pack rankings", price: "" },
          { name: "Google Business Profile posting 2-3x/week (promotions, events, menu highlights)", price: "" },
          { name: "Automatic review monitoring & professional replies (builds trust + SEO signals)", price: "" },
        ],
        subtotal: "$100/mo",
      },
      {
        category: "OPTIONAL: SOCIAL MEDIA MANAGEMENT",
        items: [
          { name: "Scheduled posting, content calendar, cross-platform strategy", price: "$150/mo" },
        ],
      },
    ],
  },
  competitors: {
    entries: [
      { name: "Mirisata.com", website_score: "232", seo_score: "High", reviews: "Strong" },
      { name: "CateringServicesNW", website_score: "59", seo_score: "Moderate", reviews: "Moderate" },
      { name: "KamsFinefoods", website_score: "58", seo_score: "Moderate", reviews: "Moderate" },
      { name: "BellyfulCatering", website_score: "37", seo_score: "Moderate", reviews: "Growing" },
      { name: "A Taste of Pearl (You)", website_score: "14", seo_score: "22/mo", reviews: "Weak", notes: "client" },
    ],
    unfair_advantage: "You're the only authentic Sri Lankan caterer in the Portland metro. Your competitors fight over generic keywords like \"catering Hillsboro.\" With the right SEO, you dominate niche searches like \"Sri Lankan catering Portland,\" \"curry catering corporate events,\" and \"authentic island food catering Oregon\" — zero competition, high buyer intent.",
  },
  roi: {
    monthly_cost: "$350",
    revenue_per_customer: "$200",
    new_customers_per_month: "2",
    monthly_revenue: "$400+",
    annual_revenue: "$19,200-$31,680",
    roi_percentage: "300-560%",
    projections: [
      { month: "Month 1", revenue: "$200-$440", cumulative: "Break-even" },
      { month: "Month 3", revenue: "$600-$1,100/mo", cumulative: "+$150-$1,650" },
      { month: "Month 6", revenue: "$1,000-$1,760/mo", cumulative: "+$3,300-$7,860" },
      { month: "Month 12", revenue: "$1,600-$2,640/mo", cumulative: "+$14,000-$26,880" },
    ],
  },
  timeline: {
    phases: [
      {
        phase_number: 1,
        title: "Foundation",
        duration: "Week 1-2",
        tasks: ["New website built & launched", "ezCater API integrated", "GBP fully optimized", "Critical SEO errors fixed", "NAP audit & corrections"],
      },
      {
        phase_number: 2,
        title: "Growth Engine",
        duration: "Month 1-2",
        tasks: ["Blog content targeting local keywords", "On-page SEO for every page", "Backlink outreach to directories", "Live Google Reviews pulling social proof"],
      },
      {
        phase_number: 3,
        title: "Momentum",
        duration: "Month 3-6",
        tasks: ["Rankings climb for target keywords", "Organic traffic grows 3-5x", "ezCater orders increase", "NAP consistency boosts local pack"],
      },
      {
        phase_number: 4,
        title: "Compounding Returns",
        duration: "Month 6-12",
        tasks: ["Top 3 rankings for niche keywords", "Steady inbound leads", "AI search visibility grows", "Free traffic replacing paid ads"],
      },
    ],
  },
  pricing_summary: {
    packages: [
      { label: "WEBSITE BUILD", original_price: "$997", price: "$500", frequency: "one-time", savings: "SAVE $497" },
      { label: "EZCATER SYNC", original_price: "Custom", price: "$100", frequency: "one-time", savings: "EXCLUSIVE" },
      { label: "SEO", original_price: "$497/mo", price: "$250", frequency: "/mo", savings: "SAVE $247/mo", highlighted: true },
      { label: "GBP PRO", original_price: "$197/mo", price: "$100", frequency: "/mo", savings: "SAVE $97/mo", highlighted: true },
    ],
    personal_note: "\"Kal, I'm not here to sell you something you don't need. Lacey was my boss at Intel — this is personal. I've seen what you and Lacey have built with A Taste of Pearl, and the food speaks for itself. The problem isn't your product — it's that people can't find you. Two extra catering orders per month pays for everything I'm proposing. Let me handle the digital side so you can focus on what you do best.\"",
  },
  next_steps: {
    steps: [
      { number: 1, title: "Say Yes", description: "Quick call to confirm your menu, ezCater login, and Google Business access." },
      { number: 2, title: "We Build", description: "New website live within 2 weeks. ezCater integration same week. SEO starts day one." },
      { number: 3, title: "You Cook", description: "Focus on making incredible Sri Lankan food. We handle the digital side completely." },
      { number: 4, title: "Orders Grow", description: "Watch your phone ring more, ezCater orders increase, and Google presence climb." },
    ],
    cta_text: "Ready to get started?",
  },
};

export async function seedProposals() {
  const sql = getDb();

  // Check if already seeded
  const existing = await sql`SELECT id FROM proposals WHERE slug = 'a-taste-of-pearl'`;
  if (existing.length > 0) {
    return { success: true, message: "Proposal already exists" };
  }

  await sql`
    INSERT INTO proposals (slug, client_name, contact_name, industry, proposal_data, status)
    VALUES (
      'a-taste-of-pearl',
      'A Taste of Pearl',
      'Kal',
      'Sri Lankan catering',
      ${JSON.stringify(pearlProposal)},
      'published'
    )
  `;

  return { success: true, message: "A Taste of Pearl proposal seeded" };
}
