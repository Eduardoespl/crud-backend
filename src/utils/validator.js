function isValidStatus(s) {
    return ['pendiente', 'en progreso', 'completada'].includes(s);
}

module.exports = { isValidStatus };
