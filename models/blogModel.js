const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const blogSchema = new mongoose.Schema(
    {
      title:{
         type:String ,
         required:true,
         trim:true
      },
      body:{
        type:String,
        required:true,
      },
      authorId:{
        type:ObjectId,
        required:true,
        ref:"Author",
      },
      tags:{type:[String],trim:true},
      category:{type:[String],trim:true,required:true},
      subcategory:{type:[String],trim:true},
      isDeleted:{type:Boolean,default:false},
      deletedAt:{type:String},
      publishedAt:{type:String},
      isPublished:{type:Boolean,default:false},
    
},{ timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);