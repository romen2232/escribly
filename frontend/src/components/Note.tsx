import { useAutosave } from '../hooks/useAutosave';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FolderIcon } from '../assets/icons/Icons';
import { Folder, Note as NoteType } from '../utils/types';
import { t } from 'i18next';
import { formatDate } from '../utils/functions';
import { useNoteStore } from '../stores/noteStore';
import { destroyNote, analyzeNote } from '../services/notes';
import { parseCookies } from 'nookies';
import { AUTH_COOKIE_NAME } from '../utils/consts';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import {
    Modal,
    ModalBody,
    ModalHeader,
    ModalContent,
    useDisclosure,
} from '@nextui-org/react';
import { Tree } from './Tree';
// import { AnswerProps } from '../utils/types';
import { rootFolder } from '../services/folders';
import useVisibility from '../hooks/useVisibility';
export interface INoteProps {
    note: NoteType;
    folder?: Folder;
    onNoteChange?: (note: NoteType) => void;
    updateURL?: (folderId: number) => void;
    // onSubmit: (answer: AnswerProps) => void;
}

//TODO: Tab index is not working as intendeed
export function Note({ note, folder, onNoteChange, updateURL }: INoteProps) {
    const { currentNote, saveNote, undo, redo, localSaveNote } = useNoteStore();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [newNote, setNewNote] = useState({} as NoteType);
    const [folderTree, setFolderTree] = useState<Folder>();
    const [newFolder, setNewFolder] = useState<Folder>();
    const cookies = parseCookies();
    const [publicNote, setPublicNote] = useState(false);

    const [noteRef, isNoteVisible] = useVisibility<HTMLDivElement>();

    // Update note as soon as it's passed as prop
    useEffect(() => {
        setNewNote(note);
        setNewFolder(folder);
        setPublicNote(note.public ?? false);
    }, [note]);

    useEffect(() => {
        if (!newFolder) return;
        setNewNote({
            ...newNote,
            folder: newFolder,
            public: publicNote,
        });
        saveNote({
            ...newNote,
            folder: newFolder,
            public: publicNote,
        });
    }, [newFolder, publicNote]);

    useEffect(() => {
        if (!isNoteVisible) {
            handleUnmount(newNote);
        }
    }, [isNoteVisible]);

    // Save note on unmount
    useEffect(() => {
        updateRootFolder();

        return () => {
            handleUnmount(newNote);
        };
    }, []);

    // Keyboard shortcuts for saving, undo and redo
    useKeyboardShortcuts({
        save: async () => {
            await saveNote(newNote);
            if (onNoteChange) {
                onNoteChange(newNote);
            }
        },
        undo: () => {
            undo();
            setNewNote(currentNote);
        },
        redo: () => {
            redo();
            setNewNote(currentNote);
        },
    });

    // Autosave note every minute
    useAutosave({
        data: newNote.noteContent ?? '',
        onSave: async (data: string) => {
            const updatedNote = {
                ...newNote,
                noteLastModified: new Date().toISOString(),
                noteContent: data,
            };
            await saveNote(updatedNote);
            setNewNote(updatedNote);
        },
        interval: 60000,
    });

    /**
     * Save note on beforeunload
     * Destroy note if it's empty
     */
    const handleUnmount = async (note: NoteType) => {
        console.log(note);
        if (note.noteContent === '' && note.noteName === '' && note.id) {
            await destroyNote(note.id, cookies[AUTH_COOKIE_NAME]);
        } else {
            await saveNote({
                ...note,
                noteLastModified: formatDate(new Date()),
            });
        }
    };

    const updateRootFolder = () => {
        rootFolder(cookies[AUTH_COOKIE_NAME])
            .then((response) => {
                setFolderTree(response);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const changeFolder = (folder: Folder) => {
        setNewFolder(folder);
        if (updateURL && folder.id) {
            updateURL(folder.id);
        }
        onOpenChange();
    };

    const fadeInDown = {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
    };
    const handleAnalyzeNote = async (note: NoteType) => {
        const id = note.id;
        const token = cookies[AUTH_COOKIE_NAME];

        try {
            if (id != undefined) {
                const result = await analyzeNote(id, note, token);

                localSaveNote({
                    ...result,
                    noteLastModified: formatDate(new Date()),
                });
                console.log(result);
            }

            //TODO: Modal here
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <motion.div
            ref={noteRef}
            className="flex h-full flex-col overflow-hidden"
        >
            <header className="flex items-center justify-between">
                <div className="w-full">
                    <motion.input
                        initial="hidden"
                        animate="visible"
                        variants={fadeInDown}
                        transition={{ duration: 0.5 }}
                        type="text"
                        name="title"
                        id="title"
                        className="h-16 w-full bg-mainBackground-200 p-16 text-7xl placeholder-gray-500 focus:placeholder-gray-600 focus:outline-none"
                        placeholder={t('note.Title')}
                        autoFocus
                        autoComplete="off"
                        value={newNote.noteName ?? ''}
                        onChange={(e) =>
                            setNewNote({
                                ...newNote,
                                noteName: e.target.value,
                            })
                        }
                    />
                    <div className="pointer-events-none flex justify-between px-16">
                        <p className="text-2xl text-gray-500">
                            {formatDate(
                                new Date(newNote.noteLastModified ?? ''),
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col">
                    {newFolder?.id && (
                        <button
                            className={`hover:bg-hover:shadow  mx-16  my-2 flex h-min cursor-pointer items-center justify-between rounded-md p-3 duration-300 ease-in-out transition hover:text-primaryBlue-600 hover:shadow-lg`}
                            tabIndex={2}
                            onClick={onOpen}
                        >
                            <FolderIcon className="h-10 w-10" />
                            {(newFolder?.depth ?? 0) > 0 && (
                                <div className="px-3 text-lg">
                                    <h4 className="font-bold">
                                        {newFolder?.folderName}
                                    </h4>
                                </div>
                            )}
                        </button>
                    )}

                    <label className="flex cursor-pointer flex-col items-center justify-center">
                        <div className="relative inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={publicNote}
                                className="peer sr-only"
                                onChange={() => {
                                    setPublicNote(!publicNote);
                                }}
                            />
                            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:content-[''] after:transition-all peer-checked:bg-primaryPink-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primaryPink-200"></div>
                        </div>
                        <span className="pt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Public
                        </span>
                    </label>

                    <button
                        className={`hover:bg-hover:shadow items-center" mx-16 my-2 flex h-min cursor-pointer items-center justify-between rounded-md p-3 duration-300 ease-in-out transition hover:text-primaryBlue-600 hover:shadow-lg`}
                        tabIndex={2}
                        onClick={() => handleAnalyzeNote(newNote)}
                    >
                        <FolderIcon className="h-10 w-10" />
                    </button>
                </div>
            </header>
            <textarea
                name="text"
                id="text"
                value={newNote.noteContent ?? ''}
                onChange={(e) =>
                    setNewNote({
                        ...newNote,
                        noteContent: e.target.value,
                    })
                }
                tabIndex={1}
                className="m-24 mb-12 mt-16 h-full overflow-scroll bg-mainBackground-200 text-2xl focus:placeholder-gray-500 focus:outline-none"
                placeholder="En algún lugar de la Mancha, de cuyo nombre no quiero acordarme..."
            ></textarea>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="top-center"
                className="bg-mainBackground-200"
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>
                                <h1 className="text-2xl font-bold">
                                    {t('folders.Title')}
                                </h1>
                            </ModalHeader>
                            <ModalBody>
                                <Tree
                                    rootFolder={folderTree}
                                    onlyFolders={true}
                                    changeFolder={changeFolder}
                                />
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </motion.div>
    );
}
