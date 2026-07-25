PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS correlation;
DROP TABLE IF EXISTS material;

CREATE TABLE IF NOT EXISTS correlation (
    appl TEXT PRIMARY KEY,
    certi TEXT
);



CREATE TABLE IF NOT EXISTS material (
    id INTEGER PRIMARY KEY,
    appl TEXT NOT NULL,
    part TEXT,
    manufacturer TEXT,
    name TEXT,
    type TEXT,
    cl TEXT,
    report TEXT,
    issue TEXT
    -- FOREIGN KEY (appl) REFERENCES correlation (appl)
);

