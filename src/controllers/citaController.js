import { pool } from "../db.js";
import { format } from 'date-fns';


export const renderAgenda = async (req, res) => {
  const titulo = "Agendar cita";
  res.render("usuarioG/agenda", { titulo: titulo });
};

function escapeWithSpaces(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/[&<>"'\/\\]/g, function(match) {
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
  const [rows] = await pool.query("SELECT * FROM citas");

  const citasFormatted = rows.map(cita => ({
    id: cita.id,
    fecha: format(new Date(cita.fecha), "EEEE dd 'de' MMMM 'de' yyyy"),
    descripcion: escapeWithSpaces(cita.descripcion),
    estatus: escapeWithSpaces(cita.estatus)
  }));

  const titulo = "Consulta de citas";

  res.render("admin/citas", { citas: citasFormatted, titulo: titulo });
};


export const createCita = async (req, res) => {
  const newCita = req.body;
  await pool.query("INSERT INTO citas SET ?", [newCita]);
  res.redirect("/tableroUsuario");
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
  await pool.query("UPDATE citas SET ? WHERE id = ?", [newCita, id]);
  res.redirect("/citas");
};

export const deleteCita = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM citas WHERE id = ?", [id]);
  if (result.affectedRows === 1) {
    res.json({ message: "Cita deleted" });
  }
  res.redirect("/citas");
};
