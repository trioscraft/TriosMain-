const fs = require("fs")
const path = require("path")

const REVIEWS_FILE = path.join(process.cwd(), "data", "reviews.json")

function ensureFile() {
  const dir = path.dirname(REVIEWS_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(REVIEWS_FILE)) {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify([]))
  }
}

function readReviews() {
  ensureFile()
  const raw = fs.readFileSync(REVIEWS_FILE, "utf-8")
  try {
    return JSON.parse(raw)
  } catch (e) {
    return []
  }
}

function writeReviews(reviews) {
  ensureFile()
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8")
}

function addReview(review) {
  const reviews = readReviews()
  // New reviews are public by default so they appear on the site right away.
  // Set approved: false (or re-order logic) to enable moderation later.
  const newReview = {
    id: Date.now().toString(),
    name: review.name,
    company: review.company,
    rating: Number(review.rating) || 5,
    comment: review.comment,
    approved: true,
    createdAt: new Date().toISOString(),
  }
  reviews.unshift(newReview)
  writeReviews(reviews)
  return newReview
}

function getApprovedReviews() {
  return readReviews().filter((r) => r.approved === true)
}

module.exports = {
  readReviews,
  writeReviews,
  addReview,
  getApprovedReviews,
  REVIEWS_FILE,
}
