const BlogModel = require("../models/blogModel.js"); 

const AuthorModel = require('../models/authorModel')

const validation  = require("../validator/validation");

const moment= require("moment")

let {isValidObjectId} = validation


/*-----------------------------------CREATING BLOG-----------------------------------------------------*/

const createBlog= async function(req,res){
    try{

    let data= req.body
    let {title,body,authorId}=data //Destructuring

    if(!title||!body||!authorId){  
       return res.status(400).send({status:false,msg:"this field  must be present"}) //Checking attributes
    }
    if(!isValidObjectId(authorId)){
       return res.status(400).send({status:false,msg:"authorId is invalid"}) //Checking authorId
    }

    let find_author_Id = await AuthorModel.findById(req.body.authorId)
    if(!find_author_Id){
        return res.status(400).send({status:false,msg:"AuthoId is wrong"})
    }

    if(req.body.isPublished){
       data["publishedAt"]=moment().format()
    }

    let blogData= await BlogModel.create(data)
     res.status(201).send({status:true,data:blogData})

    }
    catch(error){
        res.status(404).send({msg:error.message})
    }

}

module.exports.createBlog=createBlog 


/*---------------------------------GETTING-BLOG-WITH-AUTHOR------------------------------------------------*/

const getblogwithauthor = async function(req,res){
    let authorId = req.query.authorId
    try{
       let blogs = await BlogModel.find({authorId:{$eq:authorId}}).populate("authorId")
       console.log(blogs)
       if(blogs.length==0){
        return res.status(404).send({message:"Blog Not Found"})
       }
       res.status(200).send({msg:blogs})
    }
    catch(error){
          res.status(500).send({status:true,message:error.message})
    }
    
}

module.exports.getblogwithauthor = getblogwithauthor


/*---------------------------------GET-FILTERED-BLOGS------------------------------------------------*/

const getblog = async function(req,res){
    try{
        const data1 = req.query
        
        const {authorId,category,tags,subcategory}= data1

        data1["isDeleted"] = false
        data1["isPublished"] = true

        if(!data1.authorId){
            return res.status(400).send({status:false,msg:"AutherId is required"})
        }
       
             
/* ---------------Authorisation--------------------- */

        if(req.verifyToken.authorId !== authorId){
            console.log("Authorisation Failed")
                return  res.status(401).send({status:false,msg:"not Authorized"})
           }

/* -------------------------------------------- */


     let filterblog= await BlogModel.find(data1).populate("authorId")
             console.log(filterblog.length)
                       if(filterblog.length>0){
                               res.status(200).send({status:true,data:filterblog})
                        }
                        else if(filterblog.length == 0){
                            res.status(404).send({status:false,message:"Data Not Matched"})
                        }
                        else {
                             res.status(200).send({status:false,data:filterblog})
                        } 
              
        
    }

    catch(error){
         return  res.status(500).send({message:error.message})
        }
    
}

module.exports.getblog = getblog


/*---------------------------------UPDATE-BLOG------------------------------------------------*/

const updatedBlog= async function (req,res){
    try {

        let alldata=req.body  
        let blogId=req.params.blogId;
    
    if(Object.keys(alldata).length==0)
    return res.status(400).send({status:false,msg:"plz enter blog details for updating"})
     
    if(!blogId)
    return res.status(400).send({status:false,msg:" blogId is required"})

    let findBlogId = await BlogModel.findById(blogId);

    if(!findBlogId){
        return res.status(404).send({status:false,msg:"Blog Not Found"})
    }
     
      if(findBlogId.isDeleted==true){
        return res.status(404).send({status:false,msg:"Blog already deleted"})
      }

   let authorId= findBlogId.authorId.toString()

/* ---------------Authorisation--------------------- */

   if(req.verifyToken.authorId !== authorId){
    console.log("Authorisation Failed")
        return  res.status(401).send({status:false,msg:"not Authorized"})
   }

/* -------------------------------------------- */

      let updatedBlog=await BlogModel.findOneAndUpdate(
        {_id:blogId},
        {
        $set : {
          title:alldata.title,
          body:alldata.body,
          category:alldata.category,
          publishedAt:moment().format(), 
          isPublished:true
        },
        $push:{tags:req.body.tags, subcategory:req.body.subcategory},
        },
        {new:true}
      )
      return res.status(200).send({status:true,msg:updatedBlog})
    
    } catch (error) {
        res.status(500).send({status:false,msg:error.message})
    } 
 }

 module.exports.updatedBlog = updatedBlog


/*-------------------------------------DELETE-BLOG--------------------------------------------*/
  
  
const deleteBlog=async function(req,res){

    try{

   const blogId= req.params.blogId

   if(!isValidObjectId(blogId)){
    return res.status(400).send({status:false,msg:"blogId is invalid"})
    }

   let blog= await BlogModel.findById(blogId)

   if(!blog){
    return res.status(400).send({status:false,msg:"Blog not found"})
   }

   if(!blog.isDeleted==false){  
    return res.status(400).send({status:false,msg:"blog does not exist"})
   }

   let authorId=blog.authorId.toString()

/* --------------Authorisation--------------------- */

   if(req.verifyToken.authorId !== authorId){
    console.log("Authorisation Failed")
     return res.status(401).send({status:false,msg:"not authorised"})
   }

/* -------------------------------------------- */

   let markDeleted= await BlogModel.findOneAndUpdate(
    {_id:blogId},
    {$set:{isDeleted:true,deletedAt:moment().format()}},
    {new:true}
    )
   res.status(200).send({msg:"Data Deleted"})
}

    catch(error){
       res.status(500).send({status:false,msg:error.message})
      }
}

module.exports.deleteBlog=deleteBlog

/* ------------------------------------DELETE-BLOG-BY-QUERY------------------------------------------------ */


const deleteDocument=async function(req,res){

    try{
        const data = req.query
        const {authorId,category,tags,subcategory} = data

      if(Object.keys(data).length == 0){
         return res.status(400).send({status:true,message:"No data is provided"})
        }

    if(!data.authorId){
        return res.status(400).send({status:false,msg:"AutherId is required"})
        }

/* --------------Authorisation--------------------- */

  if(req.verifyToken.authorId !== authorId){
    console.log("Authorisation Failed")
     return res.status(401).send({status:false,msg:"not authorised"})
   }

/* -------------------------------------------- */
   
   let deleteDoc= await BlogModel.find({isDeleted:false},data).updateMany({$set:{isDeleted:true,deletedAt:moment().format()}})

   if(!deleteDoc){
      return res.status(404).send({msg:"Blog not found"})
   }
        res.status(200).send({msg:deleteDoc})
       } 
    catch(error){
        res.status(500).send({msg:error.message})
    }

}

module.exports.deleteDocument = deleteDocument 