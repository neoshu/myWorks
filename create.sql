PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS correlation;
DROP TABLE IF EXISTS material;
DROP TABLE IF EXISTS appl_report;


CREATE TABLE IF NOT EXISTS correlation (
    id INTEGER PRIMARY KEY,
    appl TEXT,
    certi TEXT,
    former TEXT
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

CREATE TABLE IF NOT EXISTS appl_report (
    id INTEGER PRIMARY KEY,
    appl TEXT,
    report TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);