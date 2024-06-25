export default {
  routes: [
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/quizzes/findAndGetFull",
      handler: "api::quiz.quiz.findAndGetFull",
    },
  ],
};
