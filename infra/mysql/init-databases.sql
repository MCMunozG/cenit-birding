CREATE DATABASE IF NOT EXISTS cenit_accounts CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS cenit_catalog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS cenit_observation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS cenit_community CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON cenit_accounts.* TO 'cenit'@'%';
GRANT ALL PRIVILEGES ON cenit_catalog.* TO 'cenit'@'%';
GRANT ALL PRIVILEGES ON cenit_observation.* TO 'cenit'@'%';
GRANT ALL PRIVILEGES ON cenit_community.* TO 'cenit'@'%';
FLUSH PRIVILEGES;
