// Event Categories
export const CATEGORIES = [
  {
    id: "tech",
    label: "Technology",
    icon: "💻",
    description: "Tech meetups, hackathons, and developer conferences",
    subCategories: [
      { id: "hackathon", label: "Hackathon" },
      { id: "coding-event", label: "Coding Event" },
      { id: "tech-meetup", label: "Tech Meetup" },
      { id: "conference", label: "Conference" },
      { id: "workshop", label: "Workshop" }
    ]
  },
  {
    id: "music",
    label: "Music",
    icon: "🎵",
    description: "Concerts, festivals, and live performances",
    subCategories: [
      { id: "concert", label: "Concert" },
      { id: "festival", label: "Festival" },
      { id: "live-performance", label: "Live Performance" },
      { id: "dj-set", label: "DJ Set" },
      { id: "open-mic", label: "Open Mic" }
    ]
  },
  {
    id: "sports",
    label: "Sports",
    icon: "⚽",
    description: "Sports events, tournaments, and fitness activities",
    subCategories: [
      { id: "tournament", label: "Tournament" },
      { id: "match", label: "Match / Game" },
      { id: "fitness-class", label: "Fitness Class" },
      { id: "marathon", label: "Marathon / Run" },
      { id: "esports", label: "eSports" }
    ]
  },
  {
    id: "art",
    label: "Art & Culture",
    icon: "🎨",
    description: "Art exhibitions, cultural events, and creative workshops",
    subCategories: [
      { id: "exhibition", label: "Exhibition" },
      { id: "cultural-event", label: "Cultural Event" },
      { id: "creative-workshop", label: "Creative Workshop" },
      { id: "theater", label: "Theater / Play" },
      { id: "poetry", label: "Poetry / Spoken Word" }
    ]
  },
  {
    id: "food",
    label: "Food & Drink",
    icon: "🍕",
    description: "Food festivals, cooking classes, and culinary experiences",
    subCategories: [
      { id: "food-festival", label: "Food Festival" },
      { id: "cooking-class", label: "Cooking Class" },
      { id: "tasting", label: "Tasting Event" },
      { id: "pop-up", label: "Pop-up Restaurant" },
      { id: "networking-dinner", label: "Networking Dinner" }
    ]
  },
  {
    id: "business",
    label: "Business",
    icon: "💼",
    description: "Networking events, conferences, and startup meetups",
    subCategories: [
      { id: "networking", label: "Networking" },
      { id: "conference", label: "Conference" },
      { id: "startup-meetup", label: "Startup Meetup" },
      { id: "seminar", label: "Seminar" },
      { id: "trade-show", label: "Trade Show" }
    ]
  },
  {
    id: "health",
    label: "Health & Wellness",
    icon: "🧘",
    description: "Yoga, meditation, wellness workshops, and health seminars",
    subCategories: [
      { id: "yoga", label: "Yoga" },
      { id: "meditation", label: "Meditation" },
      { id: "wellness-workshop", label: "Wellness Workshop" },
      { id: "health-seminar", label: "Health Seminar" },
      { id: "retreat", label: "Retreat" }
    ]
  },
  {
    id: "education",
    label: "Education",
    icon: "📚",
    description: "Workshops, seminars, and learning experiences",
    subCategories: [
      { id: "workshop", label: "Workshop" },
      { id: "seminar", label: "Seminar" },
      { id: "lecture", label: "Lecture" },
      { id: "class", label: "Class / Course" },
      { id: "bootcamp", label: "Bootcamp" }
    ]
  },
  {
    id: "gaming",
    label: "Gaming",
    icon: "🎮",
    description: "Gaming tournaments, esports, and gaming conventions",
    subCategories: [
      { id: "tournament", label: "Tournament" },
      { id: "esports", label: "eSports" },
      { id: "convention", label: "Convention" },
      { id: "lan-party", label: "LAN Party" },
      { id: "board-games", label: "Board Games" }
    ]
  },
  {
    id: "networking",
    label: "Networking",
    icon: "🤝",
    description: "Professional networking and community building events",
    subCategories: [
      { id: "professional", label: "Professional Mixer" },
      { id: "casual", label: "Casual Meetup" },
      { id: "industry-specific", label: "Industry Specific" },
      { id: "speed-networking", label: "Speed Networking" },
      { id: "alumni", label: "Alumni Gathering" }
    ]
  },
  {
    id: "outdoor",
    label: "Outdoor & Adventure",
    icon: "🏕️",
    description: "Hiking, camping, and outdoor activities",
    subCategories: [
      { id: "hiking", label: "Hiking" },
      { id: "camping", label: "Camping" },
      { id: "sports", label: "Outdoor Sports" },
      { id: "tour", label: "Guided Tour" },
      { id: "cleanup", label: "Community Cleanup" }
    ]
  },
  {
    id: "community",
    label: "Community",
    icon: "👥",
    description: "Local community gatherings and social events",
    subCategories: [
      { id: "gathering", label: "Gathering" },
      { id: "volunteering", label: "Volunteering" },
      { id: "town-hall", label: "Town Hall" },
      { id: "fundraiser", label: "Fundraiser" },
      { id: "celebration", label: "Celebration" }
    ]
  },
];

// Get category by ID
export const getCategoryById = (id) => {
  return CATEGORIES.find((cat) => cat.id === id);
};

// Get category label by ID
export const getCategoryLabel = (id) => {
  const category = getCategoryById(id);
  return category ? category.label : id;
};

// Get category icon by ID
export const getCategoryIcon = (id) => {
  const category = getCategoryById(id);
  return category ? category.icon : "📅";
};

// Get subcategory label by category ID and subcategory ID
export const getSubCategoryLabel = (categoryId, subCategoryId) => {
  if (!subCategoryId) return null;
  const category = getCategoryById(categoryId);
  if (!category || !category.subCategories) return subCategoryId;
  
  const subCat = category.subCategories.find(s => s.id === subCategoryId);
  return subCat ? subCat.label : subCategoryId;
};
