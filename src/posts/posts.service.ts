import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({
      relations: ['user'],
    });
  }

  async getPostById(id: string) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('없어');
    }

    return post;
  }

  async createPost(user: number, title: string, content: string) {
    const post = this.postsRepository.create({
      user: {
        id: user,
      },
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    });

    return await this.postsRepository.save(post);
  }

  async updatePost(id: string, title: string, content: string) {
    // const post = posts.find(post => post.id === id);
    const post: PostsModel = await this.postsRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    return await this.postsRepository.save(post);
  }

  async deletePost(id: string) {
    const post: PostsModel = await this.postsRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return await this.postsRepository.delete(post);
  }
}
