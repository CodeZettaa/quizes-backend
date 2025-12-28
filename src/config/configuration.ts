export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET || 'changeme',
    expiresIn: '7d',
  },
  database: {
    url:
      process.env.DATABASE_URL ||
      'mongodb://localhost:27017/quizdb',
  },
  ai: {
    apiKey: process.env.AI_API_KEY || '',
  },
});
