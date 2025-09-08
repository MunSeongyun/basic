import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}
  async create(createPostDto: CreatePostDto) {
    await this.postRepository.save(createPostDto);
  }

  async findAll() {
    return await this.postRepository.find();
  }

  async findOne(id: number) {
    return await this.postRepository.findOneBy({ id });
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    await this.postRepository.update(id, updatePostDto);
    return await this.postRepository.findOneBy({ id });
  }

  async remove(id: number) {
    return await this.postRepository.delete(id);
  }

  async searchByTitle(title: string) {
    return await this.postRepository
      .createQueryBuilder('post')
      .where('post.title LIKE :title', { title: `%${title}%` })
      .getMany();
  }
}
