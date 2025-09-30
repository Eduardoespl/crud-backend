const pool = require('../db');

exports.listProjects = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT p.*, json_agg(t.*) AS tasks
             FROM projects p
             LEFT JOIN tasks t ON t.project_id = p.id
             GROUP BY p.id`
        );
        res.json(result.rows);
    } catch (err) { next(err); }
};

exports.createProject = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'name es obligatorio' });
        const result = await pool.query(
            'INSERT INTO projects(name) VALUES($1) RETURNING *',
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Nombre ya existe' });
        next(err);
    }
};
