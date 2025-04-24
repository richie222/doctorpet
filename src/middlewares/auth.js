const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'No autorizado' });
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