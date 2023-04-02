import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, UseInterceptors, ClassSerializerInterceptor, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response, Request } from 'express';
import { AuthGuard } from './guards/auth.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post(['admin/register', 'ambassador/register'])
  register(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    return this.userService.register({
      ...createUserDto,
      isAmbassador: req.path === '/api/ambassador/register'
    });
  }

  @Post(['admin/login', 'ambassador/login'])
  login(@Body('email') email: string, @Body('password') password: string,@Req() req: Request, @Res({ passthrough: true}) res: Response) {
    return this.userService.Login(email,password, req, res);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(['admin/user', 'ambassador/user'])
  authenticatedUser(@Req() req: Request) {
    return this.userService.authenticatedUser(req)
  }

  @Post(['admin/logout', 'ambassador/logout'])
  logout(@Res({ passthrough: true}) res: Response) {
    return this.userService.logout(res);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(['admin/users/info', 'ambassador/users/info'])
  updateInfo(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateInfo(req, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(['admin/users/password', 'ambassador/users/password'])
  updatePassword(@Req() req: Request, @Body('password') password: string, @Body('password_confirmation') password_confirmation: string) {
    return this.userService.updatePassword(req, password, password_confirmation);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('admin/ambassadors')
  getAllAmbassadors(){
    return this.userService.getAllAmb();
  }

  // @UseGuards(AuthGuard)
  @Get('ambassador/rankings')
  rankings(@Res() res: Response){
    return this.userService.rankings(res);
  }
}
