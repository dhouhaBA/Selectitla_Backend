
const categoryEventController = require('../src/api/category-event/controllers/category-event.js');

describe('category-event controller', () => {
  let findByName;

  beforeAll(() => {
    const strapiMock = {
      contentType: jest.fn().mockReturnValue({}), // ✅ mock requis par createCoreController
      db: {
        query: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue({ name: 'Sport' }),
        }),
      },
    };

    const controller = categoryEventController({ strapi: strapiMock });
    findByName = controller.findByName;
  });

  it('should return category by name', async () => {
    const ctx = { params: { name: 'Sport' } };
    const result = await findByName(ctx);
    expect(result).toEqual({ name: 'Sport' });
  });
});
