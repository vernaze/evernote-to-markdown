import evernote from "evernote";

export default class Client {
    constructor(token) {
        if (token == "") {
            console.error("failed to get access token from .env");
            process.exit(1);
        }
        const client = new evernote.Client({
            token: token,
            sandbox: true,
        });
        if (client == null) {
            console.error("failed to initialize evernote client");
            process.exit(1);
        }
        const noteStore = client.getNoteStore();
        if (noteStore == null) {
            console.error("failed to get evernote.NoteStore");
            process.exit(1);
        }

        this.noteStore = noteStore;
    }

    async getNotebook() {
        const notebooks = await this.noteStore.listNotebooks().catch((e) => {
            console.error("failed to get notebook");
            return [];
        });
        return notebooks.map((notebook) => ({
            name: notebook.name,
            guid: notebook.guid,
        }));
    }

    async getNote(guid) {
        const noteSpec = new evernote.NoteStore.NoteResultSpec({
            includeContent: true,
            includeResourcesData: true,
        });
        return await this.noteStore
            .getNoteWithResultSpec(guid, noteSpec)
            .catch((e) => {
                console.error(e);
            });
    }

    async getNoteList(guid, offset = 0, n = 1) {
        const filter = new evernote.NoteStore.NoteFilter({
            order: 1,
            notebookGuid: guid,
        });
        const metaSpec = new evernote.NoteStore.NotesMetadataResultSpec({
            includeTitle: true,
            includeCreated: true,
            includeUpdated: true,
            includeNotebookGuid: true,
        });
        const notesMetadata = await this.noteStore
            .findNotesMetadata(filter, offset, n, metaSpec)
            .catch((e) => {
                console.error(e);
                return [];
            });
        return notesMetadata.notes;
    }

    async getNoteCounts(guid) {
        const filter = new evernote.NoteStore.NoteFilter({
            order: 1,
            notebookGuid: guid,
        });
        const metaSpec = new evernote.NoteStore.NotesMetadataResultSpec();
        const notesMetadata = await this.noteStore
            .findNotesMetadata(filter, 0, 1, metaSpec)
            .catch((e) => {
                console.error(e);
                return 0;
            });
        return notesMetadata.totalNotes;
    }
}