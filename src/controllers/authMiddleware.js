export const verificarAutenticacion = (req, res, next) => {
  // Verificar si el usuario está autenticado (por ejemplo, si existe una sesión)
  if (req.session && req.session.usuario) {
      // El usuario está autenticado
      next();
  } else {
      // El usuario no está autenticado, redirigirlo a la página de inicio de sesión
      res.redirect("/login");
  }
};

export const verificarRol = (rolPermitido) => {
  return (req, res, next) => {
      // Verificar si el usuario tiene el rol permitido
      if (req.session.usuario.role === rolPermitido) {
          // El usuario tiene el rol permitido, continuar con la siguiente función middleware
          next();
      } else {
          // El usuario no tiene el rol permitido, redirigirlo a una página de error o acceso no autorizado
          res.redirect("/errorAcceso");
      }
  };
};
