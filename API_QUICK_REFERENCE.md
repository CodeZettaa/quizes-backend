# Quiz Attempts API - Quick Reference

## New Endpoints

### 1. Get User's Quiz Attempts
```
GET /quizzes/attempts/my
Authorization: Bearer <token>
```
Returns: Array of all user's quiz attempts

### 2. Get Specific Quiz Attempt (Review)
```
GET /quizzes/attempts/:attemptId
Authorization: Bearer <token>
```
Returns: Full quiz attempt with questions, options, and user answers

## Updated Endpoint

### 3. Get All Quizzes (Now includes `hasTaken` flag)
```
GET /quizzes
Authorization: Bearer <token>  // Optional but recommended for hasTaken flag
```
Returns: Array of quizzes, each with `hasTaken: true/false` (when authenticated)

## Key Response Fields

**Quiz Attempt:**
- `_id`, `quiz`, `score`, `totalQuestions`, `correctAnswersCount`, `pointsEarned`
- `startedAt`, `finishedAt`

**Quiz Attempt Detail (Review):**
- All above fields +
- `questions[]` with `userAnswer: { selectedOptionId, isCorrect }`

**Quiz (in list):**
- All existing fields +
- `hasTaken?: boolean` (only when authenticated)

## Quick Integration

```javascript
// 1. Dashboard - Show hasTaken status
const quizzes = await fetch('/quizzes', { headers: { Authorization: `Bearer ${token}` } });
// Use quiz.hasTaken to show completed badge

// 2. History - List all attempts
const attempts = await fetch('/quizzes/attempts/my', { headers: { Authorization: `Bearer ${token}` } });

// 3. Review - Show attempt details
const attempt = await fetch(`/quizzes/attempts/${attemptId}`, { headers: { Authorization: `Bearer ${token}` } });
// Use attempt.questions[].userAnswer to highlight user's selections
```

See `API_INTEGRATION_GUIDE.md` for full documentation.

