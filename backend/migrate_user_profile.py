"""
用户资料字段迁移：为 users 表增加姓名、年龄、性别、联系方式、学院、专业、学号。
应用启动时自动执行，也可手动运行：python migrate_user_profile.py
"""
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

PROFILE_COLUMNS = [
    ("real_name", "VARCHAR(64) NULL COMMENT '姓名'"),
    ("age", "INT NULL COMMENT '年龄'"),
    ("gender", "VARCHAR(16) NULL COMMENT '性别'"),
    ("contact", "VARCHAR(128) NULL COMMENT '联系方式（电话/微信号）'"),
    ("college", "VARCHAR(128) NULL COMMENT '学院'"),
    ("major", "VARCHAR(128) NULL COMMENT '专业'"),
    ("student_id", "VARCHAR(64) NULL COMMENT '学号'"),
]


def _table_exists(inspector, table: str) -> bool:
    return table in inspector.get_table_names()


def _column_exists(inspector, table: str, column: str) -> bool:
    return column in {c["name"] for c in inspector.get_columns(table)}


def migrate_user_profile_schema(db: Session) -> list[str]:
    """执行幂等迁移，返回已执行步骤说明。"""
    conn = db.connection()
    inspector = inspect(conn)
    steps: list[str] = []

    if not _table_exists(inspector, "users"):
        return steps

    for column, ddl in PROFILE_COLUMNS:
        if not _column_exists(inspector, "users", column):
            conn.execute(text(f"ALTER TABLE users ADD COLUMN {column} {ddl}"))
            steps.append(f"added users.{column}")

    conn.execute(
        text("UPDATE users SET real_name = username WHERE real_name IS NULL OR TRIM(real_name) = ''")
    )
    if steps:
        steps.append("synced real_name from username for legacy rows")
    db.commit()
    return steps


if __name__ == "__main__":
    from database import SessionLocal

    session = SessionLocal()
    try:
        applied = migrate_user_profile_schema(session)
        print("Migration completed:", applied or ["no changes needed"])
    finally:
        session.close()
