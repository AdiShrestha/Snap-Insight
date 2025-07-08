"""create_users_and_oauth_tables

Revision ID: new_migration
Revises: 
Create Date: 2025-03-31 05:48:22.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid

# revision identifiers, used by Alembic
revision = 'new_migration'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create users table first
    op.create_table('users',
                    sa.Column('id', UUID(as_uuid=True), primary_key=True,
                              server_default=sa.text('gen_random_uuid()')),
                    sa.Column('name', sa.String(255), nullable=False),
                    sa.Column('email', sa.String(), nullable=False),
                    sa.Column('password_hash', sa.String(), nullable=False),
                    sa.Column('preferences', sa.JSON(), nullable=True),
                    sa.Column('created_at', sa.DateTime(), nullable=False,
                              server_default=sa.text('CURRENT_TIMESTAMP')),
                    sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text(
                        'CURRENT_TIMESTAMP'), server_onupdate=sa.text('CURRENT_TIMESTAMP')),
                    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Then create oauth_accounts table
    op.create_table('oauth_accounts',
                    sa.Column('id', UUID(as_uuid=True), primary_key=True,
                              server_default=sa.text('gen_random_uuid()')),
                    sa.Column('provider', sa.String(), nullable=False),
                    sa.Column('provider_id', sa.String(), nullable=False),
                    sa.Column('extra', sa.JSON(), nullable=True),
                    sa.Column('user_id', UUID(as_uuid=True), nullable=False),
                    sa.Column('created_at', sa.DateTime(), nullable=False,
                              server_default=sa.text('CURRENT_TIMESTAMP')),
                    sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text(
                        'CURRENT_TIMESTAMP'), server_onupdate=sa.text('CURRENT_TIMESTAMP')),
                    sa.ForeignKeyConstraint(
                        ['user_id'], ['users.id'], ondelete='CASCADE'),
                    )


def downgrade():
    op.drop_table('oauth_accounts')
    op.drop_table('users')
