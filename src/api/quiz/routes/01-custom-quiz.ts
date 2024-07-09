export default {
  routes: [
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/quizzes/findAndGetFull",
      handler: "api::quiz.quiz.findAndGetFull",
    },
    {
      method: "POST",
      path: "/quizzes/create-from-google-sheet",
      handler: "api::quiz.quiz.createQuizFromGoogleSheet",
    },
  ],
};
