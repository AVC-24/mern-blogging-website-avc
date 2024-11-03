import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import { createContext } from "react";
import defaultBanner from "../imgs/blog banner.png"
import axios from "axios";

let profile_imgs_name_list = ["Destiny", "Jessica", "Aidan", "Riley", "Valentina", "Nolan", "Sara", "Caleb", "Eden", "Mason"];
const blogStructure = {
    title: '',
    banner:`https://api.dicebear.com/9.x/shapes/svg?seed=${profile_imgs_name_list[Math.floor(Math.random() * profile_imgs_name_list.length)]}`,
    content: [],
    tags: [],
    des: '',
    author: { personal_info: {} }
}
export const EditorContext = createContext({});
const Editor = () => {

    let {blog_id} = useParams();
    const [blog, setBlog] = useState(blogStructure)
    const [editorState, setEditorState] = useState("editor");
    const [textEditor, setTextEditor] = useState({isReady:false});
    const [loading, setLoading] = useState(true);
    let { userAuth: { access_token } } = useContext(UserContext);

    useEffect(()=>{
        if(!blog_id){
            return setLoading(false);
        }
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog",{
            blog_id, mode:'edit'
        })
        .then(({data:{blog}})=>{
            setBlog(blog);
            setLoading(false);
        })
        .catch(err=>{
            setBlog(null);
        })
       
    },[])


    return (
        <EditorContext.Provider value={{blog, setBlog, editorState,setEditorState, textEditor, setTextEditor}}>
            {
            access_token === null ? <Navigate to="/signin" />
            : editorState == "editor" ? <BlogEditor /> : <PublishForm />
            }
        </EditorContext.Provider>
    )
}
export default Editor;