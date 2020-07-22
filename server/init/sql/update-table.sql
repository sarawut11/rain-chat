# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: localhost (MySQL 5.7.22)
# Database: rain-chat
# Generation Time: 2019-07-29 03:01:21 +0000
# ************************************************************
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

ALTER TABLE `user_info` 
CHANGE COLUMN `password` `password` VARCHAR(40) NULL DEFAULT '' ,
CHANGE COLUMN `name` `name` VARCHAR(20) NULL DEFAULT '' ,
CHANGE COLUMN `intro` `intro` VARCHAR(100) NULL DEFAULT '' ,
CHANGE COLUMN `walletAddress` `walletAddress` CHAR(255) NULL DEFAULT '' ;