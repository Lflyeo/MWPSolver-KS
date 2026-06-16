from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.sql import func
from database import Base
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(64), unique=True, nullable=False, index=True, comment="姓名（登录账号）")
    password_hash = Column(String(128), nullable=False, comment="密码哈希")
    nickname = Column(String(64), nullable=True, comment="昵称/显示名")
    avatar_url = Column(String(512), nullable=True, comment="头像 URL")
    real_name = Column(String(64), nullable=True, comment="姓名")
    age = Column(Integer, nullable=True, comment="年龄")
    gender = Column(String(16), nullable=True, comment="性别")
    contact = Column(String(128), nullable=True, comment="联系方式（电话/微信号）")
    college = Column(String(128), nullable=True, comment="学院")
    major = Column(String(128), nullable=True, comment="专业")
    student_id = Column(String(64), nullable=True, comment="学号")
    created_at = Column(DateTime, server_default=func.now(), comment="注册时间")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "nickname": self.nickname,
            "avatar_url": self.avatar_url,
            "real_name": self.real_name,
            "age": self.age,
            "gender": self.gender,
            "contact": self.contact,
            "college": self.college,
            "major": self.major,
            "student_id": self.student_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
