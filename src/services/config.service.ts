import { appDataSource } from "../db/dataBase";
import { HolidaysConfig } from "../db/entities/holidays_config";
import { SystemConfiguration } from "../db/entities/system_configuration";
import { AssignUserDto } from "../Dto/config/assignUser.dto";
import { CreateConfigDto } from "../Dto/holidays/create_config.dto";
import { UpdateConfigDto } from "../Dto/holidays/update_config.dto";

export class ConfigService {

    constructor(
        private readonly configRepository = appDataSource.getRepository(SystemConfiguration),
        private readonly holidaysConfigrepository = appDataSource.getRepository(HolidaysConfig)
    ) { }

    // * For Special users
    public assignUser(assigndDto: AssignUserDto) {
        const { key, user_id } = assigndDto;
        return this.configRepository.update({ key }, { user_id });
    }

    public getSystemConfiguration() {
        return this.configRepository.createQueryBuilder('system')
            .select(['system.key as "key", system.description as description, system.user_id as user_id'])
            .leftJoin('system.employee', 'employee')
            .leftJoin('employee.user', 'user')
            .addSelect(['user.name'])
            .getRawMany();
    }

    // * For holidays config


    public getHolidaysConfig(){
        return this.holidaysConfigrepository.find();
    }

    public createConfigHoliday (dto: CreateConfigDto){
        return this.holidaysConfigrepository.insert(dto);
    }
    public updateConfig(id: number, dto: UpdateConfigDto){
        return this.holidaysConfigrepository.update({holiday_config_id: id}, dto);
    } 

    public deleteConfig(id: number){
        return this.holidaysConfigrepository.delete({holiday_config_id: id});
    }

    

    public getRoles() {
        return [
            {value: 'admin', description: 'Administrador'},
            {value: 'manager', description: 'Auxiliar administrativo'},
            {value: 'query', description: 'Consultas'},
            {value: 'user', description: 'Usuario'},
        ];
    }
}