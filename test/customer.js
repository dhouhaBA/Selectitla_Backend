// src/api/customer/controllers/customer.js

module.exports = ({ strapi }) => ({
  // Fonction pour créer un client
  async create(ctx) {
    const { data } = ctx.request.body;

    // On crée un nouvel enregistrement dans la collection "customer"
    const newCustomer = await strapi.db.query('api::customer.customer').create({
      data,
    });

    // On retourne le résultat
    return newCustomer;
  },

  // Fonction pour supprimer un client par ID
  async delete(ctx) {
    const { id } = ctx.params;

    await strapi.db.query('api::customer.customer').delete({
      where: { id },
    });

    return { message: "Customer deleted successfully." };
  }
});
