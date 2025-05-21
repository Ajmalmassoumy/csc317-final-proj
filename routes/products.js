const express = require('express');

function createProductsRouter(db) {
    const router = express.Router();

    router.get('/crystals', (req, res) => {
        res.render('products/crystals', { title: 'All Crystals' });
    });

    router.get('/jewelry', (req, res) => {
        res.render('products/jewelry', { title: 'All Jewelry' });
    });

    // Create a new product
    router.post('/', (req, res) => {
        const { name, description, price, is_featured, is_sale } = req.body;

        if (!name || price == null) {
            return res.status(400).send('Name and price are required');
        }

        db.run(
            `INSERT INTO products (name, description, price, is_featured, is_sale)
             VALUES (?, ?, ?, ?, ?)`,
            [name, description || '', price, is_featured ? 1 : 0, is_sale ? 1 : 0],
            function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Database error during product creation');
                }
                res.status(201).json({ id: this.lastID });
            }
        );
    });

    // Read: Get all products
    router.get('/', (req, res) => {
        db.all('SELECT * FROM products', [], (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).send('Database error fetching products');
            } else {
                res.render('products', { products: rows, title: 'All Products' });
            }
        });
    });

    // Read: Get single product by id (FIXED to render the detail view)
    router.get('/:id', (req, res) => {
        const { id } = req.params;
        db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
            const title = `${row.name}`;
            if (err) {
                console.error(err);
                return res.status(500).send('Database error fetching product');
            }
            if (!row) {
                return res.status(404).send('Product not found');
            }
            res.render('products/detail', { product: row, title: title }); 
        });
    });

    // Update: Update a product
    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { name, description, price, is_featured, is_sale } = req.body;

        if (!name && price == null && description == null && is_featured == null && is_sale == null) {
            return res.status(400).send('Nothing to update');
        }

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (price !== undefined) {
            updates.push('price = ?');
            params.push(price);
        }
        if (is_featured !== undefined) {
            updates.push('is_featured = ?');
            params.push(is_featured ? 1 : 0);
        }
        if (is_sale !== undefined) {
            updates.push('is_sale = ?');
            params.push(is_sale ? 1 : 0);
        }

        params.push(id);

        db.run(
            `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
            params,
            function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Database error updating product');
                }
                if (this.changes === 0) {
                    return res.status(404).send('Product not found');
                }
                res.json({ message: 'Product updated successfully' });
            }
        );
    });

    // Delete: Remove a product
    router.delete('/:id', (req, res) => {
        const { id } = req.params;

        db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error deleting product');
            }
            if (this.changes === 0) {
                return res.status(404).send('Product not found');
            }
            res.json({ message: 'Product deleted successfully' });
        });
    });

    return router;
}

module.exports = {
    createProductsRouter,
};
