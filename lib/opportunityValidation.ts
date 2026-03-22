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
  // Sexual content — no legitimate use in a volunteer listing
  /\bporn(ography)?\b/i,
  /\bsex(ual)?\s+(act|service|content|favor|encounter|contact)\b/i,
  /\b(nude|naked|nudity)\b/i,
  /\b(prostitut|escort\s+service|sex\s+work)\b/i,
  /\b(grope|fondle|molest|assault).{0,30}(minors?|kids?|children|teens?|students?|youth)\b/i,
  /\bchild\s*(porn|sex|exploit|abuse|lure|groom)\b/i,
  /\b(lure|groom|solicit).{0,30}(minors?|kids?|children|teens?|youth)\b/i,
  /\bsend\s*(me\s*)?(nude|pic|photo|image)s?\b/i,
  /\bonly\s*fans\b/i,
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
