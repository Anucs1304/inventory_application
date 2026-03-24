const pool = require('../db/pool');

exports.category_list = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM category ORDER BY name');
    res.render('category_list', {
      title: 'Categories',
      category_list: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.category_detail = async (req, res, next) => {
  const id = req.params.id;

  try {
    const category = await pool.query('SELECT * FROM category WHERE id = $1', [id]);
    const items = await pool.query('SELECT * FROM item WHERE category_id = $1', [id]);

    if (category.rows.length === 0) {
      const error = new Error('Category not found');
      error.status = 404;
      return next(error);
    }

    res.render('category_detail', {
      title: category.rows[0].name,
      category: category.rows[0],
      items: items.rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.category_create_get = (req, res) => {
  res.render('category_form', { title: 'Create Category' });
};

exports.category_create_post = async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO category (name, description) VALUES ($1, $2) RETURNING id',
      [name, description]
    );

    res.redirect(`/categories/${result.rows[0].id}`);
  } catch (err) {
    next(err);
  }
};

exports.category_update_get = async (req, res, next) => {
  const id = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM category WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      const error = new Error('Category not found');
      error.status = 404;
      return next(error);
    }

    res.render('category_form', {
      title: 'Update Category',
      category: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

exports.category_update_post = async (req, res, next) => {
  const id = req.params.id;
  const { name, description } = req.body;

  try {
    await pool.query(
      'UPDATE category SET name = $1, description = $2 WHERE id = $3',
      [name, description, id]
    );

    res.redirect(`/categories/${id}`);
  } catch (err) {
    next(err);
  }
};

exports.category_delete_get = async (req, res, next) => {
  const id = req.params.id;

  try {
    const category = await pool.query('SELECT * FROM category WHERE id = $1', [id]);
    const items = await pool.query('SELECT * FROM item WHERE category_id = $1', [id]);

    if (category.rows.length === 0) {
      const error = new Error('Category not found');
      error.status = 404;
      return next(error);
    }

    res.render('category_delete', {
      title: 'Delete Category',
      category: category.rows[0],
      items: items.rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.category_delete_post = async (req, res, next) => {
  const id = req.params.id;

  try {
    const items = await pool.query('SELECT * FROM item WHERE category_id = $1', [id]);

    if (items.rows.length > 0) {
      const category = await pool.query('SELECT * FROM category WHERE id = $1', [id]);

      return res.render('category_delete', {
        title: 'Delete Category',
        category: category.rows[0],
        items: items.rows,
        error: 'Cannot delete category with existing items.',
      });
    }

    await pool.query('DELETE FROM category WHERE id = $1', [id]);
    res.redirect('/categories');
  } catch (err) {
    next(err);
  }
};
