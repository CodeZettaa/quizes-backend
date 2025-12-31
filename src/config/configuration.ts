export default () => ({
  port: parseInt(process.env.PORT || "3000", 10),
  jwt: {
    secret: process.env.JWT_SECRET || "changeme",
    expiresIn: "7d",
  },
  database: {
    url: process.env.DATABASE_URL || "mongodb://localhost:27017/quizdb",
  },
  ai: {
    apiKey: process.env.AI_API_KEY || "",
  },
  frontend: {
    baseUrl: process.env.FRONTEND_BASE_URL || "http://localhost:8888",
    successRedirect: process.env.FRONTEND_SUCCESS_REDIRECT || "http://localhost:8888/auth/social/callback",
    failureRedirect: process.env.FRONTEND_FAILURE_REDIRECT || "http://localhost:8888/auth/login",
  },
});
