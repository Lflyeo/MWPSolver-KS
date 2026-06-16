"""
认知实验库表迁移：将旧版（无 experiment_flows / flow_id）升级到实验流架构。
应用启动时自动执行，也可手动运行：python migrate_experiment.py
"""
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

DEFAULT_FLOW_ID = "flow-default"
DEFAULT_FLOW_NAME = "默认认知实验流"
DEFAULT_FLOW_DESC = "系统内置示例实验流，包含数学应用题。"


def _table_exists(inspector, table: str) -> bool:
    return table in inspector.get_table_names()


def _column_exists(inspector, table: str, column: str) -> bool:
    return column in {c["name"] for c in inspector.get_columns(table)}


def _exec(conn, sql: str):
    conn.execute(text(sql))


def migrate_experiment_schema(db: Session) -> list[str]:
    """执行幂等迁移，返回已执行步骤说明。"""
    conn = db.connection()
    inspector = inspect(conn)
    steps: list[str] = []

    if not _table_exists(inspector, "experiment_flows"):
        _exec(
            conn,
            """
            CREATE TABLE experiment_flows (
                id VARCHAR(64) PRIMARY KEY COMMENT '实验流ID',
                name VARCHAR(128) NOT NULL COMMENT '实验流名称',
                description TEXT COMMENT '描述',
                sort_order INT DEFAULT 0 COMMENT '排序',
                enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
                rest_break_enabled TINYINT(1) DEFAULT 1 COMMENT '题间是否休息',
                rest_break_seconds INT DEFAULT 5 COMMENT '题间休息秒数',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """,
        )
        steps.append("created experiment_flows")

    _exec(
        conn,
        f"""
        INSERT INTO experiment_flows (id, name, description, sort_order, enabled)
        SELECT '{DEFAULT_FLOW_ID}', '{DEFAULT_FLOW_NAME}', '{DEFAULT_FLOW_DESC}', 0, 1
        FROM DUAL
        WHERE NOT EXISTS (SELECT 1 FROM experiment_flows WHERE id = '{DEFAULT_FLOW_ID}')
        """,
    )
    steps.append("ensured default flow")

    if _table_exists(inspector, "experiment_questions"):
        if not _column_exists(inspector, "experiment_questions", "flow_id"):
            _exec(
                conn,
                f"""
                ALTER TABLE experiment_questions
                ADD COLUMN flow_id VARCHAR(64) NOT NULL DEFAULT '{DEFAULT_FLOW_ID}' FIRST
                """,
            )
            steps.append("added experiment_questions.flow_id")

            _exec(conn, "ALTER TABLE experiment_questions DROP PRIMARY KEY")
            _exec(conn, "ALTER TABLE experiment_questions ADD PRIMARY KEY (flow_id, id)")
            steps.append("updated experiment_questions primary key")

            try:
                _exec(
                    conn,
                    """
                    ALTER TABLE experiment_questions
                    ADD CONSTRAINT fk_experiment_questions_flow
                    FOREIGN KEY (flow_id) REFERENCES experiment_flows(id) ON DELETE CASCADE
                    """,
                )
                steps.append("added experiment_questions foreign key")
            except Exception:
                pass
        else:
            _exec(
                conn,
                f"UPDATE experiment_questions SET flow_id = '{DEFAULT_FLOW_ID}' WHERE flow_id IS NULL OR flow_id = ''",
            )

    if _table_exists(inspector, "experiment_sessions"):
        if not _column_exists(inspector, "experiment_sessions", "flow_id"):
            _exec(
                conn,
                "ALTER TABLE experiment_sessions ADD COLUMN flow_id VARCHAR(64) NULL AFTER id",
            )
            steps.append("added experiment_sessions.flow_id")
            try:
                _exec(conn, "CREATE INDEX idx_experiment_sessions_flow_id ON experiment_sessions (flow_id)")
            except Exception:
                pass

    if _table_exists(inspector, "experiment_flows"):
        if not _column_exists(inspector, "experiment_flows", "rest_break_enabled"):
            _exec(
                conn,
                "ALTER TABLE experiment_flows ADD COLUMN rest_break_enabled TINYINT(1) DEFAULT 1 COMMENT '题间是否休息'",
            )
            steps.append("added experiment_flows.rest_break_enabled")
        if not _column_exists(inspector, "experiment_flows", "rest_break_seconds"):
            _exec(
                conn,
                "ALTER TABLE experiment_flows ADD COLUMN rest_break_seconds INT DEFAULT 5 COMMENT '题间休息秒数'",
            )
            steps.append("added experiment_flows.rest_break_seconds")

    db.commit()
    return steps


if __name__ == "__main__":
    from database import SessionLocal

    session = SessionLocal()
    try:
        applied = migrate_experiment_schema(session)
        print("Migration completed:", applied or ["no changes needed"])
    finally:
        session.close()
