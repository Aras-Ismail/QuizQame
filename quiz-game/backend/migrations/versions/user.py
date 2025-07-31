"""create users table

Revision ID: 20250716abc1
Revises: 
Create Date: 2025-07-16 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '20250716abc1'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('username', sa.String(10), nullable=False, unique=True),
        sa.Column('password', sa.String(10), nullable=False)
    )


def downgrade():
    op.drop_table('users')

