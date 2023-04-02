import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { LinkService } from './link.service';
import { Request } from 'express';
import { UpdateLinkDto } from './dto/update-link.dto';
import { AuthGuard } from 'src/user/guards/auth.guard';

@Controller()
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @UseGuards(AuthGuard)
  @Post('ambassador/links')
  create(@Body('products') products: number[], @Req() req: Request) {
    return this.linkService.create(req, products);
  }

  @UseGuards(AuthGuard)
  @Get('ambassador/stats')
  stats(@Req() req: Request){
    return this.linkService.stats(req);
  }

  @UseGuards(AuthGuard)
  @Get('admin/users/:id/links')
  findByUser(@Param('id') id: string) {
    return this.linkService.findByUser(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLinkDto: UpdateLinkDto) {
    return this.linkService.update(+id, updateLinkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.linkService.remove(+id);
  }

  @Get('checkout/links/:code')
    linkCheckout(@Param('code') code: string) {
        return this.linkService.linkCheckout(code);
    }
}
