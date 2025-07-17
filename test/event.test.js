const eventControllerFactory = require("../src/api/event/controllers/event");

describe("eventController.create", () => {
  let controller;
  let mockCtx;

  beforeEach(() => {
    const mockStrapi = {
      db: {
        query: jest.fn(() => ({
          create: jest.fn().mockResolvedValue({ id: 1 }),
        })),
      },
      plugins: {
        upload: {
          services: {
            upload: {
              upload: jest.fn(),
            },
          },
        },
      },
    };

    controller = eventControllerFactory({ strapi: mockStrapi });

    mockCtx = {
      is: jest.fn(() => false),
      request: {
        body: {
          name: "Test Event",
          price: 100,
          promoting_info: "Promo",
          name_promoter: "John",
          description: "Un bel événement",
          partner: 1,
          category_events: 2,
          total_bottles: 50,
          total_seats: 100,
          start_date: "2025-07-25",
          end_date: "2025-07-26",
          start_time: "10:00",
          end_time: "12:00",
          location: "Tunis",
        },
        files: {},
      },
      throw: jest.fn((code, msg) => {
        const err = new Error(msg);
        err.status = code;
        throw err;
      }),
    };
  });

  it("should create event with valid data", async () => {
    const result = await controller.create(mockCtx);
    expect(result).toEqual({ id: 1 });
  });

  it("should throw error for past start date", async () => {
    mockCtx.request.body.start_date = "2020-01-01";
    await expect(controller.create(mockCtx)).rejects.toThrow(
      "The start date must be greater than or equal to today."
    );
  });

  it("should throw error if end date is before start date", async () => {
    mockCtx.request.body.start_date = "2025-07-26";
    mockCtx.request.body.end_date = "2025-07-25";
    await expect(controller.create(mockCtx)).rejects.toThrow(
      "The end date must be greater than or equal to the start date."
    );
  });

  it("should throw error if start time >= end time on same day", async () => {
    mockCtx.request.body.start_date = "2025-07-25";
    mockCtx.request.body.end_date = "2025-07-25";
    mockCtx.request.body.start_time = "14:00";
    mockCtx.request.body.end_time = "12:00";
    await expect(controller.create(mockCtx)).rejects.toThrow(
      "The start time must be less than the end time when start date is equal to end date."
    );
  });
});
