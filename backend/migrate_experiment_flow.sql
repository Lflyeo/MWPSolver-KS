-- 认知实验流架构迁移脚本（从旧版升级时执行，执行前请备份数据库）
USE mathpro_db;

-- 1. 创建实验流表
CREATE TABLE IF NOT EXISTS experiment_flows (
    id VARCHAR(64) PRIMARY KEY COMMENT '实验流ID',
    name VARCHAR(128) NOT NULL COMMENT '实验流名称',
    description TEXT COMMENT '描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 插入默认实验流
INSERT INTO experiment_flows (id, name, description, sort_order, enabled)
SELECT 'flow-default', '默认认知实验流', '系统内置示例实验流', 0, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM experiment_flows WHERE id = 'flow-default');

-- 3. 为题目表增加 flow_id（若列已存在会报错，可跳过此步）
-- 请逐条执行，已存在的步骤跳过即可
ALTER TABLE experiment_questions
    ADD COLUMN flow_id VARCHAR(64) NOT NULL DEFAULT 'flow-default' FIRST;

UPDATE experiment_questions SET flow_id = 'flow-default' WHERE flow_id IS NULL OR flow_id = '';

ALTER TABLE experiment_questions DROP PRIMARY KEY;
ALTER TABLE experiment_questions ADD PRIMARY KEY (flow_id, id);

ALTER TABLE experiment_questions
    ADD CONSTRAINT fk_experiment_questions_flow
    FOREIGN KEY (flow_id) REFERENCES experiment_flows(id) ON DELETE CASCADE;

-- 4. 为会话表增加 flow_id（若列已存在会报错，可跳过此步）
ALTER TABLE experiment_sessions
    ADD COLUMN flow_id VARCHAR(64) NULL AFTER id;

CREATE INDEX idx_experiment_sessions_flow_id ON experiment_sessions (flow_id);
