const pool = require('./pool');

async function seed() {
  try {
    await pool.query('DELETE FROM item');
    await pool.query('DELETE FROM category');

    const categories = await pool.query(`
      INSERT INTO category (name, description)
      VALUES
      ('Guitars', 'Electric and acoustic guitars'),
      ('Keyboards', 'Digital and analog keyboards'),
      ('Drums', 'Drum kits and percussion')
      RETURNING id, name
    `);

    const guitarsId = categories.rows.find(c => c.name === 'Guitars').id;
    const keysId = categories.rows.find(c => c.name === 'Keyboards').id;

    await pool.query(
      `INSERT INTO item (name, description, price, stock, category_id)
       VALUES
       ('Stratocaster', 'Classic electric guitar', 799.99, 5, $1),
       ('Acoustic Dreadnought', 'Warm acoustic tone', 399.99, 8, $1),
       ('Stage Piano', '88-key weighted digital piano', 1199.00, 3, $2)`,
      [guitarsId, keysId]
    );

    console.log('Seed complete');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

seed();
