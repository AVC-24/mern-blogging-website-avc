import { useParams } from "react-router-dom"
import InPageNavigation from "../components/inpage-navigation.component";
import PageNotFound from "./404.page";
import { useEffect, useState } from "react";
import NoDataMessage from "../components/nodata.component";
import axios from "axios";
import Loader from "../components/loader.component";
import UserCard from "../components/usercard.component";

const SearchPage = () => {

    let { query } = useParams();

    let [users, setUsers] = useState(null);

    const fetchUsers = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })
            .then(({ data: { users } }) => {
                setUsers(users);
            })
    }
    useEffect(() => {
        resetState();
        fetchUsers();
    }, [query])
    const resetState = () => {
        setUsers(null);
    }


    const UserCardWrapper = () => {
        return (
            <>
                {
                    users == null ? <Loader /> :
                        users.length ?
                            users.map((user, i) => {
                                return <UserCard key={i} user={user} />
                            })
                            : <NoDataMessage message="No User Found" />
                }
            </>
        )
    }
    return (
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full">
                <InPageNavigation routes={[`Search Results for ${query}`, "Accounts Matched"]} defaultHide={["Accounts Matched"]}>
                    <h1>Search Results for- {query} blogs</h1>
                    <UserCardWrapper />
                </InPageNavigation> </div>
                <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-grey pl-8 pt-3 max-md:hidden">
                    <h1 className="font-medium text-xl mb-9">
                        users related to search
                        <UserCardWrapper/>
                    </h1>
               

            </div>
        </section>
    )
}
export default SearchPage