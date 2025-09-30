const pool = require('../db');

function isValidStatus(s) {
    return ['pendiente', 'en progreso', 'completada'].includes(s);
}

exports.listTasks = async (req, res, next) => {
    try {
        const { title, status, project_id } = req.query;
        const conditions = [];
        const values = [];

        if (title) {
            values.push(`%${title}%`);
            conditions.push(`title $${values.length}`);
        }
        if (status) {
            if (!isValidStatus(status))
                return res.status(400).json({ error: 'Estado inválido' });
            values.push(status);
            conditions.push(`status = $${values.length}`);
        }
        if (project_id) {
            values.push(project_id);
            conditions.push(`project_id = $${values.length}`);
        }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
        const query = `SELECT * FROM tasks ${where} ORDER BY due_date ASC`;
        const { rows } = await pool.query(query, values);
        res.json(rows);
    } catch (err) { next(err); }
};

exports.getTask = async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM tasks WHERE id = $1',
            [req.params.id]
        );
        if (rows.length === 0)
            return res.status(404).json({ error: 'Tarea no encontrada' });
        res.json(rows[0]);
    } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
    try {
        const { title, description, status, due_date, priority, project_id } = req.body;
        if (!title || !due_date)
            return res.status(400).json({ error: 'title y due_date son obligatorios' });

        if (status && !isValidStatus(status))
            return res.status(400).json({ error: 'Estado inválido' });

        if (project_id) {
            const proj = await pool.query('SELECT id FROM projects WHERE id=$1', [project_id]);
            if (proj.rows.length === 0)
                return res.status(400).json({ error: 'project_id inválido' });
        }

        const { rows } = await pool.query(
            `INSERT INTO tasks (title, description, status, due_date, priority, project_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [title, description || null, status || 'pendiente', due_date, priority, project_id || null]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === '23505')
            return res.status(409).json({ error: 'El título de la tarea debe ser único' });
        next(err);
    }
};

exports.updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, status, due_date, priority, project_id } = req.body;

        if (status && !isValidStatus(status))
            return res.status(400).json({ error: 'Estado inválido' });

        if (project_id) {
            const proj = await pool.query('SELECT id FROM projects WHERE id=$1', [project_id]);
            if (proj.rows.length === 0)
                return res.status(400).json({ error: 'project_id inválido' });
        }

        const fields = [];
        const values = [];
        const pushField = (col, val) => {
            if (val !== undefined) {
                values.push(val);
                fields.push(`${col} = $${values.length}`);
            }
        };

        pushField('title', title);
        pushField('description', description);
        pushField('status', status);
        pushField('due_date', due_date);
        pushField('priority', priority);
        pushField('project_id', project_id);

        if (fields.length === 0)
            return res.status(400).json({ error: 'Nada para actualizar' });

        const query = `UPDATE tasks SET ${fields.join(', ')}, updated_at = NOW()
                   WHERE id = $${values.length + 1} RETURNING *`;
        values.push(id);

        const { rows } = await pool.query(query, values);
        if (rows.length === 0)
            return res.status(404).json({ error: 'Tarea no encontrada' });

        res.json(rows[0]);
    } catch (err) {
        if (err.code === '23505')
            return res.status(409).json({ error: 'El título de la tarea debe ser único' });
        next(err);
    }
};

exports.deleteTask = async (req, res, next) => {
    try {
        const { rowCount } = await pool.query(
            'DELETE FROM tasks WHERE id = $1',
            [req.params.id]
        );
        if (rowCount === 0)
            return res.status(404).json({ error: 'Tarea no encontrada' });
        res.status(204).send();
    } catch (err) { next(err); }
};
