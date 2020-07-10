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
  `email` varchar(40) NOT NULL DEFAULT '',
  `avatar` varchar(250) DEFAULT '',
  `intro` varchar(100) DEFAULT NULL,
  `socketid` char(255) DEFAULT NULL,
  `sponsor` int(11) DEFAULT 1,
  `walletAddress` char(255) DEFAULT NULL,
  `balance` double DEFAULT 0,
  `popBalance` double DEFAULT 0,
  `refcode` varchar(50) NOT NULL DEFAULT '',
  `role` varchar(20) DEFAULT 'FREE',
  `lastUpgradeTime` int(11) NOT NULL DEFAULT 0,
  `lastVitaePostTime` int(11) NOT NULL DEFAULT 0,
  `ban` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table group_info
# ------------------------------------------------------------
DROP TABLE IF EXISTS `group_info`;
CREATE TABLE `group_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `groupId` char(100) NOT NULL DEFAULT '',
  `name` varchar(20) NOT NULL DEFAULT '',
  `description` varchar(100) NOT NULL DEFAULT '',
  `creatorId` int(11) NOT NULL,
  `createTime` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table group_msg
# ------------------------------------------------------------
DROP TABLE IF EXISTS `group_msg`;
CREATE TABLE `group_msg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fromUser` int(11) NOT NULL,
  `groupId` char(100) NOT NULL DEFAULT '',
  `message` text NOT NULL,
  `time` int(11) NOT NULL,
  `attachments` varchar(250) DEFAULT '''[]''',
  PRIMARY KEY (`id`),
  KEY `to_group` (`groupId`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table rain_group_msg
# ------------------------------------------------------------
DROP TABLE IF EXISTS `rain_group_msg`;
CREATE TABLE `rain_group_msg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fromUser` int(11) NOT NULL,
  `groupId` char(100) NOT NULL DEFAULT '',
  `message` text NOT NULL,
  `time` int(11) NOT NULL,
  `attachments` varchar(250) DEFAULT '''[]''',
  PRIMARY KEY (`id`),
  KEY `to_group` (`groupId`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table group_user_relation
# ------------------------------------------------------------
DROP TABLE IF EXISTS `group_user_relation`;
CREATE TABLE `group_user_relation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `groupId` char(100) NOT NULL DEFAULT '',
  `userId` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table private_msg
# ------------------------------------------------------------
DROP TABLE IF EXISTS `private_msg`;
CREATE TABLE `private_msg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fromUser` int(11) NOT NULL,
  `toUser` int(11) NOT NULL,
  `message` text,
  `time` int(11) NOT NULL,
  `attachments` varchar(250) DEFAULT '[]',
  PRIMARY KEY (`id`),
  KEY `fromUser` (`fromUser`),
  KEY `toUser` (`toUser`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table user_user_relation
# ------------------------------------------------------------
DROP TABLE IF EXISTS `user_user_relation`;
CREATE TABLE `user_user_relation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `fromUser` int(11) NOT NULL,
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
  `userId` int(11) NOT NULL,
  `type` tinyint(1) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `impressions` int(11) DEFAULT 0,
  `givenImp` int(11) DEFAULT 0,
  `costPerImp` double DEFAULT 0,
  `paidAmount` double DEFAULT 0,
  `title` varchar(50) DEFAULT '',
  `description` varchar(200) DEFAULT '',
  `buttonLabel` varchar(20) DEFAULT '',
  `assetLink` varchar(200) DEFAULT '',
  `link` varchar(200) DEFAULT '',
  `lastTime` int(11) DEFAULT 0,
  `time` int(11) NOT NULL,
  `reviewer` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table wallet_transaction_info
# ------------------------------------------------------------
DROP TABLE IF EXISTS `wallet_transaction_info`;
CREATE TABLE `wallet_transaction_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `transactionId` varchar(200) DEFAULT '',
  `type` tinyint(1) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `paidAmount` double NOT NULL DEFAULT 0,
  `expectAmount` double NOT NULL DEFAULT 0,
  `confirmTime` int(11) DEFAULT 0,
  `details` varchar(200) DEFAULT '',
  `time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table inner_transaction_info
# ------------------------------------------------------------
DROP TABLE IF EXISTS `inner_transaction_info`;
CREATE TABLE `inner_transaction_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `type` tinyint(1) NOT NULL DEFAULT 0,
  `amount` double NOT NULL DEFAULT 0,
  `time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table contact_ban_info
# ------------------------------------------------------------
DROP TABLE IF EXISTS `contact_ban_info`;
CREATE TABLE `contact_ban_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `blockerId` varchar(200) NOT NULL DEFAULT '',
  `type` tinyint(1) NOT NULL DEFAULT 0,
  `time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table otp_info
# ------------------------------------------------------------
DROP TABLE IF EXISTS `otp_info`;
CREATE TABLE `otp_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `code` varchar(6) NOT NULL DEFAULT '',
  `type` tinyint(1) NOT NULL DEFAULT 0,
  `time` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
# Dump of table expense_info
# ------------------------------------------------------------
DROP TABLE IF EXISTS `expense_info`;
CREATE TABLE `expense_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `docPath` varchar(200) NOT NULL DEFAULT '',
  `amount` double NOT NULL DEFAULT 0,
  `confirmCount` int(11) NOT NULL DEFAULT 0,
  `rejectCount` int(11) NOT NULL DEFAULT 0,
  `requestTime` int(11) NOT NULL DEFAULT 0,
  `confirmTime` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;