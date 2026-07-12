"""add fcm_token to employees

Revision ID: a1f3c2e4b5d6
Revises:
Create Date: 2026-07-12

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "a1f3c2e4b5d6"
down_revision: Union[str, None] = "824066dd7a2d"
branch_labels: Union[Sequence[str], None] = None
depends_on: Union[Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("employees", sa.Column("fcm_token", sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column("employees", "fcm_token")
