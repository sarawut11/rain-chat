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

DROP TABLE IF EXISTS `setting_info`;
CREATE TABLE `setting_info` (
  `name` varchar(255) NOT NULL DEFAULT '',
  `value` varchar(255) NOT NULL DEFAULT '',
  `type` varchar(10) NOT NULL DEFAULT '',
  PRIMARY KEY (`name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;

INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("COMPANY_REV_COMPANY_EXPENSE","0.2","DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("COMPANY_REV_OWNER_SHARE", "0.3", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("COMPANY_REV_MODER_SHARE", "0.25", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("COMPANY_REV_MEMBER_SHARE", "0.25", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("POP_RAIN_BALANCE_LIMIT", "10", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("POP_RAIN_LAST_POST_USER", "200", "INT");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("STOCKPILE_RAIN_INTERVAL", "360000", "INT");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("STOCKPILE_RAIN_AMOUNT", "0.1", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("RAIN_ADS_COMING_AFTER", "5000", "INT");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("RAIN_ADS_DURATION", "10000", "INT");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("RAIN_ADS_INTERVAL", "300000", "INT");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("STATIC_ADS_INTERVAL", "300000", "INT");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("COST_PER_IMPRESSION_RAIN_ADS", "0.0005", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("COST_PER_IMPRESSION_STATIC_ADS", "0.001", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("ADS_REV_COMPANY_SHARE", "0.25", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("ADS_REV_IMP_REVENUE", "0.75", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("VITAE_POST_TIME", "10000", "INT");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("VITAE_POST_TEXT", "I love Vitae! :heart:", "STRING");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("MEMBERSHIP_PRICE_USD", "14.99", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("MEMBERSHIP_REV_COMPANY_SHARE", "0.3328885924", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("MEMBERSHIP_REV_SPONSOR_SHARE", "0.3335557038", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("SPONSOR_SHARE_FIRST", "0.5", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("SPONSOR_SHARE_SECOND", "0.25", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("SPONSOR_SHARE_THIRD", "0.25", "DOUBLE");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("TRANSACTION_REQUEST_EXPIRE", "300000", "INT");
INSERT INTO `setting_info` (`name`, `value`, `type`) VALUES("OTP_EXPIRE", "60000", "INT");