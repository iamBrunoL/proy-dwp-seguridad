import { pool } from "../db.js";

export const renderRegistro = async (req, res) => {
  const titulo = "Registro";
  res.render("registro", { titulo: titulo });
};


export const iniciarSesion = async (req, res) => {
  const { correoUsuario, username, contrasenaUsuario } = req.body;

  try {
    // Buscar en la base de datos un usuario con el correo electrónico o username proporcionado
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ? and username = ?", [correoUsuario, username]);

    // Verificar si se encontró algún usuario
    if (rows.length === 0) {
      // No se encontró ningún usuario con las credenciales proporcionadas
      return res.redirect("/login?error=credenciales");
    }

    // Verificar si la contraseña coincide
    const usuario = rows[0];
    if (usuario.password !== contrasenaUsuario) {
      // La contraseña proporcionada no coincide
      return res.redirect("/login?error=contrasena");
    }

    // Determinar la página de destino según el role del usuario
    let paginaDestino;
    if (usuario.role === "administrador") {
      paginaDestino = "/tableroAdmin";
    } else {
      paginaDestino = "/tableroUsuario";
    }

    req.session.usuario = usuario;
    // Redirigir al usuario a la página de destino
    res.redirect(paginaDestino);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.redirect("/login?error=general");
  }
};

export const cerrarSesion = (req, res) => {
  // Destruir la sesión
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
    }
    // Redirigir al usuario a la página de inicio de sesión u otra página
    res.redirect("/login");
  });
};


export const renderUsuarios = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM usuarios");
  const titulo = "Consulta de usuarios";
  res.render("admin/usuario", { usuarios: rows, titulo: titulo });
};

export const createUsuarios = async (req, res) => {
  const newusuario = req.body;
  await pool.query("INSERT INTO usuarios set ?", [newusuario]);
  res.redirect("/usuario");
};

export const editUsuario = async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [
    id,
  ]);
  const titulo = "Actualizar datos de usuario";
  res.render("admin/usuarios_edit", { usuario: result[0], titulo: titulo });
};

export const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const newusuario = req.body;
  await pool.query("UPDATE usuarios set ? WHERE id = ?", [newusuario, id]);
  res.redirect("/usuario");
};

export const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
  if (result.affectedRows === 1) {
    res.json({ message: "usuario deleted" });
  }
  res.redirect("/usuario");
};