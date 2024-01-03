from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

# Configuration for the email service
config_email = ConnectionConfig(
    MAIL_USERNAME="osisami.oj@gmail.com",
    MAIL_PASSWORD="Osisamkay007!",
    MAIL_FROM="your_email@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_TLS=True,
    MAIL_SSL=False,
)
