from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base

from datetime import datetime
import uuid

Base = declarative_base()


class TimestampMixin:
    created_at = Column(DateTime, nullable=False,
                        server_default=sa.text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime, nullable=False, server_default=sa.text(
        'CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP'))


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True,
                server_default=sa.text('gen_random_uuid()'))
    name = Column(String(255), nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    preferences = Column(JSON, nullable=True, default={})

    oauth_accounts = relationship(
        "OAuthAccount", back_populates="users", cascade="all, delete-orphan")


class OAuthAccount(TimestampMixin, Base):
    __tablename__ = "oauth_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True,
                server_default=sa.text('gen_random_uuid()'))
    provider = Column(String, nullable=False)
    provider_id = Column(String, nullable=False)
    extra = Column(JSON, nullable=True, default={})
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        'users.id', ondelete='CASCADE'), nullable=False)

    users = relationship("User", back_populates="oauth_accounts")
