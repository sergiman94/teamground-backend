import {MongoClient, Collection} from "mongodb"
import { PostJSON } from "src/models/posts/posts.model"

let posts: Collection<any>

export default class PostsDAO {

    /** injected mongo db collection connection from server index */
    static async injectDB (conn: MongoClient) {
        try {
            posts = await conn.db(process.env.MAIN_DB).collection("posts")
        } catch (error) {
            console.log(`There was a problem connection to PostsDAO ${error}`)
        }
    }

    static async createPost(postData: PostJSON) {
        try {
            await posts.insertOne(postData)
            return {success: true, data: postData}
        } catch (error) {
            if (String(error).startsWith("MongoError: E11000 duplicate key error")) {
                return { error: "A Post with the given data already exists." }
            }
            console.error(`Error occurred while adding new post, ${error}.`)
            return { error: error }
        }
    }

    // get a single post
    static async getPost(postKey) {
        try {
            let post = await posts.findOne({key: postKey})
            return post
        } catch (error) {
            console.log(`Error getting post --> ${error}`)
            return {error:`Error getting post --> ${error}`}
        }
    }

    // get a single post by match key
    static async getPostByMatchKey(matchKey) {
        try {
            let post = await posts.findOne({matchKey: matchKey})
            return post
        } catch (error) {
            console.log(`Error getting post --> ${error}`)
            return {error:`Error getting post --> ${error}`}
        }
    }

    // get all posts
    static async getPosts() {
        try {
            let postList = await posts.find().toArray()
            return postList
        } catch (error) {
            console.log(`Error listing posts --> ${error}`)
            let postsList = []
            return postsList
        }
    }

    static async updatePost (postKey, post: PostJSON) {
        try {
            const updateResponse =  await posts.updateOne(
                {key: postKey},
                {$set: {
                    // Set here necesary changes
                    comments: post.comments,
                    likes: post.likes,
                    match: post.match,
                    name: post.name, 
                    userImage: post.userImage
                }} 
            )

            if (updateResponse.matchedCount === 0) {
                throw new Error("Couldn't find a post for this credential");
            }

            return postKey
                
        } catch (error) {
            console.log('error updating post', error)
            return {error: `Error updating post --> ${error}`}
        }
    }

    static async deletePost(postKey) {
        try {
            await posts.deleteOne({key: postKey})

            if (! (await this.getPost(postKey))) {
                return {success: `post ${postKey} successfully deleted`}
            } else {
                return {error: `Can not delete post ${postKey}`}
            }
        } catch (error) {
            console.log(`Error deleting post --> ${error}`)
            return {error: `Can not delete post ${postKey} error ${error}`}
        }
    }

}