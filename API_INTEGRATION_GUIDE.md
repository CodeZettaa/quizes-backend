# Quiz Attempts API Integration Guide

## Overview
This guide explains the new API endpoints for tracking and reviewing quiz attempts. Users can now:
- See which quizzes they've already taken (marked in dashboard)
- View all their quiz attempts
- Review specific quiz attempts with their answers

---

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## New Endpoints

### 1. Get All Quiz Attempts (User's History)
**Endpoint:** `GET /quizzes/attempts/my`

**Description:** Retrieves all quiz attempts for the authenticated user, sorted by most recent first.

**Response:**
```json
[
  {
    "_id": "attempt-id-123",
    "quiz": {
      "_id": "quiz-id-456",
      "title": "JavaScript Basics",
      "subject": {
        "_id": "subject-id-789",
        "name": "JavaScript"
      },
      "level": "beginner"
    },
    "score": 8,
    "totalQuestions": 10,
    "correctAnswersCount": 8,
    "pointsEarned": 80,
    "startedAt": "2025-12-24T23:00:00.000Z",
    "finishedAt": "2025-12-24T23:15:00.000Z"
  },
  // ... more attempts
]
```

**Example Usage:**
```javascript
const response = await fetch('/quizzes/attempts/my', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const attempts = await response.json();
```

---

### 2. Get Specific Quiz Attempt (Review Mode)
**Endpoint:** `GET /quizzes/attempts/:attemptId`

**Description:** Retrieves a specific quiz attempt with full details including questions, options, and user's selected answers. Perfect for review/result screens.

**Parameters:**
- `attemptId` (path parameter): The ID of the quiz attempt

**Response:**
```json
{
  "_id": "attempt-id-123",
  "quiz": {
    "_id": "quiz-id-456",
    "title": "JavaScript Basics",
    "subject": {
      "_id": "subject-id-789",
      "name": "JavaScript"
    },
    "level": "beginner"
  },
  "score": 8,
  "totalQuestions": 10,
  "correctAnswersCount": 8,
  "pointsEarned": 80,
  "startedAt": "2025-12-24T23:00:00.000Z",
  "finishedAt": "2025-12-24T23:15:00.000Z",
  "questions": [
    {
      "_id": "question-id-1",
      "text": "What is a variable?",
      "type": "mcq",
      "options": [
        {
          "_id": "option-id-1",
          "text": "A container for storing data",
          "isCorrect": true
        },
        {
          "_id": "option-id-2",
          "text": "A function",
          "isCorrect": false
        },
        // ... more options
      ],
      "userAnswer": {
        "selectedOptionId": "option-id-1",
        "isCorrect": true
      }
    },
    // ... more questions
  ]
}
```

**Example Usage:**
```javascript
const attemptId = 'attempt-id-123';
const response = await fetch(`/quizzes/attempts/${attemptId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const attempt = await response.json();

// Display quiz review
attempt.questions.forEach(question => {
  const userAnswer = question.userAnswer;
  if (userAnswer) {
    console.log(`Selected: ${userAnswer.selectedOptionId}, Correct: ${userAnswer.isCorrect}`);
  }
});
```

---

## Updated Endpoints

### 3. Get All Quizzes (Updated)
**Endpoint:** `GET /quizzes`

**Description:** Now includes a `hasTaken` flag for each quiz when user is authenticated.

**Query Parameters:**
- `subjectId` (optional): Filter by subject
- `level` (optional): Filter by level (beginner, middle, intermediate)

**Response:**
```json
[
  {
    "_id": "quiz-id-1",
    "title": "JavaScript Basics",
    "level": "beginner",
    "subject": {
      "_id": "subject-id-1",
      "name": "JavaScript"
    },
    "questions": [...],
    "hasTaken": true,  // ← NEW: Indicates if user has taken this quiz
    "createdAt": "2025-12-20T10:00:00.000Z"
  },
  {
    "_id": "quiz-id-2",
    "title": "Advanced React",
    "level": "intermediate",
    "subject": {
      "_id": "subject-id-2",
      "name": "React"
    },
    "questions": [...],
    "hasTaken": false,  // ← NEW: User hasn't taken this quiz yet
    "createdAt": "2025-12-21T10:00:00.000Z"
  }
]
```

**Note:** The `hasTaken` field is only included when the user is authenticated. If no token is provided, the field won't be present.

**Example Usage:**
```javascript
// Get all quizzes with hasTaken status
const response = await fetch('/quizzes', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const quizzes = await response.json();

// Filter or style based on hasTaken
quizzes.forEach(quiz => {
  if (quiz.hasTaken) {
    // Show "Completed" badge or disable retake button
    console.log(`${quiz.title} - Already taken`);
  } else {
    // Show as available
    console.log(`${quiz.title} - Available`);
  }
});
```

---

## Frontend Integration Examples

### Example 1: Dashboard with Quiz Status
```javascript
// Fetch quizzes for dashboard
const fetchQuizzes = async () => {
  const response = await fetch('/quizzes?level=beginner', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const quizzes = await response.json();
  
  return quizzes.map(quiz => ({
    ...quiz,
    status: quiz.hasTaken ? 'completed' : 'available',
    badge: quiz.hasTaken ? '✓ Completed' : 'New'
  }));
};
```

### Example 2: Quiz History Page
```javascript
// Fetch user's quiz attempts
const fetchQuizHistory = async () => {
  const response = await fetch('/quizzes/attempts/my', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const attempts = await response.json();
  
  return attempts.map(attempt => ({
    id: attempt._id,
    quizTitle: attempt.quiz.title,
    subject: attempt.quiz.subject?.name,
    score: `${attempt.correctAnswersCount}/${attempt.totalQuestions}`,
    percentage: Math.round((attempt.correctAnswersCount / attempt.totalQuestions) * 100),
    points: attempt.pointsEarned,
    date: new Date(attempt.finishedAt).toLocaleDateString(),
    // Navigate to review page
    reviewUrl: `/quizzes/attempts/${attempt._id}/review`
  }));
};
```

### Example 3: Quiz Review/Results Page
```javascript
// Fetch specific attempt for review
const fetchQuizReview = async (attemptId) => {
  const response = await fetch(`/quizzes/attempts/${attemptId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const attempt = await response.json();
  
  return {
    quizTitle: attempt.quiz.title,
    score: `${attempt.correctAnswersCount}/${attempt.totalQuestions}`,
    percentage: Math.round((attempt.correctAnswersCount / attempt.totalQuestions) * 100),
    points: attempt.pointsEarned,
    questions: attempt.questions.map(q => ({
      id: q._id,
      text: q.text,
      options: q.options.map(opt => ({
        id: opt._id,
        text: opt.text,
        isCorrect: opt.isCorrect,
        isSelected: opt._id === q.userAnswer?.selectedOptionId
      })),
      userAnswer: q.userAnswer,
      isCorrect: q.userAnswer?.isCorrect || false
    }))
  };
};
```

### Example 4: TypeScript Interfaces (Recommended)
```typescript
// types/quiz.ts

export interface QuizAttempt {
  _id: string;
  quiz: {
    _id: string;
    title: string;
    subject: {
      _id: string;
      name: string;
    } | null;
    level: string;
  };
  score: number;
  totalQuestions: number;
  correctAnswersCount: number;
  pointsEarned: number;
  startedAt: string;
  finishedAt: string;
}

export interface QuizAttemptDetail extends QuizAttempt {
  questions: Array<{
    _id: string;
    text: string;
    type: string;
    options: Array<{
      _id: string;
      text: string;
      isCorrect: boolean;
    }>;
    userAnswer: {
      selectedOptionId: string;
      isCorrect: boolean;
    } | null;
  }>;
}

export interface Quiz {
  _id: string;
  title: string;
  level: string;
  subject: {
    _id: string;
    name: string;
  };
  questions: any[];
  hasTaken?: boolean; // Optional - only present when authenticated
  createdAt: string;
}
```

---

## UI/UX Recommendations

### Dashboard
- Show a badge/indicator (e.g., "✓ Completed" or checkmark icon) for quizzes with `hasTaken: true`
- Consider different styling:
  - Completed quizzes: Grayed out or with a checkmark badge
  - Available quizzes: Normal styling with "Start Quiz" button
- You might want to show "Retake Quiz" button for completed quizzes

### Quiz History Page
- Display attempts in a list or card format
- Show key metrics: Score, Date, Points earned
- Add a "Review" button that navigates to the detailed review page
- Sort by most recent first (already handled by backend)

### Quiz Review Page
- Display each question with:
  - User's selected answer (highlighted)
  - Correct answer (if different from user's)
  - Visual indicators (green for correct, red for incorrect)
- Show overall score and points at the top
- Consider showing explanations if available in the future

---

## Error Handling

All endpoints return standard HTTP status codes:
- `200 OK`: Success
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Quiz or attempt not found
- `500 Internal Server Error`: Server error

Example error handling:
```javascript
try {
  const response = await fetch('/quizzes/attempts/my', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
      router.push('/login');
    } else if (response.status === 404) {
      // Show "No attempts found" message
      return [];
    }
    throw new Error('Failed to fetch attempts');
  }
  
  return await response.json();
} catch (error) {
  console.error('Error fetching quiz attempts:', error);
  // Handle error in UI
}
```

---

## Testing Checklist

- [ ] Dashboard shows `hasTaken` status correctly
- [ ] Quiz history page displays all user attempts
- [ ] Review page shows correct answers and user selections
- [ ] Authentication is properly handled
- [ ] Error states are handled gracefully
- [ ] Loading states are shown during API calls

---

## Questions or Issues?

If you encounter any issues or need clarification, please contact the backend team.

