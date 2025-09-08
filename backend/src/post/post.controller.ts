import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import express from 'express';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // Query Parameter: /post/search?target=Nest
  // 쿼리 파라미터 사용 예시
  // 쿼리 파라미터는 url에서 조건을 줄 때 사용 (검색, 필터링 등)
  @Get('search')
  async searchByTitle(@Query('target') title: string) {
    return {
      message: 'Posts retrieved successfully',
      data: await this.postService.searchByTitle(title),
    };
  }

  // Create Post
  // Post 메소드는 주로 리소스를 생성할 때 사용
  // 사용자의 입력을 body에 담아 백엔드로 전달
  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    await this.postService.create(createPostDto);
    return { message: 'Post created successfully' };
  }

  // Read Posts
  // Get 메소드는 주로 리소스를 조회할 때 사용
  // 모든 리소스를 조회할 때는 path parameter 없이 사용 (모든 리소스 == 조건 없음)
  // 아래 예시는 모든 포스트를 조회하는 예시
  @Get()
  async findAll() {
    return {
      message: 'Posts retrieved successfully',
      data: await this.postService.findAll(),
    };
  }

  // Path Parameter: /post/1
  // 패스 파라미터 사용 예시
  // 패스 파라미터는 url에서 특정 리소스를 지정할 때 사용 (id 등)
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: express.Response) {
    const data = await this.postService.findOne(+id);
    // 데이터가 없을 때 404 응답
    if (!data) {
      res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json({
      message: 'Post retrieved successfully',
      data: data,
    });
  }

  // Update Post
  // Patch 메소드는 리소스의 일부를 수정할 때 사용
  // 사용자의 입력을 body에 담아 백엔드로 전달
  // 특정 리소스를 지정하기 위해 path parameter 사용 (id 등)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    await this.postService.update(+id, updatePostDto);
    return {
      message: 'Post updated successfully',
    };
  }

  // Delete Post
  // Delete 메소드는 리소스를 삭제할 때 사용
  // 특정 리소스를 지정하기 위해 path parameter 사용 (id 등)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.postService.remove(+id);
    return { message: 'Post deleted successfully' };
  }
}
