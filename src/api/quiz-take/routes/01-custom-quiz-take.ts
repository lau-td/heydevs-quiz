export default {
  routes: [
    {
      // Path defined with a URL parameter
      method: "POST",
      path: "/quiz-takes/:id/result",
      handler: "api::quiz-take.quiz-take.submitResult",
    },
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/quiz-takes/:id/quiz",
      handler: "api::quiz-take.quiz-take.getQuizByQuizTakeId",
    },
    {
      // Path defined with a URL parameter
      method: "POST",
      path: "/quiz-takes/:id/validate",
      handler: "api::quiz-take.quiz-take.verifyPassCode",
    },
    {
      // Path defined with a URL parameter
      method: "POST",
      path: "/quiz-takes/:id/start",
      handler: "api::quiz-take.quiz-take.startQuizTake",
    },
  ],
};
