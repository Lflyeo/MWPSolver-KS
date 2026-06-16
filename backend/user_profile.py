"""用户资料字段的共享读写逻辑。"""
from models.user import User

PROFILE_FIELD_NAMES = ("real_name", "age", "gender", "contact", "college", "major", "student_id")


def user_display_name(user: User | None) -> str | None:
    """对外展示用的姓名（优先 real_name，兼容旧数据 username）。"""
    if not user:
        return None
    name = (user.real_name or user.username or "").strip()
    return name or None


def find_user_by_name(db, name: str) -> User | None:
    """按姓名登录：匹配 username 或 real_name。"""
    from sqlalchemy import or_

    trimmed = name.strip()
    if not trimmed:
        return None
    return db.query(User).filter(or_(User.username == trimmed, User.real_name == trimmed)).first()


def name_taken(db, name: str, exclude_user_id: str | None = None) -> bool:
    """检查姓名是否已被占用（username / real_name 均不可重复）。"""
    from sqlalchemy import or_

    trimmed = name.strip()
    if not trimmed:
        return False
    query = db.query(User).filter(or_(User.username == trimmed, User.real_name == trimmed))
    if exclude_user_id:
        query = query.filter(User.id != exclude_user_id)
    return query.first() is not None


def user_profile_dict(user: User, *, include_created_at: bool = False) -> dict:
    """将 User 转为 API 返回的资料字典（不含密码）。"""
    data = {
        "id": user.id,
        "username": user.username,
        "nickname": user.nickname,
        "avatar_url": user.avatar_url,
        "real_name": user.real_name or user.username,
        "age": user.age,
        "gender": user.gender,
        "contact": user.contact,
        "college": user.college,
        "major": user.major,
        "student_id": user.student_id,
    }
    if include_created_at:
        data["created_at"] = user.created_at.isoformat() if user.created_at else None
    return data


def user_brief_dict(user: User | None) -> dict:
    """管理端列表中附带的用户简要信息。"""
    if not user:
        return {
            "username": None,
            "nickname": None,
            "real_name": None,
            "age": None,
            "gender": None,
            "contact": None,
            "college": None,
            "major": None,
            "student_id": None,
        }
    display = user_display_name(user)
    return {
        "username": user.username,
        "nickname": user.nickname,
        "real_name": display,
        "age": user.age,
        "gender": user.gender,
        "contact": user.contact,
        "college": user.college,
        "major": user.major,
        "student_id": user.student_id,
    }


def user_profile_fields_dict(user: User | None) -> dict:
    """仅返回扩展资料字段（不含 username/nickname）。"""
    brief = user_brief_dict(user)
    return {k: brief[k] for k in PROFILE_FIELD_NAMES}


def apply_profile_update(user: User, req, db=None) -> str | None:
    """根据请求体更新用户资料字段。若 db 传入且修改姓名，会同步 username。返回错误信息或 None。"""
    if req.avatar_url is not None:
        user.avatar_url = req.avatar_url.strip() or None
    if req.real_name is not None:
        new_name = req.real_name.strip() or None
        if new_name and db and name_taken(db, new_name, user.id):
            return "该姓名已被使用"
        user.real_name = new_name
        if new_name:
            user.username = new_name
    if req.age is not None:
        user.age = req.age
    if req.gender is not None:
        user.gender = req.gender.strip() or None
    if req.contact is not None:
        user.contact = req.contact.strip() or None
    if req.college is not None:
        user.college = req.college.strip() or None
    if req.major is not None:
        user.major = req.major.strip() or None
    if req.student_id is not None:
        user.student_id = req.student_id.strip() or None
    return None


def user_keyword_filter(kw: str):
    """管理端用户关键字搜索条件（姓名、学号、学院、专业）。"""
    from sqlalchemy import or_, and_

    pattern = f"%{kw.strip()}%"
    return or_(
        User.username.like(pattern),
        and_(User.real_name.isnot(None), User.real_name.like(pattern)),
        and_(User.student_id.isnot(None), User.student_id.like(pattern)),
        and_(User.college.isnot(None), User.college.like(pattern)),
        and_(User.major.isnot(None), User.major.like(pattern)),
    )
