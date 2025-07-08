# import os
# import sys
# from logging.config import fileConfig

# from sqlalchemy import engine_from_config
# from sqlalchemy import pool
# from alembic import context
# from dotenv import load_dotenv

# # Add project root to Python path
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# # Load environment variables
# load_dotenv()

# # Alembic Config object
# config = context.config

# # Enable logging if config file exists
# if config.config_file_name is not None:
#     fileConfig(config.config_file_name)

# # Import metadata
# try:
#     from v1.db.schema import Base
#     print(
#         f"Found tables: {', '.join(table.name for table in Base.metadata.tables.values() if table.name != 'alembic_version')}")
#     target_metadata = Base.metadata
# except ImportError as e:
#     print(f"Error importing from project1.db.schema: {e}")
#     try:
#         from v1.db.schema import Base
#         target_metadata = Base.metadata
#     except ImportError as e2:
#         print(f"Error importing from db.schema: {e2}")
#         target_metadata = None


# def get_url():
#     """Get database URL using environment variables for synchronous connections."""
#     user = os.getenv("POSTGRES_USER")
#     password = os.getenv("POSTGRES_PASSWORD")
#     host = os.getenv("DB_HOST", "localhost")
#     port = os.getenv("DB_PORT", "5432")
#     db = os.getenv("POSTGRES_DB")

#     if not all([user, password, db]):
#         missing = []
#         if not user:
#             missing.append("POSTGRES_USER")
#         if not password:
#             missing.append("POSTGRES_PASSWORD")
#         if not db:
#             missing.append("POSTGRES_DB")
#         raise ValueError(
#             f"Missing required environment variables: {', '.join(missing)}")

#     # Use synchronous driver for migrations
#     return f"postgresql://{user}:{password}@{host}:{port}/{db}"


# def run_migrations_offline() -> None:
#     """Run migrations in 'offline' mode."""
#     url = get_url()
#     context.configure(
#         url=url,
#         target_metadata=target_metadata,
#         literal_binds=True,
#         dialect_opts={"paramstyle": "named"},
#     )

#     with context.begin_transaction():
#         context.run_migrations()


# def do_run_migrations(connection):
#     context.configure(connection=connection, target_metadata=target_metadata)
#     with context.begin_transaction():
#         context.run_migrations()


# def run_migrations_sync() -> None:
#     """Run migrations using a synchronous engine."""
#     configuration = config.get_section(config.config_ini_section, {})
#     configuration["sqlalchemy.url"] = get_url()

#     connectable = engine_from_config(
#         configuration,
#         prefix="sqlalchemy.",
#         poolclass=pool.NullPool,
#     )

#     with connectable.connect() as connection:
#         context.configure(
#             connection=connection, target_metadata=target_metadata
#         )

#         with context.begin_transaction():
#             context.run_migrations()


# def run_migrations_online() -> None:
#     """Run migrations in 'online' mode."""
#     run_migrations_sync()


# if context.is_offline_mode():
#     run_migrations_offline()
# else:
#     run_migrations_online()


import os
import sys
from logging.config import fileConfig
from logging import getLogger
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
from dotenv import load_dotenv

# Configure logging
logger = getLogger('alembic')

# Add project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# Load environment variables
load_dotenv()

# Alembic Config object
config = context.config

# Enable logging if config file exists
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import metadata with better error handling and logging


def import_metadata():
    try:
        from database import Base
        tables = [table.name for table in Base.metadata.tables.values()
                  if table.name != 'alembic_version']
        logger.info(f"Found tables: {', '.join(tables)}")
        return Base.metadata
    except ImportError as e:
        logger.warning(f"Error importing from database: {e}")
        try:
            # Fallback import attempt
            from v1.db.schema import Base
            tables = [table.name for table in Base.metadata.tables.values()
                      if table.name != 'alembic_version']
            logger.info(f"Found tables: {', '.join(tables)}")
            return Base.metadata
        except ImportError as e2:
            logger.error(f"Failed to import schema: {e2}")
            return None


target_metadata = import_metadata()


def get_url():
    """
    Get database URL using environment variables with Docker compatibility.
    """
    # Environment variables with defaults suitable for Docker
    config = {
        "user": os.getenv("POSTGRES_USER"),
        "password": os.getenv("POSTGRES_PASSWORD"),
        "host": os.getenv("DB_HOST", "localhost"),  # Default to 'localhost' for local development
        "port": os.getenv("DB_PORT", "5432"),
        "db": os.getenv("POSTGRES_DB")
    }

    # Validate required environment variables
    missing = [k for k, v in config.items() if k in [
        'user', 'password', 'db'] and not v]
    if missing:
        raise ValueError(
            f"Missing required environment variables: "
            f"{', '.join(f'POSTGRES_{k.upper()}' for k in missing)}"
        )

    # Construct URL with proper escaping
    return (f"postgresql://{config['user']}:{config['password']}"
            f"@{config['host']}:{config['port']}/{config['db']}")


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode for generating SQL scripts.
    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,  # Enable type comparison
        compare_server_default=True,  # Compare server defaults
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    """Execute migration in a context."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_sync() -> None:
    """Run migrations using a synchronous engine."""
    try:
        # Get alembic section configuration
        configuration = config.get_section(config.config_ini_section, {})
        configuration["sqlalchemy.url"] = get_url()

        # Configure the engine
        connectable = engine_from_config(
            configuration,
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
        )

        with connectable.connect() as connection:
            do_run_migrations(connection)

        logger.info("Migration completed successfully")
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        raise


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    run_migrations_sync()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
