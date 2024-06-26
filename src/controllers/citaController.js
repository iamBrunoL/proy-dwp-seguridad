import { pool } from "../db.js";
import fs from "fs";
import PDFDocument from "pdfkit";

export const renderAgenda = async (req, res) => {
  const titulo = "Agendar cita";
  res.render("usuarioG/agenda", { titulo: titulo });
};

function escapeWithSpaces(text) {
  if (typeof text !== "string") return text;
  return text.replace(/[&<>"'\/\\]/g, function (match) {
    switch (match) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      case "/":
        return "&#x2F;";
      case "\\":
        return "&#92;";
      default:
        return match;
    }
  });
}

export const renderCitas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT citas.id, DATE_FORMAT(citas.fechaRegistro, '%W %d de %M de %Y') AS fechaFormateada, usuarios.nombreCompleto AS nombreUsuario, citas.descripcion, citas.estatus, citas.motivo  FROM citas JOIN usuarios ON citas.id_usuario = usuarios.id"
    );

    const citasFormatted = rows.map((cita) => ({
      id: cita.id,
      fecha: cita.fechaFormateada,
      motivo: cita.motivo,
      nombreUsuario: cita.nombreUsuario,
      descripcion: escapeWithSpaces(cita.descripcion),
      estatus: escapeWithSpaces(cita.estatus),
    }));

    const titulo = "Consulta de citas";
    // Registro de log
    const usuario = req.session.usuario;
    let crearLog = `Consulta general de citas realizada por: ${
      usuario.username
    } a las ${new Date().toLocaleString()}`;
    pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
    res.render("admin/citas", {
      citas: citasFormatted,
      titulo: titulo,
      message: "Sin resultados encontrados",
    });
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.redirect("/error");
  }
};


const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const createCita = async (req, res) => {
  const newCita = req.body;
  const usuarioId = req.session.usuario.id;
  newCita.id_usuario = usuarioId;

  // Asignar la fecha actual al campo fechaRegistro
  newCita.fechaRegistro = getCurrentDate();

  // Calcular la fecha programada entre 15 y 20 días siguientes a la fecha actual
  const fechaActual = new Date();
  const fechaProgramada = new Date();
  fechaProgramada.setDate(fechaActual.getDate() + Math.floor(Math.random() * 6) + 15);
  newCita.fechaProgramada = fechaProgramada.toISOString().split('T')[0]; // Convertir a formato YYYY-MM-DD

  try {
    await pool.query("START TRANSACTION");
    await pool.query("INSERT INTO citas SET ?", [newCita]);
    await pool.query("COMMIT");
    // Registro de log
    const usuario = req.session.usuario;
    let crearLog = `Creación de nueva cita realizada por: ${
      usuario.username
    } a las ${new Date().toLocaleString()}`;
    pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
    return res.send(
      '<script>alert("Registro de cita exitoso"); window.location="/tableroUsuario";</script>'
    );
  } catch (error) {
    console.error("Error al crear cita:", error);
    await pool.query("ROLLBACK");
    +res.redirect("/error");
  }
};


export const editCita = async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query("SELECT * FROM citas WHERE id = ?", [id]);
  const titulo = "Actualizar datos de cita";
  res.render("admin/citas_edit", { cita: result[0], titulo: titulo });
};

export const updateCita = async (req, res) => {
  const { id } = req.params;
  const newCita = req.body;

  try {
    await pool.query("START TRANSACTION");
    await pool.query("UPDATE citas SET ? WHERE id = ?", [newCita, id]);
    // Registro de log
    const usuario = req.session.usuario;
    let crearLog = `Actualización de datos de cita con id ${id} realizada por: ${
      usuario.username
    } a las ${new Date().toLocaleString()}`;
    pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
    await pool.query("COMMIT");
    return res.send(
      '<script>alert("Actualización exitosa"); window.location="/citas";</script>'
    );
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    await pool.query("ROLLBACK");
    res.redirect("/error");
  }
};

export const deleteCita = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM citas WHERE id = ?", [id]);
  // Registro de log
  const usuario = req.session.usuario;
  let crearLog = `Eliminación de cita con id ${id} realizada por: ${
    usuario.username
  } a las ${new Date().toLocaleString()}`;
  pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
  if (result.affectedRows === 1) {
    res.json({ message: "Cita deleted" });
  }
  return res.send(
    '<script>alert("Eliminación de cita realizada correctamente"); window.location="/citas";</script>'
  );
};

export const renderMisCitas = async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;
    const [rows] = await pool.query(
      "SELECT * FROM citas WHERE id_usuario = ?",
      [usuarioId]
    );

    // Registro de log
    const usuario = req.session.usuario;
    let crearLog = `Consulta general de citas asignadas al usuario realizada por: ${
      usuario.username
    } a las ${new Date().toLocaleString()}`;
    pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);

    const citasFormatted = rows.map((cita) => ({
      id: cita.id,
      fechaRegistro: formatDate(cita.fechaRegistro),
      id_usuario: cita.id_usuario,
      motivo: cita.motivo,
      descripcion: cita.descripcion,
      lugar: cita.lugar,
      fechaProgramada: formatDate(cita.fechaProgramada),
      estatus: cita.estatus,
    }));

    const titulo = "Mis Citas";

    res.render("usuarioG/verCitas", {
      citas: citasFormatted,
      titulo: titulo,
      message: "Sin resultados encontrados",
    });
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.redirect("/error");
  }
};

const formatDate = (dateString) => {
  if (dateString === "1899-11-30") return "Sin asignar";

  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const buscarCitaPorId = async (req, res) => {
  const { idCita } = req.query;

  try {
    if (idCita) {
      const [rows] = await pool.query("SELECT * FROM citas WHERE id = ?", [
        idCita,
      ]);

      const citasFormatted = rows.map((cita) => ({
        id: cita.id,
        fechaRegistro: formatDate(cita.fechaRegistro),
        id_usuario: cita.id_usuario,
        nombreUsuario: cita.nombreUsuario,
        motivo: cita.motivo,
        descripcion: cita.descripcion,
        lugar: cita.lugar,
        fechaProgramada: formatDate(cita.fechaProgramada),
        estatus: cita.estatus,
      }));

      const titulo = "Citas encontradas";
       // Registro de log
       const usuario = req.session.usuario;
       let crearLog = `Búsqueda de cita con id ${idCita} realizada por: ${
         usuario.username
       } a las ${new Date().toLocaleString()}`;
       pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);

      res.render("admin/citas", {
        citas: citasFormatted,
        titulo: titulo,
        message: "Sin resultados encontrados",
      });
    } else {
      const [rows] = await pool.query(
        "SELECT citas.id, DATE_FORMAT(citas.fechaRegistro, '%W %d de %M de %Y') AS fechaFormateada, usuarios.nombreCompleto AS nombreUsuario, citas.descripcion, citas.estatus, citas.motivo  FROM citas JOIN usuarios ON citas.id_usuario = usuarios.id"
      );

      const citasFormatted = rows.map((cita) => ({
        id: cita.id,
        fecha: cita.fechaFormateada,
        motivo: cita.motivo,
        nombreUsuario: cita.nombreUsuario,
        descripcion: escapeWithSpaces(cita.descripcion),
        estatus: escapeWithSpaces(cita.estatus),
      }));

      const titulo = "Consulta de citas";
      res.render("admin/citas", {
        citas: citasFormatted,
        titulo: titulo,
        message: "Sin resultados encontrados",
      });
    }
  } catch (error) {
    console.error("Error al buscar cita por ID:", error);
    res.redirect("/error");
  }
};

export const renderConsultaCitas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT citas.id, DATE_FORMAT(citas.fechaRegistro, '%W %d de %M de %Y') AS fechaFormateada, usuarios.nombreCompleto AS nombreUsuario, citas.descripcion, citas.estatus, citas.motivo  FROM citas JOIN usuarios ON citas.id_usuario = usuarios.id"
    );

    const citasFormatted = rows.map((cita) => ({
      id: cita.id,
      fecha: cita.fechaFormateada,
      motivo: cita.motivo,
      nombreUsuario: cita.nombreUsuario,
      descripcion: escapeWithSpaces(cita.descripcion),
      estatus: escapeWithSpaces(cita.estatus),
    }));

    const titulo = "Consulta de citas";
    // Registro de log
    const usuario = req.session.usuario;
    let crearLog = `Consulta general de citas realizada por el supervisor: ${
      usuario.username
    } a las ${new Date().toLocaleString()}`;
    pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
    res.render("supervisor/consultaCitas", {
      citas: citasFormatted,
      titulo: titulo,
      message: "Sin resultados encontrados",
    });
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.redirect("/error");
  }
};

export const generarPDFCitas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT citas.id, DATE_FORMAT(citas.fechaRegistro, '%W %d de %M de %Y') AS fechaFormateada, usuarios.nombreCompleto AS nombreUsuario, citas.descripcion, citas.estatus, citas.motivo, citas.lugar, citas.fechaProgramada  FROM citas JOIN usuarios ON citas.id_usuario = usuarios.id"
    );

    const pdf = new PDFDocument();
    const fileName = `reporte_de_citas.pdf`;
    const filePath = `./src/public/${fileName}`;

    // Registro de log
    const usuario = req.session.usuario;
    let crearLog = `Creación de reporte de citas realizado por el supervisor: ${
      usuario.username
    } a las ${new Date().toLocaleString()}`;
    pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);

    pdf.text("Reporte de Citas", { align: "center" });
    pdf.moveDown();
    rows.forEach((cita) => {
      pdf.text(`ID: ${cita.id}`);
      pdf.text(`Fecha: ${cita.fechaFormateada}`);
      pdf.text(`Nombre del usuario: ${cita.nombreUsuario}`);
      pdf.text(`Motivo: ${cita.motivo}`);
      pdf.text(`Descripción: ${cita.descripcion}`);
      pdf.text(`Lugar de la cita: ${cita.lugar}`);
      pdf.text(`Estatus: ${cita.estatus}`);
      pdf.text(`Fecha programada: ${cita.fechaProgramada}`);
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
    console.error("Error al generar PDF de citas:", error);
    res.redirect("/error");
  }
};

export const generarPDFMiCita = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(`
      SELECT citas.motivo, citas.descripcion, citas.id, citas.lugar, citas.id_usuario, citas.estatus, DATE_FORMAT(citas.fechaProgramada, '%W %d de %M de %Y') AS fechaProgramada,  DATE_FORMAT(citas.fechaRegistro, '%W %d de %M de %Y') AS fechaRegistro,  usuarios.nombreCompleto AS nombreUsuario, usuarios.apellidos AS apellidosUsuario
      FROM citas
      JOIN usuarios ON citas.id_usuario = usuarios.id
      WHERE citas.id = ?
    `, [id]);

    if (result.length === 0) {
      return res.status(404).send("Cita no encontrada");
    }

    const cita = result[0];

    const pdf = new PDFDocument();
    const fileName = `datos_de_cita_${cita.id}.pdf`;
    const filePath = `./src/public/${fileName}`;

    const usuario = req.session.usuario;
    let crearLog = `Creación de informe de cita con id ${cita.id} del usuario: ${
      usuario.username
    } a las ${new Date().toLocaleString()}`;
    pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);

    // Obtener la fecha y hora actual
    const fechaActual = new Date().toLocaleString();

    // Agregar título y detalles de la cita
    pdf.text(`SapphireNetworks`, { align: "center" });
    pdf.moveDown();
    pdf.text(`Datos de la cita número ${cita.id} asignada al usuario con ID: ${cita.id_usuario}.`);
    pdf.moveDown();
    pdf.moveDown();
    
    pdf.text(`Número de la cita: ${cita.id}.`);
    pdf.text(`Fecha de registro: ${cita.fechaRegistro}.`);
    pdf.text(`Nombre completo del usuario: ${cita.nombreUsuario} ${cita.apellidosUsuario}.`); // Aquí obtenemos el nombre del usuario
    pdf.text(`Motivo de la cita: ${cita.motivo}.`);
    pdf.text(`Descripción: ${cita.descripcion}.`);
    pdf.text(`Lugar asignado para la cita: ${cita.lugar}.`);
    pdf.text(`Fecha programada: ${cita.fechaProgramada}.`);
    pdf.text(`Estatus: ${cita.estatus}.`);
    pdf.moveDown();
    pdf.moveDown();
    pdf.moveDown();
    pdf.moveDown();
    pdf.moveDown();

    // Agregar la fecha actual y la información del usuario al inicio del PDF
    pdf.text(`Fecha y hora de impresión: ${fechaActual}.`);
    pdf.text(`Generado por el usuario con ID: ${usuario.id}.`);
    pdf.moveDown();
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
    console.error("Error al generar PDF de la cita:", error);
    res.redirect("/error");
  }
};
