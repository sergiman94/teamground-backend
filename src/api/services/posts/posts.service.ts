import { FieldJSON } from "src/models/fields/fields.model";
import PostsDAO from "../../../dao/postsDAO";
import { PostJSON } from "../../../models/posts/posts.model";
import { Service } from "../service.interface";

class PostsService implements Service<PostJSON> {
  getTotal(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  create(item: PostJSON): Promise<void> {
    return this.save(item);
  }

  async update(key: string, item: PostJSON): Promise<any> {
    let postUpdated = await PostsDAO.updatePost(key, item);
    console.log(postUpdated);
    return this.get(postUpdated);
  }
  
  patch?(changes: any): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async save(item: PostJSON): Promise<any> {
    const insertResult = await PostsDAO.createPost(item);

    if (!insertResult.success) {
      throw new Error("Can't insert post to database");
    }

    let postCreated = await PostsDAO.getPost(item.key);
    return Promise.resolve(postCreated).catch((error) => console.log(error));
  }

  async get(key: any): Promise<any> {
    let post = await PostsDAO.getPost(key);
    return post;
  }

  async getByMatchKey(key: any): Promise<any> {
    let post = await PostsDAO.getPostByMatchKey(key);
    return post;
  }

  async list(query?: any) {
    let posts = await PostsDAO.getPosts();
    return posts;
  }

  async delete(key: any): Promise<any> {
    let postDeleted = await PostsDAO.deletePost(key);
    return postDeleted;
  }
}

const postService = new PostsService()
export default postService
