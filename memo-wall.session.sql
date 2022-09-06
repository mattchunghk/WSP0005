CREATE TABLE users(
    id SERIAL primary key,
    username varchar(255),
    password varchar(255),
    created_at timestamp with time zone not null,
    upadted_at timestamp with time zone
) \