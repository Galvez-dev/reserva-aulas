-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         10.4.32-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para reservas
CREATE DATABASE IF NOT EXISTS `reservas` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `reservas`;

-- Volcando estructura para tabla reservas.aula
CREATE TABLE IF NOT EXISTS `aula` (
  `id_aula` int(11) NOT NULL,
  `capacidad` int(11) NOT NULL,
  `Tipo` varchar(150) NOT NULL DEFAULT '',
  `disponible` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_aula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla reservas.aula: ~3 rows (aproximadamente)
INSERT INTO `aula` (`id_aula`, `capacidad`, `Tipo`, `disponible`) VALUES
	(10, 30, 'Sala de sistemas', 1),
	(15, 25, 'Laboratorio', 1);

-- Volcando estructura para tabla reservas.reservas
CREATE TABLE IF NOT EXISTS `reservas` (
  `id_reserva` int(11) NOT NULL AUTO_INCREMENT,
  `id_aula` int(11) DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL DEFAULT '00:00:00',
  `hora_fin` time NOT NULL DEFAULT '00:00:00',
  `id_usuario` int(11) NOT NULL,
  PRIMARY KEY (`id_reserva`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_aula` (`id_aula`),
  CONSTRAINT `FK_reservas_aula` FOREIGN KEY (`id_aula`) REFERENCES `aula` (`id_aula`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_reservas_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla reservas.reservas: ~5 rows (aproximadamente)
INSERT INTO `reservas` (`id_reserva`, `id_aula`, `fecha`, `hora_inicio`, `hora_fin`, `id_usuario`) VALUES
	(3, 10, '2025-03-27', '00:00:00', '00:05:00', 10022223),
	(8, 10, '2025-07-10', '09:00:00', '11:00:00', 1008746321),
	(10, 10, '2025-06-12', '04:00:00', '05:00:00', 1006229746),
	(13, 10, '2025-06-12', '06:00:00', '07:08:00', 1006229746),
	(16, 15, '2025-06-12', '05:15:00', '06:15:00', 1006229746);

-- Volcando estructura para tabla reservas.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `id_reserva` int(11) DEFAULT NULL,
  `rol` varchar(50) NOT NULL DEFAULT '',
  `correo` varchar(50) NOT NULL DEFAULT '',
  `nombre` varchar(50) NOT NULL DEFAULT '',
  `telefono` varchar(50) NOT NULL DEFAULT '',
  `contrasena` varchar(50) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  KEY `id_reserva` (`id_reserva`),
  CONSTRAINT `FK__reservas` FOREIGN KEY (`id_reserva`) REFERENCES `reservas` (`id_reserva`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla reservas.usuarios: ~4 rows (aproximadamente)
INSERT INTO `usuarios` (`id_usuario`, `id_reserva`, `rol`, `correo`, `nombre`, `telefono`, `contrasena`) VALUES
	(10022223, 3, 'Estudiante', 'LauraGal@gmail.com', 'Valentina Galvez', '3123567834', 'abcedario23'),
	(123414112, NULL, 'Estudiante', 'alejo@gmail.com', 'alejandro ramirez', '3245678923', 'alejo2705mister'),
	(1006229746, NULL, 'administrador', 'Miguel@gmail', 'Luis Miguel Becerra', '3133456789', 'colombia23'),
	(1008746321, NULL, 'maestro', 'camilotesla1@gmail.com', ' Juan Camilo Cristancho', '3022712323', 'phoenix123');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
