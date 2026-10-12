import { copyFileSync, createReadStream, existsSync, mkdirSync, readdirSync, readSync, rmSync } from "fs";
import { appDataSource } from "../db/dataBase";
import { User } from "../db/entities/user.entity";
import { join } from 'path';
import csvParser from "csv-parser";
import { Employee } from "../db/entities/employee.entity";
import { Binnacle } from "../db/entities/binnacle.entity";
import { ValidStateMov } from "../types/enums/validMov";
import { Contract } from "../db/entities/contract.entity";
import { EnterpriseInformation } from "../db/entities/enterprise_information.entity";
import { License } from "../db/entities/license.entity";
import { MedicalData } from "../db/entities/medical_data.entity";
import { Department } from "../db/entities/department.entity";
import { Area } from "../db/entities/area.entity";
import { Position } from "../db/entities/position.entity";
import { EmployeeFiles } from "../db/entities/employee_files.entity";

export class SeedService {
    constructor(
        private readonly pathFiles = join(__dirname, '../', '../', 'SQL_DATA'),
        private readonly departmentRepository = appDataSource.getRepository(Department),
        private readonly areaRepository = appDataSource.getRepository(Area),
        private readonly positionRepository = appDataSource.getRepository(Position),
        private readonly userRepository = appDataSource.getRepository(User),
        private readonly enterpriseRepository = appDataSource.getRepository(EnterpriseInformation),
        private readonly medicalRepository = appDataSource.getRepository(MedicalData),
        private readonly contractRepository = appDataSource.getRepository(Contract),
        private readonly licenseRepository = appDataSource.getRepository(License),
        private readonly employeeFileRepository = appDataSource.getRepository(EmployeeFiles),
    ) { }

    public loadUsers() {
        const results: Array<User> = [];
        createReadStream(join(this.pathFiles, 'users.csv'))
            .pipe(csvParser({
                skipLines: 1,
                headers: ['user_id', 'name', 'password', 'role_id', 'updated_at', 'deleted_at', 'gender', 'birthdate', 'curp', 'status', 'rfc', 'cuip', 'num_children', 'vacation_days', 'boss_id', 'have_uniform', 'num_infonavit', 'marital_status', 'place_registration', 'salary', 'cp_csf', 'date_entry', 'position_id', 'email', 'cell_phone', 'have_alimony', 'cred_fonaco', 'tell_enterprise', 'ext', 'cell_enterprise', 'lic_issue_date', 'lic_type', 'lic_validity', 'con_type', 'con_issue', 'med_blood', 'med_nss', 'med_alle', 'med_enf'],
            }))
            .on('data', (data) => {
                const parseData = this.tranformData(data);
                let infoEnter: EnterpriseInformation = null;
                let infoLic: License = null;
                let infoCon: Contract = null;
                let infoMed: MedicalData = null;

                const user_id = parseData.user_id.padStart(5, '0');

                if ((parseData.tell_enterprise && data.ext) || parseData.cell_enterprise) {
                    infoEnter = this.enterpriseRepository.create({
                        employee_id: user_id,
                        email: parseData.email?.includes('pem-sa.') ? parseData.email : null,
                        phone: parseData.tell_enterprise,
                        ext: parseData.ext,
                        cell_phone: parseData.cell_enterprise,
                    })
                }
                if (parseData.lic_issue_date && parseData.lic_type && parseData.lic_validity) infoLic = this.licenseRepository.create({
                    employee_id: user_id,
                    issue_date: parseData.lic_issue_date,
                    type: +parseData.lic_type,
                    validity: parseData.lic_validity,
                });
                if (parseData.con_type != null) infoCon = this.contractRepository.create({
                    employee_id: user_id,
                    type: +parseData.con_type,
                    validity: parseData.con_issue,
                })
                if (parseData.med_blood || parseData.med_nss || parseData.med_alle || parseData.med_enf) {
                    infoMed = this.medicalRepository.create({
                        employee_id: user_id,
                        blood_type: parseData.med_blood,
                        allergies: parseData.med_alle,
                        nss: parseData.med_nss,
                        diseases: parseData.med_enf
                    });
                }

                //@ts-ignore
                const user = this.userRepository.create({
                    user_id,
                    name: parseData.name,
                    password: null,
                    role_id: +parseData.role_id,
                    updated_at: parseData.updated_at,
                    deleted_at: parseData.deleted_at,
                    employee: {
                        user_id,
                        gender: parseData.gender,
                        birthdate: parseData.birthdate,
                        curp: parseData.curp,
                        status: parseData.status === '1' ? true : false,
                        rfc: parseData.rfc,
                        cuip: null,
                        num_children: +parseData.num_children,
                        vacation_days: 0,
                        boss_id: parseData.boss_id.padStart(5, '0'),
                        have_uniform: parseData.have_uniform === '1' ? true : false,
                        num_infonavit: parseData.num_infonavit,
                        marital_status: null,
                        place_registration: null,
                        salary: null,
                        cp_csf: null,
                        date_entry: parseData.date_entry,
                        position_id: +parseData.position_id,
                        email: (parseData.email?.includes('pem-sa.')) ? null : parseData.email,
                        cell_phone: parseData.cell_phone,
                        have_alimony: false,
                        cred_fonacot: null,
                        enterpriseInformation: infoEnter,
                        license: infoLic,
                        contracts: infoCon ? [infoCon] : null,
                        medicalData: infoMed,
                    }
                });

                results.push(user);

            })
            .on('end', async () => {
                const inserted = new Set();
                const result: Array<User> = [];
                while (result.length < results.length) {
                    let added = false;

                    for (const user of results) {
                        if (inserted.has(user.user_id)) {
                            continue;
                        }

                        const userId = user.user_id;
                        const bossId = user.employee?.boss_id;

                        // Es el registro raíz
                        if (bossId === userId) {
                            result.push(user);
                            inserted.add(userId);
                            added = true;
                            continue;
                        }

                        // Su jefe ya fue insertado
                        if (inserted.has(bossId)) {
                            result.push(user);
                            inserted.add(userId);
                            added = true;
                        }
                    }

                    if (!added) {
                        console.log('AHHH no se pudo');
                    }
                }
                // await this.userRepository.manager.transaction(async (manager) => {
                //     for (const data of result) {
                //         const { employee: empData, ...userData } = data;
                //         const { enterpriseInformation, license, contracts, medicalData, ...employeeData } = empData;
                //         await manager.save(User, userData);

                //         await manager.save(Employee, employeeData);
                //         await manager.insert(Binnacle, {
                //             modified_user_id: userData.user_id,
                //             modifier_user_id: '00000',
                //             type: ValidStateMov.alta,
                //             comment: 'Insersión al sistema'
                //         });
                //         console.log(employeeData);

                //         if (contracts) await manager.save(Contract, contracts);
                //         if (enterpriseInformation) await manager.save(EnterpriseInformation, enterpriseInformation);
                //         if (license) await manager.save(License, license);
                //         if (medicalData) await manager.save(MedicalData, medicalData);
                //         const pathUser = join(__dirname, "..", "..", "uploads", 'employees', userData.user_id);
                //         // * Eliminar en caso de que exista
                //         if (existsSync(pathUser)) rmSync(pathUser, { recursive: true });
                //         // * Crear directorios
                //         mkdirSync(pathUser);
                //         mkdirSync(pathUser + '/docs');
                //         mkdirSync(pathUser + '/holidays');
                //         mkdirSync(pathUser + '/courses');
                //     }
                // });
            })
    }

    public async loadDepartments() {
        const results: Array<Department> = [];
        createReadStream(join(this.pathFiles, 'DEPARTMENTS.csv'))
            .pipe(csvParser({
                skipLines: 1,
                headers: ['id', 'name', 'office_id', 'responsible_id'],
            }))
            .on('data', (data) => {
                const parseData = this.tranformData(data);
                results.push(this.departmentRepository.create({
                    name: parseData.name,
                    office_id: +parseData.office_id,
                    responsible_user_id: null
                }))
            })
            .on('end', async () => {
                // await this.departmentRepository.save(results);
            })
        return results;
    }

    public loadAreas() {
        const results: Array<Area> = [];
        createReadStream(join(this.pathFiles, 'AREAS.csv'))
            .pipe(csvParser({
                skipLines: 1,
                headers: ['id', 'name', 'responsible_id', 'department_id'],
            }))
            .on('data', (data) => {
                const parseData = this.tranformData(data);
                results.push(this.areaRepository.create({
                    name: parseData.name,
                    department_id: +parseData.department_id,
                    responsible_user_id: null
                }))
            })
            .on('end', async () => {
                // await this.areaRepository.save(results);
            })
        return results;
    }
    public loadPositions() {
        const results: Array<Position> = [];
        createReadStream(join(this.pathFiles, 'POSITIONS.csv'))
            .pipe(csvParser({
                skipLines: 1,
                headers: ['id', 'name', 'area_id'],
            }))
            .on('data', (data) => {
                const parseData = this.tranformData(data);
                results.push(this.positionRepository.create({
                    name: parseData.name,
                    area_id: +parseData.area_id,
                }))
            })
            .on('end', async () => {
                // await this.positionRepository.save(results);
            })
        return results;
    }

    public async copyFiles() {
        const oldPath = join('C:/Users/Admin/Desktop/rh/docs');
        const pathUser = join(__dirname, "..", "..", "uploads", 'employees');

        const employes = await this.userRepository.find();
        for (const data of employes) {
            if (existsSync(join(pathUser, data.user_id, 'docs'))) {
                const files = readdirSync(join(pathUser, data.user_id, 'docs'));
                const photo = files.find(txt => txt.startsWith('FILE_1.'));
                const firma = files.find(txt => txt.startsWith('FILE_2.'));
                // if (photo) {
                //     await this.employeeFileRepository.insert({ file_id: 1, employee_id: data.user_id, uploaded_by: '00000',  });
                // }
                // if (firma) {
                //     await this.employeeFileRepository.insert({ file_id: 2, employee_id: data.user_id, uploaded_by: '00000',  });
                // }
                // if (photo) {
                //     const ext = photo.split('.')[1];
                //     // rmSync(join(pathUser, data.user_id, `FILE_1.${ext}`))
                //     copyFileSync(join(oldPath, data.user_id, photo), join(pathUser, data.user_id, 'docs', `FILE_1.${ext}`));
                // }
                // if (firma) {
                //     const ext = firma.split('.')[1];
                //     // rmSync(join(pathUser, data.user_id, `FILE_2.${ext}`))
                //     copyFileSync(join(oldPath, data.user_id, firma), join(pathUser, data.user_id, 'docs', `FILE_2.${ext}`));
                // }
            }
        }
        return ['a'];
    }

    private tranformData(data: { [k: string]: string }): { [k: string]: string } {
        return Object.fromEntries(
            Object.entries(data).map(([key, val]) => [
                key,
                val === 'NULL' ? null : (val as string).trim()
            ])
        );
    }
}