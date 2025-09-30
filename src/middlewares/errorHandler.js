function errorHandler(err, req, res, next) {
    console.error(err);
    if (res.headersSent) return next(err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
}

module.exports = errorHandler;
