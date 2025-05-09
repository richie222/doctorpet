const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    console.log('Sesión no encontrada:', req.session); // Para debugging
    return res.status(401).json({ 
      error: 'No autorizado',
      details: !req.session ? 'No hay sesión' : 'No hay usuario en sesión'
    });
  }
  next();
};
  
  const isGuest = (req, res, next) => {
    if (req.session.user) {
      return res.status(400).json({ error: 'Ya has iniciado sesión' });
    }
    next();
  };
  
  module.exports = {
    isAuthenticated,
    isGuest
  };