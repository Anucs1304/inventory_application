const pool = require('../db/pool');

exports.item_list = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT item.*, category.name AS category_name
      FROM item
      JOIN category ON item.category_id = category.id
      ORDER BY item.name
    `);

    res.render('item_list', {
      title: 'All Items',
      item_list: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.item_detail = async (req, res, next) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      `SELECT item.*, category.name AS category_name
       FROM item
       JOIN category ON item.category_id = category.id
       WHERE item.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Item not found');
      error.status = 404;
      return next(error);
    }

    res.render('item_detail', {
      title: result.rows[0].name,
      item: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

exports.item_create_get = async (req, res, next) => {
  try {
    const categories = await pool.query('SELECT * FROM category ORDER BY name');

    res.render('item_form', {
      title: 'Create Item',
      categories: categories.rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.item_create_post = async (req, res, next) => {
  const { name, description, price, stock, category_id } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO item (name, description, price, stock, category_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [name, description, price, stock, category_id]
    );

    res.redirect(`/items/${result.rows[0].id}`);
  } catch (err) {
    next(err);
  }
};

exports.item_update_get = async (req, res, next) => {
  const id = req.params.id;

  try {
    const item = await pool.query('SELECT * FROM item WHERE id = $1', [id]);
    const categories = await pool.query('SELECT * FROM category ORDER BY name');

    if (item.rows.length === 0) {
      const error = new Error('Item not found');
      error.status = 404;
      return next(error);
    }

    res.render('item_form', {
      title: 'Update Item',
      item: item.rows[0],
      categories: categories.rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.item_update_post = async (req, res, next) => {
  const id = req.params.id;
  const { name, description, price, stock, category_id } = req.body;

  try {
    await pool.query(
      `UPDATE item
       SET name = $1, description = $2, price = $3, stock = $4, category_id = $5
       WHERE id = $6`,
      [name, description, price, stock, category_id, id]
    );

    res.redirect(`/items/${id}`);
  } catch (err) {
    next(err);
  }
};

exports.item_delete_get = async (req, res, next) => {
  const id = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM item WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      const error = new Error('Item not found');
      error.status = 404;
      return next(error);
    }

    res.render('item_delete', {
      title: 'Delete Item',
      item: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

exports.item_delete_post = async (req, res, next) => {
  const id = req.params.id;

  try {
    await pool.query('DELETE FROM item WHERE id = $1', [id]);
    res.redirect('/items');
  } catch (err) {
    next(err);
  }
};
