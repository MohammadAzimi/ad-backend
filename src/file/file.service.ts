import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { File, FileDocument } from './file.schema';
import { PaginationQueryDto } from './dtos/pagination.dto';
import { createReadStream, readFileSync } from 'fs';
import { join } from 'path';
import { UploadDto } from './dtos/upload.dto';
import * as Buffer from 'buffer';

@Injectable()
export class FileService {
  private logger = new Logger(FileService.name);
  constructor(@InjectModel(File.name) private fileModel: Model<File>) {}

  async createFile(ownerId: string, file: Express.Multer.File, uploadDto: UploadDto): Promise<FileDocument> {
    const fileDoc = await this.fileModel.create({
      ownerId,
      path: file.path,
      name: file.filename,
      animationName: uploadDto.animationName,
      delay: uploadDto.delay,
      type: file.mimetype.split('/')[0],
      createdAt: new Date(),
    });
    this.logger.log('File created', { fileDoc });
    return fileDoc;
  }
  async getFiles(userId: mongoose.Types.ObjectId, query: PaginationQueryDto): Promise<File[]> {
    const limit = query.limit || 10;
    const page = query.page || 0;
    return this.fileModel.find(
      {
        userId,
      },
      {},
      {
        skip: limit * page,
        limit,
      },
    );
  }
  async getFileById(id: string | mongoose.Types.ObjectId): Promise<File> {
    return this.fileModel.findById(id);
  }

  fileBuffer(fileName: string): Buffer.Buffer {
    return readFileSync(join(process.cwd(), `/files/${fileName}`));
  }
  fileStream(fileName: string): StreamableFile {
    const stream = createReadStream(join(process.cwd(), `/files/${fileName}`));
    return new StreamableFile(stream);
  }
}
