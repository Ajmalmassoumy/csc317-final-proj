const express = require('express');

function createSearchRouter(db) {
  const router = express.Router();

  // Search page
  router.get('/', (req, res) => {
      res.render('search/index', { title: 'Search' });
  });

  // Search results
  router.get('/results', (req, res) => {
      const { q, sort } = req.query;

      let query = 'SELECT * FROM products';
      const params = [];

      if (q) {
          query += ' WHERE name LIKE ?';
          params.push(`%${q}%`);
      }

      // Handle sorting
      if (sort) {
          if (sort === 'name_asc') {
              query += ' ORDER BY name ASC';
          } else if (sort === 'name_desc') {
              query += ' ORDER BY name DESC';
          } else if (sort === 'price_asc') {
              query += ' ORDER BY price ASC';
          } else if (sort === 'price_desc') {
              query += ' ORDER BY price DESC';
          } else if (sort === 'sale') {
              query += (q ? ' AND' : ' WHERE') + ' is_sale = 1';
          }
      }

      db.all(query, params, (err, rows) => {
          if (err) {
              console.error(err);
              return res.status(500).send('Database error during search');
          }

          res.render('search/results', {
              title: `Search Results for ${q}`,
              products: rows,
              query: q,
              sort: sort
          });
      });
  });

  return router;
}


module.exports = {
  createSearchRouter: createSearchRouter,
};
