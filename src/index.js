import fs from "fs";
import "dotenv/config";
import commandLineArgs from "command-line-args";
import inquirer from "inquirer";

import Client from "./client.js";
import { generateYFM, parseDate, format } from "./formatter.js";

function save(title, created, content, resources, baseDir) {
    const date = parseDate(created);
    const filepath = `${baseDir}/${date.join("/")}`;
    fs.mkdirSync(`${filepath}/imgs`, { recursive: true });

    fs.writeFileSync(
        `${filepath}/${title}.md`,
        format(content, resources, filepath, title)
    );
    console.log(`saved files to ${filepath}`);
}

function getOptions() {
    const optionDefinitions = [{
            name: "dist",
            alias: "d",
            type: String,
            defaultValue: "./downloads",
        },
        {
            name: "notebook",
            alias: "b",
            type: String,
        },
        {
            name: "num",
            alias: "n",
            type: Number,
            defaultValue: 0,
        },
        {
            name: "offset",
            alias: "o",
            type: Number,
            defaultValue: 0,
        },
    ];
    const options = commandLineArgs(optionDefinitions);
    if (!options.notebook) {
        console.error("notebook name is required");
        process.exit(1);
    }
    return options;
}

async function getToken() {
    let token = process.env.ACCESS_TOKEN;
    if (!token) {
        const answers = await inquirer.prompt([{
            name: "token",
            message: "enter your personal access token for evernote",
            type: "password",
        }, ]);
        token = answers.token;
        fs.writeFileSync(".env", `ACCESS_TOKEN='${token}'`);
    }
    return token;
}

export default async function main() {
    const options = getOptions();
    const token = await getToken();
    const client = new Client(token);
    const notebooks = await client.getNotebook();
    const notebook = notebooks.find(
        (notebook) => notebook.name === options.notebook
    );

    if (!notebook) {
        console.error(`notebook named "${options.notebook}" does not exist.`);
        process.exit(1);
    }

    const guid = notebook.guid;
    const noteCounts = await client.getNoteCounts(guid);

    console.log(`${noteCounts} found in notebook "${notebook.name}"`);

    const notes = [];
    if (options.num < 250) {
        notes.push(
            ...(await client.getNoteList(guid, options.offset, options.num))
        );
    } else {
        for (let i = 0; i < noteCounts % 250; i++) {
            const offset = i * 250;
            notes.push(...(await client.getNoteList(guid, offset, 250)));
        }
    }

    for (let i = 0; i < notes.length; i++) {
        const note = await client
            .getNote(notes[i].guid)
            .catch((e) => console.error(e));
        console.log(`${i}: ${note.title}`);
        const content =
            generateYFM(
                note.title,
                notebook.name,
                note.created,
                note.updated,
                note.guid
            ) + note.content;
        const resources = note.resources ? note.resources : [];
        save(note.title, note.created, content, resources, options.dist);
    }
}