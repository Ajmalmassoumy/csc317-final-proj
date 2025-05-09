const express = require('express');

function createIndexRouter(db) {
  const router = express.Router();

  router.get('/', async function(req, res, next) {
    try {
      const featuredProducts = await new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM products WHERE is_featured = 1 LIMIT 12`,
          [],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      const onSaleProducts = await new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM products WHERE is_sale = 1 LIMIT 12`,
          [],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      res.render('index', {
        title: 'Gems For All',
        featuredProducts,
        onSaleProducts,
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

  return router;
}

module.exports = {
  createIndexRouter,
};
