
import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit";
import { sub } from 'date-fns';
import { apiSlice } from "../api/apiSlice";




const postsAdapter = createEntityAdapter({
    sortComparer: (a, b) => b.date.localeCompare(a.date)
})


const initialState = postsAdapter.getInitialState()


//api injections
export const extendedApiSlice = apiSlice.injectEndpoints({
    endpoints: builder =>({
        getPosts: builder.query({
            query: ()=> '/posts',
            transformErrorResponse: responseData => {
                let min = 1;
                const loadedPosts = responseData.map(post =>{
                    if(!post?.date) post.date = sub(new Date(),{minutes:min++}).toISOString();
                    if(!post?.reactions) post.reactions = {
                        thumbsUp: 0,
                        wow: 0,
                        heart: 0,
                        rocket: 0,
                        coffee: 0
                    }
                    return post
                })
                return postsAdapter.setAll(initialState,loadedPosts)
            },
            providesTags:(result,error,arg) =>[
                {type:'Post',id:"List"},
                ...result.ids.map(id => ({type:'Post',id}))
            ]
        })
    })
})


export const {
    useGetPostsQuery,
} = extendedApiSlice


//return the query result object
export const selectPostsResult = extendedApiSlice.endpoints.getPosts.select()

console.log(selectPostsResult)
//create memozied 
//to create a selector we nedd imput and output functions 
const selectPostsData = createSelector(
    selectPostsResult,
    postsResult => postsResult.data
)

export const {
    selectAll: selectAllPosts,
    selectById: selectPostsById,
    selectIds: selectPostIds
} = postsAdapter.getSelectors(state => selectPostsData(state) ?? initialState)





