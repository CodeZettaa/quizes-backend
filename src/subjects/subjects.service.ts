import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Subject, SubjectDocument } from "./subject.schema";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { SubjectName } from "../common/constants/subject-type.enum";
import { User, UserDocument } from "../users/user.schema";

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name)
    private subjectModel: Model<SubjectDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>
  ) {}

  async findAll(userId?: string) {
    // If no subjects exist, initialize them from the enum
    const existingSubjects = await this.subjectModel.find().exec();
    if (existingSubjects.length === 0) {
      const subjectNames = Object.values(SubjectName);
      const subjectsToCreate = subjectNames.map((subjectName) => ({
        name: subjectName,
        description: `${subjectName} subject`,
      }));

      await this.subjectModel.insertMany(subjectsToCreate);
    }

    // Filter by user's selectedSubjects if userId is provided
    if (userId) {
      const user = await this.userModel.findById(userId);
      if (user && user.selectedSubjects && user.selectedSubjects.length > 0) {
        // Only return subjects that match user's selectedSubjects
        const subjects = await this.subjectModel
          .find({ name: { $in: user.selectedSubjects } })
          .exec();
        return subjects;
      }
    }

    // If no userId or user has no selectedSubjects, return all subjects
    return this.subjectModel.find().exec();
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
