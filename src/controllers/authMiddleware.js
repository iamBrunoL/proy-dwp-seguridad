export const verificarAutenticacion = (req, res, next) => {
  if (req.session && req.session.usuario) {
      next();
  } else {
      res.redirect("/login");
  }
};

export const verificarRol = (rolPermitido) => {
  return (req, res, next) => {
      if (req.session.usuario.role === rolPermitido) {
          next();
      } else {
          res.redirect("/errorAcceso");
      }
  };
};
