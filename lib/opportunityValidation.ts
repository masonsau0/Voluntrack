export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// ─── Blocked word list ────────────────────────────────────────────────────────
// Each entry is matched as a whole word (\b boundary on both sides).
// If ANY of these appear in the title or description the submission is rejected
// immediately — before the LLM call. Add new terms here; no regex required.

const BLOCKED_WORDS: string[] = [
  // Profanity
  "fuck", "shit", "cunt", "bitch", "bastard", "asshole", "dickhead", "motherfucker",

  // Racial / ethnic / identity slurs
  "nigger", "nigga", "faggot", "chink", "spic", "kike", "gook", "wetback", "tranny",

  // Sexual — the word alone has no place in a volunteer listing
  "sex", "porn", "porno", "pornography",
  "nude", "nudes", "naked", "nudity",
  "erotic", "intercourse", "orgasm", "fetish",

  // Sexual body parts — clinical and slang
  "penis", "vagina", "vulva", "clitoris", "clit", "labia",
  "cock", "dick", "schlong", "dong", "boner",
  "pussy", "snatch", "muff", "quim", "twat",
  "tits", "titties", "boobs", "nipple", "nipples",
  "anus", "rectum", "bunghole", "scrotum", "testicles", "ballsack",
  "semen", "cum", "jizz", "spunk", "cumshot", "creampie",

  // Sexual acts
  "rape", "incest", "gangbang", "threesome", "orgy",
  "masturbate", "masturbation", "masturbating",
  "blowjob", "handjob", "rimjob", "footjob",
  "dildo", "vibrator", "bondage", "bdsm", "hentai",
  "voyeur", "exhibitionist",

  // Adult platforms / behaviours
  "sexting", "onlyfans",

  // CSAM / child exploitation terms
  "pedophile", "paedophile", "jailbait", "pthc", "shota", "nambla",

  // Drugs — illegal substances have no legitimate place in a volunteer listing
  "cocaine", "heroin", "meth", "methamphetamine", "fentanyl",
  "crack", "narcotics", "drugs", "weed", "marijuana",

  // Financial crimes — these words describe criminal acts, not volunteer work
  "laundering",   // money laundering
  "extortion", "extorting",
  "blackmail", "blackmailing",
  "bribery", "bribing",
  "embezzlement", "embezzling",
  "racketeering",
  "trafficking",  // covers human trafficking, drug trafficking
]

// ─── Blocked patterns ─────────────────────────────────────────────────────────
// Used only for terms that need prefix matching (inflected forms), spacing
// variants, or multi-word phrases that can't be caught by whole-word lookup.

const BLOCKED_PATTERNS: RegExp[] = [
  // Profanity prefixes — catches fucking, shitting, retarded, etc.
  /\bfuck/i,
  /\bshit/i,
  /\bretard/i,

  // Slur leet-speak variants
  /\bn+i+g+g+[ae]+r/i,
  /\bf+a+g+g+o+t/i,

  // Sexual act inflections / prefixes
  /\bmasturbat/i,   // masturbate / masturbating / masturbation
  /\bejaculat/i,    // ejaculate / ejaculation
  /\bprostitut/i,   // prostitute / prostitution / prostituting

  // Spaced or hyphenated sexual term variants
  /\bgang\s*bang\b/i,
  /\bonly\s*fans\b/i,
  /\bjail\s*bait\b/i,
  /\bbarely\s+legal\b/i,
  /\bdeep\s*throat\b/i,
  /\bdate\s*rape\b/i,
  /\b(blow|hand|foot|rim|tit|fist|finger)\s*(job|fuck|bang)\b/i,
  /\bgolden\s+shower\b/i,
  /\bsex\s*(cam|work|traffick|offend)\b/i,
  /\b(cam\s*girl|cam\s*whore|cam\s*slut)\b/i,
  /\bloli(ta)?\b/i,

  // CSAM / grooming / exploitation of minors
  /\b(child|teen|minor|underage)\s*(porn|sex|exploit|abuse)\b/i,
  /\b(lure|groom|solicit).{0,30}(minors?|kids?|children|teens?|youth)\b/i,
  /\b(grope|fondle|molest|assault).{0,30}(minors?|kids?|children|teens?|youth)\b/i,

  // Drug activity (catches "selling weed", "buy cocaine", etc.
  // even if the substance name somehow evaded the word list)
  /\b(sell|deal|distribut|buy|purchas).{0,20}(drugs?|narcotics?|weed|marijuana|cocaine|heroin|meth|fentanyl|crack)\b/i,

  // Financial crimes and scams — contextual patterns to avoid blocking
  // legitimate "fraud prevention" or "anti-scam" volunteer programs
  /\bmoney\s+launder/i,
  /\b(scamm?(ing|ed)|swindl(ing|ed)|defraud(ing|ed)|steal(ing)?|rob(bing)?).{0,40}(people|seniors?|elderly|old\s+people|victims?|person|kids?|children|anyone|women|men)\b/i,
  /\bscamm?(ing|er)s?\b/i,   // "scamming", "scammer" — the act itself, not awareness about it
  /\b(steal|rob|mug|burglariz).{0,20}(people|person|seniors?|elderly|kids?|children|homes?|houses?)\b/i,
]

// ─── Ineligible activity patterns ─────────────────────────────────────────────
const INELIGIBLE_PATTERNS: { pattern: RegExp; category: string }[] = [
  {
    pattern: /household chores|housework|doing chores|house chores/i,
    category: "household chores",
  },
  {
    pattern: /babysit(ting)?|nanny|mow.{0,10}lawn|cut.{0,10}grass|grass cutting|lawn mowing|\bjobs?\b/i,
    category: "normally-paid work",
  },
  {
    pattern: /court.?ordered|mandated service|court ordered community service/i,
    category: "court-ordered service",
  },
  {
    pattern: /power tools?|chainsaw|operate.{0,10}vehicle|must drive|driving required/i,
    category: "activities requiring vehicle operation or power tools",
  },
]

// ─── Validation ────────────────────────────────────────────────────────────────
function isBlocked(text: string): boolean {
  for (const word of BLOCKED_WORDS) {
    if (new RegExp(`\\b${word}\\b`, "i").test(text)) return true
  }
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) return true
  }
  return false
}

export function validateOpportunityContent(
  title: string,
  description: string
): ValidationResult {
  const errors: string[] = []

  if (title.length < 20) {
    errors.push("Title must be at least 20 characters.")
  }

  if (description.length < 50) {
    errors.push("Description must be at least 50 characters.")
  }

  const combined = `${title} ${description}`

  if (isBlocked(combined)) {
    errors.push(
      "This opportunity contains inappropriate or harmful content and cannot be submitted."
    )
    return { valid: false, errors }
  }

  for (const { pattern, category } of INELIGIBLE_PATTERNS) {
    if (pattern.test(combined)) {
      errors.push(
        `This activity may not be eligible for community service hours. Matched category: ${category}.`
      )
      break
    }
  }

  return { valid: errors.length === 0, errors }
}
