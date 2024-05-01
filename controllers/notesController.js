const Note = require("../models/Note");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// @desc Get all Notes
// @route Get /notes
// @access Private

const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean();
  if (!notes?.length) {
    return res.status(400).json({ message: "No notes found" });
  }
  res.status(200).json(notes);
});

// @desc create new notes
// @route /notes
// @access Private

const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;
  // Confirm Data
  if (!user || !title || !text) {
    res.status(400).json({ message: "All fields are required" });
  }

  // Check Duplicates
  //   const duplicate = await Note.findOne({ id }).lean().exec();
  //   if (duplicate && duplicate?.user == id) {
  //     return res.status(409).json({ message: "Inc" });
  //   }
  // Create and store new Note
  const noteObject = { user, title, text };
  const note = await Note.create(noteObject);

  if (note) {
    res
      .status(201)
      .json({ message: `New note with ticket No. ${note.ticket} created` });
  } else {
    res.status(400).json({ message: "Invalid Note data received" });
  }
});

// @desc update a note
// @route PATCH /notes
// @access Private

const updateNote = asyncHandler(async (req, res) => {
  const { id, ticket, user, title, text, completed } = req.body;

  //Confirm Data
  if (
    !id ||
    !user ||
    !title ||
    !text ||
    !ticket ||
    typeof completed !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(400).json({ message: "Cannot find Note" });
  }
  if (note.ticket != ticket) {
    return res.status(400).json({ message: "Incorrect Ticket Number" });
  }

  // Check for Duplicate
  const duplicate = await Note.findOne({ ticket }).lean().exec();
  if (duplicate && duplicate._id != id) {
    return res.status(409).json({ message: "Duplicate Ticket" });
  }
  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;
  const updatedNote = await note.save();

  res.json({ message: `Note with tickect No.${updatedNote.ticket} updated` });
});

// @desc delete a note
// @route DELETE /notes
// @access Private

const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Ticket ID requried" });
  }
  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(400).json({ message: "Note does not exist" });
  }
  const result = await Note.deleteOne();
  res.json(`Ticket No. ${note.ticket} deleted`);
});

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};
