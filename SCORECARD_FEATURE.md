# Scorecard Feature Documentation

## Overview

The Scorecard feature allows event hosts to create and manage performance scorecards for their events. Hosts can define custom scoring categories, add participants, and track their scores with real-time ranking.

## Key Features

### 1. **Create Scorecards**

- Event hosts can create multiple scorecards per event
- Define custom scoring categories with maximum scores
- Add descriptions for clarity
- Save scorecards in draft mode before finalizing

### 2. **Manage Participants**

- Add participants with names and emails
- Track individual scores for each category
- Automatic total score calculation
- Real-time ranking based on total scores

### 3. **Score Management**

- Edit participant scores at any time
- Add notes for individual scores
- Automatic rank recalculation when scores change
- Support for decimal scores

### 4. **Leaderboard Display**

- View all participants ranked by total score
- See individual category scores
- Identify top performers
- Export data for records

## How to Use

### Creating a Scorecard

1. Go to **My Events** → Select your event
2. Click on the **Scorecards** tab
3. Click **Create Scorecard** button
4. Fill in the scorecard details:
   - **Title**: Name your scorecard (e.g., "Best Team Performance", "Innovation Award")
   - **Description**: Explain the purpose (optional)
   - **Categories**: Define scoring criteria
     - Category Name (e.g., "Innovation", "Teamwork", "Presentation")
     - Max Score (e.g., 100)
     - Description (optional)
5. Click **Create Scorecard**

### Managing Participants and Scores

1. Click on a scorecard from the list
2. The leaderboard view shows all participants
3. To add a participant or edit scores:
   - Click the **Edit** button (pencil icon) next to a participant
   - Enter scores for each category
   - Click **Save** to update

### Viewing the Leaderboard

The leaderboard automatically displays:

- **Rank**: Position based on total score
- **Name & Email**: Participant information
- **Individual Scores**: Score for each category
- **Total Score**: Sum of all category scores

Participants are automatically ranked with #1 being the highest scorer.

### Deleting a Scorecard

1. Open the scorecard you want to delete
2. Click the **Delete** button
3. Confirm the deletion

## Database Schema

### Scorecard Model

```javascript
{
  eventId: ObjectId,              // Reference to event
  organizerId: ObjectId,          // Reference to organizer
  title: String,                  // Scorecard title
  description: String,            // Optional description
  categories: [                   // Scoring categories
    {
      name: String,
      maxScore: Number,
      description: String
    }
  ],
  participants: [                 // Participant data
    {
      participantId: ObjectId,    // Optional user reference
      name: String,
      email: String,
      scores: [                   // Individual category scores
        {
          categoryName: String,
          score: Number,
          notes: String
        }
      ],
      totalScore: Number,         // Calculated total
      rank: Number                // Calculated rank
    }
  ],
  status: String,                 // 'draft', 'active', 'completed'
  isPublic: Boolean,              // Public visibility
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Create Scorecard

```
POST /api/scorecards
```

**Body:**

```json
{
  "eventId": "event_id",
  "title": "Scorecard Title",
  "description": "Description",
  "categories": [
    { "name": "Category 1", "maxScore": 100, "description": "..." }
  ]
}
```

### Get Event Scorecards

```
GET /api/scorecards?eventId=event_id
```

### Get Specific Scorecard

```
GET /api/scorecards/{id}
```

### Update Scorecard

```
PUT /api/scorecards/{id}
```

### Delete Scorecard

```
DELETE /api/scorecards/{id}
```

### Update Participant Scores

```
POST /api/scorecards/{id}/participants
```

**Body:**

```json
{
  "participantIndex": 0,
  "scores": [
    { "categoryName": "Category 1", "score": 85 },
    { "categoryName": "Category 2", "score": 90 }
  ]
}
```

### Add Participant

```
PUT /api/scorecards/{id}/participants
```

**Body:**

```json
{
  "participantName": "John Doe",
  "participantEmail": "john@example.com",
  "scores": [{ "categoryName": "Category 1", "score": 85 }]
}
```

## Use Cases

1. **Competitions**: Track scores for talent shows, hackathons, or competitions
2. **Team Evaluation**: Assess team performance across multiple criteria
3. **Awards**: Determine winners for various award categories
4. **Scoring Events**: Any event where you need to evaluate participants
5. **Judging**: Manage judge scores in a structured format

## Best Practices

1. **Plan Categories**: Define clear, measurable criteria before creating the scorecard
2. **Set Realistic Scores**: Choose max scores that make sense for your evaluation
3. **Regular Updates**: Update scores during or immediately after the event
4. **Clear Names**: Use descriptive names for categories that participants understand
5. **Backup Data**: Export or document scores regularly for records

## Technical Details

- **Real-time Updates**: Scores are updated immediately in the database
- **Auto-ranking**: Rankings are automatically recalculated when scores change
- **Security**: Only event organizers can create and modify scorecards
- **Scalability**: Supports unlimited participants and scoring categories
- **Data Persistence**: All data is stored in MongoDB

## Troubleshooting

**Issue: Scorecard won't create**

- Check that all required fields are filled
- Ensure the event ID is valid
- Verify you're logged in as the event organizer

**Issue: Scores not updating**

- Refresh the page to sync data
- Check browser console for errors
- Verify scores are within max score limits

**Issue: Rankings not correct**

- Scores are recalculated automatically; refresh to see updated rankings
- Verify all participant scores are entered correctly

## Future Enhancements

- Public leaderboard sharing
- Export scorecards as PDFs
- Multiple judges/scorers
- Weighted scoring categories
- Scorecard templates
- Tiebreaker rules
- Score appeals/review process
