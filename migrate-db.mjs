import mongoose from 'mongoose';
const CATEGORIES = [
  { id: "tech", subCategories: [{ id: "hackathon" }, { id: "coding-event" }, { id: "tech-meetup" }, { id: "conference" }, { id: "workshop" }] },
  { id: "music", subCategories: [{ id: "concert" }, { id: "festival" }, { id: "live-performance" }, { id: "dj-set" }, { id: "open-mic" }] },
  { id: "sports", subCategories: [{ id: "tournament" }, { id: "match" }, { id: "fitness-class" }, { id: "marathon" }, { id: "esports" }] },
  { id: "art", subCategories: [{ id: "exhibition" }, { id: "cultural-event" }, { id: "creative-workshop" }, { id: "theater" }, { id: "poetry" }] },
  { id: "food", subCategories: [{ id: "food-festival" }, { id: "cooking-class" }, { id: "tasting" }, { id: "pop-up" }, { id: "networking-dinner" }] },
  { id: "business", subCategories: [{ id: "networking" }, { id: "conference" }, { id: "startup-meetup" }, { id: "seminar" }, { id: "trade-show" }] },
  { id: "health", subCategories: [{ id: "yoga" }, { id: "meditation" }, { id: "wellness-workshop" }, { id: "health-seminar" }, { id: "retreat" }] },
  { id: "education", subCategories: [{ id: "workshop" }, { id: "seminar" }, { id: "lecture" }, { id: "class" }, { id: "bootcamp" }] },
  { id: "gaming", subCategories: [{ id: "tournament" }, { id: "esports" }, { id: "convention" }, { id: "lan-party" }, { id: "board-games" }] },
  { id: "networking", subCategories: [{ id: "professional" }, { id: "casual" }, { id: "industry-specific" }, { id: "speed-networking" }, { id: "alumni" }] },
  { id: "outdoor", subCategories: [{ id: "hiking" }, { id: "camping" }, { id: "sports" }, { id: "tour" }, { id: "cleanup" }] },
  { id: "community", subCategories: [{ id: "gathering" }, { id: "volunteering" }, { id: "town-hall" }, { id: "fundraiser" }, { id: "celebration" }] }
];

mongoose.connect('mongodb+srv://medarsatish32_db_user:iYYR8MNEs3G4vNsD@cluster0.tedfev1.mongodb.net/?appName=Cluster0')
  .then(async () => {
    const EventSchema = new mongoose.Schema({}, { strict: false });
    const Event = mongoose.model('Event', EventSchema);
    
    const events = await Event.find({});
    let updatedCount = 0;

    for (const event of events) {
      if (!event.subCategory) {
        const catObj = CATEGORIES.find(c => c.id === event.category);
        if (catObj && catObj.subCategories && catObj.subCategories.length > 0) {
          // Pick a random subcategory
          const randomSub = catObj.subCategories[Math.floor(Math.random() * catObj.subCategories.length)].id;
          await Event.updateOne({ _id: event._id }, { $set: { subCategory: randomSub } });
          updatedCount++;
          console.log(`Updated ${event.title} with subCategory ${randomSub}`);
        }
      }
    }

    console.log(`Successfully migrated ${updatedCount} events!`);
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
