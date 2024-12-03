import { promises as fs } from 'fs';
import sqlite3 from 'sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Enable verbose mode for sqlite3
sqlite3.verbose();

const db = new sqlite3.Database('project_files.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS files (
        uuid TEXT PRIMARY KEY,
        file_path TEXT,
        file_name TEXT,
        extension TEXT,
        description TEXT,
        converted BOOLEAN,
        converted_date TEXT,
        converted_notes TEXT,
        dependencies TEXT,
        dependent_to TEXT,
        created_at TEXT,
        updated_at TEXT,
        resulting_file_paths TEXT,
        package_dependencies TEXT
    )`);
});

async function scanDirectory(directory, baseDirectory) {
    const files = await fs.readdir(directory, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(directory, file.name);
        if (file.isDirectory()) {
            await scanDirectory(fullPath, baseDirectory);
        } else {
            const relativePath = path.relative(baseDirectory, fullPath);
            const fileName = path.basename(file.name, path.extname(file.name));
            const extension = path.extname(file.name);
            const description = null;
            const dependencies = null;
            const dependentTo = null;
            const resulting_file_paths = null;
            const packageDependencies = null;
            const uuid = uuidv4();
            const createdAt = new Date().toISOString();
            const updatedAt = createdAt;

            db.run(`INSERT INTO files (
                file_path, file_name, extension, description,
                converted, converted_date, converted_notes,
                dependencies, dependent_to, uuid, created_at, updated_at, resulting_file_paths, package_dependencies
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                relativePath, fileName, extension, description,
                0, null, null,
                dependencies, dependentTo, uuid, createdAt, updatedAt, resulting_file_paths, packageDependencies
            ]);
        }
    }
}

scanDirectory('/Users/pablohernandezsanz/Local Sites/toconvert', '/Users/pablohernandezsanz/Local Sites/toconvert').then(() => {
    db.close();
    console.log("File scan completed.");
}).catch(console.error);
