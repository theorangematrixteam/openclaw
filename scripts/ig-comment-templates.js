// Updated Comment Templates — "Creative Visual" instead of "Reel"
// All platforms: Instagram, Twitter, LinkedIn

const templates = {
  // Clothing brands
  clothing: [
    "The quality here is next level. {brand} is doing something special — we'd love to create a creative visual for you. Reach out if interested.",
    "This drop is fire 🔥 Love the direction you're taking. Would love to make a creative visual for {brand} — DM us if you're open to it.",
    "The details on this are insane. {brand} is doing something real here. Would love to shoot some content for you — reach out if interested.",
    "Been following {brand} for a while — the quality keeps getting better. We'd love to make a free creative visual to show what we can do. DM us.",
    "This piece deserves way more eyes on it. {brand} has serious potential — we'd love to help shoot some content. Reach out if you're open.",
    "Love the aesthetic {brand} is building. We'd love to create a creative visual for you — no strings, just want to show our work. DM if interested."
  ],
  
  // Jewelry brands
  jewelry: [
    "These pieces are stunning ✨ {brand} deserves a bigger audience. We'd love to shoot some content for you — DM us if you're open to it.",
    "The craftsmanship here is unreal. {brand} is building something special — we'd love to make a creative visual to show it off. Reach out if interested.",
    "Been eyeing {brand} for a while — the designs keep getting better. We'd love to create a free creative visual. DM us if you want to see what we can do.",
    "This piece deserves to be seen by more people. {brand} has serious potential — we'd love to help with content. DM if interested.",
    "Love the minimal vibe {brand} is going for. We'd love to shoot some content for you — no cost, just want to show our work. Reach out if open."
  ],
  
  // Candles/perfume
  product: [
    "The vibe of this is perfect 🔥 {brand} deserves way more attention. We'd love to create some content for you — DM us if you're open.",
    "This looks incredible. {brand} is building something real — we'd love to make a creative visual to show what we can do. Reach out if interested.",
    "Love the aesthetic {brand} is creating. We'd love to shoot some content for you — free creative visual, no strings. DM if interested.",
    "This deserves to be in way more feeds. {brand} has serious potential — we'd love to help with content. DM us if you're open.",
    "The quality here is next level. {brand} is doing something special — we'd love to create a creative visual for you. Reach out if interested."
  ],
  
  // Ethnic wear
  ethnic: [
    "This collection is beautiful 🙏 {brand} deserves a bigger audience. We'd love to shoot some content — DM us if you're open.",
    "The craft here is unreal. {brand} is preserving something important — we'd love to help tell that story. Reach out if interested.",
    "Love what {brand} is doing with traditional craft. We'd love to create a free creative visual — DM us if you want to see our work.",
    "This deserves way more eyes on it. {brand} has serious potential — we'd love to help with content. DM if interested.",
    "The detail work here is stunning. {brand} is building something real — we'd love to shoot some content for you. Reach out if open."
  ]
};

// Twitter templates (shorter, punchier)
const twitterTemplates = {
  clothing: [
    "Your drops are fire 🔥 @{handle} — we'd love to create a creative visual for you. DM us?",
    "This piece deserves more eyes @{handle}. We'd love to help with content. Reach out?",
    "Love the direction @{handle} is taking. We'd love to make a creative visual — DM if interested."
  ],
  jewelry: [
    "These pieces are stunning ✨ @{handle} — we'd love to create a creative visual for you. DM us?",
    "The craftsmanship here is unreal @{handle}. We'd love to help with content. Reach out?"
  ],
  product: [
    "The vibe of this is perfect 🔥 @{handle} — we'd love to create a creative visual for you. DM us?",
    "This looks incredible @{handle}. We'd love to help with content. Reach out?"
  ],
  ethnic: [
    "This collection is beautiful 🙏 @{handle} — we'd love to create a creative visual for you. DM us?",
    "The craft here is unreal @{handle}. We'd love to help with content. Reach out?"
  ]
};

// LinkedIn templates (professional)
const linkedinTemplates = {
  clothing: [
    "Great to see brands like {brand} pushing boundaries in the D2C space. Would love to discuss how we can help elevate your content with a creative visual.",
    "Impressive work {brand}. We'd love to explore a content partnership — feel free to connect."
  ],
  jewelry: [
    "Beautiful craftsmanship {brand}. We'd love to create a creative visual to showcase your pieces. Let's connect.",
    "Love the minimal aesthetic {brand} is building. Would love to discuss a content collaboration."
  ],
  product: [
    "Great product positioning {brand}. We'd love to create a creative visual to help tell your story. Let's connect.",
    "Impressive brand {brand}. Would love to explore how we can help with content strategy."
  ],
  ethnic: [
    "Wonderful to see {brand} preserving traditional craft. We'd love to create a creative visual to share your story. Let's connect.",
    "Beautiful collection {brand}. Would love to discuss a content partnership."
  ]
};

function getComment(brand, category, platform = 'instagram', firstName = '') {
  let type = 'product';
  if (category.includes('Clothing') || category.includes('Streetwear')) type = 'clothing';
  else if (category.includes('Jewelry')) type = 'jewelry';
  else if (category.includes('Ethnic')) type = 'ethnic';
  
  let options;
  if (platform === 'twitter') {
    options = twitterTemplates[type];
    const template = options[Math.floor(Math.random() * options.length)];
    return template.replace(/{brand}/g, brand).replace(/{handle}/g, brand.toLowerCase().replace(/\s/g, ''));
  } else if (platform === 'linkedin') {
    options = linkedinTemplates[type];
  } else {
    options = templates[type];
  }
  
  const template = options[Math.floor(Math.random() * options.length)];
  let comment = template.replace(/{brand}/g, brand);
  
  // Add first name to IG comments if available (for DMs or personalized posts)
  if (firstName && platform === 'instagram') {
    comment = `${firstName}, ${comment.charAt(0).toLowerCase()}${comment.slice(1)}`;
  }
  
  return comment;
}

module.exports = { getComment, templates, twitterTemplates, linkedinTemplates };

// If run directly, show examples
if (require.main === module) {
  console.log('Updated Comment Templates\n');
  console.log('Instagram:', getComment('BITCHN', 'Clothing:Streetwear', 'instagram'));
  console.log('\nTwitter:', getComment('BITCHN', 'Clothing:Streetwear', 'twitter'));
  console.log('\nLinkedIn:', getComment('BITCHN', 'Clothing:Streetwear', 'linkedin'));
}
