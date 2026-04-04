CREATE TABLE `model_transitions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`from_model` text,
	`to_model` text NOT NULL,
	`trigger` text NOT NULL,
	`context_note` text,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`request_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`model` text NOT NULL,
	`role` text NOT NULL,
	`input_tokens` integer DEFAULT 0,
	`output_tokens` integer DEFAULT 0,
	`cache_creation_tokens` integer DEFAULT 0,
	`cache_read_tokens` integer DEFAULT 0,
	`total_tokens` integer DEFAULT 0,
	`estimated_cost_usd` integer DEFAULT 0,
	`cache_creation_ephemeral_5m` integer DEFAULT 0,
	`cache_creation_ephemeral_1h` integer DEFAULT 0,
	`is_subagent` integer DEFAULT false,
	`agent_id` text,
	`agent_type` text,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_path` text NOT NULL,
	`project_name` text NOT NULL,
	`session_hash` text NOT NULL,
	`started_at` integer NOT NULL,
	`last_activity_at` integer NOT NULL,
	`is_active` integer DEFAULT true,
	`model_config` text NOT NULL,
	`current_model` text,
	`has_subagents` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `subagents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`agent_type` text NOT NULL,
	`model` text NOT NULL,
	`spawned_at` integer NOT NULL,
	`completed_at` integer,
	`total_tokens` integer DEFAULT 0,
	`total_cost_usd` integer DEFAULT 0,
	`status` text DEFAULT 'running' NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_transitions_session_id` ON `model_transitions` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_transitions_timestamp` ON `model_transitions` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_requests_session_id` ON `requests` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_requests_timestamp` ON `requests` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_requests_model` ON `requests` (`model`);--> statement-breakpoint
CREATE INDEX `idx_requests_is_subagent` ON `requests` (`is_subagent`);--> statement-breakpoint
CREATE INDEX `idx_sessions_is_active` ON `sessions` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_sessions_project_name` ON `sessions` (`project_name`);--> statement-breakpoint
CREATE INDEX `idx_sessions_last_activity` ON `sessions` (`last_activity_at`);--> statement-breakpoint
CREATE INDEX `idx_subagents_session_id` ON `subagents` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_subagents_agent_id` ON `subagents` (`agent_id`);