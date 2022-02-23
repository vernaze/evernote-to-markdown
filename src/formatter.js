import fs from "fs";
import striptags from "striptags";
import md5 from "js-md5";

// generate YAML Front-matter string
export function generateYFM(title, category, created, updated, guid) {
    return `---
title: ${title}
category: ${category}
created: ${new Date(created)}
updated: ${new Date(updated)}
guid: ${guid}
---

`;
}

// convert unixtime to formatted string ([yyyy, mm, dd])
export function parseDate(unixtime) {
    const date = new Date(unixtime);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return [year, month, day];
}

// simple conversion from note to markdown
export function format(content, resources, filepath, filename) {
    // remove unnecessary tags
    content = content.replace(/<\/div><div>/g, "\n").replace(/<div>/g, "");
    content = striptags(content, ["en-media", "img"]);
    let suffix = 0;
    // naive replacement with regexp
    return content
        .replace(/(<en-media).*?(\/>)/g, (match) => {
            // get hash from en-media
            const regexp = /hash=".*"/;
            const hash = match.match(regexp)[0].split('"')[1];
            const resource = findResource(resources, hash);
            const extension = resource.mime.split("/")[1];
            const dist = `imgs/${filename}01_${suffix
        .toString()
        .padStart(2, "0")}.${extension}`;
            fs.writeFileSync(`${filepath}/${dist}`, resource.data.body);
            suffix++;
            return `\n![${filename}](./${dist})\n`;
        })
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
}

function findResource(resources, hash) {
    return resources.find((resource) => {
        // resource hash is MD5 checksum of the Resource body, in hexidecimal format
        const newHash = md5(resource.data.body);
        return newHash.includes(hash);
    });
}