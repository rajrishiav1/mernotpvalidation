const users = require("../models/userSchema")
const  userotp = require("../models/userOtp")
const nodemailer = require("nodemailer")

//email config 
const transporter = nodemailer.createTransport({
     service:"gmail",
     auth:{
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
     }
})


exports.userregister = async(req,res)=>{
const{fname,email,password}=req.body 
if(!fname || !email ||!password){
    res.status(400).json({error:"Please Enter All Input Data"})
}
try {
    const preuser = await users.findOne({email:email})
    if(preuser){
        res.status(400).json({error:"This user already exists"})
    }else{
        const userregister = new users({
            fname,email,password
        })

        //password Hasing
        const storeData =await userregister.save()
        res.status(200).json(storeData)
    }
    
} catch (error) {
    res.status(400).json({error:"Invalid Details",error})
}
}

//user send otp

exports.userOtpSend =async(req,res)=>{
    const {email}= req.body;
    if(!email){ 
        res.status(400).json({error:"please enter your email"})
    }
    try {
        const preuser = await users.findOne({email:email})
        if(preuser)
        {
            const OTP = Math.floor(100000+Math.random()*900000);
            const existEmail=await userotp.findOne({email:email})
            if(existEmail){
                const updateData = await userotp.findByIdAndUpdate({_id:existEmail._id},{
                    otp:OTP 
                },{new:true})
                await updateData.save()

                const mailOption ={
                    from:process.env.EMAIL,
                    to:email,
                    subject:"sending otp for email verification",
                    text:`OTP:- ${OTP}`
                }

                transporter.sendMail(mailOption,(error,info)=>{
                    if(error)
                    {
                        console.log("error",error);
                        res.status(400).json({error:"email not send"})
                    }else{
                        console.log("Email sent",info.response);
                        res.status(200).json({message:"Email sent Successfully"})
                    }
                })
            }else{
                const saveOtpData = new userotp({
                    email,otp:OTP
                })
                await saveOtpData.save()

                const mailOption ={
                    from:process.env.EMAIL,
                    to:email,
                    subject:"sending otp for email verification",
                    text:`OTP:- ${OTP}`
                }

                transporter.sendMail(mailOption,(error,info)=>{
                    if(error)
                    {
                        console.log("error",error);
                        res.status(400).json({error:"email not send"})
                    }else{
                        console.log("Email sent",info.response);
                        res.status(200).json({message:"Email sent Successfully"})
                    }
                }) 
            }

        }else{
            const saveOtpData = new userotp({
                email,otp:OTP
            })

        }
        
    } catch (error) {
        res.status(400).json({error:"Invalid Details",error})
        
    }
}


//user login

exports.userLogin = async(req,res)=>{
    const {email,otp}= req.body 
    if(!otp || !email)
    {
        res.status(400).json({error:"please enter your OTP and email"})

    }
    try {
        const otpverification = await userotp.findOne({email:email})
        if(otpverification.otp===otp)
        {
            const preuser = await users.findOne({email:email})

            //token generate

            const token = await preuser.generateAuthtoken()
            //console.log(token);
            res.status(200).json({message:"User Login Succesfully Done",userToken:token})

        } else{
            res.status(400).json({error:"Invalid otp"})
        }
        
    } catch (error) {
        res.status(400).json({error:"Invalid Details",error})
        
    }

}