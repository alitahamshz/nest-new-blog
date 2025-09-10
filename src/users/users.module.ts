import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
// import { Role } from 'src/roles/entities/role.entity';
import { RolesModule } from 'src/roles/roles.module';


@Module({
  imports: [TypeOrmModule.forFeature([User]),RolesModule],
  controllers: [UsersController],
  providers: [UserService],
  exports :[TypeOrmModule, UserService]
})


export class UsersModule {}
