import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Subject, SubjectDocument } from "./subject.schema";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { SubjectName } from "../common/constants/subject-type.enum";

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name)
    private subjectModel: Model<SubjectDocument>
  ) {}

  async findAll() {
    const subjects = await this.subjectModel.find().exec();

    // If no subjects exist, initialize them from the enum
    if (subjects.length === 0) {
      const subjectNames = Object.values(SubjectName);
      const subjectsToCreate = subjectNames.map((subjectName) => ({
        name: subjectName,
        description: `${subjectName} subject`,
      }));

      const createdSubjects =
        await this.subjectModel.insertMany(subjectsToCreate);
      return createdSubjects;
    }

    return subjects;
  }

  async findOne(id: string) {
    const subject = await this.subjectModel.findById(id);
    if (!subject) throw new NotFoundException("Subject not found");
    return subject;
  }

  create(dto: CreateSubjectDto) {
    const subject = new this.subjectModel({
      name: dto.name as SubjectName,
      description: dto.description,
    });
    return subject.save();
  }
}
