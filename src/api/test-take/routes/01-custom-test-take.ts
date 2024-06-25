export default {
  routes: [
    {
      method: "GET",
      path: "/test-takes/:id",
      handler: "api::test-take.test-take.findOneCustom",
    },
    {
      method: "POST",
      path: "/test-takes/:id/start",
      handler: "api::test-take.test-take.startQuizTake",
    },
    {
      method: "POST",
      path: "/test-takes/:id/result",
      handler: "api::test-take.test-take.submitResult",
    },
  ],
};
