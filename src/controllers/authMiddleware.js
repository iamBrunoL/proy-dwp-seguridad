export const verificarAutenticacion = (req, res, next) => {
    // Verificar si el usuario está autenticado (por ejemplo, si existe una sesión)
    if (req.session && req.session.usuario) {
      // El usuario está autenticado, continuar con la siguiente función middleware
      next();
    } else {
      // El usuario no está autenticado, redirigirlo a la página de inicio de sesión
      res.redirect("/login");
    }
  };
  