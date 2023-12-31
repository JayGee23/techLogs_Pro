const Note = require('../models/Note')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

//description: Get all notes
//@route GET /notes
//@access Private
const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find().lean()
    if (!notes?.length) {
        return res.status(400).json({ message: 'No notes were found' })
    }

    //Add username to each note before sending the response
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username }
    }))

    res.json(notesWithUser)

})

//description: Create new note
//@route POST /notes
//@access Private
const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body

    //Confirm Data
    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    //Check for duplicate title
    const duplicate = await Note.findOne({ title }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    //Create and store new note
    const note = await Note.create({ user, title, text })

    if (note) {
        res.status(201).json({ message: `New note created: ${title}` })
    } else {
        res.status(400).json({ message: 'Invalid note data' })
    }
})

//description: Update a note
//@route PATCH /notes
//@access Private
const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body

    //Confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'Invalid data. Couldn\'t update note.' })
    }

    //Confirm note exists to update
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    //Check for duplicate
    const duplicate = await Note.findOne({ title }).lean().exec()
    //Allow updates to original note
    if (duplicate && duplicate?._id.toString !== id) {
        return res.status(409).json({ message: 'Title already exists' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json({ message: `Note: ${updatedNote.title} has been updated` })
})

//description: Delete a note
//@route DELETE /notes
//@access Private
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    //Confirm data
    if (!id) {
        return res.status(400).json({message: 'Note ID required'})
    }

    //Confirm note exists
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({message: 'Note not found'})
    }

    const result = await note.deleteOne()

    const reply = `Note: ${result.title} (ID: ${result.id}) has been deleted.`

    res.json(reply)

})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}
