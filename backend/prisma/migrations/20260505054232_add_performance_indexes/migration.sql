-- DropIndex
DROP INDEX `view_history_created_at_idx` ON `view_history`;

-- CreateIndex
CREATE INDEX `projects_pushed_at_idx` ON `projects`(`pushed_at`);

-- CreateIndex
CREATE INDEX `projects_github_created_at_idx` ON `projects`(`github_created_at`);

-- CreateIndex
CREATE INDEX `reviews_user_id_idx` ON `reviews`(`user_id`);

-- CreateIndex
CREATE INDEX `subscriptions_enabled_type_value_idx` ON `subscriptions`(`enabled`, `type`, `value`);

-- CreateIndex
CREATE INDEX `view_history_user_id_created_at_idx` ON `view_history`(`user_id`, `created_at`);

-- RenameIndex
ALTER TABLE `comments` RENAME INDEX `comments_user_id_fkey` TO `comments_user_id_idx`;
