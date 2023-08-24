import { useState } from 'react';
import { TaskProps } from '../utils/types';
import { Note } from './Note';
import { Note as NoteType } from '../utils/types';
interface TaskWriteProps extends TaskProps {
    initialNote?: NoteType;
}

const TaskWrite = ({ task, onSubmit, onSkip, initialNote }: TaskWriteProps) => {
    const mockNote: NoteType = {
        noteName: '',
        noteContent: '',
        noteLastModified: '',
        folder: 0,
    };
    const [currentNote, setCurrentNote] = useState<NoteType>(
        initialNote || mockNote,
    );

    const handleNoteChange = (updatedNote: NoteType) => {
        setCurrentNote(updatedNote);
    };

    const handleAnswer = async () => {
        // Save the note first

        const answer = {
            type: task.type,
            answerText: currentNote.noteContent ?? '',
            answerNote: currentNote.id,
        };

        onSubmit(answer);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">{task.taskName}</h2>
            <p className="text-lg">{task.taskDescription}</p>

            {/* Render the Note component for writing the task */}
            <Note
                note={initialNote || mockNote}
                onNoteChange={handleNoteChange}
            />

            <div className="flex justify-between">
                <button
                    className="w-1/2 rounded-xl border-2 bg-tiviElectricPurple-100 p-4"
                    onClick={handleAnswer}
                >
                    Submit
                </button>
                <button
                    className="w-1/2 rounded-xl border-2 bg-gray-500 p-4"
                    onClick={onSkip}
                >
                    Skip
                </button>
            </div>
        </div>
    );
};

export default TaskWrite;
