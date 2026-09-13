const mongoose = require("mongoose");
const {Schema} = mongoose;

const RepositorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description:{
        type: String,
    },
    content: [
        {
            type: String,
        },
    ],
    files: [
        {
            name: String,
            path: String,
            content: String,
            lastModified: {
                type: Date,
                default: Date.now
            },
            size: Number
        }
    ],
    visibility:{
        type: String,
        enum: ["public", "private"],
        default: "public"
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    issues: [
        {
            type: Schema.Types.ObjectId,
            ref: "Issue"
        }
    ]
});

const Repository = mongoose.model("Repository", RepositorySchema);

module.exports =  Repository;