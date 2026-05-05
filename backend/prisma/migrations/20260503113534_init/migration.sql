-- CreateTable
CREATE TABLE `roles` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(32) NOT NULL,
    `description` VARCHAR(255) NULL,
    `permissions` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `github_id` BIGINT NULL,
    `username` VARCHAR(64) NOT NULL,
    `email` VARCHAR(255) NULL,
    `password_hash` VARCHAR(255) NULL,
    `avatar_url` VARCHAR(512) NULL,
    `bio` TEXT NULL,
    `role_id` CHAR(36) NULL,
    `preferences` JSON NOT NULL,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_github_id_key`(`github_id`),
    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_id_idx`(`role_id`),
    INDEX `users_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `slug` VARCHAR(64) NOT NULL,
    `description` TEXT NULL,
    `icon` VARCHAR(64) NULL,
    `parent_id` CHAR(36) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_slug_key`(`slug`),
    INDEX `categories_parent_id_idx`(`parent_id`),
    INDEX `categories_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `slug` VARCHAR(64) NOT NULL,
    `usage_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tags_name_key`(`name`),
    UNIQUE INDEX `tags_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` CHAR(36) NOT NULL,
    `github_id` BIGINT NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `description` TEXT NULL,
    `homepage_url` VARCHAR(512) NULL,
    `html_url` VARCHAR(512) NOT NULL,
    `stars` INTEGER NOT NULL DEFAULT 0,
    `forks` INTEGER NOT NULL DEFAULT 0,
    `watchers` INTEGER NOT NULL DEFAULT 0,
    `open_issues` INTEGER NOT NULL DEFAULT 0,
    `primary_language` VARCHAR(64) NULL,
    `language_stats` JSON NULL,
    `license` VARCHAR(64) NULL,
    `topics` JSON NOT NULL,
    `readme_content` LONGTEXT NULL,
    `readme_html` LONGTEXT NULL,
    `contributor_count` INTEGER NOT NULL DEFAULT 0,
    `github_created_at` DATETIME(3) NULL,
    `github_updated_at` DATETIME(3) NULL,
    `pushed_at` DATETIME(3) NULL,
    `is_archived` BOOLEAN NOT NULL DEFAULT false,
    `is_fork` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `source` VARCHAR(20) NOT NULL DEFAULT 'api',
    `avg_rating` DECIMAL(2, 1) NULL,
    `review_count` INTEGER NOT NULL DEFAULT 0,
    `category_id` CHAR(36) NULL,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `projects_github_id_key`(`github_id`),
    INDEX `projects_stars_idx`(`stars`),
    INDEX `projects_primary_language_idx`(`primary_language`),
    INDEX `projects_status_idx`(`status`),
    INDEX `projects_category_id_idx`(`category_id`),
    INDEX `projects_full_name_idx`(`full_name`),
    INDEX `projects_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_tags` (
    `project_id` CHAR(36) NOT NULL,
    `tag_id` CHAR(36) NOT NULL,
    `source` VARCHAR(20) NOT NULL DEFAULT 'github',

    INDEX `project_tags_tag_id_idx`(`tag_id`),
    PRIMARY KEY (`project_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collections` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `project_id` CHAR(36) NOT NULL,
    `group_name` VARCHAR(64) NULL DEFAULT '默认收藏夹',
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `collections_user_id_idx`(`user_id`),
    INDEX `collections_project_id_idx`(`project_id`),
    UNIQUE INDEX `collections_user_id_project_id_key`(`user_id`, `project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `project_id` CHAR(36) NOT NULL,
    `rating` TINYINT NOT NULL,
    `title` VARCHAR(255) NULL,
    `content` TEXT NULL,
    `usage_scenario` VARCHAR(20) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reviews_project_id_idx`(`project_id`),
    UNIQUE INDEX `reviews_user_id_project_id_key`(`user_id`, `project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `project_id` CHAR(36) NOT NULL,
    `parent_id` CHAR(36) NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `comments_project_id_idx`(`project_id`),
    INDEX `comments_parent_id_idx`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_snapshots` (
    `id` CHAR(36) NOT NULL,
    `project_id` CHAR(36) NOT NULL,
    `stars` INTEGER NOT NULL,
    `forks` INTEGER NOT NULL,
    `open_issues` INTEGER NOT NULL,
    `snapshot_date` DATE NOT NULL,

    INDEX `project_snapshots_project_id_idx`(`project_id`),
    INDEX `project_snapshots_snapshot_date_idx`(`snapshot_date`),
    UNIQUE INDEX `project_snapshots_project_id_snapshot_date_key`(`project_id`, `snapshot_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_tags` ADD CONSTRAINT `project_tags_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_tags` ADD CONSTRAINT `project_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collections` ADD CONSTRAINT `collections_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collections` ADD CONSTRAINT `collections_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_snapshots` ADD CONSTRAINT `project_snapshots_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
