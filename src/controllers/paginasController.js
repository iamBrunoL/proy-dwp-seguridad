export const renderPrincipal = async (req, res) => {
  const titulo = "Inicio";
  res.render("principal", { titulo: titulo });
};

export const renderLogin = async (req, res) => {
  const titulo = "Login";
  res.render("login", { titulo: titulo });
};

export const renderTableroAdmin = async (req, res) => {
  const titulo = "Panel de control - Administrador";
  res.render("admin/tableroAdmin", { titulo: titulo });
};

export const renderTableroUsuario = async (req, res) => {
  const titulo = "Panel de control - Usuario";
  res.render("usuarioG/tableroUsuario", { titulo: titulo });
};
