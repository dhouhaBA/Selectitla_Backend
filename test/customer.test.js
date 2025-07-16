// @ts-nocheck
'use strict';

const customerController = require('../src/api/customer/controllers/customer.js');

describe('Customer Controller', () => {
  let createFunction;
  beforeAll(() => {
    // Mock the strapi object
    const strapiMock = {
      contentType: jest.fn().mockReturnValue({
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn(),
        create: jest.fn(),
        delete: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      }),
      db: {
        query: jest.fn().mockReturnValue({
        create: jest.fn().mockResolvedValue({ id: 'customer_id' }),
        delete: jest.fn().mockResolvedValue({}),
        findOne: jest.fn().mockResolvedValue({ user: { id: 'user_id_here' } }), // Mock the findOne method to resolve to an object containing the user property with an id


        }),
      },
    };
  
    const controller = customerController({ strapi: strapiMock });
    createFunction = controller.create;
    deleteFunction = controller.delete;
    

  
  });

  it("should have a create function", () => {
    expect(typeof createFunction).toBe("function");
  });

  it("should create a new customer entry", async () => {
    const ctx = {
      request: {
        body: {
          data: {
            name: 'John',
            surname: 'Doe',
            phone: '1234567890',
            driver_license: 'ABC123',
            Insurance: 'XYZ456',
            address: '123 Main St',
            credit_cards: ['1234 5678 9012 3456'],
            user: 'user_id_here'
          }
        }
      }
    };

    const result = await createFunction(ctx);

    expect(result).toEqual({ 
      id: 'customer_id'});
  });

 
  it("should delete a customer entry", async () => {
    const ctx = {
      params: { id: 'customer_id' }  }

    const result = await deleteFunction(ctx);

    expect(result).toEqual({ message: "Customer deleted successfully." });
  });
});