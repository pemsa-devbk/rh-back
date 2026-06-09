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
import { FileArray } from "express-fileupload";
import { CustomError } from "../utils/error";
import { Like } from "typeorm";


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
    // TODO Esta ruta no se ocupa en el front verificar uso y su respuesta ya que devuleve la relación de usuarios
    public async getById(course_id: number) {
        const course = await this.courseRepository.findOne({
            where: { course_id },
            relations: { courseEmployee: true }
        });
        if (!course) throw 'El curso solicitado no existe';
        return course;
    }

    public async delete(course_id: number): Promise<Course> {
        const course = await this.getById(course_id);
        await this.courseRepository.delete({ course_id });
        if (course.courseEmployee.length > 0) {
            // ELiminar 
            for (let index = 0; index < course.courseEmployee.length; index++) {
                if (course.courseEmployee[index].have_proof) {
                    const userDir = join(__dirname, "..", "..", 'uploads/employees', course.courseEmployee[index].employee_id, 'courses');
                    this.deleteFile(userDir, `${course.courseEmployee[index].employee_id}_${course.courseEmployee[index].course_id}`);
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

    public async uploadProof(course_id: number, employee_id: string, files: FileArray) {
        const file = files['proof'];
        if(!file) throw new CustomError('Archivo no encontrado', 400);
        if(Array.isArray(file)) throw new CustomError('Solo se admite un archivo como comprobante', 400);
        return this.courseUserRepository.manager.transaction(async (transactionalEntityManager) => {
            const userCourse = await transactionalEntityManager.findOneBy(CourseEmployee, { course_id, employee_id });
            if (!userCourse) throw 'No existe el registro solicitado';
            const userDir = join(__dirname, "..", "..", 'uploads/employees', employee_id, 'courses');
            if (!existsSync(userDir)) mkdirSync(userDir, { recursive: true });
            if (!userCourse.have_proof) await transactionalEntityManager.update(CourseEmployee, { course_id, employee_id }, { have_proof: true });
            this.deleteFile(userDir, `${employee_id}_${course_id}`);
            const ext = this.validateExt(file.name);
            const filepath = join(userDir, `${employee_id}_${course_id}.${ext}`);
            writeFileSync(filepath, file.data);
            return true;
        })
    }

    public downloadProof(course_id: number, employee_id: string) {
        const userDir = join(__dirname, "..", "..", 'uploads/employees', employee_id, 'courses');
        const proofs = readdirSync(userDir);
        const file = proofs.find(proof => proof.includes(`${employee_id}_${course_id}.`));
        if (!file) throw 'Archivo no encontrado';
        const dirFile = join(userDir, file);
        const mimeType = mime.lookup(file) || 'application/octet-stream';
        return [file, dirFile, mimeType];
    }

    // * Relaciones
    public async getByEmployee(employee_id: string, pagination: QueryRelationsDTO) {
        const { take, skip, search } = pagination;
        const total = await this.courseRepository.count({
            where: search && { name: Like(`%${search}%`)}
        })
        const query = this.courseRepository.createQueryBuilder("course")
            .select(['course.course_id as course_id', 'course.name as name', 'course.date_start as date_start', 'course.date_end as date_end'])
            .leftJoin("course.courseEmployee", "courseEmployee")
            .where("courseEmployee.employee_id = :employee_id", { employee_id })
            .skip(skip).take(take);
        if (search) query.where("course.name LIKE :search", { search: `%${search}%` });
        const courses = await query.getRawMany();
        return [courses, total]
    }

    public async assignUsers(course_id: number, assignDto: AssignUsersToCourseDTO) {
        const { users } = assignDto;
        const course = await this.getById(course_id);

        const usersID = course.courseEmployee.map( usr => usr.employee_id);
        const assingIDS = users.filter( usr => !usersID.includes(usr));
        const usersToCourse = assingIDS.map(employee_id => ({
            course_id: course.course_id,
            employee_id
        }));
        this.courseUserRepository.insert(usersToCourse);
        return true;
    }

    public async deleteUser(course_id: number, employee_id: string) {
        const userDir = join(__dirname, "..", "..", 'uploads/employees', employee_id, 'courses');
        await this.courseUserRepository.delete({ course_id, employee_id });
        this.deleteFile(userDir, `${employee_id}_${course_id}`);
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