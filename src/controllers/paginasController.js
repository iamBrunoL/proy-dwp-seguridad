export const renderPrincipal = async (req, res) => {
  res.render("principal");
};

export const renderLogin = async (req, res) => {
  res.render("login");
};

export const renderTableroAdmin = async (req, res) => {
  res.render("admin/tableroAdmin");
};

export const renderTableroUsuario = async (req, res) => {
  res.render("usuarioG/tableroUsuario");
};
