-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-04-2024 a las 08:19:13
-- Versión del servidor: 10.4.27-MariaDB
-- Versión de PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `proy-dwp`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `datos` ()   BEGIN
    SELECT c.id, u.username, u.telefono, c.motivo, c.descripcion, c.lugar, c.fechaProgramada, c.estatus
    FROM usuarios u
    JOIN citas c ON u.id = c.id_usuario;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `verCitas` ()   BEGIN
    SELECT citas.id AS id_cita, citas.descripcion, citas.estatus, usuarios.username AS nombre_usuario
    FROM citas
    INNER JOIN usuarios ON citas.id_usuario = usuarios.id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administrador`
--

CREATE TABLE `administrador` (
  `id` int(11) NOT NULL,
  `nombreCompleto` varchar(50) NOT NULL,
  `apellidos` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(50) NOT NULL,
  `telefono` bigint(11) NOT NULL,
  `domicilio` varchar(100) NOT NULL,
  `fechaNacimiento` date NOT NULL,
  `role` enum('Administrador','Supervisor') NOT NULL,
  `fechaRegistro` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `administrador`
--

INSERT INTO `administrador` (`id`, `nombreCompleto`, `apellidos`, `username`, `email`, `password`, `telefono`, `domicilio`, `fechaNacimiento`, `role`, `fechaRegistro`) VALUES
(1, 'Evelin', 'Contreras', 'evelin', 'eve@gmail.com', '1234567890', 1111111111, 'Hgghy gygg', '2024-01-01', 'Supervisor', '0000-00-00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas`
--

CREATE TABLE `citas` (
  `id` int(11) NOT NULL,
  `fechaRegistro` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) NOT NULL,
  `motivo` varchar(50) NOT NULL,
  `descripcion` text NOT NULL,
  `lugar` varchar(255) NOT NULL DEFAULT 'Sin asignar',
  `fechaProgramada` date NOT NULL,
  `estatus` enum('Pendiente','Cancelado','Efectuado') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombreCompleto` varchar(50) NOT NULL,
  `apellidos` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(50) NOT NULL,
  `telefono` bigint(11) NOT NULL,
  `domicilio` varchar(100) NOT NULL,
  `fechaNacimiento` date NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'Usuario general',
  `fechaRegistro` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `usuarios`
--
DELIMITER $$
CREATE TRIGGER `eliminar_citas_despues_borrado_usuario` AFTER DELETE ON `usuarios` FOR EACH ROW BEGIN
    DELETE FROM citas WHERE id_usuario = OLD.id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_usuarios_administrador`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_usuarios_administrador` (
`id` int(11)
,`nombreCompleto` varchar(50)
,`apellidos` varchar(50)
,`username` varchar(50)
,`email` varchar(255)
,`telefono` bigint(20)
,`role` varchar(255)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_usuarios_administrador`
--
DROP TABLE IF EXISTS `vista_usuarios_administrador`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_usuarios_administrador`  AS SELECT `usuarios`.`id` AS `id`, `usuarios`.`nombreCompleto` AS `nombreCompleto`, `usuarios`.`apellidos` AS `apellidos`, `usuarios`.`username` AS `username`, `usuarios`.`email` AS `email`, `usuarios`.`telefono` AS `telefono`, `usuarios`.`role` AS `role` FROM `usuarios` union select `administrador`.`id` AS `id`,`administrador`.`nombreCompleto` AS `nombreCompleto`,`administrador`.`apellidos` AS `apellidos`,`administrador`.`username` AS `username`,`administrador`.`email` AS `email`,`administrador`.`telefono` AS `telefono`,`administrador`.`role` AS `role` from `administrador`  ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`,`email`,`telefono`);

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`,`telefono`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administrador`
--
ALTER TABLE `administrador`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `fk_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
