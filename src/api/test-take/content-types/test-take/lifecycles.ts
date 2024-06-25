export default {
  async afterCreate(event) {
    const { result } = event;

    // Update url
    const url = `${process.env.FRONT_END_URL}/test-takes/${result.id}`;
    await strapi.entityService.update("api::test-take.test-take", result.id, {
      data: {
        url,
      },
    });
  },
};
