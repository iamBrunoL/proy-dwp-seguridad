export const renderPrincipal = async (req, res) => {
  const titulo = "Sapphire Networks";
  res.render("principal", { titulo: titulo });
};

export const renderEasterEgg = async (req, res) => {
  const titulo = "Sapphire Networks - Desarrolladores";
  res.render("desarrolladores", { titulo: titulo });
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

export const renderTableroSupervisor = async (req, res) => {
  const titulo = "Panel de control - Supervisor";
  res.render("supervisor/tableroSupervisor", { titulo: titulo });
};

export const renderErrorAcceso = async (req, res) => {
  const titulo = "Acceso restringido";
  res.render("errorAcceso", { titulo: titulo });
};

export const renderError = async (req, res) => {
  const titulo = "Error en la ejecución";
  res.render("error", { titulo: titulo });
};
