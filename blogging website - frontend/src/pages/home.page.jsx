import axios from "axios";
import AnimationWrapper from "../common/page-animation"
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component.jsx";
import BlogPost from "../components/blog-post.component.jsx";
import TrendingBlogSec from "../components/trending-blog-section.component.jsx";
import { filterpaginationData } from "../common/filter-pagination-data.jsx";
const HomePage = () => {
    let [blogs, setBlog] = useState(null);
    let [trendingBlogs, setTrendingBlog] = useState(null);

    const fetchLatestBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs")
            .then(({ data }) => {
                setBlog(data.blogs);
            })
            .catch(err => {
                console.log(err);
            })
    }
    const fetchTrendingBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
            .then(({ data }) => {
                setTrendingBlog(data.blogs)
            })
            .catch(err => {
                console.log(err);
            })
    }
    useEffect(() => {
        fetchLatestBlogs();
        fetchTrendingBlogs();
    }, [])

    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                <div className="w-full">
                    <InPageNavigation routes={["home", "trendings"]} defaultHide={["trendings"]}>
                        <>
                            {
                                blogs == null ? (
                                    <Loader />
                                ) :
                                    blogs.map((blog, i) => {
                                        return <AnimationWrapper key={i}><BlogPost content={blog} author={blog.author.personal_info} /></AnimationWrapper>
                                    })
                            }

                        </>
                        {
                            trendingBlogs == null ? <Loader /> :
                                trendingBlogs.map((blog, i) => {
                                    return <AnimationWrapper key={i}>
                                        <TrendingBlogSec blog={blog} index={i} />
                                    </AnimationWrapper>
                                })
                        }
                    </InPageNavigation>
                </div>

                <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
                    <div>
                        <h1 className="font-medium text-xl mb-8">Trending <i className="fi fi-br-arrow-trend-up"></i></h1>
                        {
                            trendingBlogs == null ? <Loader /> :
                                trendingBlogs.map((blog, i) => {
                                    return <AnimationWrapper key={i}>
                                        <TrendingBlogSec blog={blog} index={i} />
                                    </AnimationWrapper>
                                })
                        }
                    </div>
                </div>

            </section>
        </AnimationWrapper>
    )

}
export default HomePage;