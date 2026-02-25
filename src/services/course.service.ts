import { appDataSource } from "../db/dataBase";
import { Course } from "../db/entities/course.entity";
import { CourseEmployee } from "../db/entities/course_employee.entity";
import { AssignUsersToCourseDTO } from "../Dto/course/assignUsersToCoruse.dto";
import { CreateCourseDTO } from "../Dto/course/createCourse.dto";
import { UpdateCourseDTO } from "../Dto/course/updateCourse.dto";
import { QueryRelationsDTO } from "../Dto/query_relations.dto";
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "fs";
import mime from 'mime'


export class CourseService {

    constructor(
        private readonly courseRepository = appDataSource.getRepository(Course),
        private readonly courseUserRepository = appDataSource.getRepository(CourseEmployee),
    ) { }

    public create(courseDTO: CreateCourseDTO): Promise<Course> {
        return this.courseRepository.manager.transaction(async (transactionalEntityManager) => {
            const { users, ...createDTO } = courseDTO;

            const course = await transactionalEntityManager.save(Course, createDTO);

            if (users) {
                const courseUsers = users.map(userId => ({
                    user_id: userId,
                    course_id: course.course_id,
                }));

                await transactionalEntityManager.insert(CourseEmployee, courseUsers);
            }

            return course;
        });
    }

    public async getAll(pagination: QueryRelationsDTO) {
        const { take, skip, search } = pagination;

        const query = this.courseRepository.createQueryBuilder("course")
            .loadRelationCountAndMap("course.total_users", "course.courseUsers");
        if (search) query.where("course.name LIKE :search", { search: `%${search}%` });
        query.take(take).skip(skip)

        return await query.getManyAndCount();
    }

    public async getById(course_id: number) {
        const course = await this.courseRepository.findOne({
            where: { course_id },
            relations: { courseUsers: true }
        });
        if (!course) throw 'El curso solicitado no existe';
        return course;
    }

    public async delete(course_id: number): Promise<Course> {
        const course = await this.getById(course_id);
        await this.courseRepository.delete({ course_id });
        if (course.courseUsers.length > 0) {
            // ELiminar 
            for (let index = 0; index < course.courseUsers.length; index++) {
                if (course.courseUsers[index].have_proof) {
                    const userDir = join(__dirname, "..", "..", 'uploads/users', course.courseUsers[index].user_id, 'courses');
                    this.deleteFile(userDir, `${course.courseUsers[index].user_id}_${course.courseUsers[index].course_id}`);
                }
            }
        }
        return course;
    }

    public async update(course_id: number, updateDTO: UpdateCourseDTO): Promise<Course> {
        const course = await this.findOneOrFail(course_id);
        await this.courseRepository.update({ course_id }, updateDTO);
        return { ...course, ...updateDTO };
    }

    public async uploadProof(course_id: number, user_id: string, file: Express.Multer.File) {
        return this.courseUserRepository.manager.transaction(async (transactionalEntityManager) => {
            const userCourse = await transactionalEntityManager.findOneBy(CourseEmployee, { course_id, user_id });
            if (!userCourse) throw 'No existe el registro solicitado';
            const userDir = join(__dirname, "..", "..", 'uploads/users', user_id, 'courses');
            if (!existsSync(userDir)) mkdirSync(userDir, { recursive: true });
            if (!userCourse.have_proof) await transactionalEntityManager.update(CourseEmployee, { course_id, user_id }, { have_proof: true });
            this.deleteFile(userDir, `${user_id}_${course_id}`);
            const ext = this.validateExt(file.originalname);
            const filepath = join(userDir, `${user_id}_${course_id}.${ext}`);
            writeFileSync(filepath, file.buffer);
            return true;
        })
    }

    public downloadProof(course_id: number, user_id: string) {
        const userDir = join(__dirname, "..", "..", 'uploads/users', user_id, 'courses');
        const proofs = readdirSync(userDir);
        const file = proofs.find(proof => proof.includes(`${user_id}_${course_id}.`));
        if (!file) throw 'Archivo no encontrado';
        const dirFile = join(userDir, file);
        const mimeType = mime.lookup(file) || 'application/octet-stream';
        return [file, dirFile, mimeType];
    }

    // * Relaciones
    public async getByUser(user_id: string, pagination: QueryRelationsDTO) {
        const { take, skip, search } = pagination;

        const query = this.courseRepository.createQueryBuilder("course")
            .loadRelationCountAndMap("course.total_users", "course.courseUsers")
            .leftJoin("course.courseUsers", "courseUsers")
            .where("courseUsers.user_id = :user_id", { user_id })
            .skip(skip).take(take);
        if (search) query.where("course.name LIKE :search", { search: `%${search}%` });
        return await query.getManyAndCount()
    }

    public async assignUsers(course_id: number, assignDto: AssignUsersToCourseDTO) {
        const { users } = assignDto;
        const course = await this.getById(course_id);

        const usersID = course.courseUsers.map( usr => usr.user_id);
        const assingIDS = users.filter( usr => !usersID.includes(usr));
        const usersToCourse = assingIDS.map(user_id => ({
            course_id: course.course_id,
            user_id
        }));
        this.courseUserRepository.insert(usersToCourse);
        return true;
    }

    public async deleteUser(course_id: number, user_id: string) {
        const userDir = join(__dirname, "..", "..", 'uploads/users', user_id, 'courses');
        await this.courseUserRepository.delete({ course_id, user_id });
        this.deleteFile(userDir, `${user_id}_${course_id}`);
        return true;
    }

    // * Privados
    private async findOneOrFail(course_id: number) {
        const course = await this.courseRepository.findOne({
            where: { course_id }
        });

        if (!course) throw 'El curso solicitado no existe';
        return course;
    }

    private deleteFile(dir: string, file: string, ext: string = '') {
        if (!existsSync(dir)) throw "No existe el directorio";
        const existingFiles = readdirSync(dir);

        for (const f of existingFiles) {
            if (f.startsWith(file + '.' + ext)) {
                unlinkSync(join(dir, f));
            }
        }
    }
    private validateExt(name: string) {
        const validaExten = name.split('.');
        if (validaExten.length < 2) throw "Archivo no valido"
        return validaExten.pop();
    }
}