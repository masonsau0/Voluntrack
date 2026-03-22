/**
 * purge-flagged-opportunities.mjs
 *
 * Scans every document in the "opportunities" Firestore collection and deletes
 * any whose title or description would be rejected by the current content filter.
 *
 * Run:
 *   node scripts/purge-flagged-opportunities.mjs
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY in .env.local (loaded automatically).
 */

import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// ─── Load .env.local ──────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, "../.env.local")
try {
  const envFile = readFileSync(envPath, "utf8")
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "")
    if (!(key in process.env)) process.env[key] = val
  }
} catch {
  console.error("Could not read .env.local — make sure it exists.")
  process.exit(1)
}

// ─── Firebase Admin ───────────────────────────────────────────────────────────
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
if (!serviceAccountKey) {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env.local")
  process.exit(1)
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(JSON.parse(serviceAccountKey)) })
}
const db = getFirestore()

// ─── Content filter (mirrors lib/opportunityValidation.ts) ───────────────────
const BLOCKED_WORDS = [
  // Profanity
  "fuck", "shit", "cunt", "bitch", "bastard", "asshole", "dickhead", "motherfucker",
  // Racial / ethnic / identity slurs
  "nigger", "nigga", "faggot", "chink", "spic", "kike", "gook", "wetback", "tranny",
  // Sexual
  "sex", "porn", "porno", "pornography",
  "nude", "nudes", "naked", "nudity",
  "erotic", "intercourse", "orgasm", "fetish",
  // Body parts
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
  // Adult platforms
  "sexting", "onlyfans",
  // CSAM
  "pedophile", "paedophile", "jailbait", "pthc", "shota", "nambla",
  // Drugs
  "cocaine", "heroin", "meth", "methamphetamine", "fentanyl",
  "crack", "narcotics", "drugs", "weed", "marijuana",
]

const BLOCKED_PATTERNS = [
  /\bfuck/i,
  /\bshit/i,
  /\bretard/i,
  /\bn+i+g+g+[ae]+r/i,
  /\bf+a+g+g+o+t/i,
  /\bmasturbat/i,
  /\bejaculat/i,
  /\bprostitut/i,
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
  /\b(child|teen|minor|underage)\s*(porn|sex|exploit|abuse)\b/i,
  /\b(lure|groom|solicit).{0,30}(minors?|kids?|children|teens?|youth)\b/i,
  /\b(grope|fondle|molest|assault).{0,30}(minors?|kids?|children|teens?|youth)\b/i,
  /\b(sell|deal|distribut|buy|purchas).{0,20}(drugs?|narcotics?|weed|marijuana|cocaine|heroin|meth|fentanyl|crack)\b/i,
]

function isBlocked(text) {
  for (const word of BLOCKED_WORDS) {
    if (new RegExp(`\\b${word}\\b`, "i").test(text)) return { blocked: true, reason: `blocked word: "${word}"` }
  }
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) return { blocked: true, reason: `pattern: ${pattern}` }
  }
  return { blocked: false }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching all opportunities from Firestore…\n")

  const snapshot = await db.collection("opportunities").get()
  console.log(`Found ${snapshot.size} opportunities.\n`)

  const toDelete = []

  for (const doc of snapshot.docs) {
    const data = doc.data()
    const title = data.title ?? ""
    const description = data.description ?? ""
    const combined = `${title} ${description}`
    const result = isBlocked(combined)

    if (result.blocked) {
      toDelete.push({ id: doc.id, title, reason: result.reason })
    }
  }

  if (toDelete.length === 0) {
    console.log("✓ No flagged opportunities found. Database is clean.")
    return
  }

  console.log(`Found ${toDelete.length} flagged opportunity/opportunities:\n`)
  for (const item of toDelete) {
    console.log(`  [${item.id}] "${item.title}"`)
    console.log(`    Reason: ${item.reason}\n`)
  }

  // Delete
  const batch = db.batch()
  for (const item of toDelete) {
    batch.delete(db.collection("opportunities").doc(item.id))
  }
  await batch.commit()

  console.log(`\n✓ Deleted ${toDelete.length} flagged opportunity/opportunities.`)
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
