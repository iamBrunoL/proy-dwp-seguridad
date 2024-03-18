import { pool } from "../db.js";

export const renderRegistro = async (req, res) => {
  res.render("registro");
};

export const renderPrincipal = async (req, res) => {
  res.render("principal");
};

export const renderUsuarios = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM usuarios");
  res.render("admin/usuario", { usuarios: rows });
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
  res.render("admin/usuarios_edit", { usuario: result[0] });
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
