const jwt= require("jsonwebtoken")

/* ----------------------------------------------AUTHENTICATION---------------------------------------- */

const authenticate= async function(req,res,next){
    try{
   let token= req.headers["x-api-key"]
   if(!token){
    return res.status(400).send({status:false,msg:"token must be present"})
   }
   let verifyToken= jwt.verify(token,"functionup-lithium-very-very-secret-key")
   if(!verifyToken){
    return res.status(401).send({status:false,msg:"token is invalid"})
   }
   req.verifyToken=verifyToken
   console.log("Authentication successfull")
}
catch(error){
    res.status(500).send({status:false,msg:error.message})
    console.log("Authentication Failed")
}
next()
}


/* -----------------------------------------AUTHORISATION----------------------------------------------------- */


const auth2= async function(req,res,next){

    try{
        let token= req.headers["x-api-key"]

        console.log(token)

        if(!token){
         return res.status(400).send({status:false,msg:"token must be present"})
        }

        let verifyToken= jwt.verify(token,"functionup-lithium-very-very-secret-key")

        if(!verifyToken){
         return res.status(400).send({status:false,msg:"token is invalid"})
        }

        const{ authorId } = req.body

         let  loggedinAuthor= verifyToken.authorId.toString()

         if(authorId !== loggedinAuthor){
            return res.status(403).send({status:false,msg:"author is not allowed for this request"})
           }
           console.log("Authorise successfull")
        }

  catch(error){
    res.status(500).send({status:false,msg:error.message})
  }

  next()
}
 




module.exports.authenticate=authenticate


module.exports.auth2=auth2