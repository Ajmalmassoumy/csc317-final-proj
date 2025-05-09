const express = require('express');

function createProductsRouter(db) {
  const router = express.Router();

  // Fetch featured and on-sale products
  router.get('/', async function (req, res, next) {
    try {
      const featuredProducts = await new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM products WHERE is_featured = 1`,
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      const onSaleProducts = await new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM products WHERE is_sale = 1`,
          [],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      res.render('products/index', {
        featuredProducts,
        onSaleProducts,
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

  // Individual product details route
  router.get('/:id', async function (req, res, next) {
    const productId = req.params.id;
    try {
      const product = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM products WHERE id = ?',
          [productId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!product) {
        return res.status(404).send('Product not found');
      }

      res.render('products/product', { product });
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

  return router;
}

module.exports = {
  createProductsRouter,
};
