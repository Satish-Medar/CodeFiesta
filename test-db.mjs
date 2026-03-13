import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://medarsatish32_db_user:iYYR8MNEs3G4vNsD@cluster0.tedfev1.mongodb.net/?appName=Cluster0')
  .then(async () => {
    const EventSchema = new mongoose.Schema({}, { strict: false });
    const Event = mongoose.model('Event', EventSchema);
    const events = await Event.find({ subCategory: { $exists: true, $ne: null } }, 'title category subCategory').sort({createdAt: -1}).limit(10);
    console.log(JSON.stringify(events, null, 2));
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
