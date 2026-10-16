CREATE TABLE IF NOT EXISTS `user` (
  `id` varchar(255) NOT NULL,
  `email` varchar(512) NOT NULL,
  `emailVerified` tinyint(1) NOT NULL DEFAULT 0,
  `name` longtext DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `image` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `session` (
  `id` varchar(255) NOT NULL,
  `expiresAt` datetime(6) NOT NULL,
  `token` varchar(512) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `ipAddress` longtext DEFAULT NULL,
  `userAgent` longtext DEFAULT NULL,
  `userId` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token_key` (`token`),
  KEY `session_userId_fkey` (`userId`),
  CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `account` (
  `id` varchar(255) NOT NULL,
  `accountId` longtext NOT NULL,
  `providerId` longtext NOT NULL,
  `userId` varchar(255) NOT NULL,
  `accessToken` longtext DEFAULT NULL,
  `refreshToken` longtext DEFAULT NULL,
  `idToken` longtext DEFAULT NULL,
  `accessTokenExpiresAt` datetime(6) DEFAULT NULL,
  `refreshTokenExpiresAt` datetime(6) DEFAULT NULL,
  `scope` longtext DEFAULT NULL,
  `password` longtext DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `issuer` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `account_userId_fkey` (`userId`),
  CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `verification` (
  `id` varchar(255) NOT NULL,
  `identifier` longtext NOT NULL,
  `value` longtext NOT NULL,
  `expiresAt` datetime(6) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
