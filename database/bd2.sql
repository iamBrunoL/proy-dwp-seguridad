-- Tabla Usuarios
CREATE TABLE Usuarios (
    id INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    usuario VARCHAR(50) NOT NULL,
    correo VARCHAR(50) NOT NULL,
    contrasena VARCHAR(50) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    domicilio VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    fecha_registro DATE NOT NULL,
    fecha_consulta DATE,
    consultas_hechas INT NOT NULL
);

-- Tabla Administrador
CREATE TABLE Administrador (
    id INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    usuario VARCHAR(50) NOT NULL,
    contrasena VARCHAR(50) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    domicilio VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    rol ENUM('administrador', 'supervisor') NOT NULL
);

-- Tabla Citas
CREATE TABLE Citas (
    id INT PRIMARY KEY,
    fecha DATE NOT NULL,
    id_usuario INT NOT NULL,
    motivo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    lugar VARCHAR(100) NOT NULL,
    estatus ENUM('pendiente', 'cancelado', 'efectuado') NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id)
);

-- Tabla Reportes
CREATE TABLE Reportes (
    id INT PRIMARY KEY,
    contenido TEXT NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id)
);