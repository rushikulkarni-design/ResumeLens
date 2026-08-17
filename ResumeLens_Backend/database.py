from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker


DATABASE_URL = "sqlite:///./users.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    }
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()

def migrate_database():
    with engine.connect() as connection:

        result = connection.execute(
            text("PRAGMA table_info(users)")
        )

        columns = [
            row[1]
            for row in result
        ]

        if "country_code" not in columns:

            connection.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN country_code
                    VARCHAR DEFAULT '+91'
                    """
                )
            )

            connection.commit()

migrate_database()

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

def migrate_database():

    with engine.begin() as connection:

        result = connection.execute(
            text("PRAGMA table_info(users)")
        )

        existing_columns = {
            row[1]
            for row in result
        }

        if "email_notifications" not in existing_columns:

            connection.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN email_notifications
                    BOOLEAN DEFAULT 1
                    """
                )
            )

        if "product_updates" not in existing_columns:

            connection.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN product_updates
                    BOOLEAN DEFAULT 0
                    """
                )
            )

        if "retain_files" not in existing_columns:

            connection.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN retain_files
                    BOOLEAN DEFAULT 1
                    """
                )
            )