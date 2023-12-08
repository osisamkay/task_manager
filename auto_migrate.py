from alembic import command
from alembic.config import Config

# Load Alembic configuration from alembic.ini file
alembic_cfg = Config("alembic.ini")

# Run the migration command
command.revision(alembic_cfg, autogenerate=True, message="Add email column to User model")

# Run the upgrade command to apply the changes
command.upgrade(alembic_cfg, "head")
