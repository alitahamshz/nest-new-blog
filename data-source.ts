import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { User } from 'src/users/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Role } from 'src/roles/entities/role.entity';
import { FileEntity } from 'src/files/entities/file.entity';
import { UserProfile } from './src/users/entities/user-profile.entity';
import { Post } from './src/posts/entities/post.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 8000,
  username: 'postgres',
  password: '123456789',
  database: 'blog-db',
  entities: [Post, Category, Tag, User, Comment, Role, FileEntity, UserProfile],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
