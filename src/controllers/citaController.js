import { pool } from "../db.js";
import fs from 'fs';
import PDFDocument from 'pdfkit';

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

    res.render("admin/citas", { citas: citasFormatted, titulo: titulo, message: "Sin resultados encontrados" });
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.redirect("/error");
  }
};


export const createCita = async (req, res) => {
  const newCita = req.body;
  const usuarioId = req.session.usuario.id;
  newCita.id_usuario = usuarioId;

  try {
    // Iniciar la transacción
    await pool.query("START TRANSACTION");

    await pool.query("INSERT INTO citas SET ?", [newCita]);

    // Confirmar la transacción
    await pool.query("COMMIT");

    res.redirect("/tableroUsuario");
  } catch (error) {
    console.error("Error al crear cita:", error);

    // Revertir la transacción en caso de error
    await pool.query("ROLLBACK");

    res.redirect("/error"); // Maneja el error como desees
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
    // Iniciar la transacción
    await pool.query("START TRANSACTION");

    await pool.query("UPDATE citas SET ? WHERE id = ?", [newCita, id]);

    // Confirmar la transacción
    await pool.query("COMMIT");

    res.redirect("/citas");
  } catch (error) {
    console.error("Error al actualizar cita:", error);

    // Revertir la transacción en caso de error
    await pool.query("ROLLBACK");

    res.redirect("/error"); // Maneja el error como desees
  }
};

export const deleteCita = async (req, res) => {
  const { id } = req.params;

  try {
    // Iniciar la transacción
    await pool.query("START TRANSACTION");

    await pool.query("DELETE FROM citas WHERE id = ?", [id]);

    // Confirmar la transacción
    await pool.query("COMMIT");

    res.redirect("/citas");
  } catch (error) {
    console.error("Error al eliminar cita:", error);

    // Revertir la transacción en caso de error
    await pool.query("ROLLBACK");

    res.redirect("/error"); // Maneja el error como desees
  }
};

export const renderMisCitas = async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id; // Obtener el ID del usuario actual
    const [rows] = await pool.query(
      "SELECT * FROM citas WHERE id_usuario = ?",
      [usuarioId]
    );

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

    res.render("usuarioG/verCitas", { citas: citasFormatted, titulo: titulo,  message: "Sin resultados encontrados" });
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
      // Si se proporciona un ID de cita específico, buscar esa cita
      const [rows] = await pool.query("SELECT * FROM citas WHERE id = ?", [idCita]);

      const citasFormatted = rows.map((cita) => ({
        id: cita.id,
        fechaRegistro: formatDate(cita.fechaRegistro),
        id_usuario: cita.id_usuario,
        nombreUsuario: cita.nombreUsuario, // Agregamos el nombre de usuario a cada cita
        motivo: cita.motivo,
        descripcion: cita.descripcion,
        lugar: cita.lugar,
        fechaProgramada: formatDate(cita.fechaProgramada),
        estatus: cita.estatus,
      }));

      const titulo = "Citas encontradas";

      res.render("admin/citas", { citas: citasFormatted, titulo: titulo, message: "Sin resultados encontrados" });
    } else {
      // Si no se proporciona un ID de cita específico, mostrar todas las citas
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

      res.render("admin/citas", { citas: citasFormatted, titulo: titulo, message: "Sin resultados encontrados" });
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

    res.render("supervisor/consultaCitas", { citas: citasFormatted, titulo: titulo, message: "Sin resultados encontrados" });
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
    
    pdf.text('Reporte de Citas', { align: 'center' });
    pdf.moveDown();
    rows.forEach(cita => {
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
    console.error("Error al generar PDF de citas:", error);
    res.redirect("/error");
  }
};