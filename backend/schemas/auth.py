from pydantic import BaseModel, Field


class UserProfileFields(BaseModel):
    real_name: str | None = None
    age: int | None = Field(None, ge=1, le=150, description="年龄")
    gender: str | None = Field(None, max_length=16, description="性别")
    contact: str | None = Field(None, max_length=128, description="联系方式（电话/微信号）")
    college: str | None = Field(None, max_length=128, description="学院")
    major: str | None = Field(None, max_length=128, description="专业")
    student_id: str | None = Field(None, max_length=64, description="学号")


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=64, description="姓名（登录账号）")
    password: str = Field(..., min_length=6, max_length=64, description="密码")
    real_name: str | None = Field(None, max_length=64, description="姓名")
    age: int | None = Field(None, ge=1, le=150, description="年龄")
    gender: str | None = Field(None, max_length=16, description="性别")
    contact: str | None = Field(None, max_length=128, description="联系方式")
    college: str | None = Field(None, max_length=128, description="学院")
    major: str | None = Field(None, max_length=128, description="专业")
    student_id: str | None = Field(None, max_length=64, description="学号")


class LoginRequest(BaseModel):
    username: str = Field(..., description="姓名")
    password: str = Field(..., description="密码")


class UserInfo(UserProfileFields):
    id: str
    username: str
    nickname: str | None = None
    avatar_url: str | None = None


class ProfileUpdateRequest(BaseModel):
    avatar_url: str | None = Field(None, max_length=512, description="头像URL")
    real_name: str | None = Field(None, max_length=64, description="姓名")
    age: int | None = Field(None, ge=1, le=150, description="年龄")
    gender: str | None = Field(None, max_length=16, description="性别")
    contact: str | None = Field(None, max_length=128, description="联系方式")
    college: str | None = Field(None, max_length=128, description="学院")
    major: str | None = Field(None, max_length=128, description="专业")
    student_id: str | None = Field(None, max_length=64, description="学号")


class LoginResponse(BaseModel):
    errCode: int = 0
    errMsg: str = "success"
    data: dict = Field(default_factory=dict)  # { "access_token": str, "token_type": "bearer", "user": UserInfo }
