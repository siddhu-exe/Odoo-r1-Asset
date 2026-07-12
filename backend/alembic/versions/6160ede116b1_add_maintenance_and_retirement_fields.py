"""add_maintenance_and_retirement_fields

Revision ID: 6160ede116b1
Revises: a1f3c2e4b5d6
Create Date: 2026-07-12 14:15:05.186089

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '6160ede116b1'
down_revision: Union[str, None] = 'a1f3c2e4b5d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('assets', sa.Column('next_maintenance_date', sa.Date(), nullable=True))
    op.add_column('assets', sa.Column('expected_lifespan_years', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('assets', 'expected_lifespan_years')
    op.drop_column('assets', 'next_maintenance_date')
