-- --------------------------------------------------------
-- ホスト:                          127.0.0.1
-- サーバーのバージョン:                   5.5.46 - MySQL Community Server (GPL)
-- サーバー OS:                      Win32
-- HeidiSQL バージョン:               11.0.0.5919
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

DROP DATABASE IF EXISTS `activestreamhc_session`;
CREATE DATABASE IF NOT EXISTS `activestreamhc_session` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `activestreamhc_session`;

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

-- activestreamhc のデータベース構造をダンプしています
DROP DATABASE IF EXISTS `activestreamhc`;
CREATE DATABASE IF NOT EXISTS `activestreamhc` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `activestreamhc`;

--  テーブル activestreamhc.activestreamhc_log の構造をダンプしています
DROP TABLE IF EXISTS `activestreamhc_log`;
CREATE TABLE IF NOT EXISTS `activestreamhc_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uid` varchar(50) DEFAULT '0000',
  `searchscore` float DEFAULT '0',
  `picture` varchar(255) DEFAULT 'nobody.png',
  `ismask` varchar(255) DEFAULT 'なし',
  `lastdate` bigint(20) unsigned DEFAULT '1588058876474',
  `temperature` float DEFAULT '0',
  `temperaturealarm` float unsigned DEFAULT '0',
  `temperaturecorrection` float DEFAULT '0',
  `temperaturecorrectionfrquency` int(10) unsigned DEFAULT '0',
  `temperaturecorrectioninterval` int(10) unsigned DEFAULT '0',
  `temperaturemode` int(10) unsigned DEFAULT '0',
  `temperatureresult` int(10) unsigned DEFAULT '0',
  `objectage` int(10) unsigned DEFAULT '0',
  `objectsex` varchar(50) DEFAULT 'Male',
  `safetyhelmet` int(10) unsigned DEFAULT '0',
  `machinename` varchar(255) DEFAULT 'AZESTCAM0',
  `serialno` varchar(255) DEFAULT 'AZESTDEVICE0',
  `timezone` varchar(255) DEFAULT 'GMT+09:00',
  `utc` bigint(20) DEFAULT '1588114137',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8;

-- テーブル activestreamhc.activestreamhc_log: ~0 rows (約) のデータをダンプしています
/*!40000 ALTER TABLE `activestreamhc_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `activestreamhc_log` ENABLE KEYS */;

--  テーブル activestreamhc.user_info の構造をダンプしています
DROP TABLE IF EXISTS `user_info`;
CREATE TABLE IF NOT EXISTS `user_info` (
  `uid` varchar(50) NOT NULL,
  `certificatetype` varchar(50) DEFAULT 'IC',
  `birthday` varchar(50) DEFAULT 'Unknown',
  `name` varchar(50) DEFAULT 'Unknown',
  `sex` varchar(50) DEFAULT NULL,
  `country` varchar(50) DEFAULT 'Unknown',
  `province` varchar(50) DEFAULT 'Unknown',
  `city` varchar(50) DEFAULT 'Unknown',
  `state` varchar(50) DEFAULT '0',
  `deviceserialno` varchar(255) DEFAULT '',
  `photo` varchar(255) DEFAULT '',
  `item1` varchar(255) DEFAULT '',
  `item2` varchar(255) DEFAULT '',
  `item3` varchar(255) DEFAULT '',
  `item4` varchar(255) DEFAULT '',
  `item5` varchar(255) DEFAULT '',
  `item6` varchar(255) DEFAULT '',
  `item7` varchar(255) DEFAULT '',
  `item8` varchar(255) DEFAULT '',
  `item9` varchar(255) DEFAULT '',
  `item10` varchar(255) DEFAULT '',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- テーブル activestreamhc.user_info: ~1 rows (約) のデータをダンプしています
/*!40000 ALTER TABLE `user_info` DISABLE KEYS */;
INSERT INTO `user_info` (`uid`, `certificatetype`, `birthday`, `name`, `country`, `province`, `city`, `state`, `deviceserialno`, `photo`, `created_at`) VALUES
	('0000', 'IC', 'Unknown', '未登録者', 'Unknown', 'Unknown', 'Unknown', '0', NULL, NULL, '2020-06-06 20:20:49');
/*!40000 ALTER TABLE `user_info` ENABLE KEYS */;

DROP TABLE IF EXISTS `user_states`;
CREATE TABLE IF NOT EXISTS `user_states` (
  `code` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uid` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `user_states` (`uid`, `name`) VALUES
	('1696c7a0-c048-11ea-a6a6-87ade068a000', '一般利用者');

DROP TABLE IF EXISTS `user_settings`;
CREATE TABLE IF NOT EXISTS `user_settings` (
  `uid` varchar(50) NOT NULL,
  `field` varchar(255) DEFAULT '',
  `label` varchar(255) DEFAULT '',
  `required` TINYINT(0) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `user_settings` (`uid`, `field`, `label`) VALUES
	('1696c7a0-c048-11ea-a6a6-87ade068a000', 'item1', '個別ID');
INSERT INTO `user_settings` (`uid`, `field`) VALUES
	('1696c7a0-c048-11ea-a6a6-87ade068a001', 'item2');
INSERT INTO `user_settings` (`uid`, `field`) VALUES
	('1696c7a0-c048-11ea-a6a6-87ade068a002', 'item3');
INSERT INTO `user_settings` (`uid`, `field`) VALUES
	('1696c7a0-c048-11ea-a6a6-87ade068a003', 'item4');
INSERT INTO `user_settings` (`uid`, `field`) VALUES
	('1696c7a0-c048-11ea-a6a6-87ade068a004', 'item5');
INSERT INTO `user_settings` (`uid`, `field`) VALUES
	('1696c7a0-c048-11ea-a6a6-87ade068a005', 'item6');
INSERT INTO `user_settings` (`uid`, `field`) VALUES
	('1696c7a0-c048-11ea-a6a6-87ade068a006', 'item7');
INSERT INTO `user_settings` (`uid`, `field`) VALUES
	('1696c7a0-c048-11ea-a6a6-87ade068a007', 'item8');
INSERT INTO `user_settings` (`uid`, `field`) VALUES
	('1696c7a0-c048-11ea-a6a6-87ade068a008', 'item9');
INSERT INTO `user_settings` (`uid`, `field`) VALUES
	('1696c7a0-c048-11ea-a6a6-87ade068a009', 'item10');

DROP TABLE IF EXISTS `devices`;
CREATE TABLE IF NOT EXISTS `devices` (
  `uid` VARCHAR(255) NOT NULL, 
  `serialno` VARCHAR(255) NOT NULL ,
  `deviceclass` VARCHAR(255) NOT NULL ,
  `devicetype` VARCHAR(255) NOT NULL ,
  `version` VARCHAR(255) NOT NULL ,
  `activated` TINYINT(0) NOT NULL ,
  `host` VARCHAR(255) NOT NULL ,
  `username` VARCHAR(255) NOT NULL DEFAULT 'admin',
  `password` VARCHAR(255) NOT NULL DEFAULT 'admin123',
  `devicelabel` VARCHAR(255) NULL ,
  `devicename` VARCHAR(255) NULL ,
  `temperature` VARCHAR(255) NULL ,
  `backgroundimgpath` VARCHAR(255) NULL ,
  `deleted` TINYINT(0) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `queues`;
CREATE TABLE IF NOT EXISTS `queues` (
  `uid` VARCHAR(255) NOT NULL, 
  `id` bigint(20) NOT NULL,
  `serialno` varchar(255) NOT NULL,
  `method` varchar(255) NOT NULL,
  `params` text NOT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `account`;
CREATE TABLE IF NOT EXISTS `account` ( 
  `uid` VARCHAR(255) NOT NULL, 
  `tenant_code` VARCHAR(255) NOT NULL DEFAULT '0000',
  `type` int NOT NULL DEFAULT 0, 
  `email` VARCHAR(255) NOT NULL , 
  `name` VARCHAR(255) NOT NULL DEFAULT 'ActiveStreamHC ユーザー', 
  `photo` varchar(255) DEFAULT '',
  `password` VARCHAR(255) NOT NULL , 
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uid`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `account` (`uid`, `type`, `email`, `password`) VALUES
	('1696c7a0-c048-11ea-a6a6-87ade068a966', 1, 'admin', 'admin123');

DROP TABLE IF EXISTS `account_device_relationship`;
CREATE TABLE IF NOT EXISTS `account_device_relationship` ( 
  `uid` VARCHAR(255) NOT NULL, 
  `account_uid` VARCHAR(255) NOT NULL,
  `serialno` varchar(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uid`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `message`;
CREATE TABLE IF NOT EXISTS `message` ( 
  `uid` VARCHAR(255) NOT NULL, 
  `user_uid` VARCHAR(255) NOT NULL,
  `serialno` varchar(255) NOT NULL,
  `type` int NOT NULL, 
  `content` varchar(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uid`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `sequence`;
CREATE TABLE IF NOT EXISTS `sequence` (
  `uid` VARCHAR(255) NOT NULL, 
  `serialno` varchar(255) NOT NULL,
  `id` bigint(20) NOT NULL DEFAULT 0, 
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uid`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `settings`;
CREATE TABLE IF NOT EXISTS `settings` (
  `uid` VARCHAR(255) NOT NULL, 
  `key` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uid`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `settings` (`uid`, `key`, `value`, `created_at`, `updated_at`) VALUES
('1696c7a0-c048-11ea-a6a6-87ade068a000', 'isCloud', 'false', '2020-08-03 01:08:49', '2020-08-03 01:08:49'),
('1696c7a0-c048-11ea-a6a6-87ade068a001', 'host', '192.168.1.3', '2020-08-03 02:05:47', '2020-08-03 02:05:47'),
('1696c7a0-c048-11ea-a6a6-87ade068a002', 'port', '3000', '2020-08-03 02:06:16', '2020-08-03 02:06:16');

DROP TABLE IF EXISTS `processing`;
CREATE TABLE IF NOT EXISTS `processing` (
  `uid` VARCHAR(255) NOT NULL, 
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uid`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP VIEW IF EXISTS `activestreamhc_log_count_by_serialno`;
CREATE VIEW `activestreamhc_log_count_by_serialno` AS 
  SELECT serialno, COUNT(*) AS cnt FROM activestreamhc_log GROUP BY serialno;

DROP VIEW IF EXISTS `activestreamhc_log_count_today_by_serialno`;
CREATE VIEW `activestreamhc_log_count_today_by_serialno` AS 
  SELECT serialno, COUNT(*) AS cnt FROM activestreamhc_log 
  WHERE date_format(created_at, '%Y %M %d') = date_format(CURRENT_TIMESTAMP, '%Y %M %d') 
  GROUP BY serialno;

DROP VIEW IF EXISTS `activestreamhc_log_count_today_high_temperature_by_serialno`;
CREATE VIEW `activestreamhc_log_count_today_high_temperature_by_serialno` AS 
  SELECT activestreamhc_log.serialno AS serialno, COUNT(*) AS cnt 
  FROM activestreamhc_log 
  INNER JOIN devices 
  ON activestreamhc_log.serialno = devices.serialno 
  WHERE date_format(activestreamhc_log.created_at, '%Y %M %d') = date_format(CURRENT_TIMESTAMP, '%Y %M %d') 
  AND cast(activestreamhc_log.temperature as DECIMAL) > cast(devices.temperature as DECIMAL)
  GROUP BY activestreamhc_log.serialno;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;