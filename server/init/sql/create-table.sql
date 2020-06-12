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
# Dump of table user_info
# ------------------------------------------------------------
DROP TABLE IF EXISTS `user_info`;
CREATE TABLE `user_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL DEFAULT 'NOT NULL',
  `password` varchar(40) DEFAULT NULL,
  `name` varchar(20) DEFAULT NULL,
  `email` varchar(40) DEFAULT '',
  `avatar` varchar(250) DEFAULT '',
  `intro` varchar(100) DEFAULT NULL,
  `socketid` char(255) DEFAULT NULL,
  `sponsor` int(11) DEFAULT 1,
  `wallet_address` char(255) DEFAULT NULL,
  `balance` double DEFAULT 0,
  `pop_balance` double DEFAULT 0,
  `refcode` varchar(50) NOT NULL DEFAULT '',
  `role` varchar(20) DEFAULT 'FREE',
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table group_info
# ------------------------------------------------------------
DROP TABLE IF EXISTS `group_info`;
CREATE TABLE `group_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `to_group_id` char(100) NOT NULL DEFAULT '',
  `name` varchar(20) NOT NULL DEFAULT '',
  `group_notice` varchar(100) NOT NULL DEFAULT '',
  `creator_id` int(11) NOT NULL,
  `create_time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table group_msg
# ------------------------------------------------------------
DROP TABLE IF EXISTS `group_msg`;
CREATE TABLE `group_msg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_user` int(11) NOT NULL,
  `to_group_id` char(100) NOT NULL DEFAULT '',
  `message` text NOT NULL,
  `time` int(11) NOT NULL,
  `attachments` varchar(250) DEFAULT '''[]''',
  PRIMARY KEY (`id`),
  KEY `to_group` (`to_group_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table rain_group_msg
# ------------------------------------------------------------
DROP TABLE IF EXISTS `rain_group_msg`;
CREATE TABLE `rain_group_msg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_user` int(11) NOT NULL,
  `to_group_id` char(100) NOT NULL DEFAULT '',
  `message` text NOT NULL,
  `time` int(11) NOT NULL,
  `attachments` varchar(250) DEFAULT '''[]''',
  PRIMARY KEY (`id`),
  KEY `to_group` (`to_group_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table group_user_relation
# ------------------------------------------------------------
DROP TABLE IF EXISTS `group_user_relation`;
CREATE TABLE `group_user_relation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `to_group_id` char(100) NOT NULL DEFAULT '',
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table private_msg
# ------------------------------------------------------------
DROP TABLE IF EXISTS `private_msg`;
CREATE TABLE `private_msg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_user` int(11) NOT NULL,
  `to_user` int(11) NOT NULL,
  `message` text,
  `time` int(11) NOT NULL,
  `attachments` varchar(250) DEFAULT '[]',
  PRIMARY KEY (`id`),
  KEY `from_user` (`from_user`),
  KEY `to_user` (`to_user`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table user_user_relation
# ------------------------------------------------------------
DROP TABLE IF EXISTS `user_user_relation`;
CREATE TABLE `user_user_relation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `from_user` int(11) NOT NULL,
  `remark` varchar(10) DEFAULT '',
  `shield` tinyint(1) NOT NULL DEFAULT '0',
  `time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table ads_info
# ------------------------------------------------------------
DROP TABLE IF EXISTS `ads_info`;
CREATE TABLE `ads_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `asset_link` varchar(200) DEFAULT '',
  `impressions` int(11) DEFAULT 0,
  `link` varchar(200) DEFAULT '',
  `button_name` varchar(20) DEFAULT '',
  `title` varchar(50) DEFAULT '',
  `description` varchar(200) DEFAULT '',
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `last_time` int(11) DEFAULT 0,
  `time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table membership_info
# ------------------------------------------------------------
DROP TABLE IF EXISTS `membership_info`;
CREATE TABLE `membership_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `transaction_id` varchar(200) DEFAULT '',
  `status` tinyint(1) NOT NULL,
  `confirm_time` int(11) DEFAULT 0,
  `time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table membership_info
# ------------------------------------------------------------
DROP TABLE IF EXISTS `transaction_info`;
CREATE TABLE `transaction_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `transaction_refid` varchar(200) DEFAULT '',
  `type` varchar(200) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `confirm_time` int(11) DEFAULT 0,
  `time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;