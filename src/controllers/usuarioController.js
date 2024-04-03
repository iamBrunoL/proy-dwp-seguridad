import { pool } from "../db.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';

export const renderMisDatos = (req, res) => {
  const titulo = "Mi perfil";
  const usuario = req.session.usuario;
  res.render("usuarioG/misDatos", { usuario, titulo: titulo,  message: "Sin resultados encontrados" });
};

export const renderRegistro = async (req, res) => {
  const titulo = "Registro";
  res.render("registro", { titulo: titulo });
};

export const iniciarSesion = async (req, res) => {
  const {
    correoUsuario,
    username,
    contrasenaUsuario
  } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM administrador WHERE email = ? AND username = ? UNION SELECT * FROM usuarios WHERE email = ? AND username = ?",
      [correoUsuario, username, correoUsuario, username]
    );

    if (rows.length === 0) {
      return res.send('<script>alert("Los datos ingresados no son correctos"); window.location="/login";</script>');
    }

    const usuario = rows[0];

    // Verificar la contraseña según el tipo de usuario
    let paginaDestino = '';
    switch (usuario.role) {
      case "Administrador":
        if (usuario.password !== contrasenaUsuario) {
          return res.send('<script>alert("Contraseña incorrecta"); window.location="/login";</script>');
        }
        paginaDestino = "/tableroAdmin";
        break;

      case "Supervisor":
        if (usuario.password !== contrasenaUsuario) {
          return res.send('<script>alert("Contraseña incorrecta"); window.location="/login";</script>');
        }
        paginaDestino = "/tableroSupervisor";
        break;

      default:
        if (usuario.password !== contrasenaUsuario) {
          return res.send('<script>alert("Contraseña incorrecta"); window.location="/login";</script>');
        }
        paginaDestino = "/tableroUsuario";
        break;
    }

    req.session.usuario = usuario;
    res.redirect(paginaDestino);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.redirect("/login?error=general");
  }
};

export const cerrarSesion = (req, res) => {
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
  res.render("admin/usuario", { usuarios: rows, titulo: titulo,  message: "Sin resultados encontrados" });
};

export const createUsuarios = async (req, res) => {
  const newUsuario = req.body;

  try {
    // Iniciar la transacción
    await pool.query("START TRANSACTION");

    // Verificar si ya existe un usuario con el mismo username, correo o teléfono
    const [existingUsers] = await pool.query(
      "SELECT * FROM usuarios WHERE username = ? OR email = ?",
      [newUsuario.username, newUsuario.email]
    );

    // Array para almacenar los tipos de datos duplicados
    const duplicatedFields = [];

    // Verificar y almacenar los tipos de datos duplicados
    existingUsers.forEach(user => {
      if (user.username === newUsuario.username) {
        duplicatedFields.push("Nombre de usuario");
      }
      if (user.email === newUsuario.email) {
        duplicatedFields.push("Correo electrónico");
      }
    });

    // Si hay datos duplicados, construir el mensaje de error y revertir la transacción
    if (duplicatedFields.length > 0) {
      const errorMessage = `Ya existe un usuario con los siguientes datos: ${duplicatedFields.join(", ")}`;
      await pool.query("ROLLBACK");

      // Enviar alerta al usuario con el mensaje de error
      return res.send(
        `<script>alert(${JSON.stringify(errorMessage)}); window.location.href = "/registro";</script>`
      );
    }

    // Si no existe, proceder con la inserción del nuevo usuario
    await pool.query("INSERT INTO usuarios SET ?", [newUsuario]);

    // Confirmar la transacción
    await pool.query("COMMIT");

    res.redirect("/usuario");
  } catch (error) {
    console.error("Error al crear usuario:", error);

    // Revertir la transacción en caso de error
    await pool.query("ROLLBACK");

    res.redirect("/registro"); // Maneja el error como desees
  }
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
    // Iniciar la transacción
    await pool.query("START TRANSACTION");

    await pool.query("UPDATE usuarios set ? WHERE id = ?", [newusuario, id]);

    // Confirmar la transacción
    await pool.query("COMMIT");

    res.redirect("/usuario");
  } catch (error) {
    console.error("Error al actualizar usuario:", error);

    // Revertir la transacción en caso de error
    await pool.query("ROLLBACK");

    res.redirect("/usuario"); // Maneja el error como desees
  }
};

export const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Iniciar la transacción
    await pool.query("START TRANSACTION");

    const result = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
    if (result.affectedRows === 1) {
      // Confirmar la transacción
      await pool.query("COMMIT");

      res.send('<script>alert("Usuario eliminado exitosamente"); window.location="/usuario";</script>');
    } else {
      res.redirect("/usuario");
    }
  } catch (error) {
    console.error("Error al eliminar usuario:", error);

    // Revertir la transacción en caso de error
    await pool.query("ROLLBACK");

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).send('<script>alert("No puedes eliminar este usuario porque tiene citas asociadas"); window.location="/usuario";</script>');
    } else {
      res.status(500).send('<script>alert("Ocurrió un error al eliminar el usuario"); window.location="/usuario";</script>');
    }
  }
};

export const buscarUsuario = async (req, res) => {
  const { username } = req.query;

  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE username LIKE ?", [`%${username}%`]);

    const usuarios = rows.map(usuario => ({
      id: usuario.id,
      nombreCompleto: usuario.nombreCompleto,
      apellidos: usuario.apellidos,
      username: usuario.username,
      email: usuario.email,
      telefono: usuario.telefono,
      role: usuario.role
    }));

    const titulo = "Usuarios encontrados";

    res.render("admin/usuario", { usuarios: rows, titulo: titulo, message: "Sin resultados encontrados" })
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    res.redirect("/error");
  }
};

export const renderConsultaUsuarios = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM usuarios");
  const titulo = "Consulta de usuarios";
  res.render("supervisor/consultaUsuarios", { usuarios: rows, titulo: titulo,  message: "Sin resultados encontrados" });
};
 
export const renderConsultaPersonal = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM administrador");
  const titulo = "Consulta de personal";
  res.render("supervisor/consultaPersonal", { usuarios: rows, titulo: titulo,  message: "Sin resultados encontrados" });
};

export const generarPDFPersonal = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM administrador"
    );

    const pdf = new PDFDocument();
    const fileName = `reporte_de_personal.pdf`;
    const filePath = `./src/public/${fileName}`;
    
    pdf.text('Reporte de Personal', { align: 'center' });
    pdf.moveDown();
    rows.forEach(usuario => {
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
    
    pdf.pipe(fs.createWriteStream(filePath)).on('finish', () => {
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
    const [rows] = await pool.query(
      "SELECT * FROM usuarios"
    );

    const pdf = new PDFDocument();
    const fileName = `reporte_de_usuarios.pdf`;
    const filePath = `./src/public/${fileName}`;
    
    pdf.text('Reporte de Usuarios', { align: 'center' });
    pdf.moveDown();
    rows.forEach(usuario => {
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
    
    pdf.pipe(fs.createWriteStream(filePath)).on('finish', () => {
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
  res.render("supervisor/personal", { titulo: titulo,  message: "Sin resultados encontrados" });
};

export const createUsuariosPersonal = async (req, res) => {
  const newUsuario = req.body;

  try {
    // Iniciar la transacción
    await pool.query("START TRANSACTION");

    // Verificar si ya existe un usuario con el mismo username, correo o teléfono
    const [existingUsers] = await pool.query(
      "SELECT * FROM administrador WHERE username = ? OR email = ?",
      [newUsuario.username, newUsuario.email]
    );

    // Array para almacenar los tipos de datos duplicados
    const duplicatedFields = [];

    // Verificar y almacenar los tipos de datos duplicados
    existingUsers.forEach(user => {
      if (user.username === newUsuario.username) {
        duplicatedFields.push("Nombre de usuario");
      }
      if (user.email === newUsuario.email) {
        duplicatedFields.push("Correo electrónico");
      }
    });

    // Si hay datos duplicados, construir el mensaje de error y revertir la transacción
    if (duplicatedFields.length > 0) {
      const errorMessage = `Ya existe un usuario con los siguientes datos: ${duplicatedFields.join(", ")}`;
      await pool.query("ROLLBACK");

      // Enviar alerta al usuario con el mensaje de error
      return res.send(
        `<script>alert(${JSON.stringify(errorMessage)}); window.location.href = "/personal";</script>`
      );
    }

    // Si no existe, proceder con la inserción del nuevo usuario
    await pool.query("INSERT INTO administrador SET ?", [newUsuario]);

    // Confirmar la transacción
    await pool.query("COMMIT");

    res.redirect("/tableroSupervisor");
  } catch (error) {
    console.error("Error al crear usuario:", error);

    // Revertir la transacción en caso de error
    await pool.query("ROLLBACK");

    res.redirect("/tableroSupervisor"); // Maneja el error como desees
  }
};

export const updateUsuarioRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    // Iniciar la transacción
    await pool.query("START TRANSACTION");

    await pool.query("UPDATE administrador SET role = ? WHERE id = ?", [role, id]);

    // Confirmar la transacción
    await pool.query("COMMIT");

    res.redirect("/consultaPersonal");
  } catch (error) {
    console.error("Error al actualizar el rol del usuario:", error);

    // Revertir la transacción en caso de error
    await pool.query("ROLLBACK");

    res.status(500).send('<script>alert("Ocurrió un error al actualizar el rol del usuario"); window.location="/consultaPersonal";</script>');
  }
};
