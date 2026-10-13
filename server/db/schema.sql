-- server/db/schema.sql

CREATE TYPE user_role AS ENUM ('STUDENT', 'FACULTY', 'IRB_MEMBER', 'ADMIN');
CREATE TYPE review_level AS ENUM ('EXEMPTED', 'EXPEDITED', 'FULL_BOARD');
CREATE TYPE application_status AS ENUM ('SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'STUDENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    application_no VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    methodology TEXT NOT NULL,
    researcher_id INT REFERENCES users(id) ON DELETE SET NULL,
    review_level review_level DEFAULT 'EXEMPTED',
    status application_status DEFAULT 'SUBMITTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
