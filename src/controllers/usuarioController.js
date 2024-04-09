import { pool } from "../db.js";
import PDFDocument from "pdfkit";
import fs from "fs";

export const renderMisDatos = (req, res) => {
  const titulo = "Mi perfil";
   // Registro de log
   const usuario = req.session.usuario;
   let crearLog = `Consulta de datos de perfil realizada por: ${
     usuario.username
   } a las ${new Date().toLocaleString()}`;
   pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
  res.render("usuarioG/misDatos", {
    usuario,
    titulo: titulo,
    message: "Sin resultados encontrados",
  });
};

export const renderRegistro = async (req, res) => {
  const titulo = "Registro";
  res.render("registro", { titulo: titulo });
};

export const iniciarSesion = async (req, res) => {
  const { correoUsuario, username, contrasenaUsuario } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM administrador WHERE email = ? AND username = ? UNION SELECT * FROM usuarios WHERE email = ? AND username = ?",
      [correoUsuario, username, correoUsuario, username]
    );

    if (rows.length === 0) {
      return res.send(
        '<script>alert("Los datos ingresados no son correctos"); window.location="/login";</script>'
      );
    }

    const usuario = rows[0];

    let paginaDestino = "";
    switch (usuario.role) {
      case "Administrador":
        if (usuario.password !== contrasenaUsuario) {
          return res.send(
            '<script>alert("Contraseña incorrecta"); window.location="/login";</script>'
          );
        }
        paginaDestino = "/tableroAdmin";
        break;

      case "Supervisor":
        if (usuario.password !== contrasenaUsuario) {
          return res.send(
            '<script>alert("Contraseña incorrecta"); window.location="/login";</script>'
          );
        }
        paginaDestino = "/tableroSupervisor";
        break;

      default:
        if (usuario.password !== contrasenaUsuario) {
          return res.send(
            '<script>alert("Contraseña incorrecta"); window.location="/login";</script>'
          );
        }
        paginaDestino = "/tableroUsuario";
        break;
    }

    req.session.usuario = usuario;

    // Registro de log
    let crearLog = `Inicio de sesión  del usuario: ${
      usuario.username
    } a las ${new Date().toLocaleString()}`;
    pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
    res.redirect(paginaDestino);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.redirect("/login?error=general");
  }
};

export const cerrarSesion = (req, res) => {
  // Registro de log
  const usuario = req.session.usuario;
  let crearLog = `Cierre de sesión del usuario: ${
    usuario.username
  } a las ${new Date().toLocaleString()}`;
  pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);

  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
    }
    res.redirect("/login");
  });
};

export const renderUsuarios = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM usuarios");
  const titulo = "Consulta de usuarios";
  res.render("admin/usuario", {
    usuarios: rows,
    titulo: titulo,
    message: "Sin resultados encontrados",
  });
  // Registro de log
  const usuario = req.session.usuario;
  let crearLog = `Consulta general de usuarios realizada por el administrador: ${
    usuario.username
  } a las ${new Date().toLocaleString()}`;
  pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
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

  try {
    await pool.query("START TRANSACTION");
    await pool.query("UPDATE usuarios set ? WHERE id = ?", [newusuario, id]);
    await pool.query("COMMIT");

    // Registro de log
    const usuario = req.session.usuario;
    let crearLog = `Actualización de usuario ${id} realizada por: ${
      usuario.username
    } a las ${new Date().toLocaleString()}`;
    pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
    return res.send(
      '<script>alert("Actualización de datos de usuario exitosa"); window.location="/usuario";</script>'
    );
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    await pool.query("ROLLBACK");
    res.redirect("/usuario");
  }
};

export const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
    const result1 = await pool.query("DELETE FROM citas WHERE id_usuario = ?", [id]);
    // Registro de log
    const usuario = req.session.usuario;
    let crearLog = `Eliminación de usuario con id ${id} realizada por: ${
      usuario.username
    } a las ${new Date().toLocaleString()}`;
    pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);

    if (result.affectedRows === 1) {
      return res.send(
        '<script>alert("Eliminación de usuario realizada correctamente"); window.location="/usuario";</script>'
      );
    } else {
      res.redirect("/usuario");
    }
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      res
        .status(400)
        .send(
          '<script>alert("No puedes eliminar este usuario porque tiene citas asociadas"); window.location="/usuario";</script>'
        );
    } else {
      console.error("Error al eliminar usuario:", error);
      res
        .status(500)
        .send(
          '<script>alert("Ocurrió un error al eliminar el usuario"); window.location="/usuario";</script>'
        );
    }
  }
};

export const buscarUsuario = async (req, res) => {
  const { username } = req.query;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE username LIKE ?",
      [`%${username}%`]
    );
    const usuarios = rows.map((usuario) => ({
      id: usuario.id,
      nombreCompleto: usuario.nombreCompleto,
      apellidos: usuario.apellidos,
      username: usuario.username,
      email: usuario.email,
      telefono: usuario.telefono,
      role: usuario.role,
    }));

    const titulo = "Usuarios encontrados";
     // Registro de log
     const usuario = req.session.usuario;
     let crearLog = `Búsqueda del usuario ${username} realizada por: ${
       usuario.username
     } a las ${new Date().toLocaleString()}`;
     pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
    res.render("admin/usuario", {
      usuarios: rows,
      titulo: titulo,
      message: "Sin resultados encontrados",
    });
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    res.redirect("/error");
  }
};

export const renderConsultaUsuarios = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM usuarios");
  const titulo = "Consulta de usuarios";
  // Registro de log
  const usuario = req.session.usuario;
  let crearLog = `Consulta general de usuarios realizada por el supervisor: ${
    usuario.username
  } a las ${new Date().toLocaleString()}`;
  pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
  res.render("supervisor/consultaUsuarios", {
    usuarios: rows,
    titulo: titulo,
    message: "Sin resultados encontrados",
  });
};

export const renderConsultaPersonal = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM administrador");
  const titulo = "Consulta de personal";
  // Registro de log
  const usuario = req.session.usuario;
  let crearLog = `Consulta general de personal realizada por: ${
    usuario.username
  } a las ${new Date().toLocaleString()}`;
  pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
  res.render("supervisor/consultaPersonal", {
    usuarios: rows,
    titulo: titulo,
    message: "Sin resultados encontrados",
  });
};

export const generarPDFPersonal = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM administrador");

    const pdf = new PDFDocument();
    const fileName = `reporte_de_personal.pdf`;
    const filePath = `./src/public/${fileName}`;

    // Registro de log
    const usuario = req.session.usuario;
    let crearLog = `Creación de reporte de personal realizado por: ${
      usuario.username
    } a las ${new Date().toLocaleString()}`;
    pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);

    pdf.text("Reporte de Personal", { align: "center" });
    pdf.moveDown();
    rows.forEach((usuario) => {
      pdf.text(`ID: ${usuario.id}`);
      pdf.text(`Nombre Completo: ${usuario.nombreCompleto}`);
      pdf.text(`Apellidos: ${usuario.apellidos}`);
      pdf.text(`Usuario: ${usuario.username}`);
      pdf.text(`Correo Electrónico: ${usuario.email}`);
      pdf.text(`Fecha de Nacimiento: ${usuario.fechaNacimiento}`);
      pdf.text(`Domicilio: ${usuario.domicilio}`);
      pdf.text(`Telefono: ${usuario.telefono}`);
      pdf.text(`Fecha de registro: ${usuario.fechaRegistro}`);
      pdf.text(`Role: ${usuario.role}`);
      pdf.moveDown();
    });

    pdf.end();

    pdf.pipe(fs.createWriteStream(filePath)).on("finish", () => {
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Error al descargar el archivo PDF:", err);
          res.redirect("/error");
        } else {
          fs.unlinkSync(filePath);
        }
      });
    });
  } catch (error) {
    console.error("Error al generar PDF de personal:", error);
    res.redirect("/error");
  }
};

export const generarPDFUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios");

    const pdf = new PDFDocument();
    const fileName = `reporte_de_usuarios.pdf`;
    const filePath = `./src/public/${fileName}`;

    // Registro de log
    const usuario = req.session.usuario;
    let crearLog = `Creación de reporte de usuarios realizado por: ${
      usuario.username
    } a las ${new Date().toLocaleString()}`;
    pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);

    pdf.text("Reporte de Usuarios", { align: "center" });
    pdf.moveDown();
    rows.forEach((usuario) => {
      pdf.text(`ID: ${usuario.id}`);
      pdf.text(`Nombre: ${usuario.nombreCompleto}`);
      pdf.text(`Apellidos: ${usuario.apellidos}`);
      pdf.text(`Nombre de usuario: ${usuario.username}`);
      pdf.text(`Correo electrónico: ${usuario.email}`);
      pdf.text(`Fecha de nacimiento: ${usuario.fechaNacimiento}`);
      pdf.text(`Domicilio: ${usuario.domicilio}`);
      pdf.text(`Teléfono: ${usuario.telefono}`);
      pdf.text(`Fecha de registro: ${usuario.fechaRegistro}`);
      pdf.moveDown();
    });

    pdf.end();

    pdf.pipe(fs.createWriteStream(filePath)).on("finish", () => {
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Error al descargar el archivo PDF:", err);
          res.redirect("/error");
        } else {
          fs.unlinkSync(filePath);
        }
      });
    });
  } catch (error) {
    console.error("Error al generar PDF de usuarios:", error);
    res.redirect("/error");
  }
};

export const renderPersonal = async (req, res) => {
  const titulo = "Personal";
  // Registro de log
  const usuario = req.session.usuario;
  let crearLog = `Consulta general de personal realizada por el supervisor: ${
    usuario.username
  } a las ${new Date().toLocaleString()}`;
  pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
  res.render("supervisor/personal", {
    titulo: titulo,
    message: "Sin resultados encontrados",
  });
};

export const updateUsuarioRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    await pool.query("START TRANSACTION");
    await pool.query("UPDATE administrador SET role = ? WHERE id = ?", [
      role,
      id,
    ]);
    await pool.query("COMMIT");
    // Registro de log
    const usuario = req.session.usuario;
    let crearLog = `Actualización de rol de personal para el usuario con id ${id} realizada por: ${
      usuario.username
    } a las ${new Date().toLocaleString()}`;
    pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
    return res.send(
      '<script>alert("Actualización de rol realizada correctamente"); window.location="/consultaPersonal";</script>'
    );
  } catch (error) {
    console.error("Error al actualizar el rol del usuario:", error);
    await pool.query("ROLLBACK");
    res
      .status(500)
      .send(
        '<script>alert("Ocurrió un error al actualizar el rol del usuario"); window.location="/consultaPersonal";</script>'
      );
  }
};


const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export const createUsuarios = async (req, res) => {
  const newUsuario = req.body;
  newUsuario.fechaRegistro = getCurrentDate(); // Asignar la fecha actual al campo fechaRegistro

  try {
    await pool.query("START TRANSACTION");

    const [existingUsers] = await pool.query(
      "SELECT * FROM usuarios WHERE username = ? OR email = ?",
      [newUsuario.username, newUsuario.email]
    );

    const duplicatedFields = [];

    existingUsers.forEach((user) => {
      if (user.username === newUsuario.username) {
        duplicatedFields.push("Nombre de usuario");
      }
      if (user.email === newUsuario.email) {
        duplicatedFields.push("Correo electrónico");
      }
    });

    if (duplicatedFields.length > 0) {
      const errorMessage = `Ya existe un usuario con los siguientes datos: ${duplicatedFields.join(
        ", "
      )}`;
      await pool.query("ROLLBACK"); // Rollback de la transacción
      return res.send(
        `<script>alert(${JSON.stringify(
          errorMessage
        )}); window.location.href = "/registro";</script>`
      );
    }

    await pool.query("INSERT INTO usuarios SET ?", [newUsuario]);
    await pool.query("COMMIT"); // Commit de la transacción

    // Registro de log...

    return res.send( // Enviar respuesta al cliente
      '<script>alert("Registro de usuario exitoso"); window.location="/login";</script>'
    );
  } catch (error) {
    console.error("Error al crear usuario:", error);
    await pool.query("ROLLBACK");
    res.redirect("/registro");
  }
};

export const createUsuariosPersonal = async (req, res) => {
  const newUsuario = req.body;
  newUsuario.fechaRegistro = getCurrentDate(); // Asignar la fecha actual al campo fechaRegistro

  try {
    await pool.query("START TRANSACTION");

    const [existingUsers] = await pool.query(
      "SELECT * FROM administrador WHERE username = ? OR email = ?",
      [newUsuario.username, newUsuario.email]
    );

    const duplicatedFields = [];

    existingUsers.forEach((user) => {
      if (user.username === newUsuario.username) {
        duplicatedFields.push("Nombre de usuario");
      }
      if (user.email === newUsuario.email) {
        duplicatedFields.push("Correo electrónico");
      }
    });

    if (duplicatedFields.length > 0) {
      const errorMessage = `Ya existe un usuario con los siguientes datos: ${duplicatedFields.join(
        ", "
      )}`;
      await pool.query("ROLLBACK"); // Rollback de la transacción
      return res.send(
        `<script>alert(${JSON.stringify(
          errorMessage
        )}); window.location.href = "/personal";</script>`
      );
    }

    await pool.query("INSERT INTO administrador SET ?", [newUsuario]);
    await pool.query("COMMIT"); // Commit de la transacción

    // Registro de log...

    return res.send( // Enviar respuesta al cliente
      '<script>alert("Registro exitoso"); window.location="/tableroSupervisor";</script>'
    );
  } catch (error) {
    console.error("Error al crear usuario:", error);
    await pool.query("ROLLBACK");
    res.redirect("/tableroSupervisor");
  }
};
