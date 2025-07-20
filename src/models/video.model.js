import mongoose, {Schema} from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoschema = new Schema(
    {
        videoFile : {
            type : String, //cloudinary url
            required : true
        },
        thumbnail : {
            type : String, //cloudinary url
            required : true
        },
        description : {
            type : String,
            required : true
        },
        title : {
            type : String, 
            required : true
        },
        duration : {
            type : Number,
            required : true
        },
        views : {
            type : Number,
            required : true
        },
        isPublishe : {
            type : Boolean,
            required : true
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }

    },
    {
        timestamps : true
    }
)

videoschema.plugin(aggregatePaginate);

export const Video = mongoose.model("Video", videoschema);