import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";

const uploadImgByURL =  (e)=>{
    let link =  new Promise((resolve, reject)=>{
        try{
            resolve(e);
        }
        catch(err){
            reject(err);
        }
    })
    return link.then(url=>{
        return{
            success:1,
            file:{url}
        }
    })
}

export const tools ={
    embed:Embed,
    list:{
        class:List,
        inlineToolbar:true
    },
    image:{
        class:Image,
        config: {
            uploader:{
                uploadByUrl: uploadImgByURL,
            }
        }
    },
    marker:Marker,
    inlinecode:InlineCode
}
