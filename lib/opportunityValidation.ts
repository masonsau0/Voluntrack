export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// Conservative safety patterns — only terms with no legitimate use in a volunteer listing.
// The LLM layer handles nuanced cases; this catches obvious submissions instantly.
// Patterns use prefix matching (no trailing boundary) to catch inflected forms.
const SAFETY_PATTERNS: RegExp[] = [
  /\bfuck/i,
  /\bshit/i,
  /\bn+i+g+g+[ae]+r/i,
  /\bf+a+g+g+o+t/i,
  /\bcunt\b/i,
  /\bchink\b/i,
  /\bspic\b/i,
  /\bkike\b/i,
  /\bretard/i,
  /\b(kill|rape|molest).{0,20}(volunteer|kids?|children|students?)\b/i,
  /\b(sell|selling|deal|dealing|distribut).{0,15}(drugs?|narcotics?|weed|marijuana|meth|cocaine|heroin|fentanyl|crack|opioids?)\b/i,
  /\b(buy|buying|purchas).{0,15}(drugs?|narcotics?|weed|meth|cocaine|heroin|fentanyl)\b/i,

  // Sexual acts and solicitation phrases
  /\bhave\s+sex\b/i,
  /\b(let'?s|wanna|want\s+to|gonna|going\s+to|would\s+you)\s+(have|do|get|make)\s+sex\b/i,
  /\b(blow\s*job|hand\s*job|foot\s*job|rim\s*job|tit\s*fuck|fist\s*fuck|finger\s*fuck|finger\s*bang)\b/i,
  /\b(cunnilingus|fellatio|anilingus|felch|feltch|deepthroat|deep\s+throat)\b/i,
  /\b(gang\s*bang|threesome|orgy|menage\s+a\s+trois)\b/i,
  /\bmasturbat/i,
  /\b(jack\s+off|jerk\s+off|jerk\s*ing\s+off)\b/i,
  /\b(doggystyle|doggy\s+style|reverse\s+cowgirl)\b/i,
  /\b(rimming|tea\s*bagging|scissoring|frotting|dry\s*hump)\b/i,
  /\b(golden\s+shower|watersport\s+fetish|urophilia)\b/i,
  /\b(bdsm|bondage|dominatrix|femdom|sadism)\b/i,
  /\b(dildo|vibrator|strap\s*on|ball\s+gag)\b/i,
  /\b(hentai|ecchi|futanari|zoophilia|bestiality|beastiality)\b/i,
  /\b(incest|date\s+rape)\b/i,

  // Sexual body parts (slang) — zero legitimate use in a volunteer listing
  /\b(cock|dick|schlong|dong|boner)\b/i,
  /\b(pussy|vagina|vulva|clitoris|clit|snatch|muff|quim|poontang|poon)\b/i,
  /\b(tits|titties|boobs|nipples?|areola)\b/i,
  /\b(cum|jizz|spunk|semen|ejaculat|cumshot|creampie|skeet|splooge)\b/i,
  /\borgasm\b/i,
  /\b(erotic|intercourse|coitus)\b/i,
  /\b(anus|rectum|bunghole|cornhole)\b/i,
  /\b(scrotum|testicles?|pubes|pubic\s+hair)\b/i,

  // Nudity and pornographic content
  /\bporn(ography|o)?\b/i,
  /\b(nude|naked|nudity)\b/i,
  /\b(prostitut|escort\s+service|sex\s+work|sex\s+traffick)\b/i,
  /\b(sex\s*cam|cam\s*girl|cam\s*whore|cam\s*slut|only\s*fans|sexting)\b/i,

  // Solicitation and grooming
  /\bsend\s+(me\s+)?(nudes?|naked|sexy\s+pics?|pics?\s+of\s+you)\b/i,
  /\b(show|take\s+off|remove)\s+(your|ur)\s+(clothes?|shirt|pants|underwear|top|bra)\b/i,
  /\b(grope|fondle|molest|assault).{0,30}(minors?|kids?|children|teens?|students?|youth)\b/i,
  /\b(lure|groom|solicit).{0,30}(minors?|kids?|children|teens?|youth)\b/i,
  /\bchild\s*(porn|sex|exploit|abuse|lure|groom)\b/i,

  // CSAM terms
  /\b(jailbait|jail\s+bait|barely\s+legal|underage\s+sex|teen\s+porn)\b/i,
  /\b(pthc|shota|loli(ta)?|nambla|pedobear|pedophile|paedophile)\b/i,
]

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

  const combined = `${title} ${description}`.toLowerCase()

  for (const pattern of SAFETY_PATTERNS) {
    if (pattern.test(combined)) {
      errors.push(
        "This opportunity contains inappropriate or harmful content and cannot be submitted."
      )
      return { valid: false, errors }
    }
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
