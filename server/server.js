import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'
import { hash } from 'bcrypt';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import User from './Schema/User.js';
import Blog from './Schema/Blog.js';
import cors from 'cors';

const server = express();
let PORT = 3000;
dotenv.config();
server.use(express.json());
server.use(cors());
import fs from 'fs';

const envFileExists = fs.existsSync('.env');
// console.log('Does .env file exist?', envFileExists);

// console.log("LOC:", process.env.MDB_LOCATION);
mongoose.connect(process.env.MDB_LOCATION, {
    autoIndex: true
}).then(() => {
    console.log("Connected to the database");
}).catch((error) => {
    console.error("Database connection error:", error);
});

const verifyMiddleware = (req, res, next) => {
    // console.log("Middleware executed")

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "No access token" });
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "access token is invalid" })
        }
        req.user = user.id;
        next();
    });
};

const formatDatatoSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY)

    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }

}

const generateUsername = async (email) => {
    let username = email.split("@")[0];

    let isUsernameExists = await User.exists({ "personal_info.username": username }).then((result) => result)
    isUsernameExists ? username += nanoid().substring(0, 5) : "";
    return username;
}

server.post("/signup", (req, res) => {
    let { fullname, email, password } = req.body;
    //validating data from frontend
    if (fullname.length < 3) {
        return res.status(403).json({ "error": "too short name" })
    }
    if (!email.length) {
        return res.status(403).json({ "error": "enter Email" })
    }
    if (password.length < 6) {
        return res.status(403).json({ "error": "password too short" });
    }
    //REGEX
    bcrypt.hash(password, 10, async (err, hashed_password) => {
        let username = await generateUsername(email);
        let user = new User({
            personal_info: {
                fullname,
                email,
                password: hashed_password,
                username
            }
        })
        user.save().then((u) => {
            return res.status(200).json(formatDatatoSend(u))
        })
            .catch(err => {
                if (err.code == 11000) {
                    return res.status(500).json({ "error": "Email already exists" })
                }
                return res.status(500).json({ "error": err.message })
            })
        // console.log(hashed_password);
        // return res.status(200).json({"status": "okay"});
    })
})

server.post("/signin", (req, res) => {
    let { email, password } = req.body;

    User.findOne({ "personal_info.email": email })
        .then((user) => {
            if (!user) {
                return res.status(403).json({ "error": "email not found" })
            }

            bcrypt.compare(password, user.personal_info.password, (err, result) => {
                if (err) {
                    return res.status(403).json({ "error": "error occured while login please try again" })
                }
                if (!result) {
                    return res.status(403).json({ "error": "Incorrect Password" })
                }
                else {
                    return res.status(200).json(formatDatatoSend(user))
                }
            })



            // return res.json({ "status": "got user document" })
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ "error": err.message })
        })

})


server.get('/latest-blogs', (req, res) => {
    // let {page} = req.body;
    let maxLimit = 5;

    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})
server.get("/trending-blogs", (req,res)=>{
    Blog.find({draft:false})
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"activity.total_read": -1, "activity.total_likes":-1, "publishedAt":-1})
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then(blogs => {
        return res.status(200).json({ blogs })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })
})


server.post("/search-users", (req,res) =>{
    let {query} = req.body;
    User.find({"personal_info.username": new RegExp(query,'i')})
    .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
    .then(users => {
        return res.status(200).json({ users })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })
})

server.post("/get-profile", (req,res)=>{
    let {username} = req.body;

    User.findOne({"personal_info.username": username})
    .select("-personal_info.password -google_auth -updateAt")
    .then(user => {
        return res.status(200).json(user)
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })

    
})
server.post('/create-blog', verifyMiddleware, (req, res) => {
    let authorId = req.user;

    let { title, des, banner, tags, content } = req.body;

    if (!title.length) {
        return res.status(403).json({ error: "title is must" });
    }

    if (!des.length || des.length > 200) {
        return res.status(403).json({ error: "blog description must be under 200 characters" })
    }
    if (!content.blocks.length) {
        return res.status(403).json({ error: "content is must" })
    }
    if (!tags.length || tags.length > 5) {
        return res.status(403).json({ error: "tags are necessary" })
    }
    tags = tags.map(tag => tag.toLowerCase());
    let blog_id = title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    let blog = new Blog({
        title, des, banner, content, tags, author: authorId, blog_id,
    })
    blog.save().then(blog => {
        User.findOneAndUpdate({ _id: authorId }, { $inc: { "account_info.total_posts": 1 }, $push: { "blogs": blog._id } })
            .then(user => {
                return res.status(200).json({ id: blog.blog_id });
            })
            .catch(err => {
                return res.status(500).json({ error: "failed to update postNum" })
            })
    })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})


server.post("/get-blog", (req,res) =>{
    let {blog_id, mode} = req.body;
    let incrementVal = mode !='edit'? 1:0;
    Blog.findOneAndUpdate({blog_id}, {$inc : {"activity.total_reads": incrementVal}})
    .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
    .select("title des content banner activity publishedAt blog_id tags")
    .then(blog => {
        User.findOneAndUpdate({"personal_info.username": blog.author.personal_info.username},{
            $inc: {"account_info.total_reads": incrementVal}
        })
        .catch(err=>{
            return res.status(500).json({error:err.message});
        })
        return res.status(200).json({ blog });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })

})

server.listen(PORT, () => {
    console.log('listening on port -> ' + PORT);
})