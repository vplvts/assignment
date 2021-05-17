const mongoose = require("mongoose")
const validator = require("validator")

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    // for fetching the user who created this task
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    }
  },
  { timestamps: true }
)
const Task = mongoose.model("Task", taskSchema)
module.exports = Task
