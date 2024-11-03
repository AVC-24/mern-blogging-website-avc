import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import { getDay } from "../common/date";
import { UserContext } from "../App.jsx";
import BlogContent from "../components/blog-content.component.jsx";
import toast from "react-hot-toast";

const blogStruct = {
    title: "",
    des: "",
    content: [],
    tags: [],
    author: { personal_info: {} },
    activity: {
        total_likes: 0,
        total_comments: 0
    },
    banner: "",
    publishedAt: ""
}
const BlogPage = () => {
    let { blog_id } = useParams()
    let { userAuth: { username, access_token } } = useContext(UserContext);

    // console.log(blog_id);
    const [blog, setBlog] = useState(blogStruct);
    const [liked, setLiked] = useState(false);
    let { title, content, banner,
        author: { personal_info: { username: author_username, fullname, profile_img } },
        activity: { total_likes, total_comments },
        publishedAt, tags } = blog;

    const fetchBlog = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id })
            .then(({ data: { blog } }) => {
                setBlog(blog);
            })
            .catch(err => {
                console.log(err);
            })
    }

    const handleLike = () => {
        if (access_token) {
            setLiked(prevLiked => {
                const updatedLikes = prevLiked ? total_likes - 1 : total_likes + 1;
                setBlog(prevBlog => ({
                    ...prevBlog,
                    activity: {
                        ...prevBlog.activity,
                        total_likes: updatedLikes
                    }
                }));
                return !prevLiked;
            });
        }
        else {
            toast.error("Login to like this blog");
        }
    }
    useEffect(() => {
        fetchBlog();
    }, [])


    return (
        <AnimationWrapper>
            {
                <div className="max-w-[900px] center py-10 max-lg:px-5[vw]">
                    <img src={banner} alt={title}
                        className="aspect-video" />
                    <div className="mt-12 mx-3">
                        <h2>{title}</h2>
                        <div className="flex max-sm:flex-col justify-between my-8">

                            <div className="flex gap-5 items-start">
                                <img src={profile_img} alt={author_username}
                                    className="w-12 h-12 rounded-full" />
                                <p>{fullname} <br />@
                                    <Link to={`/user/${author_username}`}
                                    > {author_username}</Link>
                                </p>
                            </div>

                            <p className="text-dark-grey opacity-75 max-sm:mt-6 
                        max-sm:ml-12 max-sm:pl-5">Published on: {getDay(publishedAt)}</p>
                        </div>
                    </div>

                    <div className="mx-4">
                        <hr className="border-grey my-2" />
                        <div className="flex justify-between">
                            <div className="flex flex-row gap-6">
                                <div className="flex gap-3 items-center">
                                    <button className={"w-10 h-10 rounded-full flex items-center justify-center "+(liked? "bg-red/20 text-red":"bg-grey/80")}
                                        onClick={handleLike}>
                                        <i className={"fi fi-"+(liked? "sr":"rr")+"-heart"}></i>
                                    </button><p className="text-xl text-dark-grey">{total_likes}</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80">
                                        <i className="fi fi-rr-comment-alt-dots"></i>
                                    </button><p className="text-xl text-dark-grey">{total_comments}</p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-center">
                                {
                                    (username == author_username && username != undefined) ?
                                        <Link to={`/editor/${blog_id}`} className="text-dark-grey text-xl underline">Edit</Link>
                                        : ""

                                }

                            </div>

                        </div>
                        <hr className="border-grey my-2" />
                    </div>
                    <div className="my-12 font-gelasio blog-page-content">

                        {/* {
                        console.log(content[0])
                    } */}
                        {
                            content[0] && content[0].blocks ? (
                                content[0].blocks.map((block, i) => (

                                    <div key={i} className="my-4 md:my-8 mx-3">
                                        <BlogContent block={block} />
                                    </div>

                                ))
                            ) : ""
                        }
                    </div>

                </div>
            }
        </AnimationWrapper>
        // <h1>f {blog.title} wguerwutyewurytiuwyeiutyewoius</h1>
    )
}
export default BlogPage;